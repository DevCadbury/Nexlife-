"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";

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
  Menu,
  X,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

    }
  }

  async function markAllRepliesRead() {
    try {
      await api.patch(`/inquiries/replies/mark-all-read`, {});
      // Refresh both replies and notification count
      mutateReplies();
      mutate();
    } catch (error) {

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

      return null;
    }
  };

  useEffect(() => {
    setMounted(true);
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <h2 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
            Verifying Access
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          onClick={() => {
            setSidebarCollapsed(true);
            localStorage.setItem('sidebarCollapsed', 'true');
          }}
          className="fixed inset-0 bg-black/40 z-20 lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        suppressHydrationWarning={true}
        className={`fixed left-0 top-0 h-screen w-[260px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 overflow-y-auto transition-transform duration-200 ease-out ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => {
            setSidebarCollapsed(true);
            localStorage.setItem('sidebarCollapsed', 'true');
          }}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700">
              <img src="/nexlife_logo.png" alt="Nexlife" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Nexlife <span className="text-blue-600 dark:text-blue-400">CRM</span>
            </h1>
          </div>
          {profile?.user?.name && (
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Welcome back</div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.user.name}
                </div>
                {profile.user.email && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(profile.user.email);
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group mt-0.5"
                    title="Click to copy email"
                  >
                    <span className="truncate max-w-[170px]">{profile.user.email}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-50 group-hover:opacity-100">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <nav className="p-3 space-y-1">
          {tabs
            .filter((t) => {
              const userRole = profile?.user?.role;
              
              if (t.roles && t.roles.includes("all")) {
                return true;
              }
              
              if (t.roles && userRole) {
                return t.roles.includes(userRole);
              }
              
              return false;
            })
            .map((t) => {
              const Icon = t.icon;
              const isActive = path === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarCollapsed(true);
                      localStorage.setItem('sidebarCollapsed', 'true');
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-500 dark:text-slate-500"
                  }`} />
                  <span className="font-medium">{t.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Quick Stats */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
            Quick Stats
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-slate-600 dark:text-slate-400">New Inquiries</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {notif?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-slate-600 dark:text-slate-400">New Replies</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {replyNotif?.count || 0}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className={`transition-all duration-200 flex flex-col min-h-screen ${
        sidebarCollapsed ? '' : 'lg:ml-[260px]'
      }`}>
        <header
          className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSidebarCollapsed(!sidebarCollapsed);
                  localStorage.setItem('sidebarCollapsed', String(!sidebarCollapsed));
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Online
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {totalNew > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {totalNew}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <div className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ThemeToggle />
              </div>

              {/* User Menu */}
              <div
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
                ref={profileRef}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setHoverOpen(false);
                }}
              >
                <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
                  {profile?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                    {profile?.user?.name || "User"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {profile?.user?.role || "Staff"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Logout Button */}
              <form
                action="/api/logout"
                method="post"
                className="contents"
              >
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.clear();
                    sessionStorage.clear();
                    document.cookie = 'nxl_jwt=; Path=/; Max-Age=0';
                    router.push('/login');
                  }}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </form>
            </div>

              {hoverOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className="space-y-2.5">
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-200">
                        {profile?.user?.name || "User"}
                      </div>
                      {profile?.user?.email && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={profile.user.email}>
                          {profile.user.email}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Role: <span className="capitalize text-slate-600 dark:text-slate-300">{profile?.user?.role || "Staff"}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        onClick={() => setHoverOpen(false)}
                      >
                        <SettingsIcon className="w-3.5 h-3.5" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          document.cookie = 'nxl_jwt=; Path=/; Max-Age=0';
                          router.push('/login');
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {profile?.user?.name || "User"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {profile?.user?.email}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </header>        <section className="p-4 md:p-6 flex-1">{children}</section>
      </main>

        {open && (
          <div
            ref={popRef}
            className="fixed right-6 top-16 z-50 w-[560px] max-w-[90vw] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/95 backdrop-blur shadow-xl ring-1 ring-slate-200 dark:ring-indigo-500/10 animate-in fade-in zoom-in-95 duration-200"
            style={{
              boxShadow:
                "0 10px 30px rgba(0,0,0,.1), 0 0 0 1px rgba(148,163,184,.1)",
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-slate-900 dark:text-white">Notifications</div>
                <div className="flex items-center gap-2">
                  {(items.length > 0 || replyItems.length > 0) && (
                    <button
                      className="text-xs rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-200 flex items-center gap-2"
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
              <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    notificationTab === "inquiries"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => setNotificationTab("inquiries")}
                >
                  Inquiries ({notif?.count || 0})
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    notificationTab === "replies"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => setNotificationTab("replies")}
                >
                  Replies ({replyNotif?.count || 0})
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 rounded-lg">
                {notificationTab === "inquiries" ? (
                  <>
                    {items.length === 0 && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center">
                        No new inquiries
                      </div>
                    )}
                    {items.map((i: any, index: number) => (
                      <div
                        key={i._id || `inquiry-${index}-${i.createdAt}`}
                        className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {i.name}{" "}
                            <span className="text-blue-600 dark:text-cyan-400">• {i.email}</span>
                          </div>
                          {i.subject && (
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                              {i.subject}
                            </div>
                          )}
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {i.createdAt
                              ? new Date(i.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 transition-colors duration-200"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/admin/inquiries`);
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-xs rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => markRead(i._id)}
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {replyItems.length === 0 && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center">
                        No new replies
                      </div>
                    )}
                    {replyItems.map((reply: any, index: number) => (
                      <div
                        key={reply._id || `reply-${index}-${reply.createdAt}`}
                        className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors duration-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            New reply from{" "}
                            <span className="text-green-600 dark:text-green-400">
                              {reply.fromName || reply.from}
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {reply.subject}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {reply.inquiryEmail && (
                              <span className="text-blue-600 dark:text-cyan-400">
                                • {reply.inquiryEmail}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {reply.createdAt
                              ? new Date(reply.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 transition-colors duration-200"
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
                            className="text-xs rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 transition-colors duration-200"
                            onClick={() => markReplyRead(reply._id)}
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
