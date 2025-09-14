import { useEffect } from "react";

/**
 * Custom hook to force desktop view on mobile devices
 * This prevents mobile viewport optimization and forces desktop layout
 */
export const useDesktopOnly = () => {
  useEffect(() => {
    // Set viewport meta tag to force desktop view
    const setDesktopViewport = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=1200, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        );
      }
    };

    // Add CSS to force desktop layout
    const addDesktopStyles = () => {
      const existingStyle = document.getElementById("desktop-only-styles");
      if (!existingStyle) {
        const style = document.createElement("style");
        style.id = "desktop-only-styles";
        style.textContent = `
          /* Force desktop view on all devices */
          body {
            min-width: 1200px !important;
            overflow-x: auto !important;
          }
          
          .container-custom {
            min-width: 1200px !important;
            max-width: 1400px !important;
            margin: 0 auto !important;
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
          
          /* Force desktop navbar and hide mobile nav */
          .md\\:hidden {
            display: none !important;
          }
          
          .hidden.md\\:flex {
            display: flex !important;
          }
          
          /* Prevent mobile-specific optimizations */
          @media (max-width: 768px) {
            body {
              min-width: 1200px !important;
              overflow-x: auto !important;
            }
            
            .container-custom {
              min-width: 1200px !important;
              max-width: 1400px !important;
              margin: 0 auto !important;
              padding-left: 2rem !important;
              padding-right: 2rem !important;
            }
            
            /* Force desktop grid layouts */
            .grid {
              display: grid !important;
            }
            
            /* Prevent mobile text scaling */
            * {
              font-size: inherit !important;
            }
            
            /* Force desktop navbar on mobile */
            .md\\:hidden {
              display: none !important;
            }
            
            .hidden.md\\:flex {
              display: flex !important;
            }
          }
          
          /* Very small screens - force horizontal scroll */
          @media (max-width: 480px) {
            body {
              min-width: 1200px !important;
              overflow-x: auto !important;
            }
            
            .container-custom {
              min-width: 1200px !important;
              max-width: 1400px !important;
              margin: 0 auto !important;
              padding-left: 1rem !important;
              padding-right: 1rem !important;
            }
            
            /* Force desktop navbar on very small screens */
            .md\\:hidden {
              display: none !important;
            }
            
            .hidden.md\\:flex {
              display: flex !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Apply desktop view settings
    setDesktopViewport();
    addDesktopStyles();

    // Cleanup function to restore normal viewport when component unmounts
    return () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"
        );
      }

      const desktopStyle = document.getElementById("desktop-only-styles");
      if (desktopStyle) {
        desktopStyle.remove();
      }
    };
  }, []);

  return {
    isDesktopOnly: true,
    minWidth: "1200px",
  };
};
