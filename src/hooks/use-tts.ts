"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TTSVoice {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: -1,
    voices: [],
    selectedVoice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textContentRef = useRef<string>("");
  const wordsRef = useRef<string[]>([]);
  const onWordChangeRef = useRef<((index: number) => void) | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for English voices only and prioritize high-quality ones
      const englishVoices = availableVoices
        .filter((voice) => voice.lang.startsWith("en"))
        .map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          voiceURI: voice.voiceURI,
          localService: voice.localService,
        }));

      // Remove duplicates by voiceURI
      const uniqueVoices = Array.from(
        new Map(englishVoices.map((voice) => [voice.voiceURI, voice])).values()
      ).sort((a, b) => {
        // Prioritize non-local (cloud-based) voices as they're usually higher quality
        if (!a.localService && b.localService) return -1;
        if (a.localService && !b.localService) return 1;
        return a.name.localeCompare(b.name);
      });

      setState((prev) => ({
        ...prev,
        voices: uniqueVoices,
        selectedVoice: uniqueVoices[0] || null,
      }));
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Extract text content from HTML
  const extractTextContent = useCallback((html: string): string => {
    if (typeof window === "undefined") return "";
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Remove script, style, img, svg elements
    const elementsToRemove = tempDiv.querySelectorAll("script, style, img, svg");
    elementsToRemove.forEach((el) => el.remove());

    // Get text content and clean it up
    let text = tempDiv.textContent || "";
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    return text;
  }, []);

  // Split text into words with punctuation handling
  const splitIntoWords = useCallback((text: string): string[] => {
    // Split by spaces but keep punctuation with words
    return text.split(/\s+/).filter((word) => word.length > 0);
  }, []);

  const speak = useCallback(
    (htmlContent: string, onWordChange?: (index: number) => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Extract and prepare text
      const textContent = extractTextContent(htmlContent);
      textContentRef.current = textContent;
      wordsRef.current = splitIntoWords(textContent);
      onWordChangeRef.current = onWordChange || null;

      if (!textContent || !state.selectedVoice) return;

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(textContent);
      utteranceRef.current = utterance;

      // Find the actual voice object
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.voiceURI === state.selectedVoice?.voiceURI);
      if (voice) utterance.voice = voice;

      utterance.rate = state.rate;
      utterance.pitch = state.pitch;
      utterance.volume = state.volume;

      let wordIndex = 0;
      let charIndex = 0;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          // Find which word we're at based on character index
          const currentText = textContent.substring(0, event.charIndex);
          const currentWords = currentText.split(/\s+/).length - 1;
          
          wordIndex = currentWords;
          setState((prev) => ({ ...prev, currentWordIndex: wordIndex }));
          
          if (onWordChangeRef.current) {
            onWordChangeRef.current(wordIndex);
          }
        }
      };

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false, currentWordIndex: 0 }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentWordIndex: -1 }));
        if (onWordChangeRef.current) {
          onWordChangeRef.current(-1);
        }
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
      };

      window.speechSynthesis.speak(utterance);
    },
    [state.selectedVoice, state.rate, state.pitch, state.volume, extractTextContent, splitIntoWords]
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentWordIndex: -1 }));
    if (onWordChangeRef.current) {
      onWordChangeRef.current(-1);
    }
  }, []);

  const setVoice = useCallback((voice: TTSVoice) => {
    setState((prev) => ({ ...prev, selectedVoice: voice }));
  }, []);

  const setRate = useCallback((rate: number) => {
    setState((prev) => ({ ...prev, rate }));
  }, []);

  const setPitch = useCallback((pitch: number) => {
    setState((prev) => ({ ...prev, pitch }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const skipParagraph = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!state.isPlaying) return;

    // Get current text and find next paragraph
    const currentText = textContentRef.current;
    if (!currentText || !utteranceRef.current) return;

    // Calculate approximate current position based on word index
    const words = wordsRef.current;
    const currentWordIndex = state.currentWordIndex;
    
    if (currentWordIndex < 0 || currentWordIndex >= words.length) return;

    // Find the position after current word
    let charIndex = 0;
    for (let i = 0; i <= currentWordIndex; i++) {
      charIndex += words[i].length + 1; // +1 for space
    }

    // Find next paragraph break (double newline or period followed by newline)
    const remainingText = currentText.substring(charIndex);
    const paragraphBreak = remainingText.search(/\.\s+[A-Z]|[\n\r]{2,}/);
    
    if (paragraphBreak > 0) {
      // Calculate new word index
      const skippedText = remainingText.substring(0, paragraphBreak);
      const skippedWords = skippedText.split(/\s+/).filter(w => w.length > 0);
      const newWordIndex = currentWordIndex + skippedWords.length + 1;

      // Stop current speech and restart from new position
      window.speechSynthesis.cancel();
      
      // Get the remaining text after skip
      const newStartChar = charIndex + paragraphBreak;
      const newText = currentText.substring(newStartChar).trim();
      
      if (newText) {
        const utterance = new SpeechSynthesisUtterance(newText);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.voiceURI === state.selectedVoice?.voiceURI);
        if (voice) utterance.voice = voice;
        
        utterance.rate = state.rate;
        utterance.pitch = state.pitch;
        utterance.volume = state.volume;

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            const currentText = newText.substring(0, event.charIndex);
            const currentWords = currentText.split(/\s+/).length - 1;
            const adjustedIndex = newWordIndex + currentWords;
            
            setState((prev) => ({ ...prev, currentWordIndex: adjustedIndex }));
            
            if (onWordChangeRef.current) {
              onWordChangeRef.current(adjustedIndex);
            }
          }
        };

        utterance.onend = () => {
          setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentWordIndex: -1 }));
          if (onWordChangeRef.current) {
            onWordChangeRef.current(-1);
          }
        };

        utteranceRef.current = utterance;
        setState((prev) => ({ ...prev, currentWordIndex: newWordIndex }));
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [state.isPlaying, state.currentWordIndex, state.selectedVoice, state.rate, state.pitch, state.volume]);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    skipParagraph,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    words: wordsRef.current,
  };
}

