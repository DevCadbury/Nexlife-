"use client";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Upload,
  Trash2,
  Heart,
  Eye,
  Calendar,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";

export default function Gallery() {
  const { data, mutate, isLoading } = useSWR("/gallery/admin", fetcher);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

  async function del(id: string) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      mutate();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    const input = e.currentTarget.elements.namedItem(
      "file"
    ) as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (altText) fd.append("alt", altText);
      await api.post("/gallery/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      input.value = "";
      setPreview(null);
      setAltText("");
      setUploadSuccess("Image uploaded successfully!");
      mutate();
    } catch (error: any) {
      setUploadError(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadError("");
        setUploadSuccess("");
      }, 3000);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function migrateUploaders() {
    if (!confirm("This will add uploader info to existing images. Continue?"))
      return;
    setMigrating(true);
    try {
      await api.post("/gallery/migrate-uploaders");
      setUploadSuccess("Migration completed successfully!");
      mutate();
    } catch (error: any) {
      setUploadError(error.response?.data?.error || "Migration failed");
    } finally {
      setMigrating(false);
      setTimeout(() => {
        setUploadError("");
        setUploadSuccess("");
      }, 3000);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setPreview(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function setVisibility(id: string, visible: boolean) {
    await api.patch(`/gallery/${id}/visibility`, { visible });
    mutate();
  }

  async function saveNote(id: string, note: string) {
    await api.patch(`/gallery/${id}/note`, { note });
    mutate();
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
                <ImageIcon className="w-8 h-8 text-blue-600" />
                Gallery Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Upload and manage gallery images
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Images: {data?.items?.length || 0}
              </div>
              <button
                onClick={migrateUploaders}
                disabled={migrating}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add uploader info to existing images"
              >
                {migrating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {migrating ? "Migrating..." : "Migrate Uploaders"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Upload New Image
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Add images to your gallery collection
            </p>
          </div>

          <form onSubmit={upload} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image File
                </label>
                <input
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Alt Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Describe the image for accessibility"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              {preview && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Preview
                  </label>
                  <div className="mt-2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-48 rounded-lg border border-slate-300 dark:border-slate-600 object-cover shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                </div>
                <button
                  className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 font-medium transition-colors"
                  type="submit"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
              </div>
            </div>

            {/* Upload Messages */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {uploadError}
              </motion.div>
            )}
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {uploadSuccess}
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {(data?.items || []).map((image: any, index: number) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={image.url}
                    alt={image.alt || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex gap-2">
                    <button
                      onClick={() =>
                        setVisibility(image._id, !(image.visible !== false))
                      }
                      className={`p-2 rounded-full ${
                        image.visible === false
                          ? "bg-slate-600/90 hover:bg-slate-600 text-white"
                          : "bg-green-600/90 hover:bg-green-600 text-white"
                      } backdrop-blur-sm transition-all duration-300 shadow-lg`}
                      title={
                        image.visible === false ? "Set visible" : "Set hidden"
                      }
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => del(image._id)}
                      className="p-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white backdrop-blur-sm transition-all duration-300 shadow-lg"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4 space-y-3">
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Heart className="w-4 h-4 fill-current text-red-500" />
                      <span>{image.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span>{image.views || 0}</span>
                    </div>
                  </div>

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span className="truncate" title={image.uploadedBy?.email}>
                      {image.uploadedBy?.name || "Unknown User"}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(image.createdAt)}</span>
                  </div>

                  {/* Admin Note & Image ID */}
                  <div className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-700/50 rounded px-2 py-1">
                    ID: {image._id.slice(-8)}
                  </div>
                  <div className="pt-2">
                    <textarea
                      defaultValue={image.adminNote || ""}
                      placeholder="Admin note (private)"
                      onBlur={(e) => saveNote(image._id, e.target.value)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.items || data.items.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
          >
            <ImageIcon className="w-20 h-20 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No images yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              Upload your first image to get started with your gallery
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
