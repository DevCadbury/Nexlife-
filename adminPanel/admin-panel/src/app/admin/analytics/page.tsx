"use client";
import NextImage from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from "chart.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Megaphone,
  Image,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Activity,
  Clock,
} from "lucide-react";
import * as React from "react";
ChartJS.register(ArcElement, Legend, Tooltip);

const statIcons = {
  submissions: FileText,
  replies: MessageSquare,
  totalCampaigns: Megaphone,
  totalImages: Image,
  totalLikes: Heart,
};

const statColors = {
  submissions: "from-blue-500 to-cyan-500",
  replies: "from-green-500 to-emerald-500",
  totalCampaigns: "from-purple-500 to-violet-500",
  totalImages: "from-orange-500 to-red-500",
  totalLikes: "from-pink-500 to-rose-500",
};

export default function Analytics() {
  const [selectedTimespan, setSelectedTimespan] = React.useState('1M');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Detect dark mode
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

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

  const { data: ov } = useSWR("/analytics/overview", fetcher);
  const { data: sub } = useSWR(
    selectedTimespanData?.days ? `/analytics/submissions?range=${selectedTimespanData.days}` : "/analytics/submissions?range=all",
    fetcher
  );
  const { data: status } = useSWR(
    selectedTimespanData?.days ? `/analytics/status?range=${selectedTimespanData.days}` : "/analytics/status?range=all",
    fetcher
  );
  const { data: visitors } = useSWR(
    selectedTimespanData?.days ? `/analytics/visitors/countries?range=${selectedTimespanData.days}` : "/analytics/visitors/countries?range=all",
    fetcher
  );
  const { data: visitorTrends } = useSWR(
    selectedTimespanData?.days ? `/analytics/visitors/trends?range=${selectedTimespanData.days}` : "/analytics/visitors/trends?range=all",
    fetcher
  );
  const { data: visitorOverview } = useSWR(
    selectedTimespanData?.days ? `/analytics/visitors/overview?range=${selectedTimespanData.days}` : "/analytics/visitors/overview?range=all",
    fetcher
  );
  const { data: pagesByCountry } = useSWR(
    selectedTimespanData?.days ? `/analytics/visitors/pages-by-country?range=${selectedTimespanData.days}` : "/analytics/visitors/pages-by-country?range=all",
    fetcher
  );

  const series = (sub?.series || []).map((p: any) => ({
    _id: p._id,
    count: p.count,
  }));

  const pieData = status ? [status.new, status.read, status.replied] : [];

  // Process visitor trends data for area chart (time series)
  const visitorSeries = (visitorTrends?.series || []).map((item: any) => ({
    _id: item._id,
    count: item.count,
  }));

  const getTrendIcon = (key: string) => {
    // Mock trend logic - in real app, compare with previous period
    // For now, return neutral to avoid hydration issues
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 md:p-6 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold mb-1">Analytics Dashboard</h1>
          <p className="text-blue-100 text-xs md:text-sm">
            Platform performance and user engagement insights
          </p>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          "submissions",
          "replies",
          "totalCampaigns",
          "totalImages",
          "totalLikes",
        ].map((k, index) => {
          const Icon = statIcons[k as keyof typeof statIcons];
          const colorClass = statColors[k as keyof typeof statColors];
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-700 dark:text-slate-400 text-xs font-medium capitalize">
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {ov?.[k]?.toLocaleString() ?? 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Time Range Selector - Centralized */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 p-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-2">Time Range:</span>
        <div className="flex gap-2">
          {timespanOptions.map((option) => (
            <Button
              key={option.key}
              variant={selectedTimespan === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimespan(option.key)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedTimespan === option.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="h-full"
        >
          <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-slate-100 to-blue-100/70 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Submissions
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400 mt-1">
                {timespanLabel} - Interactive chart
              </CardDescription>
            </div>
            <CardContent className="p-6 flex-1">
              <ChartAreaInteractive series={series} timespan={selectedTimespan} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="h-full"
        >
          <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-slate-100 to-green-100/70 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Status Breakdown
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400 mt-1">
                {timespanLabel} - Inquiry status distribution
              </CardDescription>
            </div>
            <CardContent className="p-6 flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-[280px] aspect-square">
                <Doughnut
                  data={{
                    labels: ["New", "Read", "Replied"],
                    datasets: [
                      {
                        data: pieData,
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.8)",
                          "rgba(100, 116, 139, 0.8)",
                          "rgba(16, 185, 129, 0.8)",
                        ],
                        borderColor: [
                          "rgba(59, 130, 246, 1)",
                          "rgba(100, 116, 139, 1)",
                          "rgba(16, 185, 129, 1)",
                        ],
                        borderWidth: 2,
                        hoverOffset: 8,
                        hoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    cutout: "75%",
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: isDarkMode ? "rgb(148 163 184)" : "rgb(71 85 105)",
                          font: { size: 14, weight: "bold" as const },
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                        titleColor: isDarkMode ? "rgb(248 250 252)" : "rgb(15 23 42)",
                        bodyColor: isDarkMode ? "rgb(203 213 225)" : "rgb(71 85 105)",
                        borderColor: isDarkMode ? "rgb(51 65 85)" : "rgb(226 232 240)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                      },
                    },
                    animation: {
                      animateScale: true,
                      animateRotate: true,
                      duration: 1000,
                      easing: "easeOutQuart" as const,
                    },
                    maintainAspectRatio: false,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {pieData.reduce((a: number, b: number) => a + b, 0)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="h-full"
        >
          <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-slate-100 to-purple-100/70 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Visitor Analytics
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400 mt-1">
                {timespanLabel} - Website visitor trends with page-by-country breakdown
              </CardDescription>
            </div>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6 h-full flex flex-col">
                {/* Visitor Overview Stats */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Visits</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {visitorOverview?.totalVisits || 0}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Unique Visitors</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {visitorOverview?.uniqueVisitors || 0}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Status</span>
                      </div>
                      <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                        {visitorOverview?.totalVisits > 0 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Pages with Country Info - Enhanced */}
                {pagesByCountry?.pages && pagesByCountry.pages.length > 0 ? (
                  <div className="bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-slate-300 dark:border-slate-600 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      Top Pages by Country
                    </h4>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {pagesByCountry.pages.slice(0, 8).map((page: any, index: number) => (
                        <div key={page.page} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{page.page}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-semibold">
                                {page.totalVisits} visits
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {page.countries.slice(0, 3).map((country: any) => (
                              <div
                                key={country.country}
                                className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-500 font-medium"
                              >
                                {country.country}: {country.visits}
                              </div>
                            ))}
                            {page.countries.length > 3 && (
                              <div className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-md border border-purple-300 dark:border-purple-700 font-medium">
                                +{page.countries.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : visitorOverview?.topPages && visitorOverview.topPages.length > 0 ? (
                  <div className="bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-slate-300 dark:border-slate-600 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      Top Pages
                    </h4>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {visitorOverview.topPages.slice(0, 10).map((page: any, index: number) => (
                        <div key={page.page} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-600 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">#{index + 1}</span>
                            <span className="text-xs font-medium text-slate-900 dark:text-white truncate">{page.page}</span>
                          </div>
                          <span className="text-xs text-slate-700 dark:text-slate-400 font-semibold shrink-0 ml-2">{page.visits}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Visitor Trends by Country - Full Width Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
      >
        <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 via-purple-100/70 to-indigo-100/70 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Visitor Trends Over Time
            </CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-400 mt-1">
              {timespanLabel} - Daily website visitor trends
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-slate-100 to-blue-100/50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-300 dark:border-slate-700">
              {visitorSeries.length > 0 ? (
                <ChartAreaInteractive
                  series={visitorSeries}
                  timespan={selectedTimespan}
                  title="Daily Visitor Count"
                />
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-400 mb-2">
                    No visitor data available
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500 text-sm max-w-md mx-auto">
                    Visitor analytics will appear here once users start visiting your website. Make sure the tracking script is active on your website.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Page-by-Country Analytics Section */}
      {pagesByCountry && pagesByCountry.pages && pagesByCountry.pages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-100 via-indigo-100/70 to-purple-100/70 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Page Visits by Country
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-400">
                {timespanLabel} - Detailed breakdown showing which pages are visited from which countries, including repeat visits
              </CardDescription>
            </div>
            <CardContent className="p-4">
              <div className="space-y-6">
                {pagesByCountry.pages.map((pageData: any, pageIndex: number) => (
                  <motion.div
                    key={pageData.page}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pageIndex * 0.1 }}
                    className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-6 border border-slate-300 dark:border-slate-600 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg shrink-0">
                          {pageIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                            {pageData.page}
                          </h3>
                          <p className="text-sm text-slate-700 dark:text-slate-400">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {pageData.totalVisits.toLocaleString()}
                            </span>
                            {' '}total visits from{' '}
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {pageData.countries.length}
                            </span>
                            {' '}{pageData.countries.length === 1 ? 'country' : 'countries'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Unique:</span>
                            <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
                              {pageData.uniqueVisitors}
                            </span>
                          </div>
                        </div>
                        {pageData.totalVisits > pageData.uniqueVisitors && (
                          <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-700 shadow-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Repeat:</span>
                              <span className="text-lg font-bold text-orange-800 dark:text-orange-300">
                                {pageData.totalVisits - pageData.uniqueVisitors}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Country Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {pageData.countries.map((countryData: any, index: number) => {
                        const percentage = ((countryData.visits / pageData.totalVisits) * 100).toFixed(1);
                        const colors = [
                          "from-blue-500 to-cyan-500",
                          "from-green-500 to-emerald-500",
                          "from-purple-500 to-violet-500",
                          "from-orange-500 to-amber-500",
                          "from-pink-500 to-rose-500",
                          "from-indigo-500 to-blue-500",
                          "from-teal-500 to-cyan-500",
                          "from-red-500 to-pink-500",
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <motion.div
                            key={countryData.country}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          >
                            {/* Country Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass} shadow-md`}></div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                  {countryData.country}
                                </span>
                              </div>
                              <span className={`text-xs font-bold bg-gradient-to-r ${colorClass} text-white px-2.5 py-1 rounded-full shadow-sm`}>
                                {percentage}%
                              </span>
                            </div>
                            
                            {/* Visit Stats */}
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Visits</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {countryData.visits}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Unique</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {countryData.uniqueVisitors}
                                </span>
                              </div>
                              {countryData.visits > countryData.uniqueVisitors && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Repeats</span>
                                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {countryData.visits - countryData.uniqueVisitors}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="relative">
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.05 }}
                                  className={`h-full bg-gradient-to-r ${colorClass} shadow-inner`}
                                ></motion.div>
                              </div>
                            </div>
                            
                            {/* Repeat Visit Badge */}
                            {countryData.visits > countryData.uniqueVisitors && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Repeat
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
