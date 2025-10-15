"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  BarChart2,
  MessageCircle,
  Users,
  Megaphone,
  Image as ImageIcon,
  UserCog,
  ScrollText,
  Download,
  Bell,
  LogOut,
  ChevronDown,
  Check,
  Settings as SettingsIcon,
  Package,
  Award,
} from "lucide-react";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["all"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2, roles: ["all"] },
  { href: "/admin/api-docs", label: "API Docs", icon: ScrollText, roles: ["dev"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageCircle, roles: ["all"] },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users, roles: ["all"] },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone, roles: ["all"] },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, roles: ["superadmin", "dev"] },
  { href: "/admin/products-gallery", label: "Products", icon: Package, roles: ["superadmin", "dev"] },
  { href: "/admin/certifications", label: "Certifications", icon: Award, roles: ["superadmin", "dev"] },
  { href: "/admin/staff", label: "Staff", icon: UserCog, roles: ["superadmin", "dev"] },
  { href: "/admin/logs", label: "Logs", icon: ScrollText, roles: ["superadmin", "dev"] },
  { href: "/admin/export", label: "Export", icon: Download, roles: ["superadmin", "dev"] },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, roles: ["all"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [notificationTab, setNotificationTab] = useState<
    "inquiries" | "replies"
  >("inquiries");
  const popRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Poll counts every 15s
  const { data: notif } = useSWR(
    () => `/inquiries/new/count?ts=${Math.floor(Date.now() / 15000)}`,
    fetcher,
    { refreshInterval: 15000 }
  );

  // Poll for new replies every 10s
  const { data: replyNotif } = useSWR(
    () => `/inquiries/replies/count?ts=${Math.floor(Date.now() / 10000)}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: latest, mutate } = useSWR(
    open ? "/inquiries?status=new&limit=20" : null,
    fetcher
  );

  const { data: latestReplies, mutate: mutateReplies } = useSWR(
    open ? "/inquiries/replies/recent?limit=10" : null,
    fetcher
  );

  const { data: profile } = useSWR("/auth/me", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err: any) => {
      if (err?.response?.status === 401) {
        router.push("/login");
      }
    },
  });

  // Immediate client-side authentication check
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthChecking(true);

      // Check if token exists in localStorage or cookies
      let token = localStorage.getItem("token");
      if (!token) {
        const cookies = document.cookie
          .split(";")
          .reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.split("=");
            if (key && value) acc[key.trim()] = decodeURIComponent(value);
            return acc;
          }, {});
        token = cookies["nxl_jwt"];
      }

      if (!token) {
        // No token found, redirect immediately
        router.push("/login");
        return;
      }

      // Validate token format and expiration
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          // Token expired, redirect to login
          localStorage.removeItem("token");
          document.cookie = "nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
          router.push("/login");
          return;
        }
      } catch (error) {
        // Invalid token format, redirect to login
        localStorage.removeItem("token");
        document.cookie = "nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
        router.push("/login");
        return;
      }

      // Token is valid, allow access
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [router]);

  const items = latest?.items || [];
  const replyItems = latestReplies?.items || [];
  const totalNew = (notif?.count || 0) + (replyNotif?.count || 0);

  async function markRead(id: string) {
    await api.patch(`/inquiries/${id}/mark-read`, {});
    mutate();
  }

  async function markAllRead() {
    const emails = Array.from(
      new Set(items.map((i: any) => i.email).filter(Boolean))
    );
    await Promise.all(
      (emails as string[]).map((email) =>
        api.patch(`/inquiries/threads/mark-read-all`, { email })
      )
    );
    mutate();
  }

  async function markReplyRead(replyId: string) {
    try {
      await api.patch(`/inquiries/replies/${replyId}/mark-read`, {});
      // Refresh both replies and notification count
      mutateReplies();
      mutate();
    } catch (error) {
      console.error("Failed to mark reply as read:", error);
    }
  }

  async function markAllRepliesRead() {
    try {
      await api.patch(`/inquiries/replies/mark-all-read`, {});
      // Refresh both replies and notification count
      mutateReplies();
      mutate();
    } catch (error) {
      console.error("Failed to mark all replies as read:", error);
    }
  }

  const handleProfileMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoverOpen(true);
    setProfileOpen(false); // Close dropdown if open
  };

  const handleProfileMouseLeave = () => {
    const timeout = setTimeout(() => {
      if (!isHoveringCard) {
        setHoverOpen(false);
      }
    }, 150);
    setHoverTimeout(timeout);
  };

  const handleCardMouseEnter = () => {
    setIsHoveringCard(true);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCard(false);
    const timeout = setTimeout(() => {
      setHoverOpen(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  // Function to get last login time from JWT token
  const getLastLoginTime = () => {
    if (typeof window === "undefined") return null;
    try {
      let token = localStorage.getItem("token");

      // Fallback: check cookie if no token in localStorage
      if (!token) {
        const cookies = document.cookie
          .split(";")
          .reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key && value) acc[key] = decodeURIComponent(value);
            return acc;
          }, {});
        token = cookies["nxl_jwt"];
      }

      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const iat = payload.iat; // Issued at time from JWT

      if (iat) {
        return new Date(iat * 1000); // Convert from seconds to milliseconds
      }

      return null;
    } catch (error) {
      console.error("Error decoding token for last login:", error);
      return null;
    }
  };

  useEffect(() => {
    setMounted(true);
    function onDoc(e: MouseEvent) {
      if (!open && !profileOpen) return;
      const t = e.target as Node;

      if (
        open &&
        popRef.current &&
        !popRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }

      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(t)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [open, profileOpen, hoverTimeout]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Verifying Access
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Please wait while we check your authentication...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        suppressHydrationWarning={true}
        className="fixed left-0 top-0 h-screen w-[280px] border-r border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl z-30 overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Nexlife CRM
            </h1>
          </div>
          {profile?.user?.name && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Welcome back!
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {profile.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile.user.name}
                  </div>
                  {profile.user.email && (
                    <div
                      className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]"
                      title={profile.user.email}
                    >
                      {profile.user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <nav className="p-4 space-y-2">
          {tabs
            .filter((t) => {
              const userRole = profile?.user?.role;
              
              // If roles is "all", show to everyone
              if (t.roles && t.roles.includes("all")) {
                return true;
              }
              
              // Check if user's role is in the allowed roles list
              if (t.roles && userRole) {
                return t.roles.includes(userRole);
              }
              
              // Default: hide if no role info
              return false;
            })
            .map((t, index) => {
              const Icon = t.icon;
              const isActive = path === t.href;
              return (
                <motion.div
                  key={t.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={t.href}
                    className={`group flex items-center gap-4 px-4 py-3 rounded-xl border border-transparent transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg border-blue-400/50"
                        : "hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 dark:hover:from-slate-800 dark:hover:to-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-200 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20"
                        : "bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-slate-600"
                    }`}>
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      }`} />
                    </div>
                    <span className={`font-medium transition-all duration-300 ${
                      isActive ? "text-white" : ""
                    }`}>
                      {t.label}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Quick Stats
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">New Inquiries</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {notif?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">New Replies</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {replyNotif?.count || 0}
              </span>
            </div>
          </div>
        </div>
      </motion.aside>

      <main className="ml-[280px] flex flex-col min-h-screen">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-40"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200/60 dark:border-slate-600/60"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  System Online
                </span>
              </motion.div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 ml-[280px]">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {totalNew > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {totalNew}
                  </motion.div>
                )}
              </motion.button>

              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ThemeToggle />
              </motion.div>

              {/* User Menu */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
                ref={profileRef}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setHoverOpen(false); // Close hover card when clicking
                }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.user?.name || "User"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {profile?.user?.role || "Staff"}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </motion.div>

              {/* Logout Button - Highlighted and at the end */}
              <motion.form
                action="/api/logout"
                method="post"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-colors"
              >
                <button
                  type="submit"
                  onClick={() => {
                    // Clear all tokens from localStorage and sessionStorage
                    localStorage.clear();
                    sessionStorage.clear();
                    // Clear any cached authentication data
                    if (typeof window !== 'undefined') {
                      // Clear any cached profile data
                      window.location.href = '/login';
                    }
                  }}
                  className="flex items-center gap-2 text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors font-medium"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">Logout</span>
                </button>
              </motion.form>
            </div>

            <AnimatePresence>
              {hoverOpen && (
                <motion.div
                  key="hover-card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-xl ring-1 ring-indigo-500/10 p-4 z-50"
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-slate-200">
                        {profile?.user?.name || "User"}
                      </div>
                      {profile?.user?.email && (
                        <div
                          className="text-sm text-slate-400 truncate"
                          title={profile.user.email}
                        >
                          {profile.user.email}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        Role: <span className="capitalize text-slate-300">{profile?.user?.role || "Staff"}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Account ID: {profile?.user?.id?.slice(-8) || "N/A"}
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                      <div className="text-xs text-slate-500 mb-2">Last Login</div>
                      <div className="text-sm text-slate-300">
                        {getLastLoginTime()
                          ? getLastLoginTime()?.toLocaleString()
                          : "Today"
                        }
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        onClick={() => setHoverOpen(false)}
                      >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                      </Link>
                      <form action="/api/logout" method="post" className="w-full">
                        <button
                          type="submit"
                          onClick={() => {
                            // Clear all tokens from localStorage and sessionStorage
                            localStorage.clear();
                            sessionStorage.clear();
                            // Clear any cached authentication data
                            if (typeof window !== 'undefined') {
                              // Clear any cached profile data
                              window.location.href = '/login';
                            }
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}
              {profileOpen && (
                <motion.div
                  key="profile-menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-xl ring-1 ring-indigo-500/10"
                >
                  <div className="p-3 border-b border-slate-800">
                    <div className="font-medium">
                      {profile?.user?.name || "User"}
                    </div>
                    <div className="text-sm text-slate-400">
                      {profile?.user?.email}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>        <section className="p-6 flex-1">{children}</section>
      </main>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={popRef}
            className="fixed right-6 top-16 z-50 w-[560px] max-w-[90vw] rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur shadow-xl ring-1 ring-indigo-500/10"
            style={{
              boxShadow:
                "0 10px 30px rgba(0,0,0,.35), 0 0 0 1px rgba(99,102,241,.08)",
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold">Notifications</div>
                <div className="flex items-center gap-2">
                  {(items.length > 0 || replyItems.length > 0) && (
                    <button
                      className="text-xs rounded-lg bg-slate-800 px-3 py-1.5 hover:bg-slate-700 transition-colors duration-200 flex items-center gap-2"
                      onClick={() => {
                        if (notificationTab === "inquiries") {
                          markAllRead();
                        } else {
                          markAllRepliesRead();
                        }
                      }}
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-lg">
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    notificationTab === "inquiries"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setNotificationTab("inquiries")}
                >
                  Inquiries ({notif?.count || 0})
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    notificationTab === "replies"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setNotificationTab("replies")}
                >
                  Replies ({replyNotif?.count || 0})
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800 rounded-lg">
                {notificationTab === "inquiries" ? (
                  <>
                    {items.length === 0 && (
                      <div className="text-sm text-slate-400 p-4 text-center">
                        No new inquiries
                      </div>
                    )}
                    {items.map((i: any, index: number) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i._id || `inquiry-${index}-${i.createdAt}`}
                        className="p-4 flex items-start justify-between gap-3 hover:bg-slate-900/40 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-semibold">
                            {i.name}{" "}
                            <span className="text-cyan-300">• {i.email}</span>
                          </div>
                          {i.subject && (
                            <div className="text-sm text-slate-300">
                              {i.subject}
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            {i.createdAt
                              ? new Date(i.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/admin/inquiries`);
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-xs rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => markRead(i._id)}
                          >
                            Mark read
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <>
                    {replyItems.length === 0 && (
                      <div className="text-sm text-slate-400 p-4 text-center">
                        No new replies
                      </div>
                    )}
                    {replyItems.map((reply: any, index: number) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={reply._id || `reply-${index}-${reply.createdAt}`}
                        className="p-4 flex items-start justify-between gap-3 hover:bg-slate-900/40 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-semibold">
                            New reply from{" "}
                            <span className="text-green-300">
                              {reply.fromName || reply.from}
                            </span>
                          </div>
                          <div className="text-sm text-slate-300">
                            {reply.subject}
                          </div>
                          <div className="text-xs text-slate-500">
                            {reply.inquiryEmail && (
                              <span className="text-cyan-300">
                                • {reply.inquiryEmail}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => {
                              setOpen(false);
                              router.push(
                                `/admin/inquiries?email=${encodeURIComponent(
                                  reply.inquiryEmail
                                )}`
                              );
                            }}
                          >
                            View Thread
                          </button>
                          <button
                            className="text-xs rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => markReplyRead(reply._id)}
                          >
                            Mark read
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
