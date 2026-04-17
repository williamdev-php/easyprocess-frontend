import { HTMLAttributes } from "react";

type AlertVariant = "error" | "success" | "info";

const variantClasses: Record<AlertVariant, string> = {
  error: "bg-error-bg border-error/20 text-error",
  success: "bg-primary/10 border-primary/20 text-primary-dark",
  info: "bg-primary-deep/5 border-primary-deep/10 text-primary-deep",
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ variant = "error", className = "", children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border p-3.5 text-sm font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
