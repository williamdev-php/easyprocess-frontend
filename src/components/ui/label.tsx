import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-text-secondary ${className}`}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-accent">*</span>}
    </label>
  );
}
