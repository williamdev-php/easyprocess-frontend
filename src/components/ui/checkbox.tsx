"use client";

import { InputHTMLAttributes, forwardRef, useState, useCallback } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md";
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = "md", className = "", onChange, ...props }, ref) => {
    const sizeClasses = size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5";
    const [popping, setPopping] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
          setPopping(true);
          setTimeout(() => setPopping(false), 300);
        }
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <span className={`relative inline-flex items-center justify-center ${sizeClasses} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          className="peer absolute inset-0 z-10 opacity-0 cursor-pointer"
          onChange={handleChange}
          {...props}
        />
        <span
          className={`${sizeClasses} rounded-lg border-2 border-border-theme bg-white transition-all duration-150
            peer-checked:border-primary peer-checked:bg-primary
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-1
            peer-hover:border-primary/60
            cursor-pointer ${popping ? "animate-check-pop" : ""}`}
        />
        <svg
          className={`pointer-events-none absolute ${size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} text-white opacity-0 transition-opacity duration-100 peer-checked:opacity-100`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };
export type { CheckboxProps };
