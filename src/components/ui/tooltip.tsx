"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  text: string;
  children?: ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div className="relative inline-flex ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus:outline-none"
        aria-label="More info"
      >
        {children ?? (
          <svg
            className="h-4 w-4 text-text-muted cursor-help hover:text-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        )}
      </button>
      {visible && (
        <div className={`absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-primary-deep px-3 py-2 text-xs text-white shadow-lg ${closing ? 'animate-tooltip-out' : 'animate-tooltip-in'}`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-deep" />
        </div>
      )}
    </div>
  );
}

export { Tooltip };
export type { TooltipProps };
