"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TTSFloatingControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  volume: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSkipParagraph: () => void;
  onRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  capabilities?: {
    canAdjustRate: boolean;
    canSkipParagraphs: boolean;
    provider?: "browser" | "elevenlabs";
  };
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

export const TTSFloatingControls = memo(function TTSFloatingControls({
  isPlaying,
  isPaused,
  rate,
  volume,
  onPlayPause,
  onStop,
  onSkipParagraph,
  onRateChange,
  onVolumeChange,
  capabilities,
  theme,
}: TTSFloatingControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canAdjustRate = capabilities?.canAdjustRate ?? true;
  const canSkipParagraphs = capabilities?.canSkipParagraphs ?? true;
  const providerLabel = capabilities?.provider;

  if (!isPlaying) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 left-4 z-30 flex h-10 w-10 items-center justify-center border transition active:scale-95 md:bottom-8"
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
          color: theme.foreground,
        }}
        aria-label="TTS controls"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isPaused ? (
            <polygon points="5 3 19 12 5 21 5 3" />
          ) : (
            <>
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </>
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-36 left-4 z-50 w-72 border md:bottom-24"
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
              }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: theme.border }}>
                <span className="text-xs uppercase tracking-[0.3em]" style={{ color: theme.foreground }}>
                  TTS
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 border text-xs transition"
                  style={{ borderColor: theme.border, color: theme.mutedForeground }}
                  aria-label="Close"
                >
                  x
                </button>
              </div>

              <div className="flex flex-col gap-4 p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onPlayPause}
                    className="flex-1 border-b px-3 py-2 text-xs uppercase tracking-[0.2em] transition active:scale-95"
                    style={{ borderColor: theme.foreground, color: theme.foreground }}
                  >
                    {isPaused ? "Unpause" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={onStop}
                    className="border-b px-3 py-2 text-xs uppercase tracking-[0.2em] transition active:scale-95"
                    style={{ borderColor: theme.border, color: theme.mutedForeground }}
                  >
                    Stop
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onSkipParagraph}
                    disabled={!canSkipParagraphs}
                    className="w-full border-b px-3 py-2 text-xs uppercase tracking-[0.2em] transition active:scale-95 disabled:opacity-50"
                    style={{ borderColor: theme.border, color: theme.mutedForeground }}
                    title={
                      !canSkipParagraphs && providerLabel === "elevenlabs"
                        ? "Skip disabled for ElevenLabs."
                        : undefined
                    }
                  >
                    Skip Paragraph
                  </button>
                  {!canSkipParagraphs && providerLabel === "elevenlabs" && (
                    <p className="text-[0.65rem]" style={{ color: theme.mutedForeground }}>
                      Skip unavailable in ElevenLabs.
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.mutedForeground }}>
                      Speed
                    </label>
                    <span className="text-xs" style={{ color: theme.foreground }}>
                      {rate.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => onRateChange(Number(e.target.value))}
                    disabled={!canAdjustRate}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.mutedForeground }}>
                      Volume
                    </label>
                    <span className="text-xs" style={{ color: theme.foreground }}>
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});
