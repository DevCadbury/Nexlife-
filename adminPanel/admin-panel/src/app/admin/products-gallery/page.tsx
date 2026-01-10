"use client";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
  Save,
  Move3D,
  Shield,
  Folder,
  FolderOpen,
  ArrowUpDown,
  Grid,
  List,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

interface ProductMedia {
  url: string;
  publicId: string;
  type?: 'image' | 'video';
  format?: string;
  duration?: number;
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
  image?: ProductMedia; // For backward compatibility
  media?: ProductMedia; // New field
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

interface CategoryInfo {
  name: string;
  count: number;
  sequence: number;
  visible: boolean;
}

export default function ProductsGallery() {
  const { data, mutate } = useSWR("/products-gallery/admin", fetcher);
  const { data: categoriesData, mutate: mutateCategories } = useSWR("/products-gallery/categories/admin", fetcher);
  const { data: profile } = useSWR("/auth/me", fetcher);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"category" | "grid">("category");
  const [categoryReorderMode, setCategoryReorderMode] = useState(false);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [reorderingCategory, setReorderingCategory] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    components: "",
    uses: "",
    class: "",
    packing: "",
    category: "",
  });

  const { toast } = useToast();
  const userRole = profile?.user?.role;

  // Check if user has permission
  useEffect(() => {
    if (profile && userRole !== "superadmin" && userRole !== "dev") {
      window.location.href = "/admin";
    }
  }, [profile, userRole]);

  // Sync categories
  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(categoriesData.categories);
    }
  }, [categoriesData]);

  // Organize products by category
  useEffect(() => {
    if (data?.items && categories.length > 0) {
      const organized: Record<string, Product[]> = {};
      categories.forEach(cat => {
        organized[cat.name] = data.items
          .filter((p: Product) => p.category === cat.name)
          .sort((a: Product, b: Product) => (a.sequence || 0) - (b.sequence || 0));
      });
      setCategoryProducts(organized);
    }
  }, [data, categories]);

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryName)) {
        newExpanded.delete(categoryName);
      } else {
        newExpanded.add(categoryName);
      }
      return newExpanded;
    });
  }, []);

  const openModal = (product?: Product, category?: string) => {
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
      const media = product.media || product.image;
      if (media?.url) {
        setPreviewUrl(media.url);
      }
    } else {
      resetForm();
      if (category) {
        setFormData(prev => ({ ...prev, category }));
      }
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
    setUploadProgress(0);
    setCompressing(false);
  };

  // Compress image to max 10MB
  const compressImage = async (file: File): Promise<File> => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size <= MAX_SIZE) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions to reduce file size
          const ratio = Math.sqrt(MAX_SIZE / file.size);
          width *= ratio;
          height *= ratio;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under 10MB
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (blob && blob.size <= MAX_SIZE || quality <= 0.1) {
                const compressedFile = new File([blob!], file.name, { type: 'image/jpeg' });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            }, 'image/jpeg', quality);
          };
          tryCompress();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Compress video to max 100MB (using canvas for frame reduction)
  const compressVideo = async (file: File): Promise<File> => {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size <= MAX_SIZE) return file;

    // For videos larger than 100MB, we can't compress client-side effectively
    // Show warning and return original file (backend will handle or reject)
    toast({
      title: "Video Too Large",
      description: `Video size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 100MB. Please compress it before uploading.`,
      variant: "error",
    });
    return file;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      let processedFile = file;
      
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        const savedSize = file.size - processedFile.size;
        if (savedSize > 0) {
          toast({
            title: "Image Compressed",
            description: `Reduced from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(processedFile.size / 1024 / 1024).toFixed(1)}MB`,
          });
        }
      } else if (file.type.startsWith('video/')) {
        processedFile = await compressVideo(file);
      }

      setSelectedImage(processedFile);
      setPreviewUrl(URL.createObjectURL(processedFile));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "error",
      });
    } finally {
      setCompressing(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    const abortController = new AbortController();
    setUploadAbortController(abortController);

    // Simulate initial progress for better UX
    setUploadProgress(5);

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
        formDataToSend.append("media", selectedImage);
      }

      if (editingProduct) {
        await api.patch(`/products-gallery/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(Math.min(percentCompleted, 95)); // Cap at 95% until complete
            }
          },
        });
        setUploadProgress(100);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await api.post("/products-gallery", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(Math.min(percentCompleted, 95)); // Cap at 95% until complete
            }
          },
        });
        setUploadProgress(100);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      mutate();
      mutateCategories();
      closeModal();
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('cancel')) {
        toast({
          title: "Upload Cancelled",
          description: "File upload was cancelled",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Error saving product",
          variant: "error",
        });
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadAbortController(null);
    }
  }

  const cancelUpload = () => {
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
      setUploading(false);
      setUploadProgress(0);
      toast({
        title: "Cancelled",
        description: "Upload cancelled successfully",
      });
    }
  };

  async function toggleVisibility(product: Product) {
    try {
      await api.patch(`/products-gallery/${product._id}/visibility`, {
        visible: !product.visible,
      });
      toast({
        title: "Success",
        description: `Product ${!product.visible ? "shown" : "hidden"}`,
      });
      mutate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error updating visibility",
        variant: "error",
      });
    }
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products-gallery/${product._id}`);
      toast({
        title: "Success",
        description: "Product deleted",
      });
      mutate();
      mutateCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error deleting product",
        variant: "error",
      });
    }
  }

  async function saveCategoryOrder() {
    setSavingOrder(true);
    try {
      await api.post("/products-gallery/categories/reorder", {
        categories: categories.map((cat, index) => ({
          name: cat.name,
          sequence: index,
          visible: cat.visible,
        })),
      });
      
      toast({
        title: "Success",
        description: "Category order saved",
      });
      
      mutateCategories();
      setCategoryReorderMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error saving order",
        variant: "error",
      });
    } finally {
      setSavingOrder(false);
    }
  }

  async function saveProductOrder(categoryName: string) {
    setSavingOrder(true);
    try {
      const products = categoryProducts[categoryName] || [];
      const updates = products.map((product, index) => ({
        id: product._id,
        sequence: index,
      }));
      
      await api.post("/products-gallery/reorder", { sequences: updates });
      
      toast({
        title: "Success",
        description: `Product order saved for ${categoryName}`,
      });
      
      await mutate();
      setReorderingCategory(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error saving order",
        variant: "error",
      });
    } finally {
      setSavingOrder(false);
    }
  }

  const totalProducts = data?.items?.length || 0;
  const visibleProducts = data?.items?.filter((p: Product) => p.visible).length || 0;
  const totalLikes = data?.items?.reduce((acc: number, p: Product) => acc + (p.likes || 0), 0) || 0;

  // Permission check UI
  if (profile && userRole !== "superadmin" && userRole !== "dev") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-2xl border border-red-200 dark:border-red-800 max-w-md text-center"
        >
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You don't have permission to access the Products Gallery. This page is only accessible to Superadmin and Dev roles.
          </p>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

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
                Manage product catalog organized by categories
              </p>
            </div>
            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode("category")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "category"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title="Category View"
                >
                  <Folder className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
              </div>

              {/* Add Product Button */}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>

              {/* Category Reorder Button */}
              {viewMode === "category" && (
                <>
                  {categoryReorderMode ? (
                    <>
                      <button
                        onClick={saveCategoryOrder}
                        disabled={savingOrder}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        {savingOrder ? "Saving..." : "Save Category Order"}
                      </button>
                      <button
                        onClick={() => {
                          setCategoryReorderMode(false);
                          mutateCategories();
                        }}
                        className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCategoryReorderMode(true)}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <ArrowUpDown className="w-5 h-5" />
                      Reorder Categories
                    </button>
                  )}
                </>
              )}
            </div>
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
                  {totalProducts}
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
                  {visibleProducts}
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
              <Folder className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalLikes}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </motion.div>

        {/* Category View */}
        {viewMode === "category" && (
          <div className="space-y-4">
            {categoryReorderMode ? (
              <Reorder.Group
                axis="y"
                values={categories}
                onReorder={setCategories}
                className="space-y-4"
                layoutScroll
                style={{ willChange: 'transform' }}
              >
                {categories.map((category) => (
                  <Reorder.Item
                    key={category.name}
                    value={category}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-2 border-blue-200 dark:border-blue-600 cursor-move hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.1}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                    whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 10 }}
                    style={{ willChange: 'transform' }}
                  >
                    <div className="flex items-center gap-4">
                      <Move3D className="w-6 h-6 text-slate-400 flex-shrink-0" />
                      <Folder className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {category.count} products
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex-shrink-0">
                        Seq: {category.sequence}
                      </span>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              categories.map((category, catIndex) => {
                const products = categoryProducts[category.name] || [];
                const isExpanded = expandedCategories.has(category.name);
                const isReordering = reorderingCategory === category.name;

                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => !isReordering && toggleCategory(category.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <FolderOpen className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Folder className="w-6 h-6 text-blue-600" />
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {category.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {products.length} products • {products.filter(p => p.visible).length} visible
                              {products.filter(p => !p.visible).length > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                  {' '}({products.filter(p => !p.visible).length} hidden)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          {isReordering ? (
                            <>
                              <button
                                onClick={() => saveProductOrder(category.name)}
                                disabled={savingOrder}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                                Save Order
                              </button>
                              <button
                                onClick={() => {
                                  setReorderingCategory(null);
                                  mutate();
                                }}
                                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openModal(undefined, category.name)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Product
                              </button>
                              <button
                                onClick={() => {
                                  // Expand category if closed before reordering
                                  if (!isExpanded) {
                                    toggleCategory(category.name);
                                  }
                                  setReorderingCategory(category.name);
                                }}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                <Move3D className="w-4 h-4" />
                                Reorder
                              </button>
                              <button 
                                onClick={() => toggleCategory(category.name)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Products */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          {products.length === 0 ? (
                            <div className="p-12 text-center">
                              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                              <p className="text-slate-600 dark:text-slate-400">
                                No products in this category yet
                              </p>
                              <button
                                onClick={() => openModal(undefined, category.name)}
                                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
                              >
                                <Plus className="w-4 h-4" />
                                Add First Product
                              </button>
                            </div>
                          ) : isReordering ? (
                            <Reorder.Group
                              axis="y"
                              values={products}
                              onReorder={(newOrder) => {
                                setCategoryProducts(prev => ({
                                  ...prev,
                                  [category.name]: newOrder,
                                }));
                              }}
                              className="p-4 space-y-2"
                              layoutScroll
                              style={{ willChange: 'transform' }}
                            >
                              {products.map((product) => (
                                <Reorder.Item
                                  key={product._id}
                                  value={product}
                                  className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 cursor-move flex items-center gap-4 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                  drag="y"
                                  dragConstraints={{ top: 0, bottom: 0 }}
                                  dragElastic={0.1}
                                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                                  whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 10 }}
                                  style={{ willChange: 'transform' }}
                                >
                                  <Move3D className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                  {(() => {
                                    const media = product.media || product.image;
                                    if (!media?.url) return <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded flex-shrink-0" />;
                                    
                                    return media.type === 'video' ? (
                                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded flex-shrink-0 flex items-center justify-center text-xs">
                                        🎥
                                      </div>
                                    ) : (
                                      <img src={media.url} alt={product.name} className="w-12 h-12 object-cover rounded flex-shrink-0" loading="lazy" />
                                    );
                                  })()}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{product.brandName}</p>
                                  </div>
                                </Reorder.Item>
                              ))}
                            </Reorder.Group>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                              {products.map((product) => (
                                <ProductCard
                                  key={product._id}
                                  product={product}
                                  onEdit={() => openModal(product)}
                                  onToggleVisibility={() => toggleVisibility(product)}
                                  onDelete={() => deleteProduct(product)}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Grid View - Original Layout */}
        {viewMode === "grid" && data?.items && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((product: Product, index: number) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onEdit={() => openModal(product)}
                  onToggleVisibility={() => toggleVisibility(product)}
                  onDelete={() => deleteProduct(product)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Product Modal - Enhanced */}
        <AnimatePresence>
          {showModal && (
            <ProductModal
              product={editingProduct}
              formData={formData}
              setFormData={setFormData}
              previewUrl={previewUrl}
              selectedImage={selectedImage}
              uploading={uploading}
              uploadProgress={uploadProgress}
              compressing={compressing}
              categories={categories.map(c => c.name)}
              onClose={closeModal}
              onSubmit={handleSubmit}
              onImageSelect={handleImageSelect}
              onCancelUpload={cancelUpload}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Product Card Component
const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onToggleVisibility,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-2 transition-all ${
        product.visible
          ? "border-green-200 dark:border-green-600"
          : "border-red-200 dark:border-red-600 opacity-60"
      }`}
    >
      {(() => {
        const media = product.media || product.image;
        if (!media?.url) return null;
        
        return (
          <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-slate-100 dark:bg-slate-700">
            {media.type === 'video' ? (
              <CustomVideoPlayer src={media.url} className="w-full h-full" />
            ) : (
              <img src={media.url} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
        );
      })()}
      <div className="space-y-2">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{product.name}</h3>
        {product.brandName && (
          <p className="text-sm text-slate-600 dark:text-slate-400">Brand: {product.brandName}</p>
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
      <div className="mt-4 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={onToggleVisibility}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium transition-colors"
        >
          {product.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {product.adminNote && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
          <StickyNote className="w-3 h-3 inline mr-1" />
          {product.adminNote}
        </div>
      )}
    </div>
  );
});

// Product Modal Component
function ProductModal({
  product,
  formData,
  setFormData,
  previewUrl,
  selectedImage,
  uploading,
  uploadProgress,
  compressing,
  categories,
  onClose,
  onSubmit,
  onImageSelect,
  onCancelUpload,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Media Upload Section - Enhanced */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <label className="block text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Product Media (Image or Video)
            </label>
            
            <div className="flex flex-col items-center gap-4">
              {/* Preview Area */}
              {previewUrl && (
                <div className="w-full max-w-md">
                  {(() => {
                    // Check if it's a video - either from selectedImage or from product media type
                    const isVideo = selectedImage?.type.startsWith('video/') || 
                                   product?.media?.type === 'video' || 
                                   product?.image?.type === 'video';
                    
                    return isVideo ? (
                      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
                        <CustomVideoPlayer
                          src={previewUrl}
                          className="w-full h-64"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          Video
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Image
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* File Size Info */}
                  {selectedImage && (
                    <div className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                      Size: <span className="font-semibold">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Compression Status */}
              {compressing && (
                <div className="w-full max-w-md bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Compressing media...</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Optimizing for best quality</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Input */}
              <div className="w-full max-w-md">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onImageSelect}
                  disabled={uploading || compressing}
                  className="w-full text-sm text-slate-700 dark:text-slate-300
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    file:cursor-pointer
                    file:transition-all file:duration-200
                    file:shadow-lg hover:file:shadow-xl
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer"
                />
                <div className="mt-2 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p><strong>Images:</strong> JPG, PNG - Auto-compressed to max 10MB</p>
                    <p><strong>Videos:</strong> MP4, WebM - Max 100MB (compress large files before upload)</p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && (
                <div className="w-full max-w-md bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">Uploading...</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out flex items-center justify-end pr-1"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress > 10 && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={onCancelUpload}
                    className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel Upload
                  </button>
                </div>
              )}
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
              onClick={onClose}
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
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{product ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
