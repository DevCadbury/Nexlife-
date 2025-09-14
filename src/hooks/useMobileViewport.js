import { useEffect, useState } from "react";

/**
 * Custom hook for mobile viewport optimization
 * Automatically detects mobile devices and applies optimal viewport settings
 */
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    // Function to detect mobile devices
    const detectMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    // Function to optimize viewport for mobile
    const optimizeViewport = () => {
      if (detectMobile()) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          // Get device pixel ratio for better scaling
          const dpr = window.devicePixelRatio || 1;
          const scale = Math.min(1.0, 1.0 / dpr);

          // Set optimal viewport settings
          viewport.setAttribute(
            "content",
            `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover`
          );

          // Add mobile-specific styles
          const existingStyle = document.getElementById(
            "mobile-viewport-optimization"
          );
          if (!existingStyle) {
            const style = document.createElement("style");
            style.id = "mobile-viewport-optimization";
            style.textContent = `
               /* Mobile viewport optimization */
               body {
                 -webkit-text-size-adjust: 100%;
                 -ms-text-size-adjust: 100%;
                 text-size-adjust: 100%;
                 overflow-x: hidden;
               }
               
               /* Remove all scrollbar artifacts */
               * {
                 -webkit-appearance: none !important;
                 -moz-appearance: none !important;
                 appearance: none !important;
               }
               
               *::-webkit-scrollbar {
                 display: none !important;
               }
               
               * {
                 -ms-overflow-style: none !important;
                 scrollbar-width: none !important;
               }
               
               /* Remove scrollbar buttons and arrows */
               *::-webkit-scrollbar-button {
                 display: none !important;
               }
               
               *::-webkit-scrollbar-track {
                 display: none !important;
               }
               
               *::-webkit-scrollbar-thumb {
                 display: none !important;
               }
               
               *::-webkit-scrollbar-corner {
                 display: none !important;
               }
               
               /* Prevent zoom on input focus */
               input, textarea, select {
                 font-size: 16px !important;
               }
               
               /* Optimize container padding for mobile */
               .container-custom {
                 padding-left: 1rem;
                 padding-right: 1rem;
                 max-width: 100%;
                 overflow-x: hidden;
               }
               
               /* Ensure proper mobile scaling */
               html {
                 -webkit-text-size-adjust: 100%;
                 -ms-text-size-adjust: 100%;
                 overflow-x: hidden;
               }
               
               /* Prevent horizontal scroll */
               * {
                 box-sizing: border-box;
               }
               
               /* Mobile-specific optimizations */
               @media (max-width: 768px) {
                 .container-custom {
                   padding-left: 0.75rem;
                   padding-right: 0.75rem;
                 }
                 
                 /* Ensure images don't overflow */
                 img {
                   max-width: 100%;
                   height: auto;
                 }
                 
                 /* Optimize text for mobile reading */
                 body {
                   font-size: 16px;
                   line-height: 1.5;
                 }
               }
               
               /* Very small screens */
               @media (max-width: 480px) {
                 .container-custom {
                   padding-left: 0.5rem;
                   padding-right: 0.5rem;
                 }
               }
             `;
            document.head.appendChild(style);
          }

          setIsOptimized(true);
        }
      }
    };

    // Prevent horizontal scroll by ensuring body width doesn't exceed viewport
    const preventHorizontalScroll = () => {
      const body = document.body;
      const html = document.documentElement;

      // Force body width to not exceed viewport
      body.style.maxWidth = "100vw";
      body.style.overflowX = "hidden";
      html.style.maxWidth = "100vw";
      html.style.overflowX = "hidden";

      // Check for any elements that might be causing horizontal scroll
      const checkForOverflow = () => {
        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            element.style.maxWidth = "100%";
            element.style.overflowX = "hidden";
          }
        });
      };

      // Run check after DOM is loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkForOverflow);
      } else {
        checkForOverflow();
      }

      // Run check on window resize
      window.addEventListener("resize", checkForOverflow);
    };

    // Initial optimization
    optimizeViewport();
    preventHorizontalScroll();

    // Handle resize events
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        optimizeViewport();
        preventHorizontalScroll();
      }, 100);
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        optimizeViewport();
        preventHorizontalScroll();
      }, 100);
    };

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return { isMobile, isOptimized };
};
