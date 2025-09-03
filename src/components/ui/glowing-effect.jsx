"use client";
import React, { useMemo, useRef, useState, useEffect } from "react";

// Simple proximity-based glowing edge effect
export const GlowingEffect = ({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.02,
  className = "",
}) => {
  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    if (disabled) return;
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const isActive =
        x > -inactiveZone &&
        x < 1 + inactiveZone &&
        y > -inactiveZone &&
        y < 1 + inactiveZone;
      setPos({ x, y, active: isActive });
    };
    const handleLeave = () => setPos((p) => ({ ...p, active: false }));
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [disabled, inactiveZone]);

  const gradientStyle = useMemo(() => {
    const x = Math.max(0, Math.min(1, pos.x));
    const y = Math.max(0, Math.min(1, pos.y));
    const px = `${x * 100}%`;
    const py = `${y * 100}%`;
    const glowAlpha = glow ? 0.25 : 0.15;
    return {
      background: `radial-gradient(${spread}% ${spread}% at ${px} ${py}, rgba(59,130,246,${glowAlpha}), rgba(59,130,246,0) 60%)`,
      opacity: pos.active ? 1 : 0,
      transition: "opacity 200ms ease",
    };
  }, [pos, spread, glow]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <div className="absolute -inset-px rounded-2xl" style={gradientStyle} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-blue-500/15" />
      <div className="absolute inset-0 rounded-2xl mix-blend-screen bg-gradient-to-r from-blue-500/5 via-cyan-400/5 to-indigo-500/5" />
    </div>
  );
};
