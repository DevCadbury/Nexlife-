"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Upload,
  X,
  GripVertical,
  Tag,
  Image as ImageIcon,
  Loader2,
  Search,
  LayoutGrid,
} from "lucide-react";
import { Reorder, AnimatePresence, motion } from "framer-motion";

/* ─── Types ─── */
interface Label {
  key: string;
  value: string;
}

interface HomeProduct {
  _id: string;
  name: string;
  category: string;
  labels: Label[];
  image: {
    url: string;
    publicId: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
  } | null;
  views: number;
  visible: boolean;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Modal Component ─── */
function ProductModal({
  open,
  onClose,
  product,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product: HomeProduct | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setName(product?.name || "");
      setCategory(product?.category || "");
      setLabels(product?.labels?.length ? [...product.labels] : [{ key: "", value: "" }]);
      setFile(null);
      setPreview(product?.image?.url || null);
      setProgress(0);
    }
  }, [open, product]);

  const addLabel = () => setLabels((prev) => [...prev, { key: "", value: "" }]);
  const removeLabel = (i: number) => setLabels((prev) => prev.filter((_, idx) => idx !== i));
  const updateLabel = (i: number, field: "key" | "value", val: string) => {
    setLabels((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: val };
      return copy;
    });
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const save = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!product && !file) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }
    setSaving(true);
    setProgress(0);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("category", category.trim());
      fd.append(
        "labels",
        JSON.stringify(labels.filter((l) => l.key.trim() || l.value.trim()))
      );
      if (file) fd.append("image", file);

      if (product) {
        await api.patch(`/home-products/${product._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        toast({ title: "Product updated" });
      } else {
        await api.post("/home-products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        toast({ title: "Product created" });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      if (err.name !== "CanceledError") {
        toast({
          title: "Error",
          description: err.response?.data?.error || err.message,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
      abortRef.current = null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {product ? "Edit Product" : "New Product"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Image *
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative group border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition overflow-hidden"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Click to upload image</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-sm font-medium">Change Image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFilePick}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Product name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. Health, Beauty, Wellness"
            />
          </div>

          {/* Labels (dynamic key-value) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Labels
              </label>
              <button
                type="button"
                onClick={addLabel}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Label
              </button>
            </div>
            <div className="space-y-2">
              {labels.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={l.key}
                    onChange={(e) => updateLabel(i, "key", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Label (e.g. Ingredient)"
                  />
                  <input
                    value={l.value}
                    onChange={(e) => updateLabel(i, "value", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Value"
                  />
                  {labels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLabel(i)}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        {saving && progress > 0 && (
          <div className="px-6">
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {product ? "Update" : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomeProductsPage() {
  const { toast } = useToast();
  const {
    data,
    error,
    mutate,
    isLoading,
  } = useSWR<{ total: number; items: HomeProduct[] }>(
    "/home-products/admin/all",
    fetcher
  );
  const { data: me } = useSWR("/auth/me", fetcher);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeProduct | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [items, setItems] = useState<HomeProduct[]>([]);

  const role = me?.user?.role;
  const allowed = role === "superadmin" || role === "dev";

  useEffect(() => {
    if (data?.items) setItems(data.items);
  }, [data]);

  const filtered = search
    ? items.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  /* ─── Actions ─── */
  const toggleVisibility = async (id: string) => {
    try {
      const res = await api.patch(`/home-products/${id}/visibility`);
      toast({ title: res.data.visible ? "Now visible" : "Now hidden" });
      mutate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/home-products/${id}`);
      toast({ title: "Product deleted" });
      setDeleting(null);
      mutate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReorder = async (newOrder: HomeProduct[]) => {
    setItems(newOrder);
    const order = newOrder.map((item, i) => ({ id: item._id, sequence: i + 1 }));
    try {
      await api.post("/home-products/reorder", { order });
    } catch (err: any) {
      toast({ title: "Reorder failed", variant: "destructive" });
      mutate();
    }
  };

  /* ─── Render ─── */
  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">Access Denied</h2>
        <p className="text-zinc-500">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Home Products</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage products displayed on the homepage. Drag to reorder.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: items.length,
            icon: LayoutGrid,
            color: "blue",
          },
          {
            label: "Visible",
            value: items.filter((p) => p.visible).length,
            icon: Eye,
            color: "green",
          },
          {
            label: "Hidden",
            value: items.filter((p) => !p.visible).length,
            icon: EyeOff,
            color: "amber",
          },
          {
            label: "Categories",
            value: new Set(items.map((p) => p.category).filter(Boolean)).size,
            icon: Tag,
            color: "purple",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  s.color === "blue"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : s.color === "green"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : s.color === "amber"
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search products..."
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          Failed to load products. {error.message}
        </div>
      )}

      {/* Product List */}
      {!isLoading && !error && (
        <Reorder.Group
          axis="y"
          values={filtered}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <Reorder.Item
                key={item._id}
                value={item}
                className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    {item.category && (
                      <p className="text-xs text-zinc-500 mt-0.5">{item.category}</p>
                    )}
                    {item.labels?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.labels.slice(0, 3).map((l, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
                          >
                            {l.key}: {l.value}
                          </span>
                        ))}
                        {item.labels.length > 3 && (
                          <span className="text-[10px] text-zinc-400">
                            +{item.labels.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.visible
                          ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}
                    >
                      {item.visible ? "Visible" : "Hidden"}
                    </span>
                    <span className="text-xs text-zinc-400">{item.views || 0} views</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(item._id)}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
                      title={item.visible ? "Hide" : "Show"}
                    >
                      {item.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(item._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <LayoutGrid className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            {search ? "No products match your search" : "No products yet"}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            {search
              ? "Try different search terms."
              : "Click \"Add Product\" to create your first home product."}
          </p>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDeleting(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Delete Product?
              </h3>
              <p className="text-sm text-zinc-500 mb-6">
                This will permanently delete the product and its image from Cloudinary.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProduct(deleting)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        product={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
