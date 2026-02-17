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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  Phone,
} from "lucide-react";
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from "chart.js";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

ChartJS.register(ArcElement, Legend, Tooltip);

export default function Dashboard() {
  const path = usePathname();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedTimespan, setSelectedTimespan] = React.useState('1M');

  // Timespan options
  const timespanOptions = [
    { key: '1W', label: '1W', days: 7 },
    { key: '1M', label: '1M', days: 30 },
    { key: '3M', label: '3M', days: 90 },
    { key: '6M', label: '6M', days: 180 },
    { key: '1Y', label: '1Y', days: 365 },
    { key: 'All', label: 'All', days: null },
  ];

  const selectedTimespanData = timespanOptions.find(t => t.key === selectedTimespan);
  const timespanLabel = selectedTimespanData ? `${selectedTimespanData.label}${selectedTimespanData.days ? ` (${selectedTimespanData.days} days)` : ''}` : '1M (30 days)';

  const { data: ov, isLoading: loadingOv, mutate: mutateOv } = useSWR(
    "/analytics/overview",
    fetcher
  );
  const { data: ovPrev, isLoading: loadingOvPrev } = useSWR(
    "/analytics/overview?range=7",
    fetcher
  );
  const { data: profile } = useSWR("/auth/me", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { data: sub, isLoading: loadingSub, mutate: mutateSub } = useSWR(
    selectedTimespanData?.days ? `/analytics/submissions?range=${selectedTimespanData.days}` : "/analytics/submissions?range=all",
    fetcher
  );
  const { data: status, isLoading: loadingStatus, mutate: mutateStatus } = useSWR(
    "/analytics/status",
    fetcher
  );
  const { data: customers, isLoading: loadingCustomers, mutate: mutateCustomers } = useSWR(
    "/analytics/customers?limit=6",
    fetcher
  );
  const { data: geo, isLoading: loadingGeo, mutate: mutateGeo } = useSWR(
    "/analytics/visitors/countries?range=30",
    fetcher
  );

  // Refresh all dashboard data
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent double-clicking

    setIsRefreshing(true);
    try {
      await Promise.all([
        mutateOv(),
        mutateSub(),
        mutateStatus(),
        mutateCustomers(),
        mutateGeo()
      ]);
    } catch (error) {
      // Failed to refresh data
    } finally {
      setIsRefreshing(false);
    }
  };

  const series = sub?.series || [];

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: 0, up: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      up: change >= 0
    };
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-100 to-cyan-100 dark:from-blue-950/20 dark:to-cyan-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-800 dark:text-blue-300",
      iconBg: "bg-blue-200 dark:bg-blue-900/40",
      trend: `${trends.submissions.up ? '+' : '-'}${trends.submissions.value.toFixed(1)}%`,
      trendUp: trends.submissions.up
    },
    {
      k: "replies",
      label: "Replied",
      icon: Mail,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-100 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-800 dark:text-green-300",
      iconBg: "bg-green-200 dark:bg-green-900/40",
      trend: `${trends.replies.up ? '+' : '-'}${trends.replies.value.toFixed(1)}%`,
      trendUp: trends.replies.up
    },
    {
      k: "totalCampaigns",
      label: "Campaigns",
      icon: Users,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-100 to-violet-100 dark:from-purple-950/20 dark:to-violet-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-800 dark:text-purple-300",
      iconBg: "bg-purple-200 dark:bg-purple-900/40",
      trend: `${trends.totalCampaigns.up ? '+' : '-'}${trends.totalCampaigns.value.toFixed(1)}%`,
      trendUp: trends.totalCampaigns.up
    },
    {
      k: "totalImages",
      label: "Images",
      icon: ImageIcon,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-100 to-red-100 dark:from-orange-950/20 dark:to-red-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-800 dark:text-orange-300",
      iconBg: "bg-orange-200 dark:bg-orange-900/40",
      trend: `${trends.totalImages.up ? '+' : '-'}${trends.totalImages.value.toFixed(1)}%`,
      trendUp: trends.totalImages.up
    },
    {
      k: "totalLikes",
      label: "Likes",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-100 to-rose-100 dark:from-pink-950/20 dark:to-rose-950/20",
      borderColor: "border-pink-200 dark:border-pink-800",
      textColor: "text-pink-800 dark:text-pink-300",
      iconBg: "bg-pink-200 dark:bg-pink-900/40",
      trend: `${trends.totalLikes.up ? '+' : '-'}${trends.totalLikes.value.toFixed(1)}%`,
      trendUp: trends.totalLikes.up
    },
  ];

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
      {/* Hero Section - Compact */}
      <div className="mb-6">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Welcome back, {mounted && profile?.user?.name ? profile.user.name : "NEXLIFE"}
                </CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard Overview
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  Real-time analytics and insights
                </p>
              </div>
              <div className="relative">
                <Image src="/assests/dashboard.png" alt="Dashboard" width={64} height={64} className="h-12 w-12 md:h-14 md:w-14" />
                <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900">
                  <div className="h-full w-full bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {stats.map(({ k, label, icon: Icon, color, borderColor, textColor, iconBg, trend, trendUp }) => (
          <div
            key={k}
            className={`${borderColor} border bg-white dark:bg-slate-900 rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer`}
          >
            {loadingOv ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${textColor}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {ov?.[k]?.toLocaleString() ?? 0}
                  </p>
                  <p className={`text-xs font-medium ${textColor} opacity-80`}>
                    {label}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Top Section: Latest Customers + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-blue-600" />
                  Latest Customers
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                  Recent enquiry submissions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5 text-xs"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-medium text-xs">Customer</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-medium text-xs">Subject</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-medium text-xs">Status</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-medium text-xs">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCustomers
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={4}>
                                <Skeleton className="h-14 w-full rounded-lg" />
                              </TableCell>
                            </TableRow>
                          ))
                      : (customers?.items || []).map((r: any) => {
                          const statusColors = {
                            replied: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                            new: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
                            read: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          };

                          return (
                            <TableRow
                              key={r.id}
                              className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/inquiries?email=${encodeURIComponent(r.email)}`)}
                            >
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                                    {r.name?.[0]?.toUpperCase() || "U"}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                      {r.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                      <span className="truncate">{r.email}</span>
                                      {r.phone && (
                                        <a
                                          href={`https://wa.me/${r.phone.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:text-green-700 dark:text-green-400 flex-shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Phone className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="max-w-[180px] truncate text-sm text-slate-600 dark:text-slate-300">
                                  {r.subject}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge
                                  className={`${statusColors[r.status as keyof typeof statusColors] || statusColors.new} border text-xs px-2 py-0.5`}
                                >
                                  {r.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {r.createdAt
                                    ? new Date(r.createdAt).toLocaleDateString()
                                    : ""}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-green-600" />
                Status Distribution
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                Enquiry status breakdown
              </CardDescription>
            </CardHeader>
            {/* Status Summary */}
            <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-5 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-slate-500 dark:text-slate-400">New:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{status?.new || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-500 dark:text-slate-400">Read:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{status?.read || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-500 dark:text-slate-400">Replied:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{status?.replied || 0}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              {loadingStatus ? (
                <Skeleton className="h-[280px] w-full rounded-xl" />
              ) : (
                <>
                  <div className="relative">
                    <Doughnut
                      data={{
                        labels: ["New", "Read", "Replied"],
                        datasets: [
                          {
                            data: [
                              status?.new || 0,
                              status?.read || 0,
                              status?.replied || 0,
                            ],
                            backgroundColor: [
                              "rgba(239, 68, 68, 0.8)",
                              "rgba(59, 130, 246, 0.8)",
                              "rgba(34, 197, 94, 0.8)",
                            ],
                            borderColor: [
                              "rgba(239, 68, 68, 1)",
                              "rgba(59, 130, 246, 1)",
                              "rgba(34, 197, 94, 1)",
                            ],
                            borderWidth: 2,
                            hoverBorderWidth: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              color: "#64748b",
                              padding: 20,
                              font: {
                                size: 12,
                                weight: 500,
                              },
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#fff",
                            bodyColor: "#fff",
                            cornerRadius: 8,
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {(
                        (status?.new || 0) +
                        (status?.read || 0) +
                        (status?.replied || 0)
                      ).toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Enquiries
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Submissions Trend ({timespanLabel})
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                    Enquiry patterns over time
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {timespanOptions.map((option) => (
                    <Button
                      key={option.key}
                      variant={selectedTimespan === option.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimespan(option.key)}
                      className={`px-2.5 py-1 text-xs font-medium ${
                        selectedTimespan === option.key
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[400px] bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                {loadingSub ? (
                  <Skeleton className="h-full w-full rounded-lg" />
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

        <div>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Eye className="w-4 h-4 text-indigo-600" />
                Top Countries (30 days)
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                Visitor analytics by location
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {loadingGeo ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {(geo?.series || []).map((row: any, index: number) => {
                      const percentage = Math.min(
                        100,
                        Math.round(
                          (row.count / Math.max(1, geo.series?.[0]?.count || 1)) *
                            100
                        )
                      );

                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-purple-500",
                        "bg-orange-500",
                        "bg-pink-500",
                      ];

                      return (
                        <div
                          key={row.country}
                          className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {index + 1}
                              </span>
                              <span className="font-medium text-sm text-slate-900 dark:text-white">
                                {row.country}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {percentage}%
                              </span>
                              <span className="text-xs text-slate-400 ml-1">
                                ({row.count.toLocaleString()})
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {(!geo || (geo.series || []).length === 0) && (
                      <div className="text-center py-8">
                        <Eye className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                          No visitor data
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">
                          Visitor analytics will appear here
                        </p>
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
