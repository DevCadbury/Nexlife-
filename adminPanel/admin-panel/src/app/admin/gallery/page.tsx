"use client";
import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { api } from "@/lib/api";
import { motion, Reorder } from "framer-motion";
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
  Move3D,
  ArrowUp,
  ArrowDown,
  Shield,
  Clock,
  Package,
  FileImage,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function Gallery() {
  const { data, mutate, isLoading } = useSWR("/gallery/admin", fetcher);
  const { data: profile } = useSWR("/auth/me", fetcher);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [images, setImages] = useState<any[]>([]);
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

  // Check if user has permission to access gallery
  React.useEffect(() => {
    if (profile && userRole !== "superadmin" && userRole !== "dev") {
      window.location.href = "/admin";
    }
  }, [profile, userRole]);

  // Update images when data changes
  React.useEffect(() => {
    if (data?.items) {
      setImages(data.items);
    }
  }, [data]);

  // Image compression utility
  const compressImage = useCallback(async (file: File, maxSizeMB: number = 10): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with quality 0.8 and reduce if needed
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else if (quality > 0.1) {
              quality -= 0.1;
              tryCompress();
            } else {
              // If we can't compress enough, return original
              resolve(file);
            }
          }, file.type, quality);
        };
        
        tryCompress();
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  async function del(id: string, image: any) {
    // Check permissions for deletion
    const canDelete = checkDeletePermissions(image);
    if (!canDelete.allowed) {
      toast({
        variant: "error",
        title: "Cannot delete image",
        description: canDelete.reason,
      });
      return;
    }

    let title = "Delete Image";
    let message = "Are you sure you want to delete this image? This action cannot be undone.";
    let variant: 'danger' | 'warning' = 'danger';
    
    if (userRole === "admin" && canDelete.isOld) {
      title = "Delete Old Image";
      message = "This image is older than 24 hours but you can still delete it. Are you sure you want to continue?";
      variant = 'warning';
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      variant,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/gallery/${id}`);
          mutate();
          toast({
            variant: "success",
            title: "Image deleted",
            description: "The image has been successfully deleted",
          });
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (error: any) {

          toast({
            variant: "error",
            title: "Delete failed",
            description: error.response?.data?.error || "Failed to delete image",
          });
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      }
    });
  }

  // Check delete permissions based on role and upload time
  function checkDeletePermissions(image: any): { allowed: boolean; reason?: string; isOld?: boolean } {
    if (userRole === "superadmin" || userRole === "dev") {
      return { allowed: true };
    }
    
    return { 
      allowed: false, 
      reason: "You don't have permission to delete images" 
    };
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
      toast({
        variant: "error",
        title: "Invalid file type",
        description: "Please select a valid image file",
      });
      return;
    }

    setUploading(true);
    let processedFile = file;

    try {
      // Compress if file is larger than 10MB
      if (file.size > 10 * 1024 * 1024) {
        setCompressing(true);
        toast({
          variant: "info",
          title: "Compressing image",
          description: "Large image detected, compressing to optimize size...",
        });
        
        processedFile = await compressImage(file, 10);
        
        if (processedFile.size > 10 * 1024 * 1024) {
          throw new Error("Unable to compress image below 10MB. Please use a smaller image.");
        }
        
        toast({
          variant: "success",
          title: "Image compressed",
          description: `Reduced from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(processedFile.size / 1024 / 1024).toFixed(1)}MB`,
        });
      }

      const fd = new FormData();
      fd.append("file", processedFile);
      if (altText) fd.append("alt", altText);
      
      await api.post("/gallery/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      input.value = "";
      setPreview(null);
      setAltText("");
      
      toast({
        variant: "success",
        title: "Image uploaded successfully!",
        description: "Your image has been added to the gallery",
      });
      
      mutate();
    } catch (error: any) {

      toast({
        variant: "error",
        title: "Upload failed",
        description: error.message || error.response?.data?.error || "Failed to upload image",
      });
    } finally {
      setUploading(false);
      setCompressing(false);
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
    
    // Show file size info
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > 10) {
      toast({
        variant: "warning",
        title: "Large file detected",
        description: `File size: ${sizeMB.toFixed(1)}MB. Will be compressed during upload.`,
      });
    }
    
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  // Image sequencing functions
  async function moveImage(id: string, direction: 'up' | 'down') {
    try {
      await api.patch(`/gallery/${id}/sequence`, { direction });
      mutate();
      toast({
        variant: "success",
        title: "Image moved",
        description: `Image moved ${direction} in the sequence`,
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Failed to move image",
        description: error.response?.data?.error || "Failed to update sequence",
      });
    }
  }

  async function updateSequence(newImages: any[]) {
    try {
      const sequences = newImages.map((img, index) => ({
        id: img._id,
        sequence: index
      }));
      
      await api.patch('/gallery/reorder', { sequences });
      setImages(newImages);
      mutate();
      
      toast({
        variant: "success",
        title: "Sequence updated",
        description: "Gallery order has been saved",
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Failed to update sequence",
        description: error.response?.data?.error || "Failed to save new order",
      });
    }
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                Gallery Management
                {userRole === "superadmin" && (
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Superadmin
                  </span>
                )}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {userRole === "superadmin" 
                  ? "Upload, manage, and reorder all gallery images" 
                  : "Upload and manage gallery images (24h edit window)"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Images: {data?.items?.length || 0}
              </div>
              
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  reorderMode
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
                }`}
              >
                <Move3D className="w-4 h-4" />
                {reorderMode ? "Exit Reorder" : "Reorder Images"}
              </button>

              {userRole === "superadmin" && (
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
              )}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Preview
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setAltText("");
                        // Reset the file input
                        const fileInput = document.querySelector('input[name="file"]') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = "";
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md transition-colors"
                      title="Remove preview"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 relative">
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
                  <div>Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                    <Package className="w-3 h-3" />
                    Images larger than 10MB will be automatically compressed
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 font-medium transition-colors"
                  type="submit"
                  disabled={uploading || compressing}
                >
                  {compressing ? (
                    <>
                      <Package className="w-5 h-5 animate-pulse" />
                      Compressing...
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </>
                  )}
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
        ) : reorderMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Move3D className="w-5 h-5" />
                <span className="font-medium">Reorder Mode Active</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Drag images to reorder them. The new sequence will be reflected on the main gallery page.
              </p>
            </div>
            
            <Reorder.Group
              axis="y"
              values={images}
              onReorder={setImages}
              className="space-y-4"
            >
              {images.map((image: any, index: number) => {
                const canDeleteThis = checkDeletePermissions(image);
                const uploadTime = new Date(image.createdAt);
                const hoursSinceUpload = (Date.now() - uploadTime.getTime()) / (1000 * 60 * 60);
                
                return (
                  <Reorder.Item
                    key={image._id}
                    value={image}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Move3D className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.alt || "Gallery image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {image.alt || "Untitled Image"}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>Position: {index + 1}</span>
                          <span>Likes: {image.likes || 0}</span>
                          <span>Views: {image.views || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userRole === "admin" && !canDeleteThis.allowed && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            <Clock className="w-3 h-3" />
                            Protected
                          </div>
                        )}
                        <button
                          onClick={() => del(image._id, image)}
                          disabled={!canDeleteThis.allowed}
                          className={`p-2 rounded-lg transition-colors ${
                            canDeleteThis.allowed
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          title={canDeleteThis.allowed ? "Delete image" : canDeleteThis.reason}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={() => updateSequence(images)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Save New Order
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {images.map((image: any, index: number) => {
              const canDeleteThis = checkDeletePermissions(image);
              const uploadTime = new Date(image.createdAt);
              const hoursSinceUpload = (Date.now() - uploadTime.getTime()) / (1000 * 60 * 60);
              
              return (
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
                      onClick={() => del(image._id, image)}
                      disabled={!canDeleteThis.allowed}
                      className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg ${
                        canDeleteThis.allowed
                          ? "bg-red-600/90 hover:bg-red-600 text-white"
                          : "bg-gray-600/90 text-gray-400 cursor-not-allowed"
                      }`}
                      title={canDeleteThis.allowed ? "Delete image" : canDeleteThis.reason}
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
                    {userRole === "admin" && hoursSinceUpload <= 24 && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Editable
                      </span>
                    )}
                  </div>

                  {/* Sequence Controls */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-700/50 rounded px-2 py-1">
                      ID: {image._id.slice(-8)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveImage(image._id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-500 px-1">{index + 1}</span>
                      <button
                        onClick={() => moveImage(image._id, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div className="pt-2">
                    <textarea
                      defaultValue={image.adminNote || ""}
                      placeholder="Admin note (private)"
                      onBlur={(e) => saveNote(image._id, e.target.value)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Permission Status */}
                  {userRole === "admin" && !canDeleteThis.allowed && (
                    <div className="pt-2">
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Protected: {canDeleteThis.reason}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              );
            })}
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
