"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { api, fetcher } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  X,
  GripVertical,
  Tag,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Search,
  Folder,
  FolderOpen,
  ArrowUpDown,
  Save,
  ChevronDown,
  ChevronUp,
  StickyNote,
  FolderPlus,
  Package,
  Shield,
  Move3D,
} from "lucide-react";

interface Label {
  key: string;
  value: string;
  hidden?: boolean;
}

type LabelRow = Label & { _uid: string };

let labelUidCounter = 0;
const createLabelRow = (key = "", value = "", hidden = false): LabelRow => ({
  key,
  value,
  hidden,
  _uid: `lbl-${++labelUidCounter}`,
});

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
  hideLabels?: boolean;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderInfo {
  name: string;
  count: number;
  sequence: number;
  visible: boolean;
}

interface AdminProfile {
  user?: {
    role?: string;
  };
}

const DEFAULT_FOLDER = "Uncategorized";

function normalizeFolderName(value?: string) {
  const cleaned = String(value || "").trim();
  return cleaned || DEFAULT_FOLDER;
}

type ApiErrorLike = {
  response?: {
    status?: number;
    data?: {
      error?: string;
      code?: string;
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

function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  const apiError = toApiError(error);
  return apiError.response?.data?.error || apiError.message || fallback;
}

function ProductModal({
  open,
  onClose,
  product,
  onSaved,
  folderOptions,
  defaultFolder,
  tagSuggestions,
  removedSuggestions,
  onRemoveSuggestion,
}: {
  open: boolean;
  onClose: () => void;
  product: HomeProduct | null;
  onSaved: () => Promise<void> | void;
  folderOptions: string[];
  defaultFolder?: string;
  tagSuggestions: string[];
  removedSuggestions: string[];
  onRemoveSuggestion: (tag: string) => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [adminNote, setAdminNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmRemoveTag, setConfirmRemoveTag] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;

    setName(product?.name || "");
    setCategory(product?.category || defaultFolder || "");
    setLabels(
      product?.labels?.length
        ? product.labels.map((l) => createLabelRow(l.key, l.value, l.hidden === true))
        : [createLabelRow()]
    );
    setAdminNote(product?.adminNote || "");
    setFile(null);
    setPreview(product?.image?.url || null);
    setSaving(false);
    setProgress(0);
    setConfirmRemoveTag(null);
  }, [open, product, defaultFolder]);

  const addLabel = () => setLabels((prev) => [...prev, createLabelRow()]);

  const removeLabel = (uid: string) => {
    setLabels((prev) => {
      const next = prev.filter((l) => l._uid !== uid);
      return next.length ? next : [createLabelRow()];
    });
  };

  const updateLabel = (uid: string, field: "key" | "value", val: string) => {
    setLabels((prev) =>
      prev.map((l) => (l._uid === uid ? { ...l, [field]: val } : l))
    );
  };

  const toggleLabelVisibility = (uid: string) => {
    setLabels((prev) =>
      prev.map((l) => (l._uid === uid ? { ...l, hidden: !l.hidden } : l))
    );
  };

  const applySuggestion = (tag: string) => {
    setLabels((prev) => {
      const emptyKeyIndex = prev.findIndex((row) => !row.key.trim());
      if (emptyKeyIndex !== -1) {
        const next = [...prev];
        next[emptyKeyIndex] = { ...next[emptyKeyIndex], key: tag };
        return next;
      }
      return [...prev, createLabelRow(tag, "")];
    });
  };

  const visibleSuggestions = useMemo(() => {
    const usedKeys = new Set(labels.map((l) => l.key.trim()).filter(Boolean));
    return tagSuggestions.filter(
      (tag) => !removedSuggestions.includes(tag) && !usedKeys.has(tag)
    );
  }, [labels, tagSuggestions, removedSuggestions]);

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const save = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "error" });
      return;
    }

    if (!product && !file) {
      toast({ title: "Please upload an image", variant: "error" });
      return;
    }

    setSaving(true);
    setProgress(0);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const payload = new FormData();
      payload.append("name", name.trim());
      payload.append("category", normalizeFolderName(category));
      payload.append("adminNote", adminNote.trim());
      payload.append("hideLabels", "false");
      payload.append(
        "labels",
        JSON.stringify(
          labels
            .map((row) => ({
              key: row.key.trim(),
              value: row.value.trim(),
              hidden: row.hidden === true,
            }))
            .filter((row) => row.key || row.value)
        )
      );

      if (file) payload.append("image", file);

      if (product) {
        await api.patch(`/home-products/${product._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        });
        toast({ title: "Product updated" });
      } else {
        await api.post("/home-products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (event) => {
            if (event.total) {
              setProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        });
        toast({ title: "Product created" });
      }

      await onSaved();
      onClose();
    } catch (err: unknown) {
      const apiError = toApiError(err);
      if (apiError.message === "canceled" || apiError.message === "CanceledError") return;
      toast({
        title: "Error",
        description: getApiErrorMessage(err, "Could not save product"),
        variant: "error",
      });
    } finally {
      setSaving(false);
      abortRef.current = null;
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {product ? "Edit Home Product" : "New Home Product"}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4 max-h-[74vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Product Image {product ? "" : "*"}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl h-44 flex items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-zinc-400">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Click to upload image</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Product Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter product name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Folder
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="home-product-folders"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Choose or type folder"
                />
                <datalist id="home-product-folders">
                  {folderOptions.map((folder) => (
                    <option key={folder} value={folder} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Internal Admin Note (CRM only)
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Private note for CRM/admin use only"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Labels</label>
                <button
                  type="button"
                  onClick={addLabel}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Label
                </button>
              </div>

              {visibleSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {visibleSuggestions.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    >
                      <button
                        type="button"
                        onClick={() => applySuggestion(tag)}
                        className="hover:underline"
                      >
                        {tag}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveTag(tag)}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 p-0.5 text-blue-500 hover:text-red-500"
                        aria-label={`Remove ${tag} from suggestions`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <Reorder.Group axis="y" values={labels} onReorder={setLabels} className="space-y-2">
                {labels.map((row) => (
                  <Reorder.Item
                    key={row._uid}
                    value={row}
                    className={`flex items-center gap-2 touch-none ${row.hidden ? "opacity-70" : ""}`}
                  >
                    <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                    <input
                      value={row.key}
                      onChange={(e) => updateLabel(row._uid, "key", e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Label"
                    />
                    <input
                      value={row.value}
                      onChange={(e) => updateLabel(row._uid, "value", e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => toggleLabelVisibility(row._uid)}
                      className={`p-1.5 rounded border transition-colors ${
                        row.hidden
                          ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300"
                      }`}
                      title={row.hidden ? "Currently hidden on website" : "Currently visible on website"}
                    >
                      {row.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLabel(row._uid)}
                      className="p-1.5 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>

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

          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-700">
            {saving ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                Cancel Upload
              </button>
            ) : (
              <span className="text-xs text-zinc-500">All changes are saved to CRM.</span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Close
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
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {confirmRemoveTag && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmRemoveTag(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Remove suggestion?</h3>
              <p className="text-xs text-zinc-500 mb-4">
                This will permanently hide &quot;{confirmRemoveTag}&quot; from quick label suggestions.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmRemoveTag(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onRemoveSuggestion(confirmRemoveTag);
                    setConfirmRemoveTag(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

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
  const { data: foldersData, mutate: mutateFolders } = useSWR<{ folders: FolderInfo[] }>(
    "/home-products/admin/folders",
    fetcher
  );
  const { data: me } = useSWR<AdminProfile>("/auth/me", fetcher);

  const [initialRemovedCache] = useState<{ removed: string[] }>(() => {
    if (typeof window === "undefined") return { removed: [] };
    try {
      const cached = JSON.parse(localStorage.getItem("hp-removed-tags-db") || "null");
      if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
        return { removed: cached.removed || [] };
      }
    } catch {
      // Ignore cache parse errors.
    }
    return { removed: [] };
  });

  const { data: removedTagsData, mutate: mutateRemovedTags } = useSWR<{ removed: string[] }>(
    "/home-products/admin/tag-suggestions",
    fetcher,
    { fallbackData: initialRemovedCache }
  );

  useEffect(() => {
    if (!removedTagsData?.removed) return;
    try {
      localStorage.setItem(
        "hp-removed-tags-db",
        JSON.stringify({ removed: removedTagsData.removed, ts: Date.now() })
      );
    } catch {
      // Ignore storage errors.
    }
  }, [removedTagsData]);

  const removedSuggestions = removedTagsData?.removed ?? [];

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeProduct | null>(null);
  const [defaultFolderForModal, setDefaultFolderForModal] = useState("");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderProductMap, setFolderProductMap] = useState<Record<string, HomeProduct[]>>({});
  const [reorderingFolder, setReorderingFolder] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [folderReorderMode, setFolderReorderMode] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [createFolderName, setCreateFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<FolderInfo | null>(null);
  const [moveTargetFolder, setMoveTargetFolder] = useState("");
  const [deleteFolderMode, setDeleteFolderMode] = useState<"move" | "delete_products">("move");
  const [deleteFolderConfirmName, setDeleteFolderConfirmName] = useState("");
  const [folderActionBusy, setFolderActionBusy] = useState(false);

  const role = me?.user?.role;
  const allowed = role === "superadmin" || role === "dev";

  useEffect(() => {
    if (!foldersData?.folders) return;

    const sorted = [...foldersData.folders].sort(
      (a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name)
    );

    setFolders(sorted);
    setExpandedFolders((prev) => {
      const validNames = new Set(sorted.map((folder) => folder.name));
      return new Set([...prev].filter((name) => validNames.has(name)));
    });
  }, [foldersData]);

  useEffect(() => {
    const grouped: Record<string, HomeProduct[]> = {};

    for (const item of data?.items || []) {
      const folderName = normalizeFolderName(item.category);
      const normalized: HomeProduct = {
        ...item,
        category: folderName,
        hideLabels: item.hideLabels === true,
        adminNote: item.adminNote || "",
      };

      if (!grouped[folderName]) grouped[folderName] = [];
      grouped[folderName].push(normalized);
    }

    Object.keys(grouped).forEach((folderName) => {
      grouped[folderName].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    });

    setFolderProductMap(grouped);
  }, [data?.items]);

  const folderMap = useMemo(
    () => new Map(folders.map((folder) => [folder.name, folder])),
    [folders]
  );

  const orderedFolders = useMemo(() => {
    const names = new Set<string>();

    for (const folder of folders) names.add(folder.name);
    for (const name of Object.keys(folderProductMap)) names.add(name);

    const fallbackStart = (folders.length || 0) + 1000;

    return Array.from(names)
      .map((name, index) => {
        const existing = folderMap.get(name);
        return {
          name,
          sequence: existing?.sequence ?? fallbackStart + index,
          visible: existing?.visible ?? true,
          count: folderProductMap[name]?.length ?? existing?.count ?? 0,
        };
      })
      .sort((a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name));
  }, [folders, folderMap, folderProductMap]);

  const searchQuery = search.trim().toLowerCase();

  const matchesSearch = useCallback(
    (item: HomeProduct) => {
      if (!searchQuery) return true;

      const inLabels = (item.labels || []).some(
        (label) =>
          String(label?.key || "").toLowerCase().includes(searchQuery) ||
          String(label?.value || "").toLowerCase().includes(searchQuery)
      );

      return (
        item.name.toLowerCase().includes(searchQuery) ||
        normalizeFolderName(item.category).toLowerCase().includes(searchQuery) ||
        inLabels
      );
    },
    [searchQuery]
  );

  const visibleFolderSections = useMemo(() => {
    if (!searchQuery) return orderedFolders;

    return orderedFolders.filter((folder) => {
      if (folder.name.toLowerCase().includes(searchQuery)) return true;
      const list = folderProductMap[folder.name] || [];
      return list.some(matchesSearch);
    });
  }, [orderedFolders, folderProductMap, searchQuery, matchesSearch]);

  const folderSectionsToRender = useMemo(() => {
    if (!reorderingFolder) return visibleFolderSections;

    const current = orderedFolders.find((folder) => folder.name === reorderingFolder);
    return current ? [current] : [];
  }, [visibleFolderSections, orderedFolders, reorderingFolder]);

  const tagSuggestions = useMemo(() => {
    const keys = (data?.items || [])
      .flatMap((item) => (item.labels || []).map((label) => label.key.trim()))
      .filter(Boolean);

    return Array.from(new Set(keys)).sort((a, b) => a.localeCompare(b));
  }, [data?.items]);

  const deletingProduct = useMemo(() => {
    if (!deletingProductId) return null;
    return (data?.items || []).find((item) => item._id === deletingProductId) || null;
  }, [data?.items, deletingProductId]);

  const folderOptions = useMemo(() => orderedFolders.map((folder) => folder.name), [orderedFolders]);

  const totalProducts = data?.items?.length || 0;
  const visibleProducts = (data?.items || []).filter((item) => item.visible).length;
  const hiddenProducts = totalProducts - visibleProducts;

  const refreshAll = useCallback(async () => {
    await Promise.all([mutate(), mutateFolders(), mutateRemovedTags()]);
  }, [mutate, mutateFolders, mutateRemovedTags]);

  const removeSuggestion = async (tag: string) => {
    try {
      await api.delete(`/home-products/admin/tag-suggestions/${encodeURIComponent(tag)}`);
      await mutateRemovedTags();
    } catch (err: unknown) {
      toast({
        title: "Could not remove suggestion",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    }
  };

  const toggleFolderExpansion = (folderName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderName)) next.delete(folderName);
      else next.add(folderName);
      return next;
    });
  };

  const openNewProductModal = (folderName?: string) => {
    setEditing(null);
    setDefaultFolderForModal(folderName || "");
    setModalOpen(true);
  };

  const toggleProductVisibility = async (id: string) => {
    try {
      const res = await api.patch(`/home-products/${id}/visibility`);
      toast({ title: res.data?.visible ? "Now visible" : "Now hidden" });
      await mutate();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;

    try {
      await api.delete(`/home-products/${deletingProductId}`);
      toast({ title: "Product deleted" });
      setDeletingProductId(null);
      await refreshAll();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    }
  };

  const moveProduct = (folderName: string, productId: string, direction: "up" | "down") => {
    setFolderProductMap((prev) => {
      const list = [...(prev[folderName] || [])];
      const index = list.findIndex((item) => item._id === productId);
      if (index === -1) return prev;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;

      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [folderName]: list };
    });
  };

  const saveProductOrder = async (folderName: string) => {
    const list = folderProductMap[folderName] || [];
    if (!list.length) {
      setReorderingFolder(null);
      return;
    }

    setSavingOrder(true);
    try {
      const order = list.map((item, index) => ({ id: item._id, sequence: index + 1 }));
      await api.post("/home-products/reorder", { order });
      toast({ title: `Order saved for ${folderName}` });
      setReorderingFolder(null);
      await mutate();
    } catch (err: unknown) {
      toast({
        title: "Could not save order",
        description: getApiErrorMessage(err),
        variant: "error",
      });
      await mutate();
    } finally {
      setSavingOrder(false);
    }
  };

  const createFolder = async () => {
    const name = createFolderName.trim();
    if (!name) {
      toast({ title: "Folder name is required", variant: "error" });
      return;
    }

    const duplicate = orderedFolders.some(
      (folder) => folder.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      toast({
        title: "Folder already exists",
        description: `A folder named \"${name}\" already exists. Choose another name.`,
        variant: "error",
      });
      return;
    }

    setFolderActionBusy(true);
    try {
      await api.post("/home-products/admin/folders", { name });
      toast({ title: "Folder created" });
      setCreateFolderName("");
      setCreateFolderDialogOpen(false);
      await mutateFolders();
    } catch (err: unknown) {
      const apiError = toApiError(err);
      const isDuplicate =
        apiError.response?.status === 409 ||
        apiError.response?.data?.code === "FOLDER_EXISTS";
      toast({
        title: isDuplicate ? "Folder already exists" : "Could not create folder",
        description:
          apiError.response?.data?.error ||
          (isDuplicate
            ? "Please use a different folder name."
            : apiError.message || "Could not create folder"),
        variant: "error",
      });
    } finally {
      setFolderActionBusy(false);
    }
  };

  const startRenameFolder = (folderName: string) => {
    setRenamingFolder(folderName);
    setRenameFolderValue(folderName);
  };

  const saveRenameFolder = async () => {
    if (!renamingFolder) return;

    const newName = renameFolderValue.trim();
    if (!newName) {
      toast({ title: "New folder name is required", variant: "error" });
      return;
    }

    setFolderActionBusy(true);
    try {
      await api.patch(`/home-products/admin/folders/${encodeURIComponent(renamingFolder)}`, {
        newName,
      });

      toast({ title: "Folder renamed" });

      setExpandedFolders((prev) => {
        if (!prev.has(renamingFolder)) return prev;
        const next = new Set(prev);
        next.delete(renamingFolder);
        next.add(newName);
        return next;
      });

      setRenamingFolder(null);
      setRenameFolderValue("");

      await Promise.all([mutateFolders(), mutate()]);
    } catch (err: unknown) {
      toast({
        title: "Could not rename folder",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    } finally {
      setFolderActionBusy(false);
    }
  };

  const openDeleteFolderDialog = (folder: FolderInfo) => {
    setDeletingFolder(folder);
    const fallback = orderedFolders.find((item) => item.name !== folder.name)?.name || "";
    setMoveTargetFolder(fallback);
    setDeleteFolderMode(folder.count > 0 ? "move" : "delete_products");
    setDeleteFolderConfirmName("");
  };

  const confirmDeleteFolder = async () => {
    if (!deletingFolder) return;

    if (deletingFolder.count > 0 && deleteFolderMode === "move" && !moveTargetFolder) {
      toast({
        title: "Select target folder",
        description: "This folder has products. Choose where to move them before deleting.",
        variant: "error",
      });
      return;
    }

    if (
      deletingFolder.count > 0 &&
      deleteFolderMode === "delete_products" &&
      deleteFolderConfirmName.trim() !== deletingFolder.name
    ) {
      toast({
        title: "Confirmation required",
        description: `Type \"${deletingFolder.name}\" exactly to confirm irreversible deletion.`,
        variant: "error",
      });
      return;
    }

    setFolderActionBusy(true);
    try {
      const payload =
        deletingFolder.count > 0
          ? deleteFolderMode === "delete_products"
            ? {
                deleteProducts: true,
                confirmName: deleteFolderConfirmName.trim(),
              }
            : { moveTo: moveTargetFolder }
          : {};

      await api.delete(`/home-products/admin/folders/${encodeURIComponent(deletingFolder.name)}`, {
        data: payload,
      });

      toast({
        title: deleteFolderMode === "delete_products" ? "Folder and products deleted" : "Folder deleted",
      });

      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.delete(deletingFolder.name);
        return next;
      });

      setDeletingFolder(null);
      setMoveTargetFolder("");
      setDeleteFolderMode("move");
      setDeleteFolderConfirmName("");

      await Promise.all([mutateFolders(), mutate()]);
    } catch (err: unknown) {
      toast({
        title: "Could not delete folder",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    } finally {
      setFolderActionBusy(false);
    }
  };

  const toggleFolderVisibility = async (folderName: string) => {
    try {
      await api.patch(`/home-products/admin/folders/${encodeURIComponent(folderName)}/visibility`, {});
      await mutateFolders();
      toast({ title: "Folder visibility updated" });
    } catch (err: unknown) {
      toast({
        title: "Could not update folder visibility",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    }
  };

  const saveFoldersOrder = async () => {
    setFolderActionBusy(true);
    try {
      await api.post("/home-products/admin/folders/reorder", {
        folders: folders.map((folder, index) => ({
          name: folder.name,
          sequence: index + 1,
          visible: folder.visible !== false,
        })),
      });

      toast({ title: "Folder order saved" });
      setFolderReorderMode(false);
      await mutateFolders();
    } catch (err: unknown) {
      toast({
        title: "Could not save folder order",
        description: getApiErrorMessage(err),
        variant: "error",
      });
    } finally {
      setFolderActionBusy(false);
    }
  };

  const cancelFoldersOrder = () => {
    setFolderReorderMode(false);
    if (!foldersData?.folders) return;

    const sorted = [...foldersData.folders].sort(
      (a, b) => a.sequence - b.sequence || a.name.localeCompare(b.name)
    );
    setFolders(sorted);
  };

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-xl">
          <Shield className="w-14 h-14 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You don&apos;t have permission to view Home Products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Home Products
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Folder-based management with mobile-friendly reordering and CRM-only notes.
          </p>
        </div>

        <button
          onClick={() => openNewProductModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, tone: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" },
          { label: "Visible", value: visibleProducts, icon: Eye, tone: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300" },
          { label: "Hidden", value: hiddenProducts, icon: EyeOff, tone: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300" },
          { label: "Folders", value: orderedFolders.length, icon: Folder, tone: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.tone}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search products, folders, labels..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCreateFolderDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
            >
              <FolderPlus className="w-4 h-4" />
              Create Folder
            </button>

            {folderReorderMode ? (
              <>
                <button
                  onClick={saveFoldersOrder}
                  disabled={folderActionBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Folders
                </button>
                <button
                  onClick={cancelFoldersOrder}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setReorderingFolder(null);
                  setFolderReorderMode(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                <ArrowUpDown className="w-4 h-4" />
                Reorder Folders
              </button>
            )}
          </div>
        </div>

        {folderReorderMode && (
          <Reorder.Group axis="y" values={folders} onReorder={setFolders} className="space-y-2">
            {folders.map((folder) => (
              <Reorder.Item
                key={folder.name}
                value={folder}
                className="border border-blue-200 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-blue-500" />
                  <Folder className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{folder.name}</p>
                    <p className="text-xs text-zinc-500">{folder.count} products</p>
                  </div>
                  <span className="text-xs rounded-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    #{folder.sequence}
                  </span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 p-4 text-sm">
          Failed to load home products. {error.message}
        </div>
      )}

      {!isLoading && !error && !folderReorderMode && (
        <div className="space-y-4">
          {folderSectionsToRender.length === 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 p-12 text-center">
              <Tag className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">No matching records</h3>
              <p className="text-sm text-zinc-500 mt-1">Try a different search term.</p>
            </div>
          )}

          {reorderingFolder && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-900/20 p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Reorder mode is active for {reorderingFolder}. Save or cancel to return to all folders.
              </p>
            </div>
          )}

          {folderSectionsToRender.map((folder) => {
            const fullList = folderProductMap[folder.name] || [];
            const filteredList = searchQuery
              ? fullList.filter(matchesSearch)
              : fullList;

            const isReordering = reorderingFolder === folder.name;
            const productsToRender = isReordering ? fullList : filteredList;
            const isExpanded = expandedFolders.has(folder.name);

            return (
              <div
                key={folder.name}
                className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-700/50">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {isExpanded ? (
                        <FolderOpen className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-0" />
                      ) : (
                        <Folder className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-0" />
                      )}

                      <div className="min-w-0">
                        {renamingFolder === folder.name ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <input
                              value={renameFolderValue}
                              onChange={(e) => setRenameFolderValue(e.target.value)}
                              className="w-full sm:w-64 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveRenameFolder}
                                disabled={folderActionBusy}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setRenamingFolder(null);
                                  setRenameFolderValue("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleFolderExpansion(folder.name)}
                            className="text-left group"
                            title={isExpanded ? "Collapse folder" : "Expand folder"}
                          >
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                              {folder.name}
                            </h2>
                            <p className="text-xs text-zinc-500">
                              {fullList.length} products
                              {folder.visible ? "" : " • Hidden on website"}
                            </p>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isReordering ? (
                        <>
                          <button
                            onClick={() => saveProductOrder(folder.name)}
                            disabled={savingOrder}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            Save Order
                          </button>
                          <button
                            onClick={async () => {
                              setReorderingFolder(null);
                              await mutate();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100 text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openNewProductModal(folder.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add Product
                          </button>
                          <button
                            onClick={() => {
                              setFolderReorderMode(false);
                              setReorderingFolder(folder.name);
                              setExpandedFolders((prev) => {
                                const next = new Set(prev);
                                next.add(folder.name);
                                return next;
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                          >
                            <Move3D className="w-4 h-4" />
                            Reorder
                          </button>
                          <button
                            onClick={() => toggleFolderVisibility(folder.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                              folder.visible
                                ? "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-200"
                            }`}
                          >
                            {folder.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {folder.visible ? "Visible" : "Hidden"}
                          </button>
                          <button
                            onClick={() => startRenameFolder(folder.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => openDeleteFolderDialog(folder)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Folder
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => toggleFolderExpansion(folder.name)}
                        className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {productsToRender.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500">
                          <Package className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                          <p className="text-sm">No products in this folder.</p>
                        </div>
                      ) : isReordering ? (
                        <div className="p-3 sm:p-4">
                          <Reorder.Group
                            axis="y"
                            values={productsToRender}
                            onReorder={(newOrder) => {
                              setFolderProductMap((prev) => ({ ...prev, [folder.name]: newOrder }));
                            }}
                            className="space-y-2"
                          >
                            {productsToRender.map((item, index) => (
                              <Reorder.Item
                                key={item._id}
                                value={item}
                                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing" />

                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0">
                                    {item.image?.url ? (
                                      <img
                                        src={item.image.url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-zinc-400" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      #{index + 1} • {item.visible ? "Visible" : "Hidden"}
                                    </p>
                                  </div>

                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveProduct(folder.name, item._id, "up");
                                      }}
                                      disabled={index === 0}
                                      className="px-2.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100 disabled:opacity-40"
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveProduct(folder.name, item._id, "down");
                                      }}
                                      disabled={index === productsToRender.length - 1}
                                      className="px-2.5 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100 disabled:opacity-40"
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                          {productsToRender.map((item) => (
                            <article
                              key={item._id}
                              className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="aspect-[5/4] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                {item.image?.url ? (
                                  <img
                                    src={item.image.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-7 h-7 text-zinc-400" />
                                )}
                              </div>

                              <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                                    {item.name}
                                  </h3>
                                  <span
                                    className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-semibold ${
                                      item.visible
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                                    }`}
                                  >
                                    {item.visible ? "Visible" : "Hidden"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {normalizeFolderName(item.category)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    {item.views || 0} views
                                  </span>
                                  {item.labels?.some((label) => label.hidden) && (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                      {item.labels.filter((label) => label.hidden).length} hidden label(s)
                                    </span>
                                  )}
                                </div>

                                {item.labels?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.labels
                                      .filter((label) => !label.hidden)
                                      .slice(0, 3)
                                      .map((label, i) => (
                                        <span
                                          key={`${item._id}-${i}`}
                                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                        >
                                          {label.key}: {label.value}
                                        </span>
                                      ))}
                                    {item.labels.filter((label) => !label.hidden).length > 3 && (
                                      <span className="text-[10px] text-zinc-400">
                                        +{item.labels.filter((label) => !label.hidden).length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {item.adminNote && (
                                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 text-xs text-yellow-800 dark:text-yellow-200">
                                    <StickyNote className="w-3.5 h-3.5 inline mr-1" />
                                    {item.adminNote}
                                  </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <a
                                  href={`https://www.nexlifeinternational.com/home-product/${item._id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
                                  title="Open live product page"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Live
                                </a>

                                  <button
                                    onClick={() => toggleProductVisibility(item._id)}
                                    className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-100 text-xs font-medium"
                                  >
                                    {item.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {item.visible ? "Hide" : "Show"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEditing(item);
                                      setDefaultFolderForModal(normalizeFolderName(item.category));
                                      setModalOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => setDeletingProductId(item._id)}
                                    className="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDeletingProductId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Product?</h3>
              <p className="text-sm text-zinc-500 mb-6">
                &quot;{deletingProduct.name}&quot; will be permanently removed from home products.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingProductId(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDeletingFolder(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Folder</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Folder &quot;{deletingFolder.name}&quot; contains {deletingFolder.count} product
                {deletingFolder.count === 1 ? "" : "s"}.
              </p>

              {deletingFolder.count > 0 && (
                <div className="space-y-4 mb-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Delete option</label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                        <input
                          type="radio"
                          name="folder-delete-mode"
                          value="move"
                          checked={deleteFolderMode === "move"}
                          onChange={() => setDeleteFolderMode("move")}
                          className="mt-0.5"
                        />
                        Move products to another folder
                      </label>
                      <label className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                        <input
                          type="radio"
                          name="folder-delete-mode"
                          value="delete_products"
                          checked={deleteFolderMode === "delete_products"}
                          onChange={() => setDeleteFolderMode("delete_products")}
                          className="mt-0.5"
                        />
                        Delete this folder and all products permanently
                      </label>
                    </div>
                  </div>

                  {deleteFolderMode === "move" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        Move existing products to
                      </label>
                      <select
                        value={moveTargetFolder}
                        onChange={(e) => setMoveTargetFolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select folder</option>
                        {orderedFolders
                          .filter((folder) => folder.name !== deletingFolder.name)
                          .map((folder) => (
                            <option key={folder.name} value={folder.name}>
                              {folder.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3 space-y-2">
                      <p className="text-xs text-red-800 dark:text-red-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        This action is irreversible. Products and images in this folder will be deleted permanently.
                      </p>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-red-700 dark:text-red-300">
                          Type folder name to confirm: {deletingFolder.name}
                        </label>
                        <input
                          value={deleteFolderConfirmName}
                          onChange={(e) => setDeleteFolderConfirmName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder={deletingFolder.name}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingFolder(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFolder}
                  disabled={
                    folderActionBusy ||
                    (deletingFolder.count > 0 &&
                      deleteFolderMode === "delete_products" &&
                      deleteFolderConfirmName.trim() !== deletingFolder.name)
                  }
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {folderActionBusy ? "Deleting..." : "Delete Folder"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createFolderDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                if (folderActionBusy) return;
                setCreateFolderDialogOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Create Folder</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Enter a folder name for organizing home products.
              </p>
              <div className="space-y-3">
                <input
                  value={createFolderName}
                  onChange={(e) => setCreateFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFolder();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Folder name"
                  autoFocus
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setCreateFolderDialogOpen(false)}
                    disabled={folderActionBusy}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createFolder}
                    disabled={folderActionBusy}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {folderActionBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setDefaultFolderForModal("");
        }}
        product={editing}
        onSaved={refreshAll}
        folderOptions={folderOptions}
        defaultFolder={defaultFolderForModal}
        tagSuggestions={tagSuggestions}
        removedSuggestions={removedSuggestions}
        onRemoveSuggestion={removeSuggestion}
      />
    </div>
  );
}
