"use client";
import React from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive";

function classNames(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-800/60 text-slate-200 border-slate-700",
  secondary: "bg-slate-700/40 text-slate-200 border-slate-600",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-700/40",
  warning: "bg-amber-500/20 text-amber-300 border-amber-700/40",
  destructive: "bg-red-500/20 text-red-300 border-red-700/40",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  return (
    <span className={classNames(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
