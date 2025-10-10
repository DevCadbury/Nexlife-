"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function Campaigns() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent?: number; failed?: number } | null>(null);

  async function send() {
    if (!subject.trim() || !message.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const r = await api.post("/subscribers/campaign", { subject, message });
      setResult(r.data);
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send campaign:", error);
      setResult({ sent: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Email Campaigns
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Send newsletters and announcements to all subscribers
          </p>
        </motion.div>

        {/* Campaign Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Create New Campaign
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Compose your message and send it to all subscribers
            </p>
          </div>

          <div className="space-y-6">
            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter campaign subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message Content
              </label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                rows={12}
                placeholder="Write your campaign message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                Will be sent to all active subscribers
              </div>
              <button
                onClick={send}
                disabled={loading || !subject.trim() || !message.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Result Notification */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-6 rounded-xl border ${
              result.sent && result.sent > 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.sent && result.sent > 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  result.sent && result.sent > 0
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}>
                  Campaign {result.sent && result.sent > 0 ? "Sent Successfully" : "Failed"}
                </h3>
                <p className={`mt-1 ${
                  result.sent && result.sent > 0
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}>
                  {result.sent || 0} emails sent successfully, {result.failed || 0} failed
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Campaign Guidelines
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Make sure your subject line is clear and engaging</li>
                <li>• Keep your message concise and valuable to subscribers</li>
                <li>• Include an unsubscribe link in your message content</li>
                <li>• Campaigns are sent to all active subscribers immediately</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
