"use client";
import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-pulse rounded ${className || "h-4 w-full"}`}
    style={{ background: "var(--bg-inset)" }}
  />
);

export default Skeleton;
