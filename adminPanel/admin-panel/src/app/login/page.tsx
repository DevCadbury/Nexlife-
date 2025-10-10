"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendAt, setResendAt] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();
  const codeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (resendAt > 0) {
        const r = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
        setRemaining(r);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  useEffect(() => {
    if (showOtp && !otpVerified) {
      setTimeout(() => codeRef.current?.focus(), 50);
    }
  }, [showOtp, otpVerified]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      if (mode === "login") {
        const r = await api.post("/auth/login", { email, password });
        // force refresh of auth state endpoints after login
        try {
          await api.get("/auth/me");
        } catch {}
        try {
          const token = r?.data?.token;
          if (token && typeof document !== "undefined") {
            const maxAge = 60 * 60 * 12; // 12h
            document.cookie = `nxl_jwt=${encodeURIComponent(
              token
            )}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
            // Also store in localStorage for frontend access
            localStorage.setItem("token", token);
          }
        } catch {}
        router.replace("/admin");
      } else {
        if (!validateEmail(email)) {
          setErr("Enter a valid email");
          return;
        }
        if (!code && !otpVerified) {
          // Check email exists
          const chk = await api.get("/auth/check-email", { params: { email } });
          if (!chk.data?.exists) {
            setErr("No account found for this email");
            return;
          }
          // request OTP
          const r = await api.post("/auth/forgot", { email });
          setOk("OTP sent to your email (valid 5 minutes)");
          if (r.data?.expiresAt) setExpiresAt(r.data.expiresAt);
          setOtpVerified(false);
          setResendAt(Date.now() + 30 * 1000); // 30s cooldown
          setShowOtp(true);
        } else if (!otpVerified) {
          // verify OTP first
          const v = await api.post("/auth/verify-otp", { email, code });
          if (v.data?.valid) {
            setOk("OTP verified. Enter a new password.");
            setOtpVerified(true);
            if (v.data?.expiresAt) setExpiresAt(v.data.expiresAt);
            setShowOtp(false);
          }
        } else {
          const passwordErr = validatePassword(newPass);
          if (passwordErr) {
            setErr(passwordErr);
            return;
          }
          // reset with verified OTP
          await api.post("/auth/reset", { email, code, newPassword: newPass });
          setOk("Password reset. You can login now.");
          setMode("login");
          setOtpVerified(false);
          setCode("");
          setNewPass("");
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || "";
      if (/invalid code/i.test(msg))
        setErr("Invalid OTP. Check the latest code or resend.");
      else if (/expired/i.test(msg))
        setErr("OTP expired. Please resend a new code.");
      else setErr("Request failed. Please try again.");
    }
  }

  function validateEmail(v: string) {
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v);
  }

  function validatePassword(v: string) {
    if (!v || v.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
    if (!/[a-z]/.test(v)) return "Include at least one lowercase letter";
    if (!/[0-9]/.test(v)) return "Include at least one number";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(v))
      return "Include at least one special character";
    return "";
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-slate-800/80 rounded-2xl p-6 bg-slate-900/60 backdrop-blur shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition hover:shadow-[0_10px_50px_rgba(0,0,0,0.55)]"
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow ring-1 ring-indigo-500/30" />
          <h1 className="font-extrabold mt-2">Nexlife CRM</h1>
          <div className="text-xs text-slate-400">Admin Login</div>
        </div>
        <input
          className="w-full mb-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode === "login" ? (
          <input
            className="w-full mb-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : (
          <>
            {/* OTP prompt handled via modal; nothing shown inline */}
            {otpVerified && (
              <>
                <input
                  className="w-full mb-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                  type="password"
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <div className="text-[11px] text-slate-400 mb-2">
                  Must be 8+ chars with upper, lower, number and symbol.
                </div>
              </>
            )}
            {/* Resend + expiry moved into modal for a cleaner form */}
          </>
        )}
        {err && <div className="text-red-400 text-sm mb-2">{err}</div>}
        {ok && <div className="text-emerald-400 text-sm mb-2">{ok}</div>}
        <button className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-lg p-2 font-semibold shadow ring-1 ring-indigo-500/30 transition">
          {mode === "login"
            ? "Login"
            : !code
            ? "Send OTP"
            : otpVerified
            ? "Reset Password"
            : "Verify OTP"}
        </button>
        <div className="text-xs text-slate-400 mt-3 text-center">
          {mode === "login" ? (
            <button
              type="button"
              className="underline"
              onClick={() => setMode("forgot")}
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              className="underline"
              onClick={() => setMode("login")}
            >
              Back to login
            </button>
          )}
        </div>
      </form>
      {/* OTP Modal */}
      {showOtp && !otpVerified && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 p-5 shadow-2xl ring-1 ring-indigo-500/10">
            <div className="mb-3 text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow ring-1 ring-indigo-500/30" />
              <div className="font-extrabold">Verify Code</div>
              <div className="text-xs text-slate-400">
                Enter the 6-digit OTP we sent to your email
              </div>
            </div>
            {/* Code boxes */}
            <div
              className="mb-3 grid grid-cols-6 gap-2 cursor-text"
              onClick={() => codeRef.current?.focus()}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[1/1] rounded-lg border border-slate-800 bg-slate-900/70 text-center grid place-items-center text-lg font-bold tracking-widest text-slate-100"
                >
                  {code[i] || ""}
                </div>
              ))}
            </div>
            <input
              ref={codeRef}
              className="absolute opacity-0 pointer-events-none"
              inputMode="numeric"
              type="tel"
              pattern="[0-9]*"
              autoFocus
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
            />
            {err && <div className="mb-2 text-xs text-red-400">{err}</div>}
            <div className="flex items-center justify-between gap-2 mt-1">
              <button
                className="rounded bg-slate-800 px-3 py-2 text-sm"
                onClick={() => setShowOtp(false)}
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs text-slate-300 underline disabled:opacity-40"
                  disabled={remaining > 0}
                  onClick={async () => {
                    if (remaining > 0) return;
                    setErr("");
                    setOk("");
                    try {
                      const chk = await api.get("/auth/check-email", {
                        params: { email },
                      });
                      if (!chk.data?.exists) {
                        setErr("No account found for this email");
                        return;
                      }
                      const r = await api.post("/auth/forgot", { email });
                      setOk("OTP resent");
                      if (r.data?.expiresAt) setExpiresAt(r.data.expiresAt);
                      setResendAt(Date.now() + 30 * 1000);
                    } catch {}
                  }}
                >
                  {remaining > 0 ? `Resend in ${remaining}s` : "Resend"}
                </button>
                <button
                  className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold"
                  onClick={async () => {
                    setErr("");
                    setOk("");
                    try {
                      const v = await api.post("/auth/verify-otp", {
                        email,
                        code,
                      });
                      if (v.data?.valid) {
                        setOk("OTP verified. Enter a new password.");
                        setOtpVerified(true);
                        if (v.data?.expiresAt) setExpiresAt(v.data.expiresAt);
                        setShowOtp(false);
                      }
                    } catch (e: any) {
                      const msg = e?.response?.data?.error || "";
                      if (/invalid code/i.test(msg))
                        setErr("Invalid OTP. Check the latest code or resend.");
                      else if (/expired/i.test(msg))
                        setErr("OTP expired. Please resend a new code.");
                      else setErr("Request failed. Please try again.");
                    }
                  }}
                  disabled={!code || code.length < 6}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
