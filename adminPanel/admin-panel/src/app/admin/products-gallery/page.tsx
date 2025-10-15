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
  Heart,
  Loader2,
  AlertCircle,
  Package,
  StickyNote,
} from "lucide-react";

interface ProductImage {
  url: string;
  publicId: string;
}

interface Product {
  _id: string;
  name: string;
  brandName?: string;
  components?: string[];
  uses?: string;
  class?: string;
  packing?: string;
  category: string;
  image?: ProductImage;
  likes: number;
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

export default function ProductsGallery() {
  const { data, mutate } = useSWR("/products-gallery/admin", fetcher);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    components: "",
    uses: "",
    class: "",
    packing: "",
    category: "",
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

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brandName: product.brandName || "",
        components: product.components?.join(", ") || "",
        uses: product.uses || "",
        class: product.class || "",
        packing: product.packing || "",
        category: product.category,
      });
      if (product.image?.url) {
        setPreviewUrl(product.image.url);
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
      name: "",
      brandName: "",
      components: "",
      uses: "",
      class: "",
      packing: "",
      category: "",
    });
    setEditingProduct(null);
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("brandName", formData.brandName);
      formDataToSend.append("components", formData.components);
      formDataToSend.append("uses", formData.uses);
      formDataToSend.append("class", formData.class);
      formDataToSend.append("packing", formData.packing);
      formDataToSend.append("category", formData.category);
      
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      if (editingProduct) {
        await api.patch(`/products-gallery/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Product updated successfully", "success");
      } else {
        await api.post("/products-gallery", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Product created successfully", "success");
      }

      mutate();
      closeModal();
    } catch (error: any) {
      showToast(error.message || "Error saving product", "error");
    } finally {
      setUploading(false);
    }
  }

  async function toggleVisibility(product: Product) {
    try {
      await api.patch(`/products-gallery/${product._id}/visibility`, {
        visible: !product.visible,
      });
      showToast(`Product ${!product.visible ? "shown" : "hidden"}`, "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error updating visibility", "error");
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products-gallery/${product._id}`);
      showToast("Product deleted", "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error deleting product", "error");
    }
  }

  async function moveProduct(productId: string, direction: "up" | "down") {
    try {
      await api.patch(`/products-gallery/${productId}/sequence`, { direction });
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error moving product", "error");
    }
  }

  async function updateNote(product: Product, note: string) {
    try {
      await api.patch(`/products-gallery/${product._id}/note`, { note });
      showToast("Note updated", "success");
      mutate();
    } catch (error: any) {
      showToast(error.message || "Error updating note", "error");
    }
  }

  const products = data?.items || [];
  const categories = [...new Set(products.map((p: Product) => p.category))].filter(Boolean);

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
                <Package className="w-8 h-8 text-blue-600" />
                Products Gallery
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage product catalog with images and details
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
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
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Visible</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.filter((p: Product) => p.visible).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {products.reduce((acc: number, p: Product) => acc + (p.likes || 0), 0)}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product: Product, index: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-2 transition-all ${
                product.visible
                  ? "border-green-200 dark:border-green-600"
                  : "border-red-200 dark:border-red-600 opacity-60"
              }`}
            >
              {/* Product Image */}
              {product.image?.url && (
                <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-slate-100 dark:bg-slate-700">
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {product.name}
                </h3>
                {product.brandName && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Brand: {product.brandName}
                  </p>
                )}
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {product.category}
                </span>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {product.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {product.views || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVisibility(product)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteProduct(product)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveProduct(product._id, "up")}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Up
                  </button>
                  <button
                    onClick={() => moveProduct(product._id, "down")}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Down
                  </button>
                </div>
              </div>

              {/* Admin Note */}
              {product.adminNote && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <StickyNote className="w-3 h-3 inline mr-1" />
                  {product.adminNote}
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
                    <Package className="w-5 h-5" />
                    {editingProduct ? "Edit Product" : "Add New Product"}
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
                      Product Image
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

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., PARACET-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Analgesic, Antibiotic"
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((cat: string) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  {/* Components */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Components (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.components}
                      onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Paracetamol 500mg, Caffeine 65mg"
                    />
                  </div>

                  {/* Uses */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Uses
                    </label>
                    <textarea
                      value={formData.uses}
                      onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Fever, Pain relief, Headache"
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Class
                    </label>
                    <input
                      type="text"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Analgesic & Antipyretic"
                    />
                  </div>

                  {/* Packing */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Packing
                    </label>
                    <input
                      type="text"
                      value={formData.packing}
                      onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10x10 Tablets"
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
                          {editingProduct ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {editingProduct ? "Update" : "Create"}
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
