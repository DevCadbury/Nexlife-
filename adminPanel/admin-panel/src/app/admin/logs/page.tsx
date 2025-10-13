"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  MessageSquare,
  Image,
  Trash2,
  Edit,
  Plus,
  Mail,
  Database,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Settings,
  ArrowRight,
  Camera,
  Send,
  UserPlus,
  Megaphone,
  Target,
  Zap,
  X,
} from "lucide-react";

interface LogEntry {
  _id: string;
  type: string;
  message: string;
  level: string;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  refId?: string;
  meta?: any;
  ip?: string;
  userAgent?: string;
}

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [logToDelete, setLogToDelete] = useState<LogEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  console.log("Logs component mounted/rendered");

  // Update current time every second
  useEffect(() => {
    console.log("Setting up current time interval");
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check authorization on component mount
  useEffect(() => {
    console.log("Checking authorization on component mount");
    const checkAuthorization = () => {
      console.log("Running checkAuthorization function");
      const { role } = getUserRoleFromToken();
      const authorized = role === "superadmin" || role === "dev";
      console.log("Authorization check result:", { role, isAuthorized: authorized });
      setIsAuthorized(authorized);
      setIsLoading(false);
    };

    checkAuthorization();
  }, []);

  // Function to decode JWT token and get user role
  const getUserRoleFromToken = () => {
    if (typeof window === "undefined") return { role: "", name: "" };
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

      if (!token) return { role: "", name: "" };

      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
      console.log("Token parts:", token.split("."));

      // Try different possible role fields
      const role = payload.role || payload.userRole || payload.user?.role || "";
      const name = payload.name || payload.userName || payload.user?.name || "";

      console.log("Extracted role:", role);
      console.log("Extracted name:", name);

      return { role, name };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { role: "", name: "" };
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetails]);

  const {
    data,
    mutate,
    isLoading: logsLoading,
  } = useSWR(isAuthorized ? "/logs?limit=500" : null, fetcher);

  console.log("SWR data fetching:", {
    isAuthorized,
    endpoint: isAuthorized ? "/logs?limit=500" : null,
    data: data ? "Data received" : "No data",
    logsLoading,
    logsCount: data?.logs?.length || 0
  });

  const logs: LogEntry[] = data?.logs || [];

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (log.type || "").toLowerCase().includes(searchLower) ||
      (log.message || "").toLowerCase().includes(searchLower) ||
      (log.actorName || "").toLowerCase().includes(searchLower) ||
      (log.actorId || "").toLowerCase().includes(searchLower) ||
      (log.ip || "").toLowerCase().includes(searchLower) ||
      (log._id || "").toLowerCase().includes(searchLower) ||
      (log.userAgent || "").toLowerCase().includes(searchLower) ||
      (log.level || "").toLowerCase().includes(searchLower) ||
      ((log as any).refId || "").toLowerCase().includes(searchLower) ||
      ((log as any).category || "").toLowerCase().includes(searchLower) ||
      (log.meta && JSON.stringify(log.meta).toLowerCase().includes(searchLower));

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesType =
      typeFilter === "all" || (log.type || "").includes(typeFilter);
    const matchesCategory =
      categoryFilter === "all" || (log as any).category === categoryFilter;

    let matchesDate = true;
    if (fromDate || toDate) {
      const logDate = new Date(log.timestamp);
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && logDate >= from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && logDate <= to;
      }
    }

    return (
      matchesSearch &&
      matchesLevel &&
      matchesType &&
      matchesCategory &&
      matchesDate
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, typeFilter, categoryFilter, fromDate, toDate, pageSize]);

  const getLevelIcon = (level: string) => {
    if (!level) return <Activity className="w-4 h-4 text-gray-400" />;
    switch (level.toLowerCase()) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warn":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getActivityIcon = (type: string) => {
    if (!type) return <Activity className="w-5 h-5" />;

    const typeLower = type.toLowerCase();
    if (typeLower.includes("login") || typeLower.includes("auth")) {
      return <LogIn className="w-5 h-5" />;
    }
    if (typeLower.includes("logout")) {
      return <LogOut className="w-5 h-5" />;
    }
    if (typeLower.includes("reply") || typeLower.includes("message")) {
      return <MessageSquare className="w-5 h-5" />;
    }
    if (typeLower.includes("gallery.upload")) {
      return <Camera className="w-5 h-5" />;
    }
    if (typeLower.includes("gallery.delete")) {
      return <Trash2 className="w-5 h-5" />;
    }
    if (typeLower.includes("gallery.visibility")) {
      return <Eye className="w-5 h-5" />;
    }
    if (typeLower.includes("gallery.note")) {
      return <Edit className="w-5 h-5" />;
    }
    if (typeLower.includes("gallery") || typeLower.includes("image")) {
      return <Image className="w-5 h-5" />;
    }
    if (typeLower.includes("campaign.sent")) {
      return <Send className="w-5 h-5" />;
    }
    if (typeLower.includes("campaign")) {
      return <Megaphone className="w-5 h-5" />;
    }
    if (typeLower.includes("subscriber.added")) {
      return <UserPlus className="w-5 h-5" />;
    }
    if (typeLower.includes("subscriber")) {
      return <Users className="w-5 h-5" />;
    }
    if (typeLower.includes("delete") || typeLower.includes("remove")) {
      return <Trash2 className="w-5 h-5" />;
    }
    if (typeLower.includes("update") || typeLower.includes("edit")) {
      return <Edit className="w-5 h-5" />;
    }
    if (typeLower.includes("create") || typeLower.includes("add")) {
      return <Plus className="w-5 h-5" />;
    }
    if (typeLower.includes("email") || typeLower.includes("mail")) {
      return <Mail className="w-5 h-5" />;
    }
    if (typeLower.includes("database") || typeLower.includes("db")) {
      return <Database className="w-5 h-5" />;
    }
    if (typeLower.includes("inquiry") || typeLower.includes("contact")) {
      return <FileText className="w-5 h-5" />;
    }
    if (typeLower.includes("settings") || typeLower.includes("config")) {
      return <Settings className="w-5 h-5" />;
    }
    return <Activity className="w-5 h-5" />;
  };

  const getActivityColor = (type: string) => {
    if (!type) return "bg-gray-500";

    const typeLower = type.toLowerCase();
    if (typeLower.includes("login") || typeLower.includes("auth")) {
      return "bg-green-500";
    }
    if (typeLower.includes("logout")) {
      return "bg-red-500";
    }
    if (typeLower.includes("reply") || typeLower.includes("message")) {
      return "bg-blue-500";
    }
    if (typeLower.includes("gallery.upload")) {
      return "bg-emerald-500";
    }
    if (typeLower.includes("gallery.delete")) {
      return "bg-red-600";
    }
    if (typeLower.includes("gallery.visibility")) {
      return "bg-cyan-500";
    }
    if (typeLower.includes("gallery.note")) {
      return "bg-yellow-500";
    }
    if (typeLower.includes("gallery") || typeLower.includes("image")) {
      return "bg-purple-500";
    }
    if (typeLower.includes("campaign.sent")) {
      return "bg-indigo-500";
    }
    if (typeLower.includes("campaign")) {
      return "bg-pink-500";
    }
    if (typeLower.includes("subscriber.added")) {
      return "bg-teal-500";
    }
    if (typeLower.includes("subscriber")) {
      return "bg-orange-500";
    }
    if (typeLower.includes("delete") || typeLower.includes("remove")) {
      return "bg-red-600";
    }
    if (typeLower.includes("update") || typeLower.includes("edit")) {
      return "bg-yellow-500";
    }
    if (typeLower.includes("create") || typeLower.includes("add")) {
      return "bg-green-600";
    }
    if (typeLower.includes("email") || typeLower.includes("mail")) {
      return "bg-indigo-500";
    }
    if (typeLower.includes("database") || typeLower.includes("db")) {
      return "bg-cyan-500";
    }
    if (typeLower.includes("inquiry") || typeLower.includes("contact")) {
      return "bg-orange-500";
    }
    if (typeLower.includes("settings") || typeLower.includes("config")) {
      return "bg-gray-600";
    }
    return "bg-gray-500";
  };

  const getLevelColor = (level: string) => {
    if (!level) return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    switch (level.toLowerCase()) {
      case "error":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "warn":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "info":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-green-400 bg-green-400/10 border-green-400/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const downloadLogs = async () => {
    try {
      const response = await fetch("/api/export/logs.csv", {
        credentials: "include",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const getThreadUrl = (log: any) => {
    const ref = log.refId || log.meta?.refId || log.meta?.threadId;
    const category = (log.category || "").toLowerCase();
    const type = (log.type || "").toLowerCase();
    if (!ref) return null;
    if (category === "communication") {
      if (
        type.includes("inquiry") ||
        type.includes("contact") ||
        type.includes("email")
      ) {
        return `/admin/inquiries/${ref}`;
      }
      if (type.includes("chat") || type.includes("message")) {
        return `/admin/support/${ref}`;
      }
    }
    if (category === "sales") {
      if (type.includes("lead")) return `/admin/leads/${ref}`;
      if (type.includes("deal") || type.includes("opportunity"))
        return `/admin/deals/${ref}`;
    }
    if (category === "tasks") {
      return `/admin/tasks/${ref}`;
    }
    if (category === "engagement") {
      if (type.includes("ticket")) return `/admin/support/${ref}`;
      if (type.includes("feedback")) return `/admin/feedback/${ref}`;
      if (type.includes("purchase") || type.includes("order"))
        return `/admin/orders/${ref}`;
    }
    if (category === "system") {
      if (log.actorId) return `/admin/staff/${log.actorId}`;
    }
    return null;
  };

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("Rendering access denied state - user not authorized");
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-400">
            This page is only accessible to superadmin and dev roles.
          </p>
        </div>
      </div>
    );
  }

  console.log("Rendering main logs page - user is authorized");

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 shadow-2xl">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl"
                >
                  <Activity className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-white mb-1"
                  >
                    System Logs
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 text-base"
                  >
                    Monitor Nexlife CRM activities, API events, and system operations in real-time
                  </motion.p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      await mutate();
                      showToast('Logs refreshed successfully', 'success');
                    } catch (error) {
                      showToast('Failed to refresh logs', 'error');
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                  disabled={isRefreshing || logsLoading}
                  className="group relative overflow-hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div
                    animate={{ rotate: isRefreshing ? 360 : 0 }}
                    transition={{
                      duration: isRefreshing ? 1 : 0.3,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear"
                    }}
                    className="relative z-10"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.div>
                  <div className="relative z-10 flex flex-col items-start">
                    <span className="font-semibold text-sm">Refresh</span>
                    <span className="text-xs opacity-90">
                      {currentTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  {isRefreshing && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                    />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadLogs}
                  className="group relative overflow-hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    <Download className="w-5 h-5" />
                  </motion.div>
                  <div className="relative z-10">
                    <span className="font-semibold text-sm">Export CSV</span>
                  </div>
                </motion.button>
                {getUserRoleFromToken().role === "dev" && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteAllDialog(true)}
                    className="group relative overflow-hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.div>
                    <div className="relative z-10">
                      <span className="font-semibold text-sm">Delete All</span>
                    </div>
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">
                  Total Activities
                </p>
                <p className="text-2xl font-bold text-white">
                  {filteredLogs.length.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  All time records
                </p>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Success</p>
                <p className="text-2xl font-bold text-white">
                  {filteredLogs.filter((log) => log.level === "success").length.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {filteredLogs.length > 0 ? Math.round((filteredLogs.filter((log) => log.level === "success").length / filteredLogs.length) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 shadow-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Warnings</p>
                <p className="text-2xl font-bold text-white">
                  {filteredLogs.filter((log) => log.level === "warn").length.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {filteredLogs.length > 0 ? Math.round((filteredLogs.filter((log) => log.level === "warn").length / filteredLogs.length) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-4 shadow-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Errors</p>
                <p className="text-2xl font-bold text-white">
                  {filteredLogs.filter((log) => log.level === "error").length.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {filteredLogs.length > 0 ? Math.round((filteredLogs.filter((log) => log.level === "error").length / filteredLogs.length) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/20 dark:border-slate-700/50 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <Filter className="w-3 h-3 text-indigo-600" />
              Advanced Filters
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-600 dark:text-slate-400 text-xs"
            >
              Filter and search through system logs
            </motion.p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Enhanced Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex-1 min-w-[200px]"
            >
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Search Logs
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search activities, users, IPs, messages, IDs, levels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                />
              </div>
            </motion.div>

            {/* Enhanced Level Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="min-w-[120px]"
            >
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Level
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">🔴 Error</option>
                <option value="warn">🟡 Warning</option>
                <option value="info">🔵 Info</option>
                <option value="success">🟢 Success</option>
              </select>
            </motion.div>

            {/* Enhanced Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="min-w-[130px]"
            >
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none text-sm"
              >
                <option value="all">All Categories</option>
                <option value="communication">💬 Communication</option>
                <option value="sales">💰 Sales</option>
                <option value="engagement">🎯 Engagement</option>
                <option value="system">⚙️ System</option>
                <option value="tasks">📋 Tasks</option>
              </select>
            </motion.div>

            {/* Enhanced Type Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="min-w-[120px]"
            >
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none text-sm"
              >
                <option value="all">All Types</option>
                <option value="auth">🔐 Authentication</option>
                <option value="gallery">🖼️ Gallery</option>
                <option value="inquiry">💌 Inquiry</option>
                <option value="email">📧 Email</option>
                <option value="api">🔌 API</option>
              </select>
            </motion.div>

            {/* Enhanced Date Range Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="min-w-[200px]"
            >
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                  />
                </div>
                <div className="relative flex-1">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filter Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center justify-between p-2 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
                    {filteredLogs.length !== logs.length && ` (filtered from ${logs.length})`}
                  </span>
                </div>
                {(searchTerm || levelFilter !== "all" || categoryFilter !== "all" || typeFilter !== "all" || fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setLevelFilter("all");
                      setCategoryFilter("all");
                      setTypeFilter("all");
                      setFromDate("");
                      setToDate("");
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {logsLoading ? "Updating..." : "Live data"}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-xs font-medium"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="First page"
                  >
                    <div className="flex items-center gap-0.5">
                      <ChevronDown className="w-3 h-3 rotate-90" />
                      <ChevronDown className="w-3 h-3 rotate-90 -ml-1" />
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Last page"
                  >
                    <div className="flex items-center gap-0.5">
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                      <ChevronDown className="w-3 h-3 -rotate-90 -ml-1" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      {/* Enhanced Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {logsLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                      <div className="text-slate-600 dark:text-slate-400 font-medium">
                        Loading system logs...
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                        <Activity className="w-16 h-16 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          No logs found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">
                          Try adjusting your filters or search terms to see more results
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setLevelFilter("all");
                            setCategoryFilter("all");
                            setTypeFilter("all");
                            setFromDate("");
                            setToDate("");
                          }}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.01, 0.3), // Cap the delay to prevent too many animations
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-slate-700/30 dark:hover:to-slate-600/30 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetails(true);
                    }}
                  >
                    {/* Activity Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`p-3 rounded-2xl ${getActivityColor(
                            log.type
                          )} text-white shadow-lg backdrop-blur-sm`}
                        >
                          {getActivityIcon(log.type)}
                        </motion.div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {log.type || "Unknown Activity"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {log.actorName ? "User Action" : "System Event"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Column */}
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        <div
                          className={`w-2 h-2 rounded-full ${getActivityColor(
                            log.type
                          )}`}
                        />
                        {log.type || "unknown"}
                      </span>
                    </td>

                    {/* Message Column */}
                    <td className="px-6 py-5 max-w-xs">
                      <div
                        className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                        title={log.message || ""}
                      >
                        {log.message || "No description available"}
                      </div>
                      {(log as any).customerName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          Customer: {(log as any).customerName}
                        </div>
                      )}
                    </td>

                    {/* User Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {log.actorName ? (
                          <>
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {log.actorName}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                              <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              System
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* IP Address Column */}
                    <td className="px-6 py-5">
                      <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                        {log.ip || "N/A"}
                      </div>
                    </td>

                    {/* Timestamp Column */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Level Column */}
                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {getLevelIcon(log.level)}
                        <span className="font-bold">
                          {(log.level || "unknown").toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {(log as any).category && (
                          <span className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 font-medium">
                            {(log as any).category}
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        {getThreadUrl(log) && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={getThreadUrl(log) as string}
                            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all duration-200"
                            title="Open Thread"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.a>
                        )}
                        {getUserRoleFromToken().role === "superadmin" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogToDelete(log);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-sm"
                            title="Delete Log (Superadmin Only)"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div
                            className="w-3 h-3 rounded-full bg-indigo-400 shadow-lg"
                            title="Has metadata"
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Enhanced Log Details Modal */}
      {showDetails && selectedLog && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 z-50"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-white/20 dark:border-slate-700/50 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
          >
            {/* Enhanced Header */}
            <div className="relative p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-t-2xl"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`p-2 rounded-xl ${getActivityColor(
                      selectedLog.type
                    )} text-white shadow-xl backdrop-blur-sm`}
                  >
                    {getActivityIcon(selectedLog.type)}
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold text-slate-900 dark:text-white"
                    >
                      Activity Details
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-600 dark:text-slate-400 text-sm mt-0.5"
                    >
                      {selectedLog.type || "Unknown Activity"}
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
                >
                  <EyeOff className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div
            className="p-4 space-y-4 overflow-y-auto max-h-[80vh] custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
              {/* Activity Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Activity Level
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border backdrop-blur-sm shadow-sm ${getLevelColor(
                      selectedLog.level
                    )}`}
                  >
                    {getLevelIcon(selectedLog.level)}
                    <span className="text-sm">
                      {(selectedLog.level || "unknown").toUpperCase()}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Activity Type
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <div
                      className={`p-2 rounded-lg ${getActivityColor(
                        selectedLog.type
                      )} text-white shadow-lg`}
                    >
                      {getActivityIcon(selectedLog.type)}
                    </div>
                    <span className="text-slate-900 dark:text-white font-semibold text-sm">
                      {selectedLog.type || "unknown"}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Reference ID
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <span className="text-slate-900 dark:text-white font-mono text-xs font-bold break-all">
                      {selectedLog.refId || "N/A"}
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Activity Description
                </label>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600/30 backdrop-blur-sm overflow-hidden shadow-sm">
                  <div className="p-4">
                    <div className="space-y-3">
                      <p className="text-slate-900 dark:text-white text-sm leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedLog.message || "No description available"}
                      </p>
                      {(selectedLog as any).type === "inquiry.reply.deleted" && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                          {(selectedLog as any).meta?.subject && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                <strong>Subject:</strong> {(selectedLog as any).meta.subject}
                              </span>
                            </div>
                          )}
                          {(selectedLog as any).meta?.messagePreview && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                <strong>Deleted message:</strong> {(selectedLog as any).meta.messagePreview}
                              </span>
                            </div>
                          )}
                          {(selectedLog as any).actorName && (
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                <strong>Deleted by:</strong> {(selectedLog as any).actorName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {(selectedLog as any).meta?.email && (selectedLog as any).type !== "inquiry.reply.deleted" && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-2 rounded">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">Recipient: </span>
                          <span className="font-mono">{(selectedLog as any).meta.email}</span>
                        </div>
                      )}
                      {(selectedLog as any).meta?.subject && (selectedLog as any).type !== "inquiry.reply.deleted" && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-2 rounded">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">Subject: </span>
                          {(selectedLog as any).meta.subject}
                        </div>
                      )}
                      {getThreadUrl(selectedLog) && (
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={getThreadUrl(selectedLog) as string}
                          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mt-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all duration-200 border border-indigo-200 dark:border-indigo-800 text-xs"
                        >
                          <ArrowRight className="w-4 h-4" />
                          View Thread
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* User Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    Performed By
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    {selectedLog.actorName ? (
                      <>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white text-sm font-bold">
                            {selectedLog.actorName}
                          </div>
                          {selectedLog.actorId && (
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                              ID: {selectedLog.actorId}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-bold">
                          System
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Timestamp
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white text-sm font-bold">
                        {formatTimestamp(selectedLog.timestamp)}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                        {selectedLog.timestamp}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Network Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    IP Address
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      </div>
                      <span className="text-slate-900 dark:text-white font-mono text-sm font-bold">
                        {selectedLog.ip || "Not available"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    User Agent
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="text-slate-900 dark:text-white text-xs font-medium truncate"
                          title={selectedLog.userAgent || ""}
                        >
                          {selectedLog.userAgent || "Not available"}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Technical Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                className="space-y-3"
              >
                <motion.h4
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 }}
                  className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-600/50 pb-2"
                >
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  Technical Details
                </motion.h4>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Log ID
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                      <span className="text-slate-900 dark:text-white font-mono text-xs font-bold break-all">
                        {selectedLog._id}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.1 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      Activity Category
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-sm">
                      <span className="text-slate-900 dark:text-white text-xs font-bold">
                        {selectedLog.type?.split("_")[0] || "General"}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Metadata */}
              {selectedLog.meta && Object.keys(selectedLog.meta).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Additional Metadata
                  </label>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600/30 overflow-hidden backdrop-blur-sm shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-700/60 px-4 py-3 border-b border-slate-200 dark:border-slate-600/50">
                      <span className="text-slate-900 dark:text-white text-xs font-bold">
                        JSON Data ({Object.keys(selectedLog.meta).length} fields)
                      </span>
                    </div>
                    <pre className="text-slate-700 dark:text-slate-300 text-xs p-4 overflow-x-auto max-h-32 font-mono bg-slate-50 dark:bg-slate-800/50">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* Raw Log Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  Raw Log Data
                </label>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600/30 overflow-hidden backdrop-blur-sm shadow-sm">
                  <div className="bg-slate-100 dark:bg-slate-700/60 px-4 py-3 border-b border-slate-200 dark:border-slate-600/50">
                    <span className="text-slate-900 dark:text-white text-xs font-bold">
                      Complete Log Entry
                    </span>
                  </div>
                  <pre className="text-slate-700 dark:text-slate-300 text-xs p-4 overflow-x-auto max-h-32 font-mono bg-slate-50 dark:bg-slate-800/50">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && logToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-white/20 dark:border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-red-600/5 via-red-600/5 to-red-600/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 rounded-t-2xl"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-red-500 text-white rounded-xl shadow-xl backdrop-blur-sm"
                  >
                    <Trash2 className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold text-slate-900 dark:text-white"
                    >
                      Delete Log Entry
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-600 dark:text-slate-400 text-sm mt-0.5"
                    >
                      This action cannot be undone
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setLogToDelete(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  Are you sure you want to permanently delete this log entry? This action cannot be undone.
                </p>

                {/* Log Details */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(logToDelete.type)} text-white shadow-lg`}>
                      {getActivityIcon(logToDelete.type)}
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white font-semibold text-sm">
                        {logToDelete.type || "Unknown Activity"}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {logToDelete.level?.toUpperCase() || "UNKNOWN"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>User:</strong> {logToDelete.actorName || "System"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>Time:</strong> {formatTimestamp(logToDelete.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>Message:</strong> {logToDelete.message?.substring(0, 50) || "No message"}{logToDelete.message && logToDelete.message.length > 50 ? "..." : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowDeleteDialog(false);
                  setLogToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!logToDelete) return;

                  setIsDeleting(true);
                  try {
                    const response = await fetch(`/api/logs/${logToDelete._id}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    const result = await response.json();

                    if (result.success) {
                      mutate(); // Refresh the logs after deletion
                      setShowDeleteDialog(false);
                      setLogToDelete(null);
                      showToast('Log entry deleted successfully', 'success');
                    } else {
                      // Show error in a better way - maybe add a toast or error state
                      console.error('Failed to delete log entry:', result.error);
                      showToast('Failed to delete log entry', 'error');
                      // For now, we'll just close the dialog and log the error
                      setShowDeleteDialog(false);
                      setLogToDelete(null);
                    }
                  } catch (error) {
                    console.error('Error deleting log:', error);
                    setShowDeleteDialog(false);
                    setLogToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete All Logs Confirmation Dialog */}
      {showDeleteAllDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-white/20 dark:border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-red-600/5 via-red-600/5 to-red-600/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/10 to-red-500/10 rounded-t-2xl"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-red-500 text-white rounded-xl shadow-xl backdrop-blur-sm"
                  >
                    <Trash2 className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold text-slate-900 dark:text-white"
                    >
                      Delete All Logs
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-600 dark:text-slate-400 text-sm mt-0.5"
                    >
                      This action cannot be undone
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowDeleteAllDialog(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-red-900 dark:text-red-200 font-bold text-sm">
                        ⚠️ CRITICAL ACTION - DEV ONLY
                      </p>
                      <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">
                        You are about to permanently delete <strong>ALL {logs.length.toLocaleString()} log entries</strong> from the system. This will:
                      </p>
                      <ul className="text-red-800 dark:text-red-300 text-sm space-y-1 ml-4 list-disc">
                        <li>Remove all activity history</li>
                        <li>Clear all audit trails</li>
                        <li>Delete all system event records</li>
                        <li>Cannot be recovered or undone</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  This action is restricted to DEV role only and should be used with extreme caution. All log data will be permanently erased.
                </p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowDeleteAllDialog(false);
                }}
                disabled={isDeletingAll}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  setIsDeletingAll(true);
                  try {
                    const response = await fetch('/api/logs/all', {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    const result = await response.json();

                    if (result.success) {
                      mutate(); // Refresh the logs after deletion
                      setShowDeleteAllDialog(false);
                      showToast(`Successfully deleted ${result.deletedCount || 'all'} log entries`, 'success');
                    } else {
                      showToast(result.error || 'Failed to delete logs', 'error');
                    }
                  } catch (error) {
                    console.error('Error deleting all logs:', error);
                    showToast('Failed to delete logs', 'error');
                  } finally {
                    setIsDeletingAll(false);
                  }
                }}
                disabled={isDeletingAll}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting All...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete All {logs.length.toLocaleString()} Logs
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-6 right-6 z-[9999]"
        >
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/25'
              : toast.type === 'error'
              ? 'bg-red-500 text-white border-red-400 shadow-red-500/25'
              : 'bg-blue-500 text-white border-blue-400 shadow-blue-500/25'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Info className="w-6 h-6" />
              )}
            </div>
            <span className="text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="flex-shrink-0 ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      </div>
    </div>
  );
}
