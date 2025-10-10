"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, Shield, Sparkles } from "lucide-react";

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

        // Add a small delay for animation
        setTimeout(() => {
          router.replace("/admin");
        }, 800);
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -20, null],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen grid place-items-center p-4">
        <motion.form
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onSubmit={submit}
          className="w-full max-w-md border border-slate-800/60 rounded-3xl p-8 bg-slate-900/40 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_25px_100px_rgba(0,0,0,0.6)] hover:border-slate-700/60"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-2xl ring-2 ring-indigo-500/20 mb-4 relative overflow-hidden"
            >
              <Shield className="w-8 h-8 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-cyan-300 to-purple-500"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
            <motion.h1
              className="font-extrabold text-2xl bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Nexlife CRM
            </motion.h1>
            <motion.div
              className="text-sm text-slate-400 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles className="w-4 h-4" />
              Admin Portal
            </motion.div>
          </motion.div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-white placeholder-slate-400"
                  placeholder="admin@nexlife.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            {mode === "login" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-white placeholder-slate-400"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* New Password Field for Reset */}
            {mode === "forgot" && otpVerified && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-white placeholder-slate-400"
                  type="password"
                  placeholder="Enter new password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  disabled={isLoading}
                />
                <div className="text-[11px] text-slate-400 mt-2">
                  Must be 8+ chars with upper, lower, number and symbol.
                </div>
              </motion.div>
            )}
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="text-red-400 text-sm font-medium">{err}</div>
              </motion.div>
            )}
            {ok && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <div className="text-emerald-400 text-sm font-medium">{ok}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl py-4 font-semibold shadow-lg ring-2 ring-indigo-500/20 transition-all duration-200 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
              animate={isLoading ? { x: ["0%", "100%"] } : { x: "0%" }}
              transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
            />
            <div className="relative flex items-center justify-center gap-3">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode === "login"
                      ? "Sign In"
                      : !code
                      ? "Send OTP"
                      : otpVerified
                      ? "Reset Password"
                      : "Verify OTP"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* Mode Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
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
              className="text-sm text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-2"
            >
              {mode === "login" ? "Forgot password?" : "Back to login"}
            </button>
          </motion.div>
        </motion.form>

        {/* OTP Modal */}
        <AnimatePresence>
          {showOtp && !otpVerified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-sm rounded-3xl border border-slate-800/60 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl ring-1 ring-indigo-500/20"
              >
                <div className="mb-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-lg ring-2 ring-indigo-500/20 flex items-center justify-center"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="font-bold text-lg text-white mb-2">Verify Code</div>
                  <div className="text-sm text-slate-400">
                    Enter the 6-digit OTP sent to your email
                  </div>
                </div>

                {/* Code Input */}
                <div
                  className="mb-6 grid grid-cols-6 gap-3 cursor-text"
                  onClick={() => codeRef.current?.focus()}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="aspect-[1/1] rounded-xl border-2 border-slate-700 bg-slate-800/50 text-center grid place-items-center text-xl font-bold tracking-widest text-white transition-all duration-200"
                      animate={{
                        borderColor: code[i] ? "#6366f1" : "#374151",
                        backgroundColor: code[i] ? "#1e1b4b" : "#1f2937",
                      }}
                    >
                      {code[i] || ""}
                    </motion.div>
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setShowOtp(false)}
                  >
                    Cancel
                  </motion.button>

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

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
