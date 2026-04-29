"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------------
// Preset swatches
// ---------------------------------------------------------------------------

const SWATCHES = [
  "#326586", "#24506E", "#1A3A50", "#F4E9D4",
  "#2563EB", "#1E40AF", "#3B82F6", "#60A5FA",
  "#059669", "#047857", "#10B981", "#34D399",
  "#7C3AED", "#6D28D9", "#8B5CF6", "#A78BFA",
  "#DC2626", "#B91C1C", "#EF4444", "#F87171",
  "#D97706", "#B45309", "#F59E0B", "#FBBF24",
  "#0891B2", "#0E7490", "#06B6D4", "#22D3EE",
  "#FFFFFF", "#F9FAFB", "#111827", "#1F2937",
];

// ---------------------------------------------------------------------------
// ColorPicker component
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHSL(value));

  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"gradient" | "hue" | null>(null);

  // Sync external value changes
  useEffect(() => {
    setHexInput(value);
    setHsl(hexToHSL(value));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Exit animation lifecycle
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

  const commitColor = useCallback(
    (h: number, s: number, l: number) => {
      const hex = hslToHex(h, s, l);
      setHsl([h, s, l]);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  // ---- Gradient (saturation/lightness) interaction ----
  const handleGradientMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = gradientRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const l = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
      commitColor(hsl[0], Math.round(s), Math.round(l));
    },
    [hsl, commitColor],
  );

  // ---- Hue slider interaction ----
  const handleHueMove = useCallback(
    (clientX: number) => {
      const el = hueRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
      commitColor(Math.round(h), hsl[1], hsl[2]);
    },
    [hsl, commitColor],
  );

  // Global mouse move/up for dragging
  useEffect(() => {
    if (!open) return;

    function onMove(e: MouseEvent) {
      if (dragging.current === "gradient") handleGradientMove(e.clientX, e.clientY);
      else if (dragging.current === "hue") handleHueMove(e.clientX);
    }
    function onUp() {
      dragging.current = null;
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [open, handleGradientMove, handleHueMove]);

  // Touch support
  useEffect(() => {
    if (!open) return;

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (dragging.current === "gradient") { e.preventDefault(); handleGradientMove(t.clientX, t.clientY); }
      else if (dragging.current === "hue") { e.preventDefault(); handleHueMove(t.clientX); }
    }
    function onTouchEnd() {
      dragging.current = null;
    }

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, handleGradientMove, handleHueMove]);

  // Hex input handling
  function handleHexChange(raw: string) {
    setHexInput(raw);
    const cleaned = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      setHsl(hexToHSL(cleaned));
      onChange(cleaned.toLowerCase());
    }
  }

  const [h, s, l] = hsl;
  const pureHue = hslToHex(h, 100, 50);

  // Gradient thumb position
  const thumbX = `${s}%`;
  const thumbY = `${100 - l}%`;

  // Hue thumb position
  const hueThumbX = `${(h / 360) * 100}%`;

  return (
    <div className="relative flex flex-col items-center gap-1.5" ref={containerRef}>
      <label className="text-xs font-medium text-text-muted">{label}</label>

      {/* Swatch button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative h-10 w-10 rounded-lg border-2 border-border-theme transition-all hover:border-primary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        style={{ backgroundColor: value }}
        aria-label={`${label}: ${value}`}
      >
        <span className="absolute inset-0 rounded-[6px] ring-1 ring-inset ring-black/10" />
      </button>

      <span className="text-[10px] font-mono text-text-muted select-all">{value}</span>

      {/* Popover */}
      {visible && (
        <div className={`absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-border-theme bg-white p-4 shadow-xl ${closing ? 'animate-tooltip-out' : 'animate-tooltip-in'}`}>
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="h-3 w-3 rotate-45 border-l border-t border-border-theme bg-white" />
          </div>

          {/* Saturation/Lightness gradient */}
          <div
            ref={gradientRef}
            className="relative mb-3 h-36 w-full cursor-crosshair overflow-hidden rounded-xl"
            style={{
              background: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, ${pureHue})
              `,
            }}
            onMouseDown={(e) => {
              dragging.current = "gradient";
              handleGradientMove(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              dragging.current = "gradient";
              const t = e.touches[0];
              handleGradientMove(t.clientX, t.clientY);
            }}
          >
            {/* Thumb */}
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)]"
              style={{
                left: thumbX,
                top: thumbY,
                backgroundColor: value,
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            ref={hueRef}
            className="relative mb-4 h-3 w-full cursor-pointer rounded-full"
            style={{
              background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            onMouseDown={(e) => {
              dragging.current = "hue";
              handleHueMove(e.clientX);
            }}
            onTouchStart={(e) => {
              dragging.current = "hue";
              const t = e.touches[0];
              handleHueMove(t.clientX);
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.2)]"
              style={{
                left: hueThumbX,
                backgroundColor: pureHue,
              }}
            />
          </div>

          {/* Hex input */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-8 w-8 shrink-0 rounded-lg border border-border-theme"
              style={{ backgroundColor: value }}
            />
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-mono text-text-muted">
                #
              </span>
              <input
                type="text"
                value={hexInput.replace("#", "")}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={6}
                className="w-full rounded-lg border border-border-theme bg-white py-1.5 pl-6 pr-2 font-mono text-xs text-text-theme uppercase transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Swatches */}
          <div className="grid grid-cols-8 gap-1.5">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => {
                  const newHsl = hexToHSL(swatch);
                  setHsl(newHsl);
                  setHexInput(swatch);
                  onChange(swatch);
                }}
                className={`h-5 w-5 rounded transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  value.toLowerCase() === swatch.toLowerCase()
                    ? "ring-2 ring-primary ring-offset-1"
                    : "ring-1 ring-inset ring-black/10"
                }`}
                style={{ backgroundColor: swatch }}
                aria-label={swatch}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ColorPicker.displayName = "ColorPicker";
export { ColorPicker };
export type { ColorPickerProps };
