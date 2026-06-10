"use client";
import React from "react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive";

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default:     { background: "var(--brand-soft)", color: "var(--brand)",  border: "1px solid var(--brand-ring)" },
  secondary:   { background: "var(--bg-inset)",   color: "var(--text-3)", border: "1px solid var(--border)" },
  success:     { background: "var(--ok-bg)",       color: "var(--ok-t)",   border: "1px solid var(--ok-b)" },
  warning:     { background: "var(--warn-bg)",     color: "var(--warn-t)", border: "1px solid var(--warn-b)" },
  destructive: { background: "var(--err-bg)",      color: "var(--err-t)",  border: "1px solid var(--err-b)" },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  style,
  children,
  ...props
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}
    style={{ ...variantStyles[variant], ...style }}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
