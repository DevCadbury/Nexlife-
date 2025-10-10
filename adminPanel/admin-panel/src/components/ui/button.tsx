"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
};

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  const base = "rounded px-3 py-2 font-semibold transition";
  const v =
    variant === "outline"
      ? "border border-slate-800 hover:border-indigo-500/40 bg-transparent"
      : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 ring-1 ring-indigo-500/30";
  const s =
    size === "sm"
      ? "text-sm px-2 py-1"
      : size === "lg"
      ? "text-base px-4 py-2"
      : "text-sm";
  return (
    <button className={`${base} ${v} ${s} ${className || ""}`} {...props} />
  );
};

export default Button;
