"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md";
  disabledReason?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size = "md", className = "", disabled, disabledReason, ...props }, ref) => {
    const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
    const thumb = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    const translate = size === "sm" ? "peer-checked:translate-x-4" : "peer-checked:translate-x-5";

    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <label className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`${track} rounded-full transition-colors duration-200
              peer-checked:bg-primary-deep
              peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-1
              ${disabled
                ? "bg-gray-100 opacity-50"
                : "bg-gray-200 peer-hover:bg-gray-300 peer-checked:peer-hover:bg-primary-deep/90"
              }`}
          />
          <span
            className={`absolute left-[2px] top-1/2 -translate-y-1/2 ${thumb} rounded-full bg-white shadow-sm transition-transform duration-200 ${translate}
              ${disabled ? "opacity-70" : ""}`}
          />
        </label>
        {disabled && disabledReason && (
          <span className="ml-2 text-[11px] text-text-muted/70 italic max-w-[140px] leading-tight">
            {disabledReason}
          </span>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
export { Switch };
export type { SwitchProps };
