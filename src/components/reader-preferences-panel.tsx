"use client";

import { memo, useState } from "react";
import {
  ReaderPreferences,
  Theme,
  FontFamily,
  THEMES,
  FONT_FAMILIES,
} from "@/lib/reader-preferences";

interface ReaderPreferencesPanelProps {
  preferences: ReaderPreferences;
  onUpdate: (preferences: ReaderPreferences) => void;
}

export const ReaderPreferencesPanel = memo(function ReaderPreferencesPanel({
  preferences,
  onUpdate,
}: ReaderPreferencesPanelProps) {
  const [activeSection, setActiveSection] = useState<
    "theme" | "font" | "layout" | "spacing"
  >("theme");

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const currentTheme = THEMES[preferences.theme] || THEMES.dark;

  const updatePreference = <K extends keyof ReaderPreferences>(
    key: K,
    value: ReaderPreferences[K]
  ) => {
    onUpdate({ ...preferences, [key]: value });
  };

  const updateMargin = (side: keyof ReaderPreferences["pageMargins"], value: number) => {
    updatePreference("pageMargins", {
      ...preferences.pageMargins,
      [side]: value,
    });
  };

  const updateParagraph = <K extends keyof ReaderPreferences["paragraphSettings"]>(
    key: K,
    value: ReaderPreferences["paragraphSettings"][K]
  ) => {
    updatePreference("paragraphSettings", {
      ...preferences.paragraphSettings,
      [key]: value,
    });
  };

  const updateLineHeight = <K extends keyof ReaderPreferences["lineHeightSettings"]>(
    key: K,
    value: ReaderPreferences["lineHeightSettings"][K]
  ) => {
    updatePreference("lineHeightSettings", {
      ...preferences.lineHeightSettings,
      [key]: value,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Section Navigation */}
      <div 
        className="grid grid-cols-2 text-center text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.15em] md:tracking-[0.3em]"
        style={{ borderBottom: `1px solid ${currentTheme.border}` }}
      >
        {[
          { key: "theme" as const, label: "Theme & Display" },
          { key: "font" as const, label: "Typography" },
          { key: "layout" as const, label: "Layout & Margins" },
          { key: "spacing" as const, label: "Spacing" },
        ].map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className="px-2 py-2 md:py-3 transition last:border-r-0"
            style={{
              borderRight: section.key !== "spacing" ? `1px solid ${currentTheme.border}` : 'none',
              backgroundColor: activeSection === section.key ? currentTheme.active : 'transparent',
              color: activeSection === section.key ? currentTheme.activeForeground : currentTheme.muted,
            }}
            onMouseEnter={(e) => {
              if (activeSection !== section.key) {
                e.currentTarget.style.color = currentTheme.hoverForeground;
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.key) {
                e.currentTarget.style.color = currentTheme.muted;
              }
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 scrollbar-thin">
        {/* THEME & DISPLAY SECTION */}
        {activeSection === "theme" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Color Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as Theme[]).map((themeKey) => {
                  const theme = THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => updatePreference("theme", themeKey)}
                      className={`flex flex-col gap-2 rounded border p-3 transition ${
                        preferences.theme === themeKey
                          ? "border-zinc-400 bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div
                        className="h-12 w-full rounded border"
                        style={{
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                        }}
                      >
                        <div
                          className="flex h-full items-center justify-center text-xs"
                          style={{ color: theme.foreground }}
                        >
                          Aa
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Font Size
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={preferences.fontSize}
                  onChange={(e) => updatePreference("fontSize", Number(e.target.value))}
                  className="flex-1"
                />
                <span 
                  className="w-12 text-right text-xs"
                  style={{ color: currentTheme.mutedForeground }}
                >
                  {preferences.fontSize}px
                </span>
              </div>
            </div>

            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Text Alignment
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updatePreference("textAlign", "left")}
                  className={`flex-1 border px-3 py-2 text-xs transition ${
                    preferences.textAlign === "left"
                      ? "border-zinc-400 bg-zinc-900 text-zinc-50"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  }`}
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => updatePreference("textAlign", "justify")}
                  className={`flex-1 border px-3 py-2 text-xs transition ${
                    preferences.textAlign === "justify"
                      ? "border-zinc-400 bg-zinc-900 text-zinc-50"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  }`}
                >
                  Justify
                </button>
              </div>
            </div>

            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Content Width
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="600"
                  max="1200"
                  step="50"
                  value={preferences.maxWidth}
                  onChange={(e) => updatePreference("maxWidth", Number(e.target.value))}
                  className="flex-1"
                />
                <span 
                  className="w-16 text-right text-xs"
                  style={{ color: currentTheme.mutedForeground }}
                >
                  {preferences.maxWidth}px
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FONT SECTION */}
        {activeSection === "font" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Font Family
              </h3>
              <div className="flex flex-col gap-2">
                {(Object.keys(FONT_FAMILIES) as FontFamily[]).map((fontKey) => {
                  const font = FONT_FAMILIES[fontKey];
                  return (
                    <button
                      key={fontKey}
                      type="button"
                      onClick={() => updatePreference("fontFamily", fontKey)}
                      className={`border px-4 py-3 text-left transition ${
                        preferences.fontFamily === fontKey
                          ? "border-zinc-400 bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-zinc-400">
                            {font.name}
                          </span>
                          <span
                            className="text-sm"
                            style={{ fontFamily: font.family }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </span>
                        </div>
                        {preferences.fontFamily === fontKey && (
                          <span className="text-zinc-400">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT & MARGINS SECTION */}
        {activeSection === "layout" && (
          <div className="flex flex-col gap-6">
            {isMobile && (
              <div>
                <h3 
                  className="mb-3 text-xs uppercase tracking-[0.3em]"
                  style={{ color: currentTheme.mutedForeground }}
                >
                  Page Turn Mode
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "infinite-scroll" as const, label: "Infinite Scroll", desc: "Continuous scrolling" },
                    { key: "slide" as const, label: "Slide", desc: "Swipe to turn pages" },
                    { key: "curl" as const, label: "Page Curl", desc: "Realistic page turn" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => updatePreference("pageTurnMode", mode.key)}
                      className={`border px-4 py-3 text-left transition ${
                        preferences.pageTurnMode === mode.key
                          ? "border-zinc-400 bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-zinc-50">{mode.label}</span>
                          <span className="text-xs text-zinc-500">{mode.desc}</span>
                        </div>
                        {preferences.pageTurnMode === mode.key && (
                          <span className="text-zinc-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 
                className="mb-3 text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.mutedForeground }}
              >
                Page Margins
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label 
                    className="mb-2 block text-xs"
                    style={{ color: currentTheme.mutedForeground }}
                  >
                    Left & Right (Both Sides)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.pageMargins.left}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateMargin("left", val);
                        updateMargin("right", val);
                      }}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-xs text-zinc-400">
                      {preferences.pageMargins.left}px
                    </span>
                  </div>
                </div>

                <div>
                  <label 
                    className="mb-2 block text-xs"
                    style={{ color: currentTheme.mutedForeground }}
                  >
                    Top
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.pageMargins.top}
                      onChange={(e) => updateMargin("top", Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-xs text-zinc-400">
                      {preferences.pageMargins.top}px
                    </span>
                  </div>
                </div>

                <div>
                  <label 
                    className="mb-2 block text-xs"
                    style={{ color: currentTheme.mutedForeground }}
                  >
                    Bottom
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.pageMargins.bottom}
                      onChange={(e) => updateMargin("bottom", Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-xs text-zinc-400">
                      {preferences.pageMargins.bottom}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPACING SECTION */}
        {activeSection === "spacing" && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: currentTheme.mutedForeground }}
                >
                  Line Height
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.lineHeightSettings.override}
                    onChange={(e) => updateLineHeight("override", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs text-zinc-500">Override</span>
                </label>
              </div>
              {preferences.lineHeightSettings.override && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={preferences.lineHeightSettings.multiplier}
                    onChange={(e) =>
                      updateLineHeight("multiplier", Number(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-xs text-zinc-400">
                    {preferences.lineHeightSettings.multiplier.toFixed(1)}x
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: currentTheme.mutedForeground }}
                >
                  Paragraph
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.paragraphSettings.override}
                    onChange={(e) => updateParagraph("override", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs text-zinc-500">Override</span>
                </label>
              </div>
              {preferences.paragraphSettings.override && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Spacing
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="2.0"
                        step="0.1"
                        value={preferences.paragraphSettings.spacing}
                        onChange={(e) =>
                          updateParagraph("spacing", Number(e.target.value))
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-right text-xs text-zinc-400">
                        {preferences.paragraphSettings.spacing.toFixed(1)}em
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-zinc-500">
                      Indentation
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="4.0"
                        step="0.5"
                        value={preferences.paragraphSettings.indentation}
                        onChange={(e) =>
                          updateParagraph("indentation", Number(e.target.value))
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-right text-xs text-zinc-400">
                        {preferences.paragraphSettings.indentation.toFixed(1)}em
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  const defaults = {
                    lineHeightSettings: { override: false, multiplier: 1.75 },
                    paragraphSettings: { override: false, spacing: 0.1, indentation: 0 },
                  };
                  onUpdate({ ...preferences, ...defaults });
                }}
                className="w-full px-4 py-2 text-xs uppercase tracking-[0.3em] transition-colors"
                style={{
                  border: `1px solid ${currentTheme.border}`,
                  color: currentTheme.muted,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.hoverForeground;
                  e.currentTarget.style.color = currentTheme.hoverForeground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.border;
                  e.currentTarget.style.color = currentTheme.muted;
                }}
              >
                Reset Spacing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
