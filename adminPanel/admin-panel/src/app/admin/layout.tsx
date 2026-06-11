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
  Home,
  ShoppingBag,
  Globe,
  FileText,
} from "lucide-react";

// Tabs shown when managing the SURGICAL website
const surgicalTabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["all"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2, roles: ["all"] },
  { href: "/admin/products", label: "Product Manager", icon: ShoppingBag, roles: ["superadmin", "dev"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageCircle, roles: ["all"] },
  { href: "/admin/quotes", label: "Quotes", icon: FileText, roles: ["all"] },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users, roles: ["all"] },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone, roles: ["all"] },
  { href: "/admin/certifications", label: "Certifications", icon: Award, roles: ["superadmin", "dev"] },
  { href: "/admin/staff", label: "Staff", icon: UserCog, roles: ["superadmin", "dev"] },
  { href: "/admin/logs", label: "Logs", icon: ScrollText, roles: ["superadmin", "dev"] },
  { href: "/admin/export", label: "Export", icon: Download, roles: ["superadmin", "dev"] },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, roles: ["all"] },
];

// Tabs shown when managing the GENERAL (main Nexlife) website
const generalTabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["all"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2, roles: ["all"] },
  { href: "/admin/products", label: "Product Manager", icon: ShoppingBag, roles: ["superadmin", "dev"] },
  { href: "/admin/home-products", label: "Home Products", icon: Home, roles: ["superadmin", "dev"] },
  { href: "/admin/products-gallery", label: "Products Gallery", icon: Package, roles: ["superadmin", "dev"] },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, roles: ["superadmin", "dev"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageCircle, roles: ["all"] },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users, roles: ["all"] },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone, roles: ["all"] },
  { href: "/admin/certifications", label: "Certifications", icon: Award, roles: ["superadmin", "dev"] },
  { href: "/admin/api-docs", label: "API Docs", icon: ScrollText, roles: ["dev"] },
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
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // Active website context: 'surgical' or 'general'
  // Stored in localStorage so product pages can read it
  const [activeSite, setActiveSiteState] = useState<'surgical' | 'general'>('surgical');
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
    // Mount-only: read persisted preferences from localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") setSidebarOpen(false);
    const savedSite = localStorage.getItem("crmActiveSite");
    if (savedSite === "surgical" || savedSite === "general") {
      setActiveSiteState(savedSite);
    }
  }, []); // runs once on mount

  useEffect(() => {
    // Track viewport so <main> margin and the mobile drawer behave correctly.
    // Below 1024px the sidebar is an off-canvas overlay, so main must not reserve space.
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMobileOpen(false); // closing drawer when growing to desktop
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    // Outside-click handler — uses refs so it never needs state in dep array
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t) && notifBtnRef.current && !notifBtnRef.current.contains(t)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []); // stable — refs never change

  // Don't render anything while redirecting to login
  if (authState === "invalid") return null;

  const userRole = profile?.user?.role;

  function setActiveSite(site: 'surgical' | 'general') {
    setActiveSiteState(site);
    localStorage.setItem("crmActiveSite", site);
  }

  // Select tabs based on which website is being managed
  const allTabs = activeSite === 'surgical' ? surgicalTabs : generalTabs;
  const filteredTabs = allTabs.filter((t) => {
    if (t.roles.includes("all")) return true;
    if (userRole && t.roles.includes(userRole)) return true;
    return false;
  });

  return (
    <div suppressHydrationWarning style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={`crm-sidebar fixed left-0 top-0 h-screen z-50 flex flex-col
          ${sidebarOpen ? "w-[232px]" : "w-[56px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ transitionProperty: "width, transform", transitionDuration: "200ms", transitionTimingFunction: "ease" }}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="crm-icon-btn absolute top-3 right-3 lg:hidden z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div
          className="h-14 flex items-center flex-shrink-0"
          style={{ borderBottom: "1px solid var(--sidebar-border)", padding: sidebarOpen ? "0 16px" : "0", justifyContent: sidebarOpen ? "flex-start" : "center" }}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand)" }}>
                <img src="/nexlife_logo.png" alt="N" className="w-full h-full object-contain p-0.5 brightness-0 invert" />
              </div>
              <div>
                <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Nexlife CRM</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Admin Panel</div>
              </div>
            </div>
          ) : (
            <div className="h-7 w-7 rounded-md overflow-hidden flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <img src="/nexlife_logo.png" alt="N" className="w-full h-full object-contain p-0.5 brightness-0 invert" />
            </div>
          )}
        </div>

        {/* User Card */}
        {sidebarOpen && profile?.user?.name && (
          <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "var(--brand)" }}>
                {profile.user.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{profile.user.name}</p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{profile.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Website Context Selector */}
        {sidebarOpen ? (
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Globe className="w-3 h-3" /> Website
            </p>
            <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <button
                onClick={() => setActiveSite('surgical')}
                className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  background: activeSite === 'surgical' ? 'var(--brand)' : 'transparent',
                  color: activeSite === 'surgical' ? '#fff' : 'var(--text-muted)',
                }}
              >
                Surgical
              </button>
              <button
                onClick={() => setActiveSite('general')}
                className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  background: activeSite === 'general' ? '#0D2240' : 'transparent',
                  color: activeSite === 'general' ? '#fff' : 'var(--text-muted)',
                  borderLeft: "1px solid var(--border)",
                }}
              >
                General
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <button
              onClick={() => setActiveSite(activeSite === 'surgical' ? 'general' : 'surgical')}
              title={`Switch to ${activeSite === 'surgical' ? 'General' : 'Surgical'}`}
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: activeSite === 'surgical' ? 'var(--brand)' : '#0D2240' }}
            >
              <Globe className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: "8px 6px" }}>
          {sidebarOpen && (
            <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1" style={{ color: "var(--text-muted)" }}>
              Navigation
            </p>
          )}
          <div className="space-y-0.5">
            {filteredTabs.map((t) => {
              const Icon = t.icon;
              const isActive =
                t.href === "/admin"
                  ? path === "/admin"
                  : path === t.href || path.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  title={!sidebarOpen ? t.label : undefined}
                  className={`crm-nav-item ${isActive ? "active" : ""}`}
                  style={{ justifyContent: sidebarOpen ? "flex-start" : "center", padding: sidebarOpen ? "7px 10px" : "8px" }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span>{t.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer stats */}
        {sidebarOpen && (
          <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>New Inquiries</span>
              <span className="crm-badge crm-badge-teal text-[10px] px-1.5 py-0">{notif?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Replies</span>
              <span className="crm-badge crm-badge-gray text-[10px] px-1.5 py-0">{replyNotif?.count || 0}</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            localStorage.setItem("sidebarCollapsed", String(sidebarOpen));
          }}
          className="hidden lg:flex items-center justify-center h-9 flex-shrink-0 crm-icon-btn rounded-none"
          style={{ borderTop: "1px solid var(--sidebar-border)", width: "100%" }}
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Area */}
      <main
        className="flex flex-col min-h-screen"
        style={{
          marginLeft: isMobile ? 0 : sidebarOpen ? "232px" : "56px",
          transitionProperty: "margin-left",
          transitionDuration: "200ms",
        }}
      >
        {/* Header */}
        <header
          className="crm-header sticky top-0 z-40 flex items-center justify-between"
          style={{ padding: "0 16px" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="crm-icon-btn lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                localStorage.setItem("sidebarCollapsed", String(sidebarOpen));
              }}
              className="crm-icon-btn hidden lg:flex"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-[12px] hidden md:inline" style={{ color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <button
              ref={notifBtnRef}
              onClick={() => setNotificationOpen((v) => !v)}
              className="crm-icon-btn relative"
              style={{ padding: "7px" }}
            >
              <Bell className="w-[17px] h-[17px]" />
              {totalNew > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {totalNew}
                </span>
              )}
            </button>

            <div className="crm-icon-btn" style={{ padding: "7px" }}>
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <div
              ref={profileRef}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer relative ml-1"
              style={{ transition: "background 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-inset)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                style={{ background: "var(--brand)" }}>
                {profile?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <div className="text-[12px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {profile?.user?.name || "User"}
                </div>
                <div className="text-[10px] leading-tight capitalize" style={{ color: "var(--text-muted)" }}>
                  {profile?.user?.role || "Staff"}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 hidden md:block" style={{ color: "var(--text-muted)" }} />

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-lg z-50 py-1 overflow-hidden"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
                >
                  <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{profile?.user?.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{profile?.user?.email}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[12px]"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-inset)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-left"
                    style={{ color: "var(--danger-text)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--danger-bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>
        <section className="flex-1" style={{ padding: "20px 20px" }}>
          {authState === "checking" ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 rounded" style={{ background: "var(--border)" }} />
              <div className="h-4 w-32 rounded" style={{ background: "var(--border)" }} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 rounded-lg" style={{ background: "var(--border)" }} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2 h-64 rounded-lg" style={{ background: "var(--border)" }} />
                <div className="h-64 rounded-lg" style={{ background: "var(--border)" }} />
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
          className="fixed right-4 top-[60px] z-50 w-[440px] max-w-[92vw] rounded-lg overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
              <div className="flex items-center gap-2">
                {(items.length > 0 || replyItems.length > 0) && (
                  <button
                    className="crm-btn-ghost crm-btn-sm crm-btn flex items-center gap-1"
                    onClick={() => { if (notificationTab === "inquiries") markAllRead(); else markAllRepliesRead(); }}
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button className="crm-icon-btn" onClick={() => setNotificationOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3 pb-0">
            <div className="flex gap-0.5 rounded-md p-0.5" style={{ background: "var(--bg-inset)" }}>
              <button
                className="flex-1 px-2 py-1.5 text-[11px] font-semibold rounded transition-colors"
                style={{
                  background: notificationTab === "inquiries" ? "var(--bg-surface)" : "transparent",
                  color: notificationTab === "inquiries" ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: notificationTab === "inquiries" ? "var(--shadow-sm)" : "none",
                }}
                onClick={() => setNotificationTab("inquiries")}
              >
                Inquiries {notif?.count ? `(${notif.count})` : ""}
              </button>
              <button
                className="flex-1 px-2 py-1.5 text-[11px] font-semibold rounded transition-colors"
                style={{
                  background: notificationTab === "replies" ? "var(--bg-surface)" : "transparent",
                  color: notificationTab === "replies" ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: notificationTab === "replies" ? "var(--shadow-sm)" : "none",
                }}
                onClick={() => setNotificationTab("replies")}
              >
                Replies {replyNotif?.count ? `(${replyNotif.count})` : ""}
              </button>
            </div>
          </div>

          <div className="max-h-[56vh] overflow-y-auto custom-scrollbar divide-y" style={{ borderColor: "var(--border)" }}>
            {notificationTab === "inquiries" ? (
              <>
                {items.length === 0 && (
                  <div className="py-10 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>No new inquiries</div>
                )}
                {items.map((i: any, idx: number) => (
                  <div key={i._id || `inq-${idx}`} className="px-4 py-3 flex items-start justify-between gap-3"
                    style={{ transition: "background 100ms" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-inset)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {i.name} <span className="font-normal" style={{ color: "var(--text-muted)" }}>· {i.email}</span>
                      </p>
                      {i.subject && <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>{i.subject}</p>}
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {i.createdAt ? new Date(i.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={() => { setNotificationOpen(false); router.push("/admin/inquiries"); }}>View</button>
                      <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={() => markRead(i._id)}>Read</button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {replyItems.length === 0 && (
                  <div className="py-10 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>No new replies</div>
                )}
                {replyItems.map((reply: any, idx: number) => (
                  <div key={reply._id || `reply-${idx}`} className="px-4 py-3 flex items-start justify-between gap-3"
                    style={{ transition: "background 100ms" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-inset)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        Reply from <span style={{ color: "var(--text-secondary)" }}>{reply.fromName || reply.from}</span>
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>{reply.subject}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={() => { setNotificationOpen(false); router.push(`/admin/inquiries?email=${encodeURIComponent(reply.inquiryEmail)}`); }}>View</button>
                      <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={() => markReplyRead(reply._id)}>Read</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
