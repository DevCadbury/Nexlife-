"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const codeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setIsLoading(true);

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

        // Navigate immediately
        router.replace("/admin");
      } else {
        if (!validateEmail(email)) {
          setErr("Enter a valid email");
          setIsLoading(false);
          return;
        }
        if (!code && !otpVerified) {
          // Check email exists
          const chk = await api.get("/auth/check-email", { params: { email } });
          if (!chk.data?.exists) {
            setErr("No account found for this email");
            setIsLoading(false);
            return;
          }
          // request OTP
          const r = await api.post("/auth/forgot", { email });
          setOk("OTP sent to your email (valid 5 minutes)");
          if (r.data?.expiresAt) setExpiresAt(r.data.expiresAt);
          setOtpVerified(false);
          setResendAt(Date.now() + 30 * 1000); // 30s cooldown
          setShowOtp(true);
          setIsLoading(false);
        } else if (!otpVerified) {
          // verify OTP first
          const v = await api.post("/auth/verify-otp", { email, code });
          if (v.data?.valid) {
            setOk("OTP verified. Enter a new password.");
            setOtpVerified(true);
            if (v.data?.expiresAt) setExpiresAt(v.data.expiresAt);
            setShowOtp(false);
            setIsLoading(false);
          }
        } else {
          const passwordErr = validatePassword(newPass);
          if (passwordErr) {
            setErr(passwordErr);
            setIsLoading(false);
            return;
          }
          // reset with verified OTP
          await api.post("/auth/reset", { email, code, newPassword: newPass });
          setOk("Password reset. You can login now.");
          setMode("login");
          setOtpVerified(false);
          setCode("");
          setNewPass("");
          setIsLoading(false);
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || "";
      if (/invalid code/i.test(msg))
        setErr("Invalid OTP. Check the latest code or resend.");
      else if (/expired/i.test(msg))
        setErr("OTP expired. Please resend a new code.");
      else setErr("Request failed. Please try again.");
      setIsLoading(false);
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-5 right-5 z-50">
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ThemeToggle />
        </div>
      </div>

      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 dark:bg-blue-950/20 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 dark:bg-indigo-950/20 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative z-10 min-h-screen grid place-items-center p-4">
        <form
          onSubmit={submit}
          className="w-full max-w-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-7 bg-white dark:bg-slate-900 shadow-lg"
        >
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3 p-2.5">
              <img src="/nexlife_logo.png" alt="Nexlife" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-bold text-xl text-slate-900 dark:text-white mb-0.5">
              Nexlife International
            </h1>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Customer Management System
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="admin@nexlife.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            {mode === "login" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password Field for Reset */}
            {mode === "forgot" && otpVerified && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  type="password"
                  placeholder="Enter new password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  disabled={isLoading}
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Must be 8+ chars with upper, lower, number and symbol.
                </div>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {err && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
              <div className="text-red-600 dark:text-red-400 text-sm">{err}</div>
            </div>
          )}
          {ok && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
              <div className="text-emerald-600 dark:text-emerald-400 text-sm">{ok}</div>
            </div>
          )}

          {/* Login Button */}
          <button
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 rounded-lg py-2.5 font-medium text-sm text-white transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>
                  {mode === "login"
                    ? "Sign In"
                    : !code
                    ? "Send OTP"
                    : otpVerified
                    ? "Reset Password"
                    : "Verify OTP"}
                </span>
              )}
            </div>
          </button>

          {/* Mode Toggle */}
          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "forgot" : "login");
                setErr("");
                setOk("");
                setOtpVerified(false);
                setCode("");
                setNewPass("");
                setShowOtp(false);
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {mode === "login" ? "Forgot password?" : "Back to login"}
            </button>
          </div>
        </form>

        {/* OTP Modal */}
        {showOtp && !otpVerified && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl"
              >
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                    <img src="/nexlife_logo.png" alt="Nexlife" className="w-full h-full object-contain" />
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white mb-1">Verify Code</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Enter the 6-digit OTP sent to your email
                  </div>
                </div>

                {/* Code Input */}
                <div
                  className="mb-5 grid grid-cols-6 gap-2 cursor-text"
                  onClick={() => codeRef.current?.focus()}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg border-2 bg-slate-50 dark:bg-slate-800 text-center grid place-items-center text-lg font-bold text-slate-900 dark:text-white transition-colors ${
                        code[i] ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'
                      }`}
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

                {err && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-red-400 text-sm">{err}</div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <button
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    onClick={() => setShowOtp(false)}
                    type="button"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-indigo-400 transition-colors underline disabled:opacity-40"
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
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
