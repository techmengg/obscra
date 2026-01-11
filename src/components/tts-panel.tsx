"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTTS } from "@/hooks/use-tts";
import { useElevenLabsTTS } from "@/hooks/use-elevenlabs-tts";

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
    capabilities?: {
      canAdjustRate: boolean;
      canSkipParagraphs: boolean;
      provider: "browser" | "elevenlabs";
    };
  }) => void;
  autoAdvanceEnabled: boolean;
  onAutoAdvanceChange: (enabled: boolean) => void;
  onAutoAdvanceRequestNextChapter: () => void;
  hasNextChapter: boolean;
  autoStartKey: number;
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
  autoAdvanceEnabled,
  onAutoAdvanceChange,
  onAutoAdvanceRequestNextChapter,
  hasNextChapter,
  autoStartKey,
  theme,
}: TTSPanelProps) {
  const [provider, setProvider] = useState<"browser" | "elevenlabs">("browser");
  const tts = useTTS();
  const elevenLabs = useElevenLabsTTS();

  const clearWordHighlight = useCallback(() => {
    onWordChange(-1);
  }, [onWordChange]);

  const isBrowserProvider = provider === "browser";
  const selectedVoiceId = isBrowserProvider
    ? tts.selectedVoice?.voiceURI || ""
    : elevenLabs.selectedVoice?.id || "";
  const voiceCount = isBrowserProvider ? tts.voices.length : elevenLabs.voices.length;
  const hasVoices = voiceCount > 0;
  const isLoadingVoices = isBrowserProvider ? false : elevenLabs.isLoadingVoices;
  const isGenerating = isBrowserProvider ? false : elevenLabs.isGenerating;
  const isPlaying = isBrowserProvider ? tts.isPlaying : elevenLabs.isPlaying;
  const isPaused = isBrowserProvider ? tts.isPaused : elevenLabs.isPaused;
  const activeVolume = isBrowserProvider ? tts.volume : elevenLabs.volume;

  const canUseVoices = hasVoices && !(isGenerating && !isPlaying);

  const primaryButtonLabel = useMemo(() => {
    if (!isPlaying) {
      if (!hasVoices) return isLoadingVoices ? "Loading..." : "Select voice";
      if (!isBrowserProvider && isGenerating) return "Generating...";
      return isBrowserProvider ? "Play" : "Generate & Play";
    }
    return isPaused ? "Unpause" : "Pause";
  }, [hasVoices, isBrowserProvider, isGenerating, isLoadingVoices, isPaused, isPlaying]);

  const stopBrowserVoices = useCallback(() => {
    if (tts.isPlaying || tts.isPaused) {
      tts.stop();
    }
  }, [tts]);

  const stopElevenLabs = useCallback(() => {
    if (elevenLabs.isPlaying || elevenLabs.isPaused) {
      elevenLabs.stop();
    }
    clearWordHighlight();
  }, [clearWordHighlight, elevenLabs]);

  const handleChapterComplete = useCallback(() => {
    if (!autoAdvanceEnabled) return;
    onAutoAdvanceRequestNextChapter();
  }, [autoAdvanceEnabled, onAutoAdvanceRequestNextChapter]);

  const handleProviderSelect = useCallback(
    (next: "browser" | "elevenlabs") => {
      if (next === provider) return;
      stopBrowserVoices();
      stopElevenLabs();
      if (next === "elevenlabs") {
        clearWordHighlight();
      }
      setProvider(next);
    },
    [provider, stopBrowserVoices, stopElevenLabs, clearWordHighlight]
  );

  const handlePlayPause = useCallback(() => {
    if (isBrowserProvider) {
      if (!tts.isPlaying) {
        stopElevenLabs();
        tts.speak(chapterContent, onWordChange, { onComplete: handleChapterComplete });
      } else if (tts.isPaused) {
        tts.resume();
      } else {
        tts.pause();
      }
    } else {
      clearWordHighlight();
      if (!elevenLabs.isPlaying) {
        stopBrowserVoices();
        if (!isGenerating) {
          void elevenLabs.speak(chapterContent, { onComplete: handleChapterComplete });
        }
      } else if (elevenLabs.isPaused) {
        elevenLabs.resume();
      } else {
        elevenLabs.pause();
      }
    }
  }, [
    chapterContent,
    clearWordHighlight,
    elevenLabs,
    handleChapterComplete,
    isBrowserProvider,
    isGenerating,
    onWordChange,
    stopBrowserVoices,
    stopElevenLabs,
    tts,
  ]);

  const handleStop = useCallback(() => {
    stopBrowserVoices();
    stopElevenLabs();
  }, [stopBrowserVoices, stopElevenLabs]);

  const handleVolumeChange = (value: number) => {
    if (isBrowserProvider) {
      tts.setVolume(value);
    } else {
      elevenLabs.setVolume(value);
    }
  };

  useEffect(() => {
    if (!isBrowserProvider) {
      clearWordHighlight();
    }
  }, [isBrowserProvider, clearWordHighlight]);

  useEffect(() => {
    if (elevenLabs.isPlaying) {
      clearWordHighlight();
    }
  }, [elevenLabs.isPlaying, clearWordHighlight]);

  useEffect(() => {
    if (autoStartKey === 0) return;
    if (isPlaying) return;
    if (!hasVoices) return;
    handlePlayPause();
  }, [autoStartKey, handlePlayPause, hasVoices, isPlaying]);

  useEffect(() => {
    if (!onTTSStateChange) return;

    if (isBrowserProvider) {
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
        capabilities: {
          canAdjustRate: true,
          canSkipParagraphs: true,
          provider: "browser",
        },
      });
    } else {
      onTTSStateChange({
        isPlaying: elevenLabs.isPlaying,
        isPaused: elevenLabs.isPaused,
        rate: 1,
        volume: elevenLabs.volume,
        onPlayPause: handlePlayPause,
        onStop: handleStop,
        onSkipParagraph: () => {},
        onRateChange: () => {},
        onVolumeChange: elevenLabs.setVolume,
        capabilities: {
          canAdjustRate: false,
          canSkipParagraphs: false,
          provider: "elevenlabs",
        },
      });
    }
  }, [
    elevenLabs.isPaused,
    elevenLabs.isPlaying,
    elevenLabs.setVolume,
    elevenLabs.volume,
    handlePlayPause,
    handleStop,
    isBrowserProvider,
    onTTSStateChange,
    tts.isPaused,
    tts.isPlaying,
    tts.rate,
    tts.setRate,
    tts.setVolume,
    tts.skipParagraph,
    tts.volume,
  ]);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleProviderSelect("browser")}
          className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
          style={{
            borderColor: isBrowserProvider ? theme.foreground : theme.border,
            color: isBrowserProvider ? theme.foreground : theme.mutedForeground,
          }}
        >
          Device Voices
        </button>
        <button
          type="button"
          onClick={() => handleProviderSelect("elevenlabs")}
          className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
          style={{
            borderColor: !isBrowserProvider ? theme.foreground : theme.border,
            color: !isBrowserProvider ? theme.foreground : theme.mutedForeground,
          }}
        >
          ElevenLabs AI
        </button>
      </div>

      <div
        className="flex items-center justify-between border-b px-1 py-2 text-xs uppercase tracking-[0.2em]"
        style={{ borderColor: theme.border, color: theme.mutedForeground }}
      >
        <span>
          Autoplay next chapter
          {!hasNextChapter && (
            <span className="ml-1 text-[0.6rem] normal-case text-zinc-500">
              (end of book)
            </span>
          )}
        </span>
        <label className="ml-2 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={autoAdvanceEnabled}
            onChange={(e) => onAutoAdvanceChange(e.target.checked)}
            disabled={!hasNextChapter && !autoAdvanceEnabled}
            className="h-4 w-4"
          />
          <span>{autoAdvanceEnabled ? "On" : "Off"}</span>
        </label>
      </div>

      <div>
        <h3
          className="mb-3 text-xs uppercase tracking-[0.3em]"
          style={{ color: theme.mutedForeground }}
        >
          Voice
        </h3>
        <select
          value={selectedVoiceId}
          disabled={isLoadingVoices || !hasVoices}
          onChange={(e) => {
            if (isBrowserProvider) {
              const voice = tts.voices.find((v) => v.voiceURI === e.target.value);
              if (voice) tts.setVoice(voice);
            } else {
              const voice = elevenLabs.voices.find((v) => v.id === e.target.value);
              if (voice) elevenLabs.setVoice(voice);
            }
          }}
          className="w-full border-b px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: theme.background,
            color: theme.foreground,
            borderColor: theme.border,
          }}
        >
          {isBrowserProvider
            ? tts.voices.map((voice, index) => (
                <option key={`${voice.voiceURI}-${index}`} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))
            : elevenLabs.voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                  {voice.language ? ` (${voice.language})` : ""}
                </option>
              ))}
        </select>
        {isBrowserProvider && tts.error && (
          <p className="mt-2 text-xs" style={{ color: theme.activeForeground }}>
            {tts.error}
          </p>
        )}
        {!isBrowserProvider && elevenLabs.error && (
          <p className="mt-2 text-xs" style={{ color: theme.activeForeground }}>
            {elevenLabs.error}
          </p>
        )}
      </div>

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
            disabled={!canUseVoices || (isLoadingVoices && !isBrowserProvider)}
            className="flex-1 border-b px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
            style={{
              borderColor: theme.foreground,
              color: theme.foreground,
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.color = theme.hoverForeground;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.foreground;
            }}
          >
            {primaryButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="border-b px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all active:scale-95"
            style={{
              borderColor: theme.border,
              color: theme.mutedForeground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.hoverForeground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.mutedForeground;
            }}
          >
            Stop
          </button>
        </div>

        {isBrowserProvider ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={tts.skipParagraph}
              className="w-full border-b px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] transition-all active:scale-95"
              style={{
                borderColor: theme.border,
                color: theme.mutedForeground,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.hoverForeground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.mutedForeground;
              }}
            >
              Skip Paragraph
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs" style={{ color: theme.mutedForeground }}>
            Skip is unavailable in ElevenLabs mode.
          </p>
        )}
      </div>

      {isBrowserProvider ? (
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
            <span className="w-12 text-right text-xs" style={{ color: theme.mutedForeground }}>
              {tts.rate.toFixed(1)}x
            </span>
          </div>
        </div>
      ) : (
        <div>
          <h3
            className="mb-3 text-xs uppercase tracking-[0.3em]"
            style={{ color: theme.mutedForeground }}
          >
            Stability
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={elevenLabs.stability}
              onChange={(e) => elevenLabs.setStability(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-xs" style={{ color: theme.mutedForeground }}>
              {elevenLabs.stability.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {isBrowserProvider ? (
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
            <span className="w-12 text-right text-xs" style={{ color: theme.mutedForeground }}>
              {tts.pitch.toFixed(1)}x
            </span>
          </div>
        </div>
      ) : (
        <div>
          <h3
            className="mb-3 text-xs uppercase tracking-[0.3em]"
            style={{ color: theme.mutedForeground }}
          >
            Clarity
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={elevenLabs.similarityBoost}
              onChange={(e) => elevenLabs.setSimilarityBoost(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-xs" style={{ color: theme.mutedForeground }}>
              {elevenLabs.similarityBoost.toFixed(2)}
            </span>
          </div>
        </div>
      )}

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
            value={activeVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-right text-xs" style={{ color: theme.mutedForeground }}>
            {Math.round(activeVolume * 100)}%
          </span>
        </div>
      </div>

      {!isPlaying && voiceCount === 0 && (
        <p className="text-xs" style={{ color: theme.mutedForeground }}>
          {isLoadingVoices ? "Loading voices..." : "No voices available."}
        </p>
      )}
    </div>
  );
});
