"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { motion } from "framer-motion";
import {
  MessageSquare,
  User,
  Mail,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Phone,
  Calendar,
  FileText,
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function InquiryThreadPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const { data, isLoading, error } = useSWR(
    id ? `/inquiries/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-slate-300 text-lg">Loading conversation...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-300 mb-2">Failed to Load Thread</h2>
            <p className="text-slate-400">Unable to fetch the inquiry details. Please try again.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const inquiry = data?.inquiry;
  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center"
          >
            <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No Data Found</h2>
            <p className="text-slate-400">The requested inquiry could not be found.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "read": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "replied": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertCircle className="w-3 h-3" />;
      case "read": return <Eye className="w-3 h-3" />;
      case "replied": return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin/inquiries">
            <Button className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800/50 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inquiries
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Inquiry Conversation</h1>
              <p className="text-slate-400">Detailed view of customer inquiry and responses</p>
            </div>
          </div>
        </motion.div>

        {/* Inquiry Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8 shadow-xl"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {(inquiry.name || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white truncate">{inquiry.name}</h2>
                <Badge className={`${getStatusColor(inquiry.status)} flex items-center gap-1`}>
                  {getStatusIcon(inquiry.status)}
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{inquiry.email}</span>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{inquiry.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Created {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{new Date(inquiry.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {inquiry.subject && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm font-medium">Subject</span>
                  </div>
                  <p className="text-white font-medium">{inquiry.subject}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Conversation</h3>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {(inquiry.replies?.length || 0) + 1} messages
            </Badge>
          </div>

          {/* Original Message - User (Left Side) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-start mb-6"
          >
            <div className="max-w-[75%] bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 rounded-2xl rounded-tl-md p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-blue-300">{inquiry.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                      Customer
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-white leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Replies - Support Team (Right Side) */}
          {(inquiry.replies || []).map((reply: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="flex justify-end mb-6"
            >
              <div className="max-w-[75%] bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30 rounded-2xl rounded-tr-md p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 justify-end">
                      <span className="text-xs text-slate-500">
                        {new Date(reply.at).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                        Support Team
                      </span>
                      <span className="font-semibold text-emerald-300">
                        {reply.fromName || "Admin"}
                      </span>
                    </div>
                    {reply.subject && (
                      <div className="text-sm text-slate-400 mb-2 font-medium text-right">
                        Subject: {reply.subject}
                      </div>
                    )}
                    <div className="text-white leading-relaxed whitespace-pre-wrap">
                      {reply.message}
                    </div>
                    {reply.note && (
                      <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/40 rounded-lg">
                        <div className="text-xs text-amber-400 font-medium mb-1">Internal Note:</div>
                        <div className="text-amber-200 text-sm whitespace-pre-wrap">
                          {reply.note}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
