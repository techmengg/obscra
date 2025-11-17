"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020202] px-6 text-zinc-100">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Error</p>
          <p className="max-w-md text-center text-sm text-zinc-400">
            {this.state.error?.message || "Something went wrong. Please refresh the page."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-zinc-200"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

