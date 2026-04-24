import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-text-theme placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? "border-error focus:border-error focus:ring-error/20"
            : success
              ? "border-success focus:border-success focus:ring-success/20 animate-input-success"
              : "border-border-theme focus:border-primary focus:ring-primary/20"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
