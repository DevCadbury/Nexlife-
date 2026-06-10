"use client";
import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <div
    className={`rounded-lg ${className}`}
    style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      ...style,
    }}
    {...props}
  />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`px-4 py-3 ${className}`} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <div
    className={`text-sm font-semibold ${className}`}
    style={{ color: "var(--text)", ...style }}
    {...props}
  />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <div
    className={`text-xs ${className}`}
    style={{ color: "var(--text-3)", ...style }}
    {...props}
  />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`p-4 ${className}`} {...props} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`px-4 py-3 ${className}`} {...props} />;

export default Card;
