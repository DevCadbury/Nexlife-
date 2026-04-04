"use client";

import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  UserPlus,
  Search,
  Pencil,
  Phone,
  MessageCircle,
  X,
  StickyNote,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BulkEmailInput } from "@/components/ui/bulk-email-input";

interface Subscriber {
  email: string;
  name?: string;
  phone?: string;
  internalNote?: string;
  createdAt?: string;
  added_at?: string;
  added_by?: string;
  staff_name?: string;
  staff_email?: string;
  staff_role?: string;
  is_locked?: boolean;
  deleted_by_admin?: boolean;
  deleted_by_super?: boolean;
}

interface SubscriberListResponse {
  total: number;
  items: Subscriber[];
}

interface SubscriberStats {
  total: number;
  active: number;
  locked?: number;
  adminDeleted?: number;
}

interface AuthProfile {
  user?: {
    role?: string;
  };
}

interface StaffListResponse {
  items: Array<{ _id: string; name: string; role: string }>;
}

interface SubscriberForm {
  email: string;
  name: string;
  phone: string;
  internalNote: string;
}

interface ImportPreviewItem {
  row: number;
  email: string;
  name?: string;
  phone?: string;
  internalNote?: string;
  status: string;
  reason?: string;
}

interface ImportPreviewResponse {
  success: boolean;
  filename: string;
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  alreadyExists?: number;
  importable: number;
  items: ImportPreviewItem[];
}

const emptyForm: SubscriberForm = {
  email: "",
  name: "",
  phone: "",
  internalNote: "",
};

const normalizePhoneForLinks = (phone?: string) => String(phone || "").replace(/[^\d+]/g, "");
const normalizeWhatsAppDigits = (phone?: string) => String(phone || "").replace(/\D/g, "");

type ApiErrorLike = {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
};

function toApiError(error: unknown): ApiErrorLike {
  if (typeof error === "object" && error !== null) {
    return error as ApiErrorLike;
  }
  return {};
}

function getApiErrorMessage(error: unknown, fallback = "An error occurred") {
  const apiError = toApiError(error);
  return apiError.response?.data?.error || apiError.message || fallback;
}

export default function SubscribersPage() {
  const { data, mutate } = useSWR<SubscriberListResponse>("/subscribers", fetcher);
  const { data: statsData, mutate: mutateStats } = useSWR<SubscriberStats>("/subscribers/stats", fetcher);
  const { data: profile } = useSWR<AuthProfile>("/auth/me", fetcher);
  const { data: staffList } = useSWR<StaffListResponse>(
    profile?.user?.role === "superadmin" || profile?.user?.role === "dev" ? "/staff" : null,
    fetcher
  );

  const { toast } = useToast();
  const role = profile?.user?.role;
  const canSuperManage = role === "superadmin" || role === "dev";

  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "import">("single");
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const [addForm, setAddForm] = useState<SubscriberForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const addNoteInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOriginalEmail, setEditingOriginalEmail] = useState("");
  const [editForm, setEditForm] = useState<SubscriberForm>(emptyForm);
  const editNoteInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [noteViewer, setNoteViewer] = useState<{ email: string; note: string } | null>(null);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [importingFile, setImportingFile] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
    loading?: boolean;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const filteredSubscribers = useMemo(() => {
    const search = subscriberSearch.trim().toLowerCase();

    return (data?.items || []).filter((subscriber) => {
      const matchStaff = !canSuperManage || staffFilter === "all"
        ? true
        : subscriber.added_by === staffFilter;

      const matchSearch = !search
        ? true
        : [
            subscriber.email,
            subscriber.name || "",
            subscriber.phone || "",
            subscriber.internalNote || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(search);

      return matchStaff && matchSearch;
    });
  }, [data?.items, subscriberSearch, canSuperManage, staffFilter]);

  const selectedVisibleCount = filteredSubscribers.filter((s) => selectedEmails.includes(s.email)).length;

  const refreshAll = async () => {
    await Promise.all([mutate(), mutateStats()]);
  };

  const addSubscriber = async () => {
    if (!addForm.email.trim() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        email: addForm.email.trim(),
        name: addForm.name.trim(),
        phone: addForm.phone.trim(),
        internalNote: String(addNoteInputRef.current?.value || "").trim(),
      };

      const response = await api.post("/subscribers", payload);
      const alreadyExists = Boolean(response.data?.alreadyExists);

      setAddForm(emptyForm);
      if (addNoteInputRef.current) {
        addNoteInputRef.current.value = "";
      }
      await refreshAll();

      toast({
        variant: "success",
        title: alreadyExists ? "Subscriber already exists" : "Subscriber added",
        description: alreadyExists
          ? `${payload.email} already existed. Details were refreshed.`
          : `${payload.email} has been added to newsletter list.`,
      });
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Failed to add subscriber",
        description: getApiErrorMessage(error, "An error occurred while adding subscriber"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canDelete = (subscriber: Subscriber) => {
    if (canSuperManage) return true;
    if (role !== "admin" && role !== "staff") return false;

    const addedAt = new Date(subscriber.added_at || subscriber.createdAt || "");
    const now = new Date();
    const hoursDiff = (now.getTime() - addedAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const getTimeRemaining = (subscriber: Subscriber) => {
    if (canSuperManage || (role !== "admin" && role !== "staff")) return null;

    const addedAt = new Date(subscriber.added_at || subscriber.createdAt || "");
    const expiry = new Date(addedAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now > expiry) return "Expired";

    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const removeSubscriber = async (emailToRemove: string) => {
    const subscriber = (data?.items || []).find((s) => s.email === emailToRemove);
    if (!subscriber) return;

    if (!canSuperManage && !canDelete(subscriber)) {
      toast({
        variant: "error",
        title: "Cannot delete",
        description: "Delete window expired. Contact superadmin/dev.",
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Remove Subscriber",
      message: `Remove ${emailToRemove} from newsletter list?`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/subscribers/${encodeURIComponent(emailToRemove)}`);
          setSelectedEmails((prev) => prev.filter((email) => email !== emailToRemove));
          await refreshAll();
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
          toast({ variant: "success", title: "Subscriber removed" });
        } catch (error: unknown) {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
          toast({
            variant: "error",
            title: "Failed to remove subscriber",
            description: getApiErrorMessage(error, "An error occurred while removing subscriber"),
          });
        }
      },
    });
  };

  const bulkDelete = async () => {
    if (!selectedEmails.length || !canSuperManage) return;

    setConfirmDialog({
      open: true,
      title: "Bulk Delete",
      message: `Delete ${selectedEmails.length} selected subscribers?`,
      variant: "danger",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        setBulkDeleting(true);
        try {
          await api.delete("/subscribers/bulk", { data: { emails: selectedEmails } });
          setSelectedEmails([]);
          await refreshAll();
          setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
          toast({ variant: "success", title: "Subscribers deleted" });
        } catch (error: unknown) {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
          toast({
            variant: "error",
            title: "Bulk delete failed",
            description: getApiErrorMessage(error, "An error occurred while deleting"),
          });
        } finally {
          setBulkDeleting(false);
        }
      },
    });
  };

  const toggleSelect = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    );
  };

  const toggleSelectAll = () => {
    if (!canSuperManage || !filteredSubscribers.length) return;

    if (selectedVisibleCount === filteredSubscribers.length) {
      setSelectedEmails((prev) => prev.filter((email) => !filteredSubscribers.some((s) => s.email === email)));
      return;
    }

    const next = new Set(selectedEmails);
    filteredSubscribers.forEach((s) => next.add(s.email));
    setSelectedEmails(Array.from(next));
  };

  const openEditModal = (subscriber: Subscriber) => {
    if (!canSuperManage) return;

    setEditingOriginalEmail(subscriber.email);
    setEditForm({
      email: subscriber.email || "",
      name: subscriber.name || "",
      phone: subscriber.phone || "",
      internalNote: subscriber.internalNote || "",
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingOriginalEmail || !editForm.email.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.patch(`/subscribers/${encodeURIComponent(editingOriginalEmail)}`, {
        email: editForm.email.trim(),
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        internalNote: String(editNoteInputRef.current?.value || editForm.internalNote || "").trim(),
      });

      setEditModalOpen(false);
      setEditingOriginalEmail("");
      await refreshAll();
      toast({ variant: "success", title: "Subscriber updated" });
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Failed to update subscriber",
        description: getApiErrorMessage(error, "Could not update subscriber"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkEmails = async (emails: string[]) => {
    const response = await api.post("/subscribers/bulk-emails", { emails });
    await refreshAll();

    const added = Number(response.data?.added || 0);
    const updated = Number(response.data?.updated || 0);
    const skipped = Number(response.data?.skipped || 0);

    toast({
      variant: "success",
      title: "Bulk import completed",
      description: `Added ${added}, updated ${updated}, skipped ${skipped}.`,
    });
  };

  const downloadImportTemplate = async () => {
    try {
      const response = await api.get("/subscribers/template", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "subscribers-template.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ variant: "success", title: "Template downloaded" });
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Template download failed",
        description: getApiErrorMessage(error, "Unable to download template"),
      });
    }
  };

  const previewImportFile = async (file: File) => {
    if (!file || previewLoading) return;

    const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
    const allowed = [".csv", ".xlsx", ".xls"];
    if (!allowed.includes(extension)) {
      toast({
        variant: "error",
        title: "Invalid file type",
        description: "Please upload CSV or Excel file (.csv, .xlsx, .xls)",
      });
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        variant: "error",
        title: "File too large",
        description: "Maximum file size is 5MB",
      });
      return;
    }

    setImportFile(file);
    setPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/subscribers/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportPreview(response.data);
      setPreviewModalOpen(true);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Preview failed",
        description: getApiErrorMessage(error, "Could not parse import file"),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmImportFromPreview = async () => {
    if (!importFile || importingFile) return;

    setImportingFile(true);
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const response = await api.post("/subscribers/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshAll();

      const added = Number(response.data?.added || 0);
      const updated = Number(response.data?.updated || 0);
      const skipped = Number(response.data?.skipped || 0);
      const invalid = Number(response.data?.invalid || 0);

      toast({
        variant: "success",
        title: "File import completed",
        description: `Added ${added}, updated ${updated}, skipped ${skipped}, invalid ${invalid}.`,
      });

      setPreviewModalOpen(false);
      setImportPreview(null);
      setImportFile(null);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Import failed",
        description: getApiErrorMessage(error, "Could not import subscribers"),
      });
    } finally {
      setImportingFile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Subscribers
                {role === "superadmin" && (
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Superadmin
                  </span>
                )}
                {role === "dev" && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Dev
                  </span>
                )}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Add, edit, and manage subscribers with contact metadata.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {statsData && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    Active: <span className="font-semibold text-green-600">{statsData.active || 0}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Total: <span className="font-semibold">{statsData.total || 0}</span>
                  </div>
                </div>
              )}

              {canSuperManage && staffList?.items && (
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="all">All Staff</option>
                  {staffList.items.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              )}

              {canSuperManage && selectedEmails.length > 0 && (
                <button
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedEmails.length})
                </button>
              )}

              <a
                href="http://localhost:4000/api/export/contacts.csv"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Subscribers
            </h2>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg max-w-xl">
              {[
                { id: "single", label: "Single", icon: Plus },
                { id: "bulk", label: "Bulk Emails", icon: Mail },
                { id: "import", label: "Import File", icon: Upload },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "single" | "bulk" | "import")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
            {activeTab === "single" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Add Single Subscriber</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                    placeholder="Email address *"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addSubscriber()}
                  />
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                    placeholder="Contact name (optional)"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                    placeholder="Phone number (optional)"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white"
                    placeholder="Internal note (optional)"
                    defaultValue=""
                    ref={addNoteInputRef}
                  />
                </div>

                <button
                  onClick={addSubscriber}
                  disabled={submitting || !addForm.email.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Adding..." : "Add Subscriber"}
                </button>
              </div>
            )}

            {activeTab === "bulk" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Bulk Add from Email List</h3>
                <BulkEmailInput onSubmit={handleBulkEmails} loading={submitting} />
              </div>
            )}

            {activeTab === "import" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Import from CSV/Excel</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Download the template, fill in rows, then preview before import.
                </p>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Import template</p>
                      <p className="text-xs text-slate-500">Columns: email, name, phone, internalNote</p>
                    </div>
                    <button
                      onClick={downloadImportTemplate}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>

                  <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-white dark:bg-slate-800/70">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Select file to preview</p>
                        <p className="text-xs text-slate-500">Supported: .csv, .xlsx, .xls (max 5MB)</p>
                        {importFile && (
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            Selected: {importFile.name}
                          </p>
                        )}
                      </div>
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer">
                        {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        {previewLoading ? "Preparing Preview..." : "Choose File"}
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="hidden"
                          disabled={previewLoading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void previewImportFile(file);
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Subscriber List
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  placeholder="Search email, name, phone..."
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-60"
                />
              </div>

              {canSuperManage && filteredSubscribers.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  {selectedVisibleCount === filteredSubscribers.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All
                </button>
              )}
            </div>
          </div>

          {!filteredSubscribers.length ? (
            <div className="p-12 text-center">
              <Users className="w-14 h-14 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">No subscribers found</h3>
              <p className="text-slate-500 mt-1">Try changing filters or add a new subscriber.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/40">
                  <tr>
                    {canSuperManage && (
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Select</th>
                    )}
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Subscriber</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Contact</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Added</th>
                    {!canSuperManage && (
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Delete Window</th>
                    )}
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredSubscribers.map((subscriber, index) => {
                    const canDeleteThis = canDelete(subscriber);
                    const timeRemaining = getTimeRemaining(subscriber);
                    const telHref = normalizePhoneForLinks(subscriber.phone);
                    const whatsappDigits = normalizeWhatsAppDigits(subscriber.phone);

                    return (
                      <motion.tr
                        key={subscriber.email}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/20"
                      >
                        {canSuperManage && (
                          <td className="px-5 py-4">
                            <button onClick={() => toggleSelect(subscriber.email)}>
                              {selectedEmails.includes(subscriber.email) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>
                        )}

                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{subscriber.email}</p>
                            {subscriber.name && (
                              <p className="text-xs text-slate-600 dark:text-slate-300">{subscriber.name}</p>
                            )}
                            {subscriber.internalNote && (
                              <button
                                type="button"
                                onClick={() =>
                                  setNoteViewer({
                                    email: subscriber.email,
                                    note: subscriber.internalNote || "",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-200 hover:underline"
                              >
                                <StickyNote className="w-3.5 h-3.5" />
                                Show note
                              </button>
                            )}
                            {subscriber.staff_name && (
                              <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                <span className="text-[11px] font-medium">Added by</span>
                                <span className="font-semibold">{subscriber.staff_name}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${subscriber.email}`}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              title="Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <a
                              href={telHref ? `tel:${telHref}` : undefined}
                              onClick={(e) => {
                                if (!telHref) e.preventDefault();
                              }}
                              className={`p-2 rounded-lg ${
                                telHref
                                  ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                              }`}
                              title={telHref ? "Call" : "No phone"}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={whatsappDigits ? `https://wa.me/${whatsappDigits}` : undefined}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                if (!whatsappDigits) e.preventDefault();
                              }}
                              className={`p-2 rounded-lg ${
                                whatsappDigits
                                  ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                              }`}
                              title={whatsappDigits ? "WhatsApp" : "No phone"}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                          {subscriber.phone && (
                            <p className="text-xs text-slate-500 mt-1">{subscriber.phone}</p>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 mr-2" />
                            {(subscriber.added_at || subscriber.createdAt)
                              ? new Date(subscriber.added_at || subscriber.createdAt || "").toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Unknown"}
                          </div>
                        </td>

                        {!canSuperManage && (
                          <td className="px-5 py-4 align-top">
                            {canDeleteThis ? (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <Clock className="w-3 h-3" />
                                {timeRemaining} left
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                Expired
                              </div>
                            )}
                          </td>
                        )}

                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            {canSuperManage && (
                              <button
                                onClick={() => openEditModal(subscriber)}
                                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                                title="Edit subscriber"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => removeSubscriber(subscriber.email)}
                              disabled={!canSuperManage && !canDeleteThis}
                              className={`p-2 rounded-lg ${
                                canSuperManage || canDeleteThis
                                  ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                              }`}
                              title="Delete subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/55" onClick={() => setEditModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Subscriber</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Phone"
                />
                <textarea
                  key={editingOriginalEmail || "edit-note"}
                  rows={3}
                  ref={editNoteInputRef}
                  defaultValue={editForm.internalNote}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Internal note"
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={submitting || !editForm.email.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {noteViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/55" onClick={() => setNoteViewer(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Internal Note</h3>
                <button
                  onClick={() => setNoteViewer(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">Subscriber: {noteViewer.email}</p>
              <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                <p className="text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">{noteViewer.note}</p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setNoteViewer(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewModalOpen && importPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !importingFile && setPreviewModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative z-10 w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Import Preview</h3>
                  <p className="text-xs text-slate-500 mt-1">File: {importPreview.filename}</p>
                </div>
                <button
                  onClick={() => !importingFile && setPreviewModalOpen(false)}
                  className="self-end sm:self-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  disabled={importingFile}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                  <p className="text-xs text-slate-500">Total Rows</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{importPreview.total}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 p-3 bg-emerald-50/60 dark:bg-emerald-900/20">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Importable</p>
                  <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{importPreview.importable}</p>
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 p-3 bg-amber-50/60 dark:bg-amber-900/20">
                  <p className="text-xs text-amber-700 dark:text-amber-300">Invalid</p>
                  <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">{importPreview.invalid}</p>
                </div>
                <div className="rounded-lg border border-orange-200 dark:border-orange-800 p-3 bg-orange-50/60 dark:bg-orange-900/20">
                  <p className="text-xs text-orange-700 dark:text-orange-300">Duplicates</p>
                  <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">{importPreview.duplicates}</p>
                </div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 p-3 bg-sky-50/60 dark:bg-sky-900/20">
                  <p className="text-xs text-sky-700 dark:text-sky-300">Already Exists</p>
                  <p className="text-lg font-semibold text-sky-800 dark:text-sky-200">{importPreview.alreadyExists || 0}</p>
                </div>
              </div>

              <div className="max-h-[45vh] overflow-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Row</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Internal Note</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {importPreview.items.map((item) => {
                      const statusTone =
                        item.status === "new"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                          : item.status === "reactivate"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                            : item.status === "already_exists"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200"
                          : item.status === "invalid"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";

                      return (
                        <tr key={`${item.row}-${item.email}-${item.status}`}>
                          <td className="px-3 py-2 text-xs text-slate-500">{item.row}</td>
                          <td className="px-3 py-2 text-xs text-slate-800 dark:text-slate-200">{item.email || "-"}</td>
                          <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">{item.name || "-"}</td>
                          <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300">{item.phone || "-"}</td>
                          <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300 max-w-60">
                            <span className="line-clamp-2">{item.internalNote || "-"}</span>
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${statusTone}`}>
                              {item.status}
                            </span>
                            {item.reason && (
                              <p className="text-[10px] text-slate-500 mt-1">{item.reason}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
                <p className="text-xs text-slate-500">
                  Valid rows will be imported even if some rows are invalid.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    disabled={importingFile}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmImportFromPreview}
                    disabled={importingFile || importPreview.importable === 0}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {importingFile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {importingFile ? "Importing..." : "Confirm Import"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
