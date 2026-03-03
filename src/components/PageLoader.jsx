import React from "react";
import nexlifeLogo from "../assets/images/nexlife-logo.png";

/**
 * Lightweight page-level loader used as Suspense fallback during
 * route-based code-splitting. Keeps the branded feel without the
 * full orchestrated intro sequence.
 */
const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-fuchsia-500/10 to-purple-500/10 blur-3xl" />

      {/* Logo */}
      <div className="relative z-10 mb-8">
        <img
          src={nexlifeLogo}
          alt="Nexlife International"
          className="h-10 md:h-14 w-auto object-contain animate-pulse"
          style={{ animationDuration: "1.8s" }}
        />
      </div>

      {/* Heartbeat EKG SVG */}
      <div className="relative z-10 w-56 md:w-72 h-16 flex items-center justify-center">
        <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible drop-shadow-lg">
          <defs>
            <linearGradient id="pg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <filter id="pg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d="M 0 50 L 130 50 L 145 30 L 175 80 L 200 10 L 225 80 L 255 30 L 270 50 L 400 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated line */}
          <path
            d="M 0 50 L 130 50 L 145 30 L 175 80 L 200 10 L 225 80 L 255 30 L 270 50 L 400 50"
            fill="none"
            stroke="url(#pg-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pg-glow)"
            strokeDasharray="600"
            style={{
              animation: "heartbeat-draw 1.6s ease-in-out infinite",
            }}
          />
        </svg>
      </div>

      <p className="relative z-10 mt-3 text-xs font-semibold tracking-[0.25em] uppercase text-fuchsia-500 animate-pulse">
        Loading...
      </p>

      <style>{`
        @keyframes heartbeat-draw {
          0%   { stroke-dashoffset: 600; }
          60%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -600; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
