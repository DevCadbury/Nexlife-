"use client";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Edit,
  Loader2,
  AlertCircle,
  Award,
  StickyNote,
  Calendar,
  Building2,
} from "lucide-react";

interface CertificationImage {
  url: string;
  publicId: string;
}

interface Certification {
  _id: string;
  title: string;
  description?: string;
  issueDate?: string;
  issuedBy?: string;
  validUntil?: string;
  type: string;
  image?: CertificationImage;
  views: number;
  visible: boolean;
  adminNote?: string;
  sequence: number;
  uploadedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function CertificationsPage() {
  const { data, mutate } = useSWR("/certifications/admin", fetcher);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issueDate: "",
    issuedBy: "",
    validUntil: "",
    type: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const openModal = (cert?: Certification) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        title: cert.title,
        description: cert.description || "",
        issueDate: cert.issueDate || "",
        issuedBy: cert.issuedBy || "",
        validUntil: cert.validUntil || "",
        type: cert.type,
      });
      if (cert.image?.url) {
        setPreviewUrl(cert.image.url);
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      issueDate: "",
      issuedBy: "",
      validUntil: "",
      type: "",
    });
    setEditingCert(null);
    setSelectedImage(null);
    setPreviewUrl("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("issueDate", formData.issueDate);
      formDataToSend.append("issuedBy", formData.issuedBy);
      formDataToSend.append("validUntil", formData.validUntil);
      formDataToSend.append("type", formData.type);
      
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      if (editingCert) {
        await api.patch(`/certifications/${editingCert._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Certification updated successfully", "success");
      } else {
        await api.post("/certifications", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Certification created successfully", "success");
      }

      mutate();
      closeModal();
    } catch (error: any) {
      showToast(error.message || "Error saving certification", "error");
    } finally {
      setUploading(false);
    }
  }

  async function toggleVisibility(cert: Certification) {
    try {
      await api.patch(`/certifications/${cert._id}/visibility`, {
        visible: !cert.visible,
      });
      showToast(`Certification ${!cert.visible ? "shown" : "hidden"}`, "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error updating visibility", "error");
    }
  }

  async function deleteCertification(cert: Certification) {
    if (!confirm(`Delete "${cert.title}"?`)) return;
    try {
      await api.delete(`/certifications/${cert._id}`);
      showToast("Certification deleted", "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error deleting certification", "error");
    }
  }

  async function moveCertification(certId: string, direction: "up" | "down") {
    try {
      await api.patch(`/certifications/${certId}/sequence`, { direction });
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error moving certification", "error");
    }
  }

  async function updateNote(cert: Certification, note: string) {
    try {
      await api.patch(`/certifications/${cert._id}/note`, { note });
      showToast("Note updated", "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error updating note", "error");
    }
  }

  const certifications = data?.items || [];
  const types = [...new Set(certifications.map((c: Certification) => c.type))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
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
                <Award className="w-8 h-8 text-blue-600" />
                Certifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage company certifications and credentials
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Certification
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Certifications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {certifications.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Visible</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {certifications.filter((c: Certification) => c.visible).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Types</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {types.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {certifications.reduce((acc: number, c: Certification) => acc + (c.views || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        {/* Certifications Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {certifications.map((cert: Certification, index: number) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-2 transition-all ${
                cert.visible
                  ? "border-green-200 dark:border-green-600"
                  : "border-red-200 dark:border-red-600 opacity-60"
              }`}
            >
              {/* Certification Image */}
              {cert.image?.url && (
                <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-slate-100 dark:bg-slate-700">
                  <img
                    src={cert.image.url}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Certification Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {cert.title}
                </h3>
                {cert.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {cert.description}
                  </p>
                )}
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {cert.type}
                </span>
                {cert.issueDate && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Issued: {cert.issueDate}</span>
                  </div>
                )}
                {cert.validUntil && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Valid until: {cert.validUntil}</span>
                  </div>
                )}
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {cert.views || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(cert)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVisibility(cert)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    {cert.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteCertification(cert)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveCertification(cert._id, "up")}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Up
                  </button>
                  <button
                    onClick={() => moveCertification(cert._id, "down")}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Down
                  </button>
                </div>
              </div>

              {/* Admin Note */}
              {cert.adminNote && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <StickyNote className="w-3 h-3 inline mr-1" />
                  {cert.adminNote}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {editingCert ? "Edit Certification" : "Add New Certification"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Certification Image
                    </label>
                    <div className="flex flex-col items-center gap-4">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-48 h-48 object-cover rounded-lg"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Certification Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., WHO-GMP Certificate"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., World Health Organization - Good Manufacturing Practice"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Manufacturing, Quality, Legal, Environmental"
                      list="types"
                    />
                    <datalist id="types">
                      {types.map((type: string) => (
                        <option key={type} value={type} />
                      ))}
                      <option value="Manufacturing" />
                      <option value="Quality" />
                      <option value="Legal" />
                      <option value="Environmental" />
                    </datalist>
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., January 2024"
                    />
                  </div>

                  {/* Issued By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Issued By
                    </label>
                    <input
                      type="text"
                      value={formData.issuedBy}
                      onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., World Health Organization"
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="text"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., January 2027"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingCert ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {editingCert ? "Update" : "Create"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast.visible && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-6 right-6 z-[9999]"
            >
              <div
                className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 ${
                  toast.type === "success"
                    ? "bg-emerald-500 text-white border-emerald-400"
                    : "bg-red-500 text-white border-red-400"
                }`}
              >
                {toast.type === "success" ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
