"use client";

import { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  currentTheme: {
    background: string;
    foreground: string;
    border: string;
    muted: string;
  };
}

export const MobileNavOverlay = memo(function MobileNavOverlay({
  isOpen,
  onClose,
  children,
  currentTheme,
}: MobileNavOverlayProps) {
  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Add safe area padding for notched devices
      document.body.style.paddingBottom = "env(safe-area-inset-bottom)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingBottom = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingBottom = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sliding Panel with spring animation */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed inset-y-0 left-0 z-50 w-[90vw] max-w-[380px] shadow-2xl"
            style={{
              backgroundColor: currentTheme.background,
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Header with close button */}
            <div 
              className="flex items-center justify-between px-5 py-4"
            >
              <span 
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: currentTheme.muted }}
              >
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 hover:bg-zinc-900/50"
                aria-label="Close menu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" />
                </svg>
              </button>
            </div>

            {/* Content with proper padding */}
            <div className="flex h-[calc(100%-73px)] flex-col">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

