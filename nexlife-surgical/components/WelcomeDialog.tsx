"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";

// Shows once per browser session (not on F5/refresh).
// Tells surgical-site visitors about the main pharma site.
const SESSION_KEY = "nxl_welcome_shown";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setOpen(true);
        setTimeout(() => setVisible(true), 220);
      }
    } catch {}
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(() => setOpen(false), 260);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          background: "rgba(0,0,0,0.50)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.26s ease",
        }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            pointerEvents: "auto",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(14px) scale(0.97)",
            transition: "opacity 0.26s ease, transform 0.26s ease",
          }}
        >
          {/* Header */}
          <div style={{ background: "#0D2240", padding: "20px 22px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", padding: "5px", flexShrink: 0 }}>
                  <img src="/images/nexlife-logo.png" alt="Nexlife International" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Nexlife International</span>
              </div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.50)", marginBottom: "4px" }}>
                Also by Nexlife
              </p>
              <h2 id="welcome-title" style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Looking for pharma products?
              </h2>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{ padding: "6px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", cursor: "pointer", flexShrink: 0, transition: "background 150ms" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)")}
            >
              <X size={17} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 22px 22px" }}>
            <p style={{ fontSize: "13.5px", color: "#4B5563", lineHeight: 1.65, marginBottom: "18px" }}>
              You&apos;re on our <strong style={{ color: "#0D2240" }}>Surgical &amp; Medical Supplies</strong> site.
              We also operate a separate portal for pharmaceutical exports, medicines, and global pharma solutions.
            </p>

            <a
              href="https://www.nexlifeinternational.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 15px", borderRadius: "11px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", textDecoration: "none", transition: "border-color 150ms, background 150ms" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#0D2240"; (e.currentTarget as HTMLAnchorElement).style.background = "#EFF3F8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLAnchorElement).style.background = "#F9FAFB"; }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "9px", background: "#0D2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "6px", overflow: "hidden" }}>
                <img src="/images/nexlife-logo.png" alt="Nexlife International" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "1px" }}>Nexlife International — Pharma</div>
                <div style={{ fontSize: "11.5px", color: "#6B7280" }}>nexlifeinternational.com · Medicines, exports &amp; global solutions</div>
              </div>
              <ArrowRight size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
            </a>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={dismiss}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#0D2240", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 150ms" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0D2240")}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
