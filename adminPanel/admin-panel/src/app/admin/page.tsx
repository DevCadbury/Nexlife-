"use client";

import * as React from "react";
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
import { motion } from "framer-motion";

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
      console.error('Failed to refresh data:', error);
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
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/50 to-indigo-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-white via-blue-100/60 to-indigo-100/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200 dark:border-0 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardDescription className="text-slate-700 dark:text-slate-400 text-lg">
                  Welcome back, {mounted && profile?.user?.name ? profile.user.name : "Admin"}
                </CardDescription>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Dashboard Overview
                </CardTitle>
                <p className="text-slate-700 dark:text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Real-time analytics and insights
                </p>
              </div>
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-2xl ring-4 ring-white/20 dark:ring-slate-800/20 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map(({ k, label, icon: Icon, color, bgColor, borderColor, textColor, iconBg, trend, trendUp }, index) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`bg-gradient-to-br ${bgColor} ${borderColor} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
          >
            {loadingOv ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-medium ${textColor} opacity-80`}>
                    {label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {ov?.[k]?.toLocaleString() ?? 0}
                  </p>
                </div>
                <div className={`h-1 bg-gradient-to-r ${color} rounded-full mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Top Section: Latest Customers + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-blue-100/70 dark:from-slate-800 dark:to-slate-700">
              <div>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Latest Customers
                </CardTitle>
                <CardDescription className="text-slate-700 dark:text-slate-400">
                  Recent enquiry submissions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 bg-white/80 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-800/50">
                    <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/30">
                      <TableHead className="text-slate-900 dark:text-white font-semibold">Customer</TableHead>
                      <TableHead className="text-slate-900 dark:text-white font-semibold">Subject</TableHead>
                      <TableHead className="text-slate-900 dark:text-white font-semibold">Status</TableHead>
                      <TableHead className="text-slate-900 dark:text-white font-semibold">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCustomers
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={4}>
                                <Skeleton className="h-16 w-full rounded-lg" />
                              </TableCell>
                            </TableRow>
                          ))
                      : (customers?.items || []).map((r: any, index: number) => {
                          const badgeVariant =
                            r.status === "replied"
                              ? "default"
                              : r.status === "new"
                              ? "destructive"
                              : "secondary";

                          const statusColors = {
                            replied: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800",
                            new: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
                            read: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          };

                          return (
                            <motion.tr
                              key={r.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group"
                              onClick={() => router.push(`/admin/inquiries?email=${encodeURIComponent(r.email)}`)}
                            >
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {r.name?.[0]?.toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {r.name}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-400">
                                      <a
                                        href={`mailto:${r.email}`}
                                        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Mail className="w-3 h-3" />
                                        {r.email}
                                      </a>
                                      {r.phone && (
                                        <a
                                          href={`https://wa.me/${r.phone.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Phone className="w-3 h-3" />
                                          {r.phone}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="max-w-[200px] truncate text-slate-700 dark:text-slate-300 font-medium">
                                  {r.subject}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  variant={badgeVariant}
                                  className={`${statusColors[r.status as keyof typeof statusColors] || statusColors.new} border font-medium px-3 py-1`}
                                >
                                  {r.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">
                                    {r.createdAt
                                      ? new Date(r.createdAt).toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-green-100/70 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Status Distribution
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400">
                Enquiry status breakdown
              </CardDescription>
            </CardHeader>
            {/* Status Summary */}
            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-400">New:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{status?.new || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-400">Read:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{status?.read || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700 dark:text-slate-400">Replied:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{status?.replied || 0}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
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
                    <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">
                      Total Enquiries
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-purple-100/70 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Submissions Trend ({timespanLabel})
                  </CardTitle>
                  <CardDescription className="text-slate-700 dark:text-slate-400">
                    Interactive chart showing enquiry patterns over time
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {timespanOptions.map((option) => (
                    <Button
                      key={option.key}
                      variant={selectedTimespan === option.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimespan(option.key)}
                      className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
                        selectedTimespan === option.key
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[450px] bg-gradient-to-br from-slate-100 to-blue-100/50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-300 dark:border-slate-700">
                {loadingSub ? (
                  <Skeleton className="h-full w-full rounded-xl" />
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-indigo-100/70 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Top Countries (30 days)
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400">
                Visitor analytics by location
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
                  <div className="space-y-4">
                    {(geo?.series || []).map((row: any, index: number) => {
                      const percentage = Math.min(
                        100,
                        Math.round(
                          (row.count / Math.max(1, geo.series?.[0]?.count || 1)) *
                            100
                        )
                      );

                      const colors = [
                        "from-blue-500 to-cyan-500",
                        "from-green-500 to-emerald-500",
                        "from-purple-500 to-violet-500",
                        "from-orange-500 to-red-500",
                        "from-pink-500 to-rose-500",
                      ];

                      return (
                        <motion.div
                          key={row.country}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group p-4 bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {row.country}
                                </span>
                                <div className="text-sm text-slate-700 dark:text-slate-400">
                                  {row.count.toLocaleString()} visitors
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full shadow-sm`}
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {(!geo || (geo.series || []).length === 0) && (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-400 mb-2">
                          No visitor data
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500 text-sm">
                          Visitor analytics will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
