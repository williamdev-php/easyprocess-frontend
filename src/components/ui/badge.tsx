import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "accent" | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary-dark",
  primary: "bg-primary text-white",
  accent: "bg-accent/15 text-accent",
  outline: "border border-border-theme text-text-secondary",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
