"use client";
import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-pulse rounded bg-slate-800/60 ${
      className || "h-4 w-full"
    }`}
  />
);

export default Skeleton;
