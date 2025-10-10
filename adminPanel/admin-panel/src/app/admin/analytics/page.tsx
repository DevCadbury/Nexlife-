"use client";
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
  const { data: visitorOverview } = useSWR(
    selectedTimespanData?.days ? `/analytics/visitors/overview?range=${selectedTimespanData.days}` : "/analytics/visitors/overview?range=all",
    fetcher
  );

  const series = (sub?.series || []).map((p: any) => ({
    _id: p._id,
    count: p.count,
  }));

  const pieData = status ? [status.new, status.read, status.replied] : [];

  // Process visitor data for area chart
  const visitorSeries = visitors?.series?.map((item: any) => ({
    _id: item.country,
    count: item.count,
  })) || [];

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Analytics Dashboard</h1>
          <p className="text-blue-100 text-lg">
            Comprehensive insights into your platform's performance and user engagement
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
              <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {getTrendIcon(k)}
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-600 dark:text-slate-400 text-sm font-medium capitalize">
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {ov?.[k]?.toLocaleString() ?? 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Submissions ({timespanLabel})
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Interactive chart - scroll to zoom, drag to pan
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
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ChartAreaInteractive series={series} timespan={selectedTimespan} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Status Breakdown ({timespanLabel})
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                Distribution of inquiry statuses across the selected period
              </CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="relative">
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
                          color: "rgb(100 116 139)",
                          font: { size: 14, weight: "bold" },
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        titleColor: "rgb(248 250 252)",
                        bodyColor: "rgb(203 213 225)",
                        borderColor: "rgb(51 65 85)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                      },
                    },
                    animation: {
                      animateScale: true,
                      animateRotate: true,
                      duration: 1000,
                      easing: "easeOutQuart",
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
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Visitor Analytics ({timespanLabel})
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Website visitor trends and activity
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
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Visitor Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Visits</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {visitorOverview?.totalVisits || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Unique Visitors</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {visitorOverview?.uniqueVisitors || 0}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Last Activity</span>
                    </div>
                    <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      {visitorOverview?.totalVisits > 0 ? 'Active' : 'No recent activity'}
                    </div>
                  </div>
                </div>

                {/* Visitor Area Chart */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Visitor Trends by Country
                  </h3>
                  {visitorSeries.length > 0 ? (
                    <ChartAreaInteractive
                      series={visitorSeries}
                      timespan={selectedTimespan}
                      title="Visitor Trends"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                        No visitor data
                      </h3>
                      <p className="text-slate-500 dark:text-slate-500 text-sm">
                        Visitor analytics will appear here once users visit your website.
                      </p>
                    </div>
                  )}
                </div>

                {/* Top Pages */}
                {visitorOverview?.topPages && visitorOverview.topPages.length > 0 && (
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      Popular Pages
                    </h4>
                    <div className="space-y-2">
                      {visitorOverview.topPages.slice(0, 5).map((page: any, index: number) => (
                        <div key={page.page} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">#{index + 1}</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{page.page}</span>
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{page.visits} visits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
