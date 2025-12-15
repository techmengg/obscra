/// <reference lib="webworker" />

"use strict";

// Web worker that splits long text into small, speech-friendly chunks so the
// main thread stays focused on rendering/playback.

type ChunkRequest = {
  id: number;
  text: string;
  targetChars?: number;
  maxChars?: number;
};

type ChunkMessage =
  | { type: "chunk"; id: number; index: number; text: string }
  | { type: "done"; id: number }
  | { type: "error"; id: number; error: string };

let activeJobId = -1;

const sentenceSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("en", { granularity: "sentence" })
    : null;

const toSentences = (text: string): string[] => {
  if (sentenceSegmenter) {
    return Array.from(sentenceSegmenter.segment(text))
      .map((part) => part.segment.trim())
      .filter(Boolean);
  }

  // Fallback: rough sentence splitter
  return (
    text
      .split(/(?<=[.?!])\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
  );
};

const buildChunks = (
  sentences: string[],
  targetChars: number,
  maxChars: number
): string[] => {
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length <= maxChars) {
      current = candidate;
      if (current.length >= targetChars) {
        chunks.push(current.trim());
        current = "";
      }
      continue;
    }

    if (current) {
      chunks.push(current.trim());
      current = "";
    }

    if (sentence.length > maxChars) {
      // Hard split very long sentences
      let remaining = sentence;
      while (remaining.length > maxChars) {
        chunks.push(remaining.slice(0, maxChars));
        remaining = remaining.slice(maxChars);
      }
      if (remaining.trim()) {
        current = remaining.trim();
      }
    } else {
      current = sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
};

self.onmessage = (event: MessageEvent<ChunkRequest>) => {
  const { id, text, targetChars = 420, maxChars = 720 } = event.data;
  activeJobId = id;

  try {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
      const done: ChunkMessage = { type: "done", id };
      self.postMessage(done);
      return;
    }

    const sentences = toSentences(normalized);
    const chunks = buildChunks(sentences, targetChars, maxChars);

    chunks.forEach((chunk, index) => {
      if (id !== activeJobId) return;
      const message: ChunkMessage = { type: "chunk", id, index, text: chunk };
      self.postMessage(message);
    });

    if (id === activeJobId) {
      const done: ChunkMessage = { type: "done", id };
      self.postMessage(done);
    }
  } catch (error) {
    const message: ChunkMessage = {
      type: "error",
      id,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(message);
  }
};

export {};
