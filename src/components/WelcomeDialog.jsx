import React, { useEffect, useState } from "react";

// Shows once per browser session — tells main-site visitors about the surgical site.
const SESSION_KEY = "nxl_main_welcome_shown";

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setOpen(true);
        setTimeout(() => setVisible(true), 280);
      }
    } catch {}
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(() => setOpen(false), 260);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
  }

  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9000,
    background: "rgba(0,0,0,0.50)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.26s ease",
    cursor: "pointer",
  };

  const wrapStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    pointerEvents: "none",
  };

  const cardStyle = {
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
  };

  return (
    <>
      <div style={overlayStyle} onClick={dismiss} aria-hidden="true" />
      <div style={wrapStyle} role="dialog" aria-modal="true" aria-labelledby="welcome-main-title">
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ background: "#0D2240", padding: "20px 22px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.50)", marginBottom: "4px" }}>
                Also by Nexlife
              </p>
              <h2 id="welcome-main-title" style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Looking for surgical supplies?
              </h2>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{ padding: "6px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", cursor: "pointer", flexShrink: 0, lineHeight: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              {/* × icon inline so no icon lib dependency */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 22px 22px" }}>
            <p style={{ fontSize: "13.5px", color: "#4B5563", lineHeight: 1.65, marginBottom: "18px" }}>
              You&apos;re on our <strong style={{ color: "#0D2240" }}>Pharma &amp; Medicines</strong> portal.
              We also operate a dedicated site for surgical instruments, medical disposables, and devices.
            </p>

            <a
              href="https://nexlifeinternational.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 15px", borderRadius: "11px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0A8A78"; e.currentTarget.style.background = "#F0FBF9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
            >
              {/* Logo in a dark bg pill */}
              <div style={{ width: "48px", height: "48px", borderRadius: "9px", background: "#0D2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "6px", overflow: "hidden" }}>
                <img src="/nexlife-logo.png" alt="Nexlife" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} onError={(e) => { e.target.style.display = "none"; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "1px" }}>Nexlife — Surgical &amp; Medical Supplies</div>
                <div style={{ fontSize: "11.5px", color: "#6B7280" }}>nexlifeinternational.in · Instruments, disposables &amp; devices</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={dismiss}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#0D2240", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3a5c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0D2240")}
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
