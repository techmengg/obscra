"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { htmlToPlainText } from "@/lib/html-to-text";

export interface ElevenLabsVoice {
  id: string;
  name: string;
  category?: string;
  language?: string;
  description?: string | null;
  previewUrl?: string | null;
}

interface VoicesApiResponse {
  voices: ElevenLabsVoice[];
}

type SpeakOptions = {
  onComplete?: () => void;
};

type ChunkMessage =
  | { type: "chunk"; id: number; index: number; text: string }
  | { type: "done"; id: number }
  | { type: "error"; id: number; error: string };

type QueuedBuffer = {
  buffer: AudioBuffer;
  duration: number;
};

type PendingChunk = {
  index: number;
  text: string;
  estimateSeconds: number;
};

const TARGET_CHARS = 120; // ≈2–5s of audio at typical TTS speeds
const MAX_CHARS = 220; // hard cap per chunk
const MAX_CONCURRENT_REQUESTS = 3;
const BUFFER_HEADROOM_SECONDS = 12;
const estimateChunkDuration = (text: string) =>
  Math.min(8, Math.max(1.5, text.length / 28));

export function useElevenLabsTTS() {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice | null>(null);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);

  const completionCallbackRef = useRef<(() => void) | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const queueRef = useRef<QueuedBuffer[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferedAheadSecondsRef = useRef(0);
  const inflightRequestsRef = useRef(0);
  const inflightEstimatedSecondsRef = useRef(0);
  const pendingChunksRef = useRef<PendingChunk[]>([]);
  const chunkingCompleteRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const sessionIdRef = useRef(0);
  const playNextRef = useRef<() => void>(() => {});
  const pumpChunkRequestsRef = useRef<(id: number) => void>(() => {});

  const ensureAudioGraph = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (!gainNodeRef.current) {
      const ctx = audioContextRef.current;
      if (!ctx) return null;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
    }
    return {
      ctx: audioContextRef.current,
      gain: gainNodeRef.current,
    };
  }, [volume]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    let cancelled = false;

    const fetchVoices = async () => {
      setIsLoadingVoices(true);
      setError(null);

      try {
        const response = await fetch("/api/tts/voices");
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to fetch ElevenLabs voices.");
        }

        const data = (await response.json()) as VoicesApiResponse;
        if (!cancelled) {
          setVoices(data.voices);
          setSelectedVoice((prev) => prev ?? data.voices[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load ElevenLabs voices."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVoices(false);
        }
      }
    };

    fetchVoices();

    return () => {
      cancelled = true;
      workerRef.current?.terminate();
      workerRef.current = null;
      currentSourceRef.current?.stop();
      audioContextRef.current?.close();
      queueRef.current = [];
    };
  }, []);

  const setVoice = useCallback((voice: ElevenLabsVoice) => {
    setSelectedVoice(voice);
  }, []);

  const stopPlayback = useCallback(
    (resetCallback = true) => {
      sessionIdRef.current += 1;
      stopRequestedRef.current = true;
      if (currentSourceRef.current) {
        currentSourceRef.current.onended = null;
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
      }
      queueRef.current = [];
      bufferedAheadSecondsRef.current = 0;
      inflightRequestsRef.current = 0;
      inflightEstimatedSecondsRef.current = 0;
      pendingChunksRef.current = [];
      chunkingCompleteRef.current = false;
      if (resetCallback) {
        completionCallbackRef.current = null;
      }
      setIsPlaying(false);
      setIsPaused(false);
      setIsGenerating(false);
    },
    []
  );

  const maybeFinish = useCallback(() => {
    if (
      chunkingCompleteRef.current &&
      queueRef.current.length === 0 &&
      inflightRequestsRef.current === 0 &&
      !currentSourceRef.current
    ) {
      setIsPlaying(false);
      setIsPaused(false);
      setIsGenerating(false);
      if (!stopRequestedRef.current && completionCallbackRef.current) {
        completionCallbackRef.current();
      }
      completionCallbackRef.current = null;
    }
  }, []);

  const enqueueBuffer = useCallback(
    async (queued: QueuedBuffer) => {
      queueRef.current.push(queued);
      bufferedAheadSecondsRef.current += queued.duration;
      setIsGenerating(true);
      if (!isPlaying && !isPaused) {
        await playNextRef.current();
      }
    },
    [isPaused, isPlaying]
  );

  const decodeAndQueue = useCallback(
    async (sessionId: number, audioData: ArrayBuffer, estimateSeconds = 0) => {
      try {
        const graph = ensureAudioGraph();
        if (!graph) {
          throw new Error("Audio context unavailable.");
        }
        const decoded = await graph.ctx.decodeAudioData(audioData.slice(0));
        if (sessionId !== sessionIdRef.current) return;
        await enqueueBuffer({ buffer: decoded, duration: decoded.duration });
        setIsGenerating(inflightRequestsRef.current > 0 || !chunkingCompleteRef.current);
      } catch (err) {
        if (sessionId !== sessionIdRef.current) return;
        setError(
          err instanceof Error ? err.message : "Failed to decode streamed audio."
        );
        setIsGenerating(false);
      } finally {
        inflightRequestsRef.current = Math.max(0, inflightRequestsRef.current - 1);
        inflightEstimatedSecondsRef.current = Math.max(
          0,
          inflightEstimatedSecondsRef.current - estimateSeconds
        );
        if (sessionId === sessionIdRef.current) {
          maybeFinish();
        }
      }
    },
    [enqueueBuffer, ensureAudioGraph, maybeFinish]
  );

  const pumpChunkRequests = useCallback(
    (sessionId: number) => {
      const availableSlots = Math.max(
        0,
        MAX_CONCURRENT_REQUESTS - inflightRequestsRef.current
      );
      if (availableSlots === 0) return;

      const toSend: PendingChunk[] = [];
      while (pendingChunksRef.current.length > 0 && toSend.length < availableSlots) {
        const next = pendingChunksRef.current.shift()!;
        const projectedBuffer =
          bufferedAheadSecondsRef.current +
          inflightEstimatedSecondsRef.current +
          next.estimateSeconds;
        if (projectedBuffer > BUFFER_HEADROOM_SECONDS && inflightRequestsRef.current > 0) {
          pendingChunksRef.current.unshift(next);
          break;
        }
        inflightEstimatedSecondsRef.current += next.estimateSeconds;
        toSend.push(next);
      }
      if (toSend.length === 0) return;

      toSend.forEach(async ({ text, estimateSeconds }) => {
        inflightRequestsRef.current += 1;
        try {
          const response = await fetch("/api/tts/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voiceId: selectedVoice?.id,
              stability,
              similarityBoost,
            }),
          });

          if (sessionId !== sessionIdRef.current) {
            inflightRequestsRef.current = Math.max(
              0,
              inflightRequestsRef.current - 1
            );
            return;
          }

          if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Failed to stream ElevenLabs audio.");
          }

          const audioData = await response.arrayBuffer();
          if (sessionId === sessionIdRef.current) {
            void decodeAndQueue(sessionId, audioData, estimateSeconds);
          }
        } catch (err) {
          inflightRequestsRef.current = Math.max(0, inflightRequestsRef.current - 1);
          if (sessionId !== sessionIdRef.current) return;
          inflightEstimatedSecondsRef.current = Math.max(
            0,
            inflightEstimatedSecondsRef.current - estimateSeconds
          );
          setError(
            err instanceof Error
              ? err.message
              : "Unexpected error streaming ElevenLabs audio."
          );
          setIsGenerating(false);
          stopPlayback(false);
        } finally {
          if (sessionId === sessionIdRef.current) {
            pumpChunkRequestsRef.current(sessionId);
          }
        }
      });
    },
    [decodeAndQueue, selectedVoice?.id, similarityBoost, stability, stopPlayback]
  );

  useEffect(() => {
    pumpChunkRequestsRef.current = pumpChunkRequests;
  }, [pumpChunkRequests]);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(
      new URL("../workers/tts-chunker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    worker.onmessage = (event: MessageEvent<ChunkMessage>) => {
      const message = event.data;
      if (!message || message.id !== sessionIdRef.current) return;

      if (message.type === "chunk") {
        pendingChunksRef.current.push({
          index: message.index,
          text: message.text,
          estimateSeconds: estimateChunkDuration(message.text),
        });
        pumpChunkRequestsRef.current(message.id);
        return;
      }

      if (message.type === "done") {
        chunkingCompleteRef.current = true;
        if (queueRef.current.length === 0 && inflightRequestsRef.current === 0) {
          maybeFinish();
        }
        return;
      }

      if (message.type === "error") {
        setError(message.error);
        setIsGenerating(false);
      }
    };

    workerRef.current = worker;
    return worker;
  }, [maybeFinish]);

  const playNext = useCallback(async () => {
    const graph = ensureAudioGraph();
    if (!graph) return;
    const ctx = graph.ctx;
    const gain = graph.gain;

    if (currentSourceRef.current) return;

    const next = queueRef.current.shift();
    if (!next) {
      setIsPlaying(false);
      maybeFinish();
      return;
    }

    bufferedAheadSecondsRef.current = Math.max(
      0,
      bufferedAheadSecondsRef.current - next.duration
    );

    pumpChunkRequestsRef.current(sessionIdRef.current);

    const source = ctx.createBufferSource();
    source.buffer = next.buffer;
    source.connect(gain);
    source.onended = () => {
      currentSourceRef.current = null;
      if (!stopRequestedRef.current) {
        playNextRef.current();
      }
    };

    await ctx.resume();
    currentSourceRef.current = source;
    setIsPlaying(true);
    setIsPaused(false);
    source.start();

    if (queueRef.current.length === 0 && chunkingCompleteRef.current) {
      setIsGenerating(false);
    }
  }, [ensureAudioGraph, maybeFinish]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const speak = useCallback(
    async (htmlContent: string, options?: SpeakOptions) => {
      const text = htmlToPlainText(htmlContent);
      if (!text) {
        setError("Nothing to read from this chapter.");
        return;
      }
      if (!selectedVoice) {
        setError("Please select an ElevenLabs voice.");
        return;
      }

      stopPlayback();
      setError(null);
      setIsGenerating(true);
      stopRequestedRef.current = false;

      const worker = ensureWorker();
      const nextId = sessionIdRef.current + 1;
      sessionIdRef.current = nextId;
      completionCallbackRef.current = options?.onComplete ?? null;
      pendingChunksRef.current = [];
      chunkingCompleteRef.current = false;
      inflightRequestsRef.current = 0;
      bufferedAheadSecondsRef.current = 0;

      worker.postMessage({
        id: nextId,
        text,
        targetChars: TARGET_CHARS,
        maxChars: MAX_CHARS,
      });
    },
    [ensureWorker, selectedVoice, stopPlayback]
  );

  const pause = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlaying || isPaused) return;
    ctx.suspend().then(() => {
      setIsPaused(true);
    });
  }, [isPaused, isPlaying]);

  const resume = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPaused) return;
    ctx.resume().then(() => {
      setIsPaused(false);
      setIsPlaying(true);
      if (!currentSourceRef.current) {
        void playNext();
      }
    });
  }, [isPaused, playNext]);

  const stop = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  return {
    voices,
    selectedVoice,
    isLoadingVoices,
    isGenerating,
    isPlaying,
    isPaused,
    volume,
    stability,
    similarityBoost,
    error,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setVolume,
    setStability,
    setSimilarityBoost,
  };
}
