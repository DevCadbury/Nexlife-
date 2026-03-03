import React, { useEffect, useState } from "react";
import nexlifeLogo from "../assets/images/nexlife-logo.png";
const Preloader = ({ onComplete }) => {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    // Sequence of animations for preloader
    const sequence = async () => {
      // Step 1: Initial logo pulse
      await new Promise((r) => setTimeout(r, 800));
      setLoadingStep(1); // Start filling progress
      
      // Step 2: Progress text and bar finish
      await new Promise((r) => setTimeout(r, 1200));
      setLoadingStep(2); // Morphing / exit transition
      
      // Step 3: Call onComplete after exit transition
      await new Promise((r) => setTimeout(r, 600));
      onComplete();
    };
    
    sequence();
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500 ${
        loadingStep >= 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`relative flex flex-col items-center transition-all duration-700 ease-in-out ${
          loadingStep >= 2 ? "scale-110 blur-md" : "scale-100 blur-0"
        }`}
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-fuchsia-500/20 to-purple-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative z-10 flex items-center mb-8 drop-shadow-xl">
          <div className="overflow-hidden h-12 md:h-16 flex items-center">
            <img
              src={nexlifeLogo}
              alt="Nexlife International"
              className={`h-10 md:h-14 w-auto object-contain transition-transform duration-700 ${
                loadingStep >= 1 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            />
          </div>
        </div>

        {/* Heartbeat Loading Bar */}
        <div className="relative z-10 w-64 md:w-80 h-20 flex items-center justify-center -mt-2">
          <svg viewBox="0 0 400 100" className="w-full h-full drop-shadow-xl overflow-visible">
            <defs>
              <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
                <stop offset="50%" stopColor="#d946ef" /> {/* fuchsia-500 */}
                <stop offset="100%" stopColor="#9333ea" /> {/* purple-600 */}
              </linearGradient>
              <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Background ECG track */}
            <path 
              d="M 0 50 L 130 50 L 145 30 L 175 80 L 200 10 L 225 80 L 255 30 L 270 50 L 400 50" 
              fill="none" 
              stroke="currentColor" 
              className="text-gray-200 dark:text-gray-800" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            
            {/* Animated Gradient ECG path */}
            <path 
              d="M 0 50 L 130 50 L 145 30 L 175 80 L 200 10 L 225 80 L 255 30 L 270 50 L 400 50" 
              fill="none" 
              stroke="url(#heartbeat-gradient)" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              filter="url(#glow-effect)"
              strokeDasharray="600"
              strokeDashoffset={loadingStep === 0 ? "600" : "0"}
              style={{
                transition: "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            
            {/* Pulse traveling dot */}
            <circle
              r="4"
              fill="#ffffff"
              filter="url(#glow-effect)"
              className="transition-opacity duration-300"
              style={{
                opacity: loadingStep >= 2 ? 0 : 1,
                offsetPath: "path('M 0 50 L 130 50 L 145 30 L 175 80 L 200 10 L 225 80 L 255 30 L 270 50 L 400 50')",
                offsetDistance: loadingStep === 0 ? "0%" : "100%",
                transition: "offset-distance 2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
        </div>
        
        {/* Loading Text */}
        <div className="mt-2 text-sm font-semibold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase relative z-10 transition-colors duration-500">
          <span className={`${loadingStep === 0 ? 'animate-pulse text-blue-500' : 'text-fuchsia-500'}`}>
            {loadingStep === 0 ? "Initializing..." : "Preparing Healthcare Solutions..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
