"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
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
  PanelLeftClose,
  PanelLeft,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "valid" | "invalid">("checking");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<"inquiries" | "replies">("inquiries");
  const notifRef = useRef<HTMLDivElement | null>(null);
  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Poll counts
  const { data: notif } = useSWR(
    () => `/inquiries/new/count?ts=${Math.floor(Date.now() / 15000)}`,
    fetcher,
    { refreshInterval: 15000 }
  );

  const { data: replyNotif } = useSWR(
    () => `/inquiries/replies/count?ts=${Math.floor(Date.now() / 10000)}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: latest, mutate } = useSWR(
    notificationOpen ? "/inquiries?status=new&limit=20" : null,
    fetcher
  );

  const { data: latestReplies, mutate: mutateReplies } = useSWR(
    notificationOpen ? "/inquiries/replies/recent?limit=10" : null,
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

  // Non-blocking auth check — renders layout shell immediately while validating
  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.split("=");
        if (key && value) acc[key.trim()] = decodeURIComponent(value);
        return acc;
      }, {});
      token = cookies["nxl_jwt"];
    }

    if (!token) {
      router.push("/login");
      setAuthState("invalid");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        localStorage.removeItem("token");
        document.cookie = "nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
        router.push("/login");
        setAuthState("invalid");
        return;
      }
    } catch {
      localStorage.removeItem("token");
      document.cookie = "nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
      router.push("/login");
      setAuthState("invalid");
      return;
    }

    setAuthState("valid");
  }, [router]);

  const items = latest?.items || [];
  const replyItems = latestReplies?.items || [];
  const totalNew = (notif?.count || 0) + (replyNotif?.count || 0);

  async function markRead(id: string) {
    await api.patch(`/inquiries/${id}/mark-read`, {});
    mutate();
  }

  async function markAllRead() {
    const emails = Array.from(new Set(items.map((i: any) => i.email).filter(Boolean)));
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
      mutateReplies();
      mutate();
    } catch {}
  }

  async function markAllRepliesRead() {
    try {
      await api.patch(`/inquiries/replies/mark-all-read`, {});
      mutateReplies();
      mutate();
    } catch {}
  }

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "nxl_jwt=; Path=/; Max-Age=0";
    router.push("/login");
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") setSidebarOpen(false);

    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (notificationOpen && notifRef.current && !notifRef.current.contains(t) && notifBtnRef.current && !notifBtnRef.current.contains(t)) {
        setNotificationOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notificationOpen, profileOpen]);

  // Don't render anything while redirecting to login
  if (authState === "invalid") return null;

  const userRole = profile?.user?.role;
  const filteredTabs = tabs.filter((t) => {
    if (t.roles.includes("all")) return true;
    if (userRole && t.roles.includes(userRole)) return true;
    return false;
  });

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-50 dark:bg-[#0c0f1a]">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col
          ${sidebarOpen ? "w-[240px]" : "w-[64px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-[width] duration-200 ease-out lg:transition-[width]
        `}
        style={{ transitionProperty: "width, transform" }}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 lg:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Logo */}
        <div className={`h-[57px] flex items-center border-b border-slate-200 dark:border-slate-800 flex-shrink-0 ${sidebarOpen ? "px-5" : "px-0 justify-center"}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5">
                <img src="/nexlife_logo.png" alt="Nexlife" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Nexlife CRM</h1>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5">
              <img src="/nexlife_logo.png" alt="NL" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* User Card */}
        {sidebarOpen && profile?.user?.name && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Welcome back</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile.user.name}</p>
            {profile.user.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.user.email}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
          <div className="space-y-0.5">
            {filteredTabs.map((t) => {
              const Icon = t.icon;
              const isActive = path === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  title={!sidebarOpen ? t.label : undefined}
                  className={`flex items-center gap-2.5 rounded-md text-[13px] font-medium
                    ${sidebarOpen ? "px-3 py-2" : "px-0 py-2 justify-center"}
                    ${isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "" : "text-slate-400 dark:text-slate-500"}`} />
                  {sidebarOpen && <span>{t.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer Stats */}
        {sidebarOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Inquiries</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{notif?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Replies</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{replyNotif?.count || 0}</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            localStorage.setItem("sidebarCollapsed", String(sidebarOpen));
          }}
          className="hidden lg:flex items-center justify-center h-10 border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Area */}
      <main
        className={`flex flex-col min-h-screen ${sidebarOpen ? "lg:ml-[240px]" : "lg:ml-[64px]"}`}
        style={{ transitionProperty: "margin-left", transitionDuration: "200ms" }}
      >
        {/* Header */}
        <header className="h-[57px] border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] sticky top-0 z-40 flex items-center justify-between px-4 md:px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                localStorage.setItem("sidebarCollapsed", String(sidebarOpen));
              }}
              className="hidden lg:block p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <button
              ref={notifBtnRef}
              onClick={() => setNotificationOpen((v) => !v)}
              className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />
              {totalNew > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                  {totalNew}
                </span>
              )}
            </button>

            <div className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <div
              ref={profileRef}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer relative ml-1"
            >
              <div className="h-7 w-7 rounded-full bg-slate-900 dark:bg-slate-600 flex items-center justify-center text-white text-xs font-medium">
                {profile?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                  {profile?.user?.name || "User"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight capitalize">
                  {profile?.user?.role || "Staff"}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{profile?.user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile?.user?.email}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content — Shows skeleton during auth check instead of blocking */}
        <section className="flex-1 p-4 md:p-6">
          {authState === "checking" ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-7 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ) : (
            children
          )}
        </section>
      </main>

      {/* Notification Panel */}
      {notificationOpen && (
        <div
          ref={notifRef}
          className="fixed right-4 top-[65px] z-50 w-[480px] max-w-[90vw] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-xl"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {(items.length > 0 || replyItems.length > 0) && (
                  <button
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                    onClick={() => {
                      if (notificationTab === "inquiries") markAllRead();
                      else markAllRepliesRead();
                    }}
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button onClick={() => setNotificationOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${
                  notificationTab === "inquiries"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setNotificationTab("inquiries")}
              >
                Inquiries ({notif?.count || 0})
              </button>
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${
                  notificationTab === "replies"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setNotificationTab("replies")}
              >
                Replies ({replyNotif?.count || 0})
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
              {notificationTab === "inquiries" ? (
                <>
                  {items.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">No new inquiries</div>
                  )}
                  {items.map((i: any, idx: number) => (
                    <div key={i._id || `inq-${idx}`} className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-1 rounded">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {i.name} <span className="text-slate-400 font-normal">• {i.email}</span>
                        </p>
                        {i.subject && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{i.subject}</p>}
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {i.createdAt ? new Date(i.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded font-medium hover:opacity-90"
                          onClick={() => { setNotificationOpen(false); router.push("/admin/inquiries"); }}
                        >
                          View
                        </button>
                        <button
                          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => markRead(i._id)}
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {replyItems.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">No new replies</div>
                  )}
                  {replyItems.map((reply: any, idx: number) => (
                    <div key={reply._id || `reply-${idx}`} className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-1 rounded">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Reply from <span className="text-slate-600 dark:text-slate-300">{reply.fromName || reply.from}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{reply.subject}</p>
                        {reply.inquiryEmail && <p className="text-[11px] text-slate-400 mt-0.5">{reply.inquiryEmail}</p>}
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded font-medium hover:opacity-90"
                          onClick={() => {
                            setNotificationOpen(false);
                            router.push(`/admin/inquiries?email=${encodeURIComponent(reply.inquiryEmail)}`);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => markReplyRead(reply._id)}
                        >
                          Read
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
