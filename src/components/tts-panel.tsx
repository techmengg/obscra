"use client";

import { memo, useEffect } from "react";
import { useTTS, TTSVoice } from "@/hooks/use-tts";

interface TTSPanelProps {
  chapterContent: string;
  onWordChange: (wordIndex: number) => void;
  onTTSStateChange?: (state: {
    isPlaying: boolean;
    isPaused: boolean;
    rate: number;
    volume: number;
    onPlayPause: () => void;
    onStop: () => void;
    onSkipParagraph: () => void;
    onRateChange: (rate: number) => void;
    onVolumeChange: (volume: number) => void;
  }) => void;
  theme: {
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    hover: string;
    hoverForeground: string;
    active: string;
    activeForeground: string;
  };
}

export const TTSPanel = memo(function TTSPanel({
  chapterContent,
  onWordChange,
  onTTSStateChange,
  theme,
}: TTSPanelProps) {
  const tts = useTTS();

  const handlePlayPause = () => {
    if (!tts.isPlaying) {
      tts.speak(chapterContent, onWordChange);
    } else if (tts.isPaused) {
      tts.resume();
    } else {
      tts.pause();
    }
  };

  const handleStop = () => {
    tts.stop();
  };

  // Expose TTS state to parent
  useEffect(() => {
    if (onTTSStateChange) {
      onTTSStateChange({
        isPlaying: tts.isPlaying,
        isPaused: tts.isPaused,
        rate: tts.rate,
        volume: tts.volume,
        onPlayPause: handlePlayPause,
        onStop: handleStop,
        onSkipParagraph: tts.skipParagraph,
        onRateChange: tts.setRate,
        onVolumeChange: tts.setVolume,
      });
    }
  }, [tts.isPlaying, tts.isPaused, tts.rate, tts.volume, tts.skipParagraph, tts.setRate, tts.setVolume, onTTSStateChange]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Voice Selection */}
      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Voice
        </h3>
        <select
          value={tts.selectedVoice?.voiceURI || ""}
          onChange={(e) => {
            const voice = tts.voices.find((v) => v.voiceURI === e.target.value);
            if (voice) tts.setVoice(voice);
          }}
          className="w-full rounded border px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: theme.background,
            color: theme.foreground,
            borderColor: theme.border,
          }}
        >
          {tts.voices.map((voice, index) => (
            <option key={`${voice.voiceURI}-${index}`} value={voice.voiceURI}>
              {voice.name} {!voice.localService && "⭐"}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs" style={{ color: theme.mutedForeground }}>
          ⭐ indicates high-quality cloud-based voices
        </p>
      </div>

      {/* Playback Controls */}
      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Controls
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={tts.voices.length === 0}
            className="flex-1 rounded px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: theme.active,
              color: theme.activeForeground,
            }}
            onMouseEnter={(e) => {
              if (tts.voices.length > 0) {
                e.currentTarget.style.backgroundColor = theme.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.active;
            }}
          >
            {!tts.isPlaying ? "▶ Play" : tts.isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={!tts.isPlaying}
            className="rounded px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            style={{
              border: `1px solid ${theme.border}`,
              color: theme.foreground,
            }}
            onMouseEnter={(e) => {
              if (tts.isPlaying) {
                e.currentTarget.style.borderColor = theme.hoverForeground;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Speed
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={tts.rate}
            onChange={(e) => tts.setRate(Number(e.target.value))}
            className="flex-1"
          />
          <span
            className="w-12 text-right text-xs"
            style={{ color: theme.mutedForeground }}
          >
            {tts.rate.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Pitch Control */}
      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Pitch
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={tts.pitch}
            onChange={(e) => tts.setPitch(Number(e.target.value))}
            className="flex-1"
          />
          <span
            className="w-12 text-right text-xs"
            style={{ color: theme.mutedForeground }}
          >
            {tts.pitch.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Volume
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={tts.volume}
            onChange={(e) => tts.setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <span
            className="w-12 text-right text-xs"
            style={{ color: theme.mutedForeground }}
          >
            {Math.round(tts.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Status */}
      {tts.isPlaying && (
        <div
          className="rounded border px-4 py-3 text-center text-xs uppercase tracking-[0.25em]"
          style={{
            borderColor: theme.border,
            color: theme.muted,
          }}
        >
          {tts.isPaused ? "⏸ Paused" : "▶ Playing"}
        </div>
      )}

      {/* Help Text */}
      {!tts.isPlaying && tts.voices.length === 0 && (
        <div
          className="rounded border px-4 py-3 text-center text-xs"
          style={{
            borderColor: theme.border,
            color: theme.mutedForeground,
          }}
        >
          Loading voices...
        </div>
      )}

      {!tts.isPlaying && tts.voices.length > 0 && (
        <div
          className="rounded border px-4 py-3 text-xs leading-relaxed"
          style={{
            borderColor: theme.border,
            color: theme.mutedForeground,
          }}
        >
          <p className="mb-2">
            <strong>How to use:</strong>
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Select a voice (⭐ for best quality)</li>
            <li>Click Play to start reading</li>
            <li>Text will highlight as it&apos;s read</li>
            <li>Page scrolls automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
});

