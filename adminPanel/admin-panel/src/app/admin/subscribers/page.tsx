"use client";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Plus,
  Download,
  Users,
  Calendar,
  Trash2,
  Shield,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  Upload,
  FileText,
  Archive,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { BulkEmailInput } from "@/components/ui/bulk-email-input";

export default function Subscribers() {
  const { data, mutate } = useSWR("/subscribers", fetcher);
  const { data: statsData, mutate: mutateStats } = useSWR("/subscribers/stats", fetcher);
  const { data: profile } = useSWR("/auth/me", fetcher);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "import">("single");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  
  const { toast } = useToast();
  const userRole = profile?.user?.role;

  async function add() {
    if (!email || loading) return;
    setLoading(true);
    try {
      await api.post("/subscribers", { email });
      setEmail("");
      mutate();
      mutateStats();
      toast({
        variant: "success",
        title: "Subscriber added",
        description: `${email} has been added to the newsletter`,
      });
    } catch (error: any) {
      console.error("Failed to add subscriber:", error);
      toast({
        variant: "error",
        title: "Failed to add subscriber",
        description: error.response?.data?.error || "An error occurred while adding the subscriber",
      });
    } finally {
      setLoading(false);
    }
  }

  async function remove(emailToRemove: string) {
    const subscriber = data?.items?.find((s: any) => s.email === emailToRemove);
    if (!subscriber) return;
    
    // Check if admin can delete (within 24 hours)
    let title = "Remove Subscriber";
    let message = `Are you sure you want to remove ${emailToRemove} from the newsletter?`;
    let variant: 'danger' | 'warning' | 'info' = 'danger';
    
    if (userRole === "admin") {
      const addedAt = new Date(subscriber.added_at || subscriber.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - addedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        title = "Lock Subscriber";
        message = `This subscriber is older than 24 hours and will be locked from your view (not permanently deleted). Continue?`;
        variant = 'warning';
      }
    }
    
    setConfirmDialog({
      open: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/subscribers/${encodeURIComponent(emailToRemove)}`);
          mutate();
          mutateStats();
          toast({
            variant: "success",
            title: "Subscriber removed",
            description: `${emailToRemove} has been removed from the newsletter`,
          });
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error: any) {
          console.error("Failed to remove subscriber:", error);
          toast({
            variant: "error",
            title: "Failed to remove subscriber",
            description: error.response?.data?.error || "An error occurred while removing the subscriber",
          });
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      }
    });
  }

  async function bulkDelete() {
    if (selectedEmails.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: "Bulk Delete Subscribers",
      message: `Are you sure you want to delete ${selectedEmails.length} selected subscribers? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        setBulkDeleting(true);
        try {
          await api.delete("/subscribers/bulk", { data: { emails: selectedEmails } });
          setSelectedEmails([]);
          mutate();
          mutateStats();
          toast({
            variant: "success",
            title: "Subscribers deleted",
            description: `Successfully deleted ${selectedEmails.length} subscribers`,
          });
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error: any) {
          console.error("Failed to bulk delete subscribers:", error);
          toast({
            variant: "error",
            title: "Failed to delete subscribers",
            description: error.response?.data?.error || "An error occurred during bulk deletion",
          });
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        } finally {
          setBulkDeleting(false);
        }
      }
    });
  }

  function toggleSelectAll() {
    if (selectedEmails.length === data?.items?.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(data?.items?.map((item: any) => item.email) || []);
    }
  }

  function toggleSelect(email: string) {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  }

  function canDelete(subscriber: any) {
    if (userRole === "superadmin") return true;
    if (userRole !== "admin") return false;
    
    const addedAt = new Date(subscriber.added_at || subscriber.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - addedAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }

  function getTimeRemaining(subscriber: any) {
    if (userRole !== "admin") return null;
    
    const addedAt = new Date(subscriber.added_at || subscriber.createdAt);
    const expiryTime = new Date(addedAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > expiryTime) return "Expired";
    
    const diff = expiryTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  // Bulk email functions
  async function handleBulkEmails(emails: string[]) {
    try {
      const response = await api.post("/subscribers/bulk-emails", { emails });
      mutate();
      mutateStats();
      toast({
        variant: "success",
        title: "Bulk import completed",
        description: `Added ${response.data.added} subscribers, updated ${response.data.updated} existing ones`,
      });
    } catch (error: any) {
      console.error("Failed to import emails:", error);
      throw new Error(error.response?.data?.error || "Failed to import emails");
    }
  }

  // File upload function
  async function handleFileUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post("/subscribers/import", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      mutate();
      mutateStats();
      toast({
        variant: "success",
        title: "File import completed",
        description: `Added ${response.data.added} subscribers, updated ${response.data.updated} existing ones`,
      });
    } catch (error: any) {
      console.error("Failed to import file:", error);
      throw new Error(error.response?.data?.error || "Failed to import file");
    }
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Subscribers
                {userRole === "superadmin" && (
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Superadmin
                  </span>
                )}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {userRole === "superadmin" 
                  ? "Manage all newsletter subscribers" 
                  : "Manage your newsletter subscribers"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats Display */}
              {statsData && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    Active: <span className="font-semibold text-green-600">{statsData.active || 0}</span>
                  </div>
                  {userRole === "superadmin" && statsData.locked > 0 && (
                    <div className="text-slate-600 dark:text-slate-400">
                      Locked: <span className="font-semibold text-yellow-600">{statsData.locked}</span>
                    </div>
                  )}
                  <div className="text-slate-600 dark:text-slate-400">
                    Total: <span className="font-semibold">{statsData.total || 0}</span>
                  </div>
                </div>
              )}
              
              {/* Bulk Actions for Superadmin */}
              {userRole === "superadmin" && selectedEmails.length > 0 && (
                <button
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {bulkDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Selected ({selectedEmails.length})
                </button>
              )}
              
              <a
                href="/api/export/contacts.csv"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </a>
            </div>
          </div>
        </motion.div>

        {/* Add Subscribers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Subscribers
            </h2>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("single")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "single"
                    ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Plus className="w-4 h-4" />
                Single
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "bulk"
                    ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Mail className="w-4 h-4" />
                Bulk Emails
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "import"
                    ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                Import File
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "single" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Add Single Subscriber</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && add()}
                    />
                  </div>
                  <button
                    onClick={add}
                    disabled={loading || !email.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {loading ? "Adding..." : "Add Subscriber"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "bulk" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Bulk Add from Email List</h3>
                <BulkEmailInput onSubmit={handleBulkEmails} loading={loading} />
              </div>
            )}

            {activeTab === "import" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Import from CSV/Excel File</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload a CSV or Excel file with email addresses. The file should have an "email" column.
                </p>
                <FileUpload onUpload={handleFileUpload} loading={loading} />
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Subscribers List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Subscriber List
                {userRole === "admin" && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    (Only your subscribers shown)
                  </span>
                )}
              </h2>
              
              {/* Select All for Superadmin */}
              {userRole === "superadmin" && data?.items && data.items.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {selectedEmails.length === data.items.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All
                </button>
              )}
            </div>
          </div>

          {(!data?.items || data.items.length === 0) ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No subscribers yet
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Add your first subscriber above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    {userRole === "superadmin" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Select
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Subscription Date
                    </th>
                    {userRole === "admin" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Delete Window
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.items.map((subscriber: any, index: number) => {
                    const canDeleteThis = canDelete(subscriber);
                    const timeRemaining = getTimeRemaining(subscriber);
                    
                    return (
                      <motion.tr
                        key={subscriber.email}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        {/* Select Column for Superadmin */}
                        {userRole === "superadmin" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleSelect(subscriber.email)}
                              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                              {selectedEmails.includes(subscriber.email) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}
                        
                        {/* Email Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {subscriber.email}
                              </div>
                              {userRole === "superadmin" && subscriber.added_by && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Added by: {subscriber.staff_name || subscriber.added_by}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Date Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            {(subscriber.added_at || subscriber.createdAt)
                              ? new Date(subscriber.added_at || subscriber.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Unknown"}
                          </div>
                        </td>
                        
                        {/* Delete Window Column for Admin */}
                        {userRole === "admin" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-xs">
                              {canDeleteThis ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Clock className="w-3 h-3" />
                                  {timeRemaining} left
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertCircle className="w-3 h-3" />
                                  Expired
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                        
                        {/* Actions Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => remove(subscriber.email)}
                            disabled={userRole === "admin" && !canDeleteThis}
                            className={`p-2 rounded-lg transition-colors ${
                              canDeleteThis
                                ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              userRole === "superadmin"
                                ? "Remove subscriber"
                                : canDeleteThis
                                ? "Remove subscriber (within 24h window)"
                                : "Cannot delete - contact superadmin"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
