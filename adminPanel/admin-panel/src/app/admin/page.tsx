"use client";

import * as React from "react";
import Image from "next/image";
import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import { fetcher } from "@/lib/api";
import { Doughnut } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  Mail,
  ImageIcon,
  Heart,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Phone,
} from "lucide-react";
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from "chart.js";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

ChartJS.register(ArcElement, Legend, Tooltip);

export default function Dashboard() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedTimespan, setSelectedTimespan] = React.useState("1M");

  const timespanOptions = [
    { key: "1W", label: "1W", days: 7 },
    { key: "1M", label: "1M", days: 30 },
    { key: "3M", label: "3M", days: 90 },
    { key: "6M", label: "6M", days: 180 },
    { key: "1Y", label: "1Y", days: 365 },
    { key: "All", label: "All", days: null },
  ];

  const selectedTimespanData = timespanOptions.find((t) => t.key === selectedTimespan);
  const timespanLabel = selectedTimespanData
    ? `${selectedTimespanData.label}${selectedTimespanData.days ? ` (${selectedTimespanData.days}d)` : ""}`
    : "1M (30d)";

  const { data: ov, isLoading: loadingOv, mutate: mutateOv } = useSWR("/analytics/overview", fetcher);
  const { data: ovPrev, isLoading: loadingOvPrev } = useSWR("/analytics/overview?range=7", fetcher);
  const { data: profile } = useSWR("/auth/me", fetcher, { shouldRetryOnError: false, revalidateOnFocus: false });
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { data: sub, isLoading: loadingSub, mutate: mutateSub } = useSWR(
    selectedTimespanData?.days ? `/analytics/submissions?range=${selectedTimespanData.days}` : "/analytics/submissions?range=all",
    fetcher
  );
  const { data: status, isLoading: loadingStatus, mutate: mutateStatus } = useSWR("/analytics/status", fetcher);
  const { data: customers, isLoading: loadingCustomers, mutate: mutateCustomers } = useSWR("/analytics/customers?limit=6", fetcher);
  const { data: geo, isLoading: loadingGeo, mutate: mutateGeo } = useSWR("/analytics/visitors/countries?range=30", fetcher);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([mutateOv(), mutateSub(), mutateStatus(), mutateCustomers(), mutateGeo()]);
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  };

  const series = sub?.series || [];

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: 0, up: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), up: change >= 0 };
  };

  const trends = {
    submissions: calculateTrend(ov?.submissions || 0, ovPrev?.submissions || 0),
    replies: calculateTrend(ov?.replies || 0, ovPrev?.replies || 0),
    totalCampaigns: calculateTrend(ov?.totalCampaigns || 0, ovPrev?.totalCampaigns || 0),
    totalImages: calculateTrend(ov?.totalImages || 0, ovPrev?.totalImages || 0),
    totalLikes: calculateTrend(ov?.totalLikes || 0, ovPrev?.totalLikes || 0),
  };

  const stats = [
    {
      k: "submissions",
      label: "Enquiries",
      icon: BarChart3,
      accent: "border-l-slate-900 dark:border-l-slate-300",
      iconColor: "text-slate-700 dark:text-slate-300",
      trend: `${trends.submissions.up ? "+" : "-"}${trends.submissions.value.toFixed(1)}%`,
      trendUp: trends.submissions.up,
    },
    {
      k: "replies",
      label: "Replied",
      icon: Mail,
      accent: "border-l-emerald-600 dark:border-l-emerald-400",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      trend: `${trends.replies.up ? "+" : "-"}${trends.replies.value.toFixed(1)}%`,
      trendUp: trends.replies.up,
    },
    {
      k: "totalCampaigns",
      label: "Campaigns",
      icon: Users,
      accent: "border-l-blue-600 dark:border-l-blue-400",
      iconColor: "text-blue-600 dark:text-blue-400",
      trend: `${trends.totalCampaigns.up ? "+" : "-"}${trends.totalCampaigns.value.toFixed(1)}%`,
      trendUp: trends.totalCampaigns.up,
    },
    {
      k: "totalImages",
      label: "Images",
      icon: ImageIcon,
      accent: "border-l-amber-600 dark:border-l-amber-400",
      iconColor: "text-amber-600 dark:text-amber-400",
      trend: `${trends.totalImages.up ? "+" : "-"}${trends.totalImages.value.toFixed(1)}%`,
      trendUp: trends.totalImages.up,
    },
    {
      k: "totalLikes",
      label: "Likes",
      icon: Heart,
      accent: "border-l-rose-600 dark:border-l-rose-400",
      iconColor: "text-rose-600 dark:text-rose-400",
      trend: `${trends.totalLikes.up ? "+" : "-"}${trends.totalLikes.value.toFixed(1)}%`,
      trendUp: trends.totalLikes.up,
    },
  ];

  const statusStyles: Record<string, React.CSSProperties> = {
    replied: { background: "var(--ok-bg)",   color: "var(--ok-t)",   border: "1px solid var(--ok-b)" },
    new:     { background: "var(--err-bg)",  color: "var(--err-t)",  border: "1px solid var(--err-b)" },
    read:    { background: "var(--info-bg)", color: "var(--info-t)", border: "1px solid var(--info-b)" },
  };

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "var(--text)", fontSize: "18px", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "13px", marginTop: "2px" }}>
            {mounted && profile?.user?.name ? `Welcome back, ${profile.user.name}` : "Overview of your workspace"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-1.5 text-xs h-8"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(({ k, label, icon: Icon, accent, iconColor, trend, trendUp }) => (
          <div
            key={k}
            className={`rounded-lg p-4 border-l-[3px] ${accent}`}
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", borderLeft: undefined }}
          >
            {loadingOv ? (
              <Skeleton className="h-16 w-full rounded" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <span
                    className="text-[11px] font-medium flex items-center gap-0.5"
                    style={{ color: trendUp ? "var(--ok-t)" : "var(--err-t)" }}
                  >
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                  </span>
                </div>
                <p style={{ color: "var(--text)", fontSize: "26px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {ov?.[k]?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid: Customers + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Customers */}
        <div className="lg:col-span-2">
          <Card >
            <CardHeader style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700 }}>
                    Latest Customers
                  </CardTitle>
                  <CardDescription style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                    Recent enquiry submissions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/inquiries")}
                  className="text-xs h-7"
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <Table>
                  <TableHeader>
                    <TableRow >
                      <TableHead style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</TableHead>
                      <TableHead style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</TableHead>
                      <TableHead style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</TableHead>
                      <TableHead style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCustomers
                      ? Array(6).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-12 w-full rounded" /></TableCell>
                          </TableRow>
                        ))
                      : (customers?.items || []).map((r: any) => (
                          <TableRow
                            key={r.id}
                            className="cursor-pointer" style={{ transition: "background 120ms" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-inset)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            onClick={() => router.push(`/admin/inquiries?email=${encodeURIComponent(r.email)}`)}
                          >
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
                                  {r.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{r.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs truncate" style={{ color: "var(--text-3)" }}>{r.email}</span>
                                    {r.phone && (
                                      <a
                                        href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Phone className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <span className="text-sm truncate block max-w-[180px]" style={{ color: "var(--text-2)" }}>
                                {r.subject}
                              </span>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge
                                className={`text-[11px] px-2 py-0.5 font-medium`}
                                style={statusStyles[r.status] || statusStyles.new}
                              >
                                {r.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <div>
          <Card >
            <CardHeader style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <CardTitle style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700 }}>
                Status Distribution
              </CardTitle>
              <CardDescription style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Enquiry status breakdown
              </CardDescription>
            </CardHeader>
            {/* Status Summary Bar */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-inset)" }}>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span style={{ color: "var(--text-3)" }}>New</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{status?.new || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span style={{ color: "var(--text-3)" }}>Read</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{status?.read || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span style={{ color: "var(--text-3)" }}>Replied</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{status?.replied || 0}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              {loadingStatus ? (
                <Skeleton className="h-[260px] w-full rounded" />
              ) : (
                <>
                  <div className="relative">
                    <Doughnut
                      data={{
                        labels: ["New", "Read", "Replied"],
                        datasets: [
                          {
                            data: [status?.new || 0, status?.read || 0, status?.replied || 0],
                            backgroundColor: [
                              "rgba(239, 68, 68, 0.85)",
                              "rgba(59, 130, 246, 0.85)",
                              "rgba(16, 185, 129, 0.85)",
                            ],
                            borderColor: ["#ef4444", "#3b82f6", "#10b981"],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "65%",
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              color: "#64748b",
                              padding: 16,
                              font: { size: 11, weight: 500 },
                              usePointStyle: true,
                              pointStyleWidth: 8,
                            },
                          },
                          tooltip: {
                            backgroundColor: "#1e293b",
                            titleColor: "#fff",
                            bodyColor: "#e2e8f0",
                            cornerRadius: 6,
                            padding: 10,
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p style={{ color: "var(--text)", fontSize: "26px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {((status?.new || 0) + (status?.read || 0) + (status?.replied || 0)).toLocaleString()}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Total Enquiries</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Trend + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Trend */}
        <div className="lg:col-span-2">
          <Card >
            <CardHeader style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700 }}>
                    Submissions Trend
                  </CardTitle>
                  <CardDescription style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                    Enquiry volume over {timespanLabel}
                  </CardDescription>
                </div>
                <div className="flex gap-0.5 p-0.5 rounded-md" style={{ background: "var(--bg-inset)" }}>
                  {timespanOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedTimespan(opt.key)}
                      className="px-2 py-1 text-[11px] font-semibold rounded transition-colors"
                      style={
                        selectedTimespan === opt.key
                          ? { background: "var(--bg-surface)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }
                          : { color: "var(--text-muted)" }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[380px]">
                {loadingSub ? (
                  <Skeleton className="h-full w-full rounded" />
                ) : (
                  <ChartAreaInteractive
                    series={series}
                    bare
                    timespan={selectedTimespan}
                    title={`Submissions Trend (${timespanLabel})`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Countries */}
        <div>
          <Card >
            <CardHeader style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <CardTitle style={{ color: "var(--text)", fontSize: "13px", fontWeight: 700 }}>
                Top Countries
              </CardTitle>
              <CardDescription style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Visitor locations (30d)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loadingGeo ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[380px] pr-2">
                  <div className="space-y-2">
                    {(geo?.series || []).map((row: any, idx: number) => {
                      const pct = Math.min(100, Math.round((row.count / Math.max(1, geo.series?.[0]?.count || 1)) * 100));
                      return (
                        <div
                          key={row.country}
                          className="p-2.5 rounded-md"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-surface2)" }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium tabular-nums w-4" style={{ color: "var(--text-muted)" }}>{idx + 1}</span>
                              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{row.country}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-2)" }}>{pct}%</span>
                              <span className="text-[11px] ml-1" style={{ color: "var(--text-muted)" }}>({row.count.toLocaleString()})</span>
                            </div>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-inset)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: "var(--brand)" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {(!geo || (geo.series || []).length === 0) && (
                      <div className="text-center py-10">
                        <Eye className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--border-2)" }} />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No visitor data yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
