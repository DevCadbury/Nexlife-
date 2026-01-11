"use client";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Users,
  Activity,
  Database,
  FileSpreadsheet,
  Clock,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";

export default function ExportPage() {
  // Get the base URL for downloads
  const getDownloadUrl = (path: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      return `${backendUrl}${path}`;
    }
    return path; // Fallback to relative path
  };

  const handleDownload = async (exportType: string, fileName: string) => {
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("token");
      
      // Use fetch with authorization header
      const response = await fetch(getDownloadUrl(`/api/export/${exportType}.csv`), {
        method: "GET",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {

      alert("Failed to export data. Please try again.");
    }
  };

  const exportOptions = [
    {
      title: "Contacts CSV",
      description: "Export all subscriber email addresses",
      type: "contacts",
      fileName: "nexlife-contacts.csv",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700",
      count: "All subscribers",
    },
    {
      title: "Logs CSV",
      description: "Export system activity logs",
      type: "logs",
      fileName: "nexlife-logs.csv",
      icon: Activity,
      color: "bg-green-600 hover:bg-green-700",
      count: "Recent activities",
    },
  ];

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            Data Export
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Download your data in CSV format for analysis and backup
          </p>
        </motion.div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${option.color} text-white shadow-lg`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {option.count}
                    </span>
                    <button
                      onClick={() => handleDownload(option.type, option.fileName)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${option.color} shadow-lg`}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Export Information
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• CSV files contain all available data for the selected category</li>
                <li>• Downloads are generated in real-time from the current database</li>
                <li>• Files are automatically formatted for spreadsheet applications</li>
                <li>• Large datasets may take a moment to generate</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            Files are generated on-demand and may include the latest data
          </div>
        </motion.div>
      </div>
    </div>
  );
}
