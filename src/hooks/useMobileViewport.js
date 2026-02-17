import { useEffect, useState } from "react";

/**
 * Lightweight mobile viewport optimisation.
 * Only sets safe viewport meta and prevents horizontal overflow on
 * html/body.  All visual layout is handled by Tailwind/CSS — no
 * JS-injected style sheets, no DOM-walking overflow hacks, and
 * absolutely no blanket `appearance: none` on every element.
 */
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    /* Detect mobile (<= 768 px) */
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();

    /* Ensure viewport meta is correct (safe, non-destructive) */
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"
      );
    }

    /* Prevent horizontal overflow — CSS-only, on html + body only */
    const styleId = "mobile-viewport-safe";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        html, body {
          overflow-x: hidden;
          -webkit-text-size-adjust: 100%;
        }
        /* Prevent zoom on input focus (iOS) */
        @media (max-width: 768px) {
          input, textarea, select { font-size: 16px !important; }
        }
      `;
      document.head.appendChild(s);
    }

    /* Resize listener (debounced) */
    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(check, 120); };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      clearTimeout(t);
    };
  }, []);

  return { isMobile };
};
