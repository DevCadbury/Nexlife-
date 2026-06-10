"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Plus,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type SiteContext = "Surgical" | "General" | "Both";

interface Category {
  _id: string;
  name: string;
  siteContext: string;
  visible: boolean;
  sequence: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function siteContextBadgeVariant(ctx: string) {
  if (ctx === "surgical") return "success";
  if (ctx === "general") return "default";
  return "warning";
}

function siteContextLabel(ctx: string) {
  if (ctx === "surgical") return "Surgical";
  if (ctx === "general") return "General";
  return "Both";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const router = useRouter();
  const { toast, success, error: toastError } = useToast();

  // Stable refs to avoid useCallback/useEffect re-runs from unstable toast refs
  const toastErrorRef = useRef(toastError);
  const successRef = useRef(success);
  useEffect(() => { toastErrorRef.current = toastError; }, [toastError]);
  useEffect(() => { successRef.current = success; }, [success]);

  // Auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/admin"); return; }
    const payload = decodeToken(token);
    const role = payload?.role as string | undefined;
    if (role !== "superadmin" && role !== "dev") {
      router.push("/admin");
    }
  }, [router]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newName, setNewName] = useState("");
  const [newSite, setNewSite] = useState<SiteContext>("Surgical");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteConflict, setDeleteConflict] = useState<{
    count: number;
    categories: Category[];
  } | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sequence edit
  const [seqMap, setSeqMap] = useState<Record<string, number>>({});
  const [reordering, setReordering] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/v2/categories/admin/all");
      const cats: Category[] = res.data?.items ?? res.data?.categories ?? [];
      setCategories(cats);
      const map: Record<string, number> = {};
      cats.forEach((c) => { map[c._id] = c.sequence; });
      setSeqMap(map);
    } catch {
      toastErrorRef.current("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []); // stable — toastErrorRef never changes

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Create ────────────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!newName.trim()) { setCreateError("Name is required"); return; }
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/v2/categories", {
        name: newName.trim(),
        siteContext: newSite.toLowerCase(),
      });
      setNewName("");
      setNewSite("Surgical");
      successRef.current("Category created");
      fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to create category";
      if (err?.response?.status === 409) {
        setCreateError("Category already exists");
      } else {
        setCreateError(msg);
      }
    } finally {
      setCreating(false);
    }
  }

  // ── Inline rename ─────────────────────────────────────────────────────────
  function startEdit(cat: Category) {
    setEditingId(cat._id);
    setEditingName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(cat: Category) {
    if (!editingName.trim()) return;
    setSavingId(cat._id);
    try {
      await api.patch(`/v2/categories/${cat._id}`, { name: editingName.trim() });
      successRef.current("Category renamed");
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      toastErrorRef.current(err?.response?.data?.error ?? "Failed to rename category");
    } finally {
      setSavingId(null);
    }
  }

  // ── Visibility toggle ─────────────────────────────────────────────────────
  async function toggleVisibility(cat: Category) {
    // Optimistic
    setCategories((prev) =>
      prev.map((c) => c._id === cat._id ? { ...c, visible: !c.visible } : c)
    );
    try {
      await api.patch(`/v2/categories/${cat._id}/visibility`);
    } catch (err: any) {
      // Revert
      setCategories((prev) =>
        prev.map((c) => c._id === cat._id ? { ...c, visible: cat.visible } : c)
      );
      toastErrorRef.current(err?.response?.data?.error ?? "Failed to update visibility");
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteConflict(null);
    setReassignTo("");
  }

  async function handleDelete(opts?: { moveTo?: string; deleteProducts?: boolean }) {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/v2/categories/${deleteTarget._id}`, {
        data: opts ?? {},
      });
      successRef.current("Category deleted");
      setDeleteTarget(null);
      setDeleteConflict(null);
      fetchCategories();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        const count = err.response.data?.count ?? 0;
        setDeleteConflict({
          count,
          categories: categories.filter((c) => c._id !== deleteTarget._id),
        });
      } else {
        toastErrorRef.current(err?.response?.data?.error ?? "Failed to delete category");
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  // ── Reorder ───────────────────────────────────────────────────────────────
  async function handleReorder(id: string) {
    setReordering(true);
    try {
      const payload = categories.map((c) => ({
        id: c._id,
        sequence: seqMap[c._id] ?? c.sequence,
      }));
      await api.post("/v2/categories/reorder", { categories: payload });
      successRef.current("Order saved");
      fetchCategories();
    } catch (err: any) {
      toastErrorRef.current(err?.response?.data?.error ?? "Failed to reorder");
    } finally {
      setReordering(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin" className="hover:text-slate-200 transition-colors">Admin</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/admin/products" className="hover:text-slate-200 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200">Categories</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Category Management</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Create, rename, reorder and manage product categories
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Add New Category</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Category name"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
          <Select
            value={newSite}
            onChange={(e) => setNewSite(e.target.value as SiteContext)}
            className="bg-slate-900 border-slate-700 text-slate-100 min-w-[130px]"
          >
            <option value="Surgical">Surgical</option>
            <option value="General">General</option>
            <option value="Both">Both</option>
          </Select>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-1.5 bg-[#0A8A78] hover:bg-[#0A8A78]/90 text-white border-none whitespace-nowrap"
            style={{ background: "#0A8A78" }}
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Category
          </Button>
        </div>
        {createError && (
          <p className="text-xs text-red-400 mt-2">{createError}</p>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">No categories yet.</p>
            <p className="text-xs mt-1">Use the form above to create one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Context</th>
                <th className="text-left px-4 py-3 font-medium">Visible</th>
                <th className="text-left px-4 py-3 font-medium w-28">Sequence</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-b border-slate-800 bg-transparent hover:bg-slate-800/50 transition-colors"
                >
                  {/* Name / inline edit */}
                  <td className="px-4 py-3">
                    {editingId === cat._id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(cat);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="h-7 py-0 bg-slate-900 border-slate-600 text-slate-100 text-sm w-44"
                        />
                        <button
                          onClick={() => saveEdit(cat)}
                          disabled={savingId === cat._id}
                          className="text-[#0A8A78] hover:text-[#0A8A78]/80"
                        >
                          {savingId === cat._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-200">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-100 font-medium">{cat.name}</span>
                    )}
                  </td>

                  {/* Site context badge */}
                  <td className="px-4 py-3">
                    <Badge variant={siteContextBadgeVariant(cat.siteContext) as any}>
                      {siteContextLabel(cat.siteContext)}
                    </Badge>
                  </td>

                  {/* Visibility toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisibility(cat)}
                      className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 border transition-colors ${
                        cat.visible
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-700/40 hover:bg-emerald-500/30"
                          : "bg-slate-700/40 text-slate-400 border-slate-600 hover:bg-slate-700/60"
                      }`}
                    >
                      {cat.visible ? (
                        <><Eye className="w-3 h-3" /> Live</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Hidden</>
                      )}
                    </button>
                  </td>

                  {/* Sequence */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={seqMap[cat._id] ?? cat.sequence}
                      onChange={(e) =>
                        setSeqMap((prev) => ({
                          ...prev,
                          [cat._id]: Number(e.target.value),
                        }))
                      }
                      onBlur={() => handleReorder(cat._id)}
                      className="w-16 h-7 bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded px-2 focus:outline-none focus:border-[#0A8A78]"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(cat)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {reordering && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving order…
        </div>
      )}

      {/* ── Delete Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) { setDeleteTarget(null); setDeleteConflict(null); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <span className="text-slate-100">
                {deleteConflict ? "Category Has Products" : "Delete Category"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {!deleteConflict ? (
              <p className="text-sm text-slate-300">
                Are you sure you want to delete{" "}
                <strong className="text-white">{deleteTarget?.name}</strong>?
                This action cannot be undone.
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{deleteTarget?.name}</strong>{" "}
                  has{" "}
                  <strong className="text-amber-300">{deleteConflict.count}</strong>{" "}
                  product{deleteConflict.count !== 1 ? "s" : ""}. Choose what to
                  do with them:
                </p>

                {/* Reassign */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Reassign to another category
                  </p>
                  <div className="flex gap-2">
                    <Select
                      value={reassignTo}
                      onChange={(e) => setReassignTo(e.target.value)}
                      className="flex-1 bg-slate-900 border-slate-700 text-slate-100"
                    >
                      <option value="">Select category…</option>
                      {deleteConflict.categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      disabled={!reassignTo || deleting}
                      onClick={() => handleDelete({ moveTo: reassignTo })}
                      style={{ background: "#0A8A78" }}
                      className="text-white border-none"
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reassign"}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <Button
                    variant="outline"
                    disabled={deleting}
                    onClick={() => handleDelete({ deleteProducts: true })}
                    className="w-full border-red-700/50 text-red-400 hover:bg-red-500/10"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete Products Too"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {!deleteConflict && (
            <DialogFooter>
              <DialogClose>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={deleting}
                onClick={() => handleDelete()}
                className="border-none text-white"
                style={{ background: "#ef4444" }}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
