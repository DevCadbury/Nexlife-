"use client";
import React from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "danger" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const base = "crm-btn";

  const variantClass = {
    default:   "crm-btn-primary",
    secondary: "crm-btn-secondary",
    outline:   "crm-btn-secondary",
    ghost:     "crm-btn-ghost",
    danger:    "crm-btn-danger",
  }[variant];

  const sizeClass = {
    sm: "crm-btn-sm",
    md: "",
    lg: "crm-btn-lg",
  }[size];

  return (
    <button
      className={[base, variantClass, sizeClass, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

export default Button;
