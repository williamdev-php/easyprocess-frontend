"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth-context";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Application error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <h1 className="mb-2 text-xl font-semibold">Något gick fel</h1>
            <p className="mb-4 text-sm text-gray-500">Ett oväntat fel inträffade.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Försök igen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}
