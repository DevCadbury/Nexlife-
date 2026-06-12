"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  GripVertical,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteTab = "surgical" | "general" | "both" | "all";

interface ProductImage {
  secure_url: string;
  public_id: string;
}

interface ProductField {
  key: string;
  value: string;
  hidden: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  siteContext: "surgical" | "general" | "both";
  images: ProductImage[];
  visible: boolean;
  hidePrice: boolean;
  price?: string;
  priceUnit?: string;
  fields?: ProductField[];
  isFeatured: boolean;
  isStarred: boolean;
  sequence: number;
}

interface Category {
  _id: string;
  name: string;
  siteContext: string;
  visible: boolean;
  sequence: number;
}

// ─── Modal form state ─────────────────────────────────────────────────────────

interface FieldRow {
  _uid: string;
  key: string;
  value: string;
  hidden: boolean;
}

let fieldUidCounter = 0;
function makeField(key = "", value = "", hidden = false): FieldRow {
  return { _uid: `f-${++fieldUidCounter}`, key, value, hidden };
}

// ─── Image manager state ──────────────────────────────────────────────────────
// An image slot is either an already-uploaded image (existing) or a freshly
// picked file (new). Order matters — index 0 is the priority / cover image.
type ImageItem =
  | { _uid: string; kind: "existing"; public_id: string; secure_url: string }
  | { _uid: string; kind: "new"; file: File; preview: string };

let imageUidCounter = 0;
function makeImageUid(): string {
  return `img-${++imageUidCounter}`;
}

// Auto-growing textarea — lets long field values stay fully visible by expanding
// vertically with the content instead of clipping inside a one-line input.
function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="crm-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      style={{ flex: 1, resize: "none", overflow: "hidden", minHeight: "38px", lineHeight: 1.5 }}
    />
  );
}

// Small circular control button shown over each image thumbnail in the manager.
function imgCtrlBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    border: "none",
    background: "rgba(255,255,255,0.92)",
    color: "#1F2937",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    flexShrink: 0,
  };
}

interface ModalState {
  name: string;
  category: string;
  siteContext: "surgical" | "general" | "both";
  price: string;
  priceUnit: string;
  showPrice: boolean; // inverted hidePrice
  isFeatured: boolean;
  isStarred: boolean;
  visible: boolean;
  fields: FieldRow[];
  images: ImageItem[];
}

function defaultModal(categories: Category[], defaultCat = "", defaultSite: "surgical" | "general" | "both" = "surgical"): ModalState {
  return {
    name: "",
    category: defaultCat || (categories[0]?.name ?? ""),
    siteContext: defaultSite,
    price: "",
    priceUnit: "",
    showPrice: true,
    isFeatured: false,
    isStarred: false,
    visible: true,
    fields: [makeField()],
    images: [],
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_TABS: { value: SiteTab; label: string }[] = [
  { value: "surgical", label: "Surgical" },
  { value: "general", label: "General" },
  { value: "both", label: "Both" },
  { value: "all", label: "All" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByCategory(products: Product[]): Record<string, Product[]> {
  return products.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// ProductModal
// ═══════════════════════════════════════════════════════════════════════════════

function ProductModal({
  open,
  onClose,
  editing,
  categories,
  defaultCategory,
  defaultSite,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: Product | null;
  categories: Category[];
  defaultCategory: string;
  defaultSite: "surgical" | "general";
  onSaved: () => void;
}) {
  const { error: toastError, success } = useToast();
  const toastErrRef = useRef(toastError);
  const toastOkRef = useRef(success);
  useEffect(() => { toastErrRef.current = toastError; }, [toastError]);
  useEffect(() => { toastOkRef.current = success; }, [success]);

  const [form, setForm] = useState<ModalState>(() =>
    defaultModal(categories, defaultCategory, defaultSite)
  );
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reusable field-name (key) presets, persisted in localStorage so the same
  // field names can be reused across products without retyping.
  const FIELD_KEYS_STORAGE = "nxl_product_field_keys";
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FIELD_KEYS_STORAGE);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setSavedKeys(arr.filter((x) => typeof x === "string"));
      }
    } catch {}
  }, []);

  function rememberKey(rawKey: string) {
    const k = rawKey.trim();
    if (!k) return;
    setSavedKeys((prev) => {
      if (prev.some((x) => x.toLowerCase() === k.toLowerCase())) return prev;
      const next = [...prev, k];
      try { localStorage.setItem(FIELD_KEYS_STORAGE, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function deleteSavedKey(key: string) {
    setSavedKeys((prev) => {
      const next = prev.filter((x) => x !== key);
      try { localStorage.setItem(FIELD_KEYS_STORAGE, JSON.stringify(next)); } catch {}
      return next;
    });
    setConfirmDeleteKey(null);
  }

  function applySavedKey(key: string) {
    setForm((prev) => {
      const idx = prev.fields.findIndex((f) => !f.key.trim());
      if (idx !== -1) {
        return {
          ...prev,
          fields: prev.fields.map((f, i) => (i === idx ? { ...f, key } : f)),
        };
      }
      return { ...prev, fields: [...prev.fields, makeField(key)] };
    });
  }

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        category: editing.category,
        siteContext: editing.siteContext,
        price: editing.price ?? "",
        priceUnit: editing.priceUnit ?? "",
        showPrice: !editing.hidePrice,
        isFeatured: editing.isFeatured,
        isStarred: editing.isStarred,
        visible: editing.visible,
        fields: editing.fields?.length
          ? editing.fields.map((f) => makeField(f.key, f.value, f.hidden))
          : [makeField()],
        images: (editing.images ?? []).map((img) => ({
          _uid: makeImageUid(),
          kind: "existing" as const,
          public_id: img.public_id,
          secure_url: img.secure_url,
        })),
      });
    } else {
      setForm(defaultModal(categories, defaultCategory, defaultSite));
    }
    setSaving(false);
    setProgress(0);
  }, [open, editing, categories, defaultCategory, defaultSite]);

  function set<K extends keyof ModalState>(key: K, val: ModalState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // Fields
  function addField() {
    setForm((prev) => ({ ...prev, fields: [...prev.fields, makeField()] }));
  }
  function removeField(uid: string) {
    setForm((prev) => {
      const next = prev.fields.filter((f) => f._uid !== uid);
      return { ...prev, fields: next.length ? next : [makeField()] };
    });
  }
  function updateField(uid: string, key: "key" | "value", val: string) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f._uid === uid ? { ...f, [key]: val } : f)),
    }));
  }
  function toggleFieldHidden(uid: string) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f._uid === uid ? { ...f, hidden: !f.hidden } : f
      ),
    }));
  }

  // ── Image management ────────────────────────────────────────────────────────
  const dragImgUid = useRef<string | null>(null);

  function onFilesPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newItems: ImageItem[] = files.map((file) => ({
      _uid: makeImageUid(),
      kind: "new" as const,
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...newItems] }));
    // reset input so picking the same file again still fires onChange
    e.target.value = "";
  }

  function removeImage(uid: string) {
    setForm((prev) => {
      const target = prev.images.find((im) => im._uid === uid);
      if (target && target.kind === "new") URL.revokeObjectURL(target.preview);
      return { ...prev, images: prev.images.filter((im) => im._uid !== uid) };
    });
  }

  function moveImage(uid: string, dir: -1 | 1) {
    setForm((prev) => {
      const idx = prev.images.findIndex((im) => im._uid === uid);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.images.length) return prev;
      const next = [...prev.images];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, images: next };
    });
  }

  function reorderImage(fromUid: string, toUid: string) {
    if (fromUid === toUid) return;
    setForm((prev) => {
      const from = prev.images.findIndex((im) => im._uid === fromUid);
      const to = prev.images.findIndex((im) => im._uid === toUid);
      if (from === -1 || to === -1) return prev;
      const next = [...prev.images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, images: next };
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toastErrRef.current("Product name is required");
      return;
    }
    if (form.images.length === 0) {
      toastErrRef.current("Please add at least one image");
      return;
    }

    setSaving(true);
    setProgress(0);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("category", form.category);
      payload.append("siteContext", form.siteContext);
      payload.append("visible", String(form.visible));
      payload.append("hidePrice", String(!form.showPrice));
      payload.append("isFeatured", String(form.isFeatured));
      payload.append("isStarred", String(form.isStarred));
      if (form.price) payload.append("price", form.price);
      if (form.priceUnit) payload.append("priceUnit", form.priceUnit);
      payload.append(
        "fields",
        JSON.stringify(
          form.fields
            .map((f) => ({ key: f.key.trim(), value: f.value.trim(), hidden: f.hidden }))
            .filter((f) => f.key || f.value)
        )
      );

      // Remember any field names used so they can be reused on other products
      form.fields.forEach((f) => rememberKey(f.key));

      // Images — append new files in order, and (for edits) describe the full order
      // so the backend can rebuild the array (reorder + add + delete). Index 0 = priority.
      const imageOrder = form.images.map((it) =>
        it.kind === "existing"
          ? { type: "existing", public_id: it.public_id }
          : { type: "new" }
      );
      form.images.forEach((it) => {
        if (it.kind === "new") payload.append("images", it.file);
      });
      if (editing) {
        payload.append("imageOrder", JSON.stringify(imageOrder));
      }

      if (editing) {
        await api.patch(`/v2/products/${editing._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        toastOkRef.current("Product updated");
      } else {
        await api.post("/v2/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: ctrl.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        toastOkRef.current("Product created");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      if (err?.message === "canceled" || err?.code === "ERR_CANCELED") return;
      toastErrRef.current(err?.response?.data?.error ?? "Failed to save product");
    } finally {
      setSaving(false);
      abortRef.current = null;
    }
  }

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "640px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
          transition: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
            {editing ? "Edit Product" : "New Product"}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-3)",
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{ padding: "20px", overflowY: "auto", flex: 1 }}
          className="custom-scrollbar"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Image Manager */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
                <label className="crm-label" style={{ margin: 0 }}>
                  Product Images {editing ? "" : "*"}
                </label>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Drag to reorder · first image is the cover
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
                  gap: "10px",
                }}
              >
                {form.images.map((img, i) => {
                  const src = img.kind === "new" ? img.preview : img.secure_url;
                  return (
                    <div
                      key={img._uid}
                      draggable
                      onDragStart={() => { dragImgUid.current = img._uid; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragImgUid.current) reorderImage(dragImgUid.current, img._uid);
                        dragImgUid.current = null;
                      }}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: i === 0 ? "2px solid var(--brand)" : "1px solid var(--border)",
                        background: "var(--bg-inset)",
                        cursor: "grab",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Image ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                      {/* Priority badge */}
                      {i === 0 && (
                        <span
                          style={{
                            position: "absolute", top: "4px", left: "4px",
                            display: "inline-flex", alignItems: "center", gap: "3px",
                            padding: "2px 6px", borderRadius: "99px",
                            background: "var(--brand)", color: "#fff",
                            fontSize: "9px", fontWeight: 700, letterSpacing: "0.02em",
                          }}
                        >
                          <Star style={{ width: 9, height: 9 }} fill="#fff" /> Cover
                        </span>
                      )}

                      {/* Controls */}
                      <div
                        style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                          padding: "4px",
                          background: "linear-gradient(to top, rgba(0,0,0,0.62), transparent)",
                        }}
                      >
                        <button
                          type="button"
                          title="Move left"
                          disabled={i === 0}
                          onClick={() => moveImage(img._uid, -1)}
                          style={imgCtrlBtnStyle(i === 0)}
                        >
                          <ChevronLeft style={{ width: 13, height: 13 }} />
                        </button>
                        <button
                          type="button"
                          title="Move right"
                          disabled={i === form.images.length - 1}
                          onClick={() => moveImage(img._uid, 1)}
                          style={imgCtrlBtnStyle(i === form.images.length - 1)}
                        >
                          <ChevronRight style={{ width: 13, height: 13 }} />
                        </button>
                        <button
                          type="button"
                          title="Remove image"
                          onClick={() => removeImage(img._uid)}
                          style={{ ...imgCtrlBtnStyle(false), background: "rgba(181,74,74,0.92)" }}
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add tile */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "8px",
                    border: "2px dashed var(--border-2)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                    cursor: "pointer", transition: "border-color 130ms, color 130ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Upload style={{ width: 20, height: 20 }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Add</span>
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "6px" }}>
                JPEG / PNG / WebP / GIF · max 10MB each · up to 12 images
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                style={{ display: "none" }}
                onChange={onFilesPick}
              />
            </div>

            {/* Name */}
            <div>
              <label className="crm-label">Product Name *</label>
              <input
                className="crm-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            {/* Category + SiteContext */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="crm-label">Category</label>
                <select
                  className="crm-select"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">No categories</option>
                  )}
                </select>
              </div>
              <div>
                <label className="crm-label">Site Context</label>
                <select
                  className="crm-select"
                  value={form.siteContext}
                  onChange={(e) =>
                    set("siteContext", e.target.value as ModalState["siteContext"])
                  }
                >
                  <option value="surgical">Surgical</option>
                  <option value="general">General</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="crm-label">Price (optional)</label>
                <input
                  className="crm-input"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="e.g. 1,200"
                />
              </div>
              <div>
                <label className="crm-label">Price Unit</label>
                <input
                  className="crm-input"
                  value={form.priceUnit}
                  onChange={(e) => set("priceUnit", e.target.value)}
                  placeholder="e.g. per unit"
                />
              </div>
            </div>

            {/* Toggles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              {(
                [
                  { key: "showPrice", label: "Show Price" },
                  { key: "visible", label: "Visible" },
                  { key: "isFeatured", label: "Featured" },
                  { key: "isStarred", label: "Starred" },
                ] as { key: keyof ModalState; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set(key, !form[key] as ModalState[typeof key])}
                  className={`crm-toggle${form[key] ? " active" : ""}`}
                  style={{ justifyContent: "center" }}
                >
                  {label}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 500,
                      color: form[key] ? "var(--brand)" : "var(--text-muted)",
                    }}
                  >
                    {form[key] ? "ON" : "OFF"}
                  </span>
                </button>
              ))}
            </div>

            {/* Dynamic Fields */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <label className="crm-label" style={{ margin: 0 }}>
                  Product Fields
                </label>
                <button
                  type="button"
                  onClick={addField}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--brand)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <Plus style={{ width: 13, height: 13 }} />
                  Add Field
                </button>
              </div>

              {/* Saved field-name presets — click to reuse, tiny × to delete */}
              {savedKeys.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  {savedKeys.map((key) => (
                    <span
                      key={key}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 4px 3px 9px",
                        borderRadius: "99px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-inset)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--text-2)",
                      }}
                    >
                      <button
                        type="button"
                        title={`Use "${key}" as a field name`}
                        onClick={() => applySavedKey(key)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}
                      >
                        {key}
                      </button>
                      <button
                        type="button"
                        title="Delete saved field name"
                        onClick={() => setConfirmDeleteKey(key)}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "15px", height: "15px", borderRadius: "99px", border: "none",
                          background: "var(--border)", color: "var(--text-3)", cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        <X style={{ width: 9, height: 9 }} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {form.fields.map((f) => (
                  <div
                    key={f._uid}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      opacity: f.hidden ? 0.65 : 1,
                    }}
                  >
                    <input
                      className="crm-input"
                      value={f.key}
                      onChange={(e) => updateField(f._uid, "key", e.target.value)}
                      onBlur={(e) => rememberKey(e.target.value)}
                      placeholder="Key"
                      style={{ flex: 1 }}
                    />
                    <AutoGrowTextarea
                      value={f.value}
                      onChange={(v) => updateField(f._uid, "value", v)}
                      placeholder="Value (supports long text)"
                    />
                    <button
                      type="button"
                      title={f.hidden ? "Hidden on website" : "Visible on website"}
                      onClick={() => toggleFieldHidden(f._uid)}
                      style={{
                        padding: "5px",
                        borderRadius: "5px",
                        border: `1px solid ${f.hidden ? "var(--warn-b)" : "var(--ok-b)"}`,
                        background: f.hidden ? "var(--warn-bg)" : "var(--ok-bg)",
                        color: f.hidden ? "var(--warn-t)" : "var(--ok-t)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {f.hidden ? (
                        <EyeOff style={{ width: 14, height: 14 }} />
                      ) : (
                        <Eye style={{ width: 14, height: 14 }} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(f._uid)}
                      style={{
                        padding: "5px",
                        borderRadius: "5px",
                        border: "1px solid var(--err-b)",
                        background: "var(--err-bg)",
                        color: "var(--err-t)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload progress bar */}
        {saving && progress > 0 && (
          <div style={{ padding: "0 20px" }}>
            <div
              style={{
                height: "3px",
                background: "var(--bg-inset)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--brand)",
                  width: `${progress}%`,
                  transition: "width 300ms",
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {saving ? (
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={() => abortRef.current?.abort()}
            >
              Cancel Upload
            </button>
          ) : (
            <button
              type="button"
              className="crm-btn crm-btn-secondary crm-btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="crm-btn crm-btn-primary crm-btn-sm"
            disabled={saving}
            onClick={handleSave}
          >
            {saving && <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />}
            {editing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      {/* Confirm delete saved field name */}
      {confirmDeleteKey !== null && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setConfirmDeleteKey(null)} />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "320px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-md)",
              padding: "18px",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
              Delete saved field name?
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-3)", marginBottom: "16px", lineHeight: 1.5 }}>
              Remove <strong style={{ color: "var(--text)" }}>“{confirmDeleteKey}”</strong> from your saved field names. This won&apos;t affect fields already added to products.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setConfirmDeleteKey(null)}>
                Cancel
              </button>
              <button type="button" className="crm-btn crm-btn-danger crm-btn-sm" onClick={() => deleteSavedKey(confirmDeleteKey)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProductsPage() {
  const { success, error: toastError } = useToast();

  // Stable toast refs — prevents re-render loops
  const toastErrRef = useRef(toastError);
  const toastOkRef = useRef(success);
  useEffect(() => { toastErrRef.current = toastError; }, [toastError]);
  useEffect(() => { toastOkRef.current = success; }, [success]);

  // ── State ──────────────────────────────────────────────────────────────────
  // Active site context — mirrors the sidebar website switcher (surgical / general).
  // Products & categories are filtered to the active site so the CRM matches the site being managed.
  const [activeSite, setActiveSite] = useState<"surgical" | "general">("surgical");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");

  // Accordion expansion
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // New category inline form
  const [newCatInput, setNewCatInput] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);

  // Product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [defaultModalCat, setDefaultModalCat] = useState("");

  // Inline delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle guard
  const togglingRef = useRef<Record<string, boolean>>({});

  // Drag state — products
  const dragIdRef = useRef<string | null>(null);
  const dragCatRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Drag state — categories
  const dragCatIdRef = useRef<string | null>(null);
  const [dragOverCatName, setDragOverCatName] = useState<string | null>(null);

  // ── Fetch products — always fetch ALL products for admin view ─────────────
  const fetchProducts = useCallback(async (_site?: SiteTab) => {
    setLoadingProducts(true);
    try {
      // No site filter — admin sees all products regardless of siteContext
      const res = await api.get(`/v2/products/admin/all`);
      const items: Product[] = res.data?.items ?? res.data?.products ?? [];
      setProducts(items.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)));
    } catch {
      toastErrRef.current("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch categories ───────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await api.get("/v2/categories/admin/all");
      const cats: Category[] = res.data?.items ?? res.data?.categories ?? [];
      setCategories(cats.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)));
    } catch {
      toastErrRef.current("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Sync active site with the sidebar website switcher ─────────────────────
  useEffect(() => {
    const read = () => {
      const s = localStorage.getItem("crmActiveSite");
      if (s === "surgical" || s === "general") setActiveSite(s);
    };
    read();
    const onSiteChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "surgical" || detail === "general") setActiveSite(detail);
      else read();
    };
    window.addEventListener("crm-site-change", onSiteChange);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("crm-site-change", onSiteChange);
      window.removeEventListener("storage", read);
    };
  }, []);

  // ── Site tab change removed — admin sees all products ──────────────────────

  // ── Computed data ──────────────────────────────────────────────────────────
  const searchQuery = search.trim().toLowerCase();

  // Products belonging to the active site (siteContext matches, or 'both')
  const matchesSite = (sc: string) => sc === activeSite || sc === "both";
  const siteProducts = products.filter((p) => matchesSite(p.siteContext));
  // Categories belonging to the active site
  const siteCategories = categories.filter((c) => matchesSite(c.siteContext));

  const filteredProducts = searchQuery
    ? siteProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery) ||
          (p.price ?? "").toLowerCase().includes(searchQuery)
      )
    : siteProducts;

  // Resolve a product's category field — may be stored as an ObjectId string for old products
  const resolveProductCategory = (rawCat: string): string => {
    if (!rawCat) return "Uncategorized";
    // If it's a 24-char ObjectId, find the matching category name
    if (/^[a-f0-9]{24}$/i.test(rawCat)) {
      const match = categories.find((c) => c._id === rawCat);
      return match?.name ?? rawCat;
    }
    return rawCat;
  };

  // Normalize products for display — resolve ObjectId categories to names, strip ObjectId prefix from names
  const normalizedProducts = filteredProducts.map((p) => ({
    ...p,
    category: resolveProductCategory(p.category),
    name: p.name.replace(/^[a-f0-9]{24}/i, "").trim() || p.name,
  }));

  const grouped = groupByCategory(normalizedProducts);

  // Starred virtual category — products with isStarred=true shown in a special CRM-only section
  const starredProducts = products
    .filter((p) => p.isStarred && matchesSite(p.siteContext))
    .map((p) => ({
      ...p,
      category: resolveProductCategory(p.category),
      name: p.name.replace(/^[a-f0-9]{24}/i, "").trim() || p.name,
    }));

  // Category order: show ALL categories from API (even empty ones), then any ungrouped keys
  const allCategoryKeys = [
    ...siteCategories.map((c) => c.name),  // all categories for this site, even empty
    ...Object.keys(grouped).filter(
      (k) => !siteCategories.find((c) => c.name === k)
    ),
  ];

  // ── Optimistic toggle ──────────────────────────────────────────────────────
  // For hidePrice we need to PATCH the product directly with a body.
  // For visibility/starred/featured there are dedicated endpoints.
  async function toggleField(
    product: Product,
    field: "visible" | "isFeatured" | "isStarred" | "hidePrice",
    endpoint: string,
    patchBody?: object
  ) {
    const key = `${product._id}:${field}`;
    if (togglingRef.current[key]) return;
    togglingRef.current[key] = true;

    const prev = { ...product };
    setProducts((ps) =>
      ps.map((p) => (p._id === product._id ? { ...p, [field]: !p[field] } : p))
    );

    try {
      if (patchBody !== undefined) {
        await api.patch(endpoint, patchBody);
      } else {
        await api.patch(endpoint);
      }
    } catch (err: any) {
      setProducts((ps) =>
        ps.map((p) => (p._id === product._id ? prev : p))
      );
      toastErrRef.current(err?.response?.data?.error ?? "Action failed");
    } finally {
      togglingRef.current[key] = false;
    }
  }

  // ── Delete product ─────────────────────────────────────────────────────────
  async function handleDeleteProduct(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/v2/products/${id}`);
      setProducts((ps) => ps.filter((p) => p._id !== id));
      toastOkRef.current("Product deleted");
      setDeleteConfirmId(null);
    } catch (err: any) {
      toastErrRef.current(err?.response?.data?.error ?? "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // ── Category visibility ────────────────────────────────────────────────────
  async function toggleCatVisibility(cat: Category) {
    setCategories((prev) =>
      prev.map((c) =>
        c._id === cat._id ? { ...c, visible: !c.visible } : c
      )
    );
    try {
      await api.patch(`/v2/categories/${cat._id}/visibility`);
    } catch (err: any) {
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, visible: cat.visible } : c))
      );
      toastErrRef.current(err?.response?.data?.error ?? "Failed to update category");
    }
  }

  // ── Rename category ────────────────────────────────────────────────────────
  async function handleRenameCategory(catId: string, newName: string) {
    try {
      await api.patch(`/v2/categories/${catId}`, { name: newName });
      toastOkRef.current(`Category renamed to "${newName}"`);
      fetchCategories();
      // Also update products in local state that had the old category name
      fetchProducts();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toastErrRef.current(`A category named "${newName}" already exists.`);
      } else {
        toastErrRef.current(err?.response?.data?.error ?? "Failed to rename category");
      }
    }
  }

  // ── Delete category ────────────────────────────────────────────────────────
  async function handleDeleteCategory(cat: Category) {
    const productsInCat = products.filter((p) => p.category === cat.name);
    if (productsInCat.length > 0) {
      toastErrRef.current(
        `Remove all products from "${cat.name}" first (${productsInCat.length} remaining)`
      );
      return;
    }
    try {
      await api.delete(`/v2/categories/${cat._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      toastOkRef.current("Category deleted");
    } catch (err: any) {
      toastErrRef.current(err?.response?.data?.error ?? "Failed to delete category");
    }
  }

  // ── Create category ────────────────────────────────────────────────────────
  async function handleCreateCategory() {
    const name = newCatInput.trim();
    if (!name) return;
    setCreatingCat(true);
    try {
      await api.post("/v2/categories", { name, siteContext: activeSite });
      setNewCatInput("");
      setShowNewCat(false);
      toastOkRef.current(`Category "${name}" created`);
      fetchCategories();
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error;
      if (status === 409) {
        toastErrRef.current(`A category named "${name}" already exists. Choose a different name.`);
      } else {
        toastErrRef.current(serverMsg ?? "Failed to create category");
      }
    } finally {
      setCreatingCat(false);
    }
  }

  // ── Category drag reorder ──────────────────────────────────────────────────
  function onCatDragStart(catName: string) {
    dragCatIdRef.current = catName;
  }

  function onCatDragOver(e: React.DragEvent, targetName: string) {
    e.preventDefault();
    setDragOverCatName(targetName);
  }

  function onCatDragLeave() {
    setDragOverCatName(null);
  }

  async function onCatDrop(e: React.DragEvent, targetName: string) {
    e.preventDefault();
    setDragOverCatName(null);
    const srcName = dragCatIdRef.current;
    if (!srcName || srcName === targetName) return;

    // Reorder categories array
    const updated = [...categories];
    const srcIdx = updated.findIndex((c) => c.name === srcName);
    const tgtIdx = updated.findIndex((c) => c.name === targetName);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const [item] = updated.splice(srcIdx, 1);
    updated.splice(tgtIdx, 0, item);
    // Assign new sequences
    const resequenced = updated.map((c, i) => ({ ...c, sequence: i + 1 }));
    setCategories(resequenced);

    // Persist to API
    try {
      const order = resequenced.map((c) => ({ id: c._id, sequence: c.sequence }));
      await api.post("/v2/categories/reorder", order);
      toastOkRef.current("Category order saved");
    } catch {
      toastErrRef.current("Failed to save category order");
      fetchCategories(); // revert
    }
  }

  // ── Drag reorder ───────────────────────────────────────────────────────────
  function onDragStart(productId: string, catName: string) {
    dragIdRef.current = productId;
    dragCatRef.current = catName;
  }

  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    setDragOverId(targetId);
  }

  function onDragLeave() {
    setDragOverId(null);
  }

  async function onDrop(e: React.DragEvent, targetId: string, catName: string) {
    e.preventDefault();
    setDragOverId(null);

    const srcId = dragIdRef.current;
    const srcCat = dragCatRef.current;
    if (!srcId || srcId === targetId || srcCat !== catName) return;

    // Reorder within the same category
    setProducts((prev) => {
      const list = [...prev];
      const srcIdx = list.findIndex((p) => p._id === srcId);
      const tgtIdx = list.findIndex((p) => p._id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const [item] = list.splice(srcIdx, 1);
      list.splice(tgtIdx, 0, item);
      // Update sequences
      return list.map((p, i) => ({ ...p, sequence: i + 1 }));
    });

    // Compute new order for the category and send to API
    setProducts((prev) => {
      const catProducts = prev.filter((p) => p.category === catName);
      const order = catProducts.map((p, i) => ({ id: p._id, sequence: i + 1 }));
      // Fire-and-forget
      api.post("/v2/products/reorder", { order }).catch(() => {
        toastErrRef.current("Failed to save order");
      });
      return prev;
    });
  }

  // ── Open modal helpers ─────────────────────────────────────────────────────
  function openCreate(catName = "") {
    setEditingProduct(null);
    setDefaultModalCat(catName);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setDefaultModalCat(product.category);
    setModalOpen(true);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const loading = loadingProducts || loadingCategories;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}
          >
            Product Manager
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", marginTop: "2px" }}>
            Manage products, categories, and visibility for your{" "}
            {activeSite === "surgical" ? "surgical" : "general"} catalogue
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="crm-btn crm-btn-secondary"
            onClick={() => setShowNewCat(true)}
          >
            <Folder style={{ width: 15, height: 15 }} />
            Add Category
          </button>
          <button
            className="crm-btn crm-btn-primary"
            onClick={() => openCreate()}
          >
            <Plus style={{ width: 15, height: 15 }} />
            Add Product
          </button>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", maxWidth: "380px" }}>
        <Search
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          className="crm-input"
          style={{ paddingLeft: "32px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
        />
      </div>

      {/* ── Expand/Collapse All + view hint ──────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <button
          className="crm-btn crm-btn-ghost crm-btn-sm"
          onClick={() => {
            const toExpand: Record<string, boolean> = {};
            allCategoryKeys.forEach((k) => { toExpand[k] = true; });
            setExpanded(toExpand);
          }}
        >
          Expand All
        </button>
        <button
          className="crm-btn crm-btn-ghost crm-btn-sm"
          onClick={() => setExpanded({})}
        >
          Collapse All
        </button>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>
          {siteProducts.length} products · {siteCategories.length} categories
          {siteProducts.filter((p) => !p.visible).length > 0 && (
            <span
              style={{
                marginLeft: "6px",
                padding: "1px 6px",
                borderRadius: "99px",
                background: "var(--warn-bg)",
                border: "1px solid var(--warn-b)",
                color: "var(--warn-t)",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {siteProducts.filter((p) => !p.visible).length} hidden
            </span>
          )}
        </span>
      </div>

      {/* ── New Category inline — shown at top when triggered from empty state ── */}
      {showNewCat && allCategoryKeys.length === 0 && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Folder style={{ width: 15, height: 15, color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            className="crm-input"
            style={{ flex: 1 }}
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            placeholder="New category name…"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateCategory();
              if (e.key === "Escape") { setShowNewCat(false); setNewCatInput(""); }
            }}
          />
          <button
            className="crm-btn crm-btn-primary crm-btn-sm"
            disabled={creatingCat || !newCatInput.trim()}
            onClick={handleCreateCategory}
          >
            {creatingCat ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : "Create"}
          </button>
          <button
            className="crm-btn crm-btn-secondary crm-btn-sm"
            onClick={() => { setShowNewCat(false); setNewCatInput(""); }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {loading ? (
        <SkeletonList />
      ) : allCategoryKeys.length === 0 && !searchQuery ? (
        // No categories at all — show inline form if showNewCat, else empty state
        showNewCat ? null : <EmptyCategories onAdd={() => setShowNewCat(true)} />
      ) : searchQuery && filteredProducts.length === 0 ? (
        // Search empty state
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: "8px",
            color: "var(--text-muted)",
          }}
        >
          <Search style={{ width: 36, height: 36, opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>No products match your search.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* ── ⭐ Starred Products (virtual CRM-only category) ──────────── */}
          {starredProducts.length > 0 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid #f59e0b44",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "rgba(245,158,11,0.07)",
                  borderBottom: "1px solid #f59e0b33",
                }}
              >
                <Star style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0 }} fill="#f59e0b" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", flex: 1 }}>
                  Starred Products
                </span>
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "99px",
                  background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-3)",
                }}>
                  {starredProducts.length}
                </span>
                <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 500, marginLeft: "4px" }}>
                  CRM only — not a public category
                </span>
              </div>
              {/* Products */}
              {starredProducts.map((product, idx) => (
                <div key={product._id} style={{ borderBottom: idx < starredProducts.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <ProductRow
                    product={product}
                    onEdit={() => openEdit(product)}
                    onDelete={() => setDeleteConfirmId(product._id)}
                    onToggleVisible={() => toggleField(product, "visible", `/v2/products/${product._id}/visibility`)}
                    onToggleStar={() => toggleField(product, "isStarred", `/v2/products/${product._id}/starred`)}
                    onToggleFeatured={() => toggleField(product, "isFeatured", `/v2/products/${product._id}/featured`)}
                    onToggleHidePrice={() => toggleField(product, "hidePrice", `/v2/products/${product._id}`, { hidePrice: !product.hidePrice })}
                  />
                  {deleteConfirmId === product._id && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--err-bg)", borderLeft: "3px solid var(--err-t)" }}>
                      <p style={{ fontSize: "13px", color: "var(--err-t)", flex: 1 }}>Delete <strong>{product.name}</strong>?</p>
                      <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                      <button className="crm-btn crm-btn-sm" style={{ background: "#dc2626", color: "#fff", border: "none" }} disabled={deleting} onClick={() => handleDeleteProduct(product._id)}>
                        {deleting ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Regular category accordions with drag-to-reorder ─────────── */}
          {allCategoryKeys.map((catName) => {
            const catProducts = grouped[catName] ?? [];
            const catInfo = categories.find((c) => c.name === catName);
            const isExpanded = expanded[catName] === true; // default closed
            const isDragOverCat = dragOverCatName === catName;

            return (
              <div
                key={catName}
                draggable
                onDragStart={() => onCatDragStart(catName)}
                onDragOver={(e) => onCatDragOver(e, catName)}
                onDragLeave={onCatDragLeave}
                onDrop={(e) => onCatDrop(e, catName)}
                style={{
                  transition: "transform 150ms ease, opacity 150ms ease",
                  transform: isDragOverCat ? "scale(1.01)" : "scale(1)",
                  opacity: isDragOverCat ? 0.85 : 1,
                  outline: isDragOverCat ? "2px dashed var(--brand)" : "none",
                  outlineOffset: "2px",
                  borderRadius: "10px",
                }}
              >
                <CategoryAccordion
                  catName={catName}
                  catInfo={catInfo}
                  products={catProducts}
                  isExpanded={isExpanded}
                  deleteConfirmId={deleteConfirmId}
                  deleting={deleting}
                  dragOverId={dragOverId}
                  onToggleExpand={() =>
                    setExpanded((prev) => ({ ...prev, [catName]: !isExpanded }))
                  }
                  onToggleCatVisibility={
                    catInfo ? () => toggleCatVisibility(catInfo) : undefined
                  }
                  onDeleteCategory={
                    catInfo ? () => handleDeleteCategory(catInfo) : undefined
                  }
                  onAddProduct={() => openCreate(catName)}
                  onEditProduct={openEdit}
                  onDeleteProduct={(id) => setDeleteConfirmId(id)}
                  onDeleteConfirm={handleDeleteProduct}
                  onDeleteCancel={() => setDeleteConfirmId(null)}
                  onToggleVisible={(p) =>
                    toggleField(p, "visible", `/v2/products/${p._id}/visibility`)
                  }
                  onToggleStar={(p) =>
                    toggleField(p, "isStarred", `/v2/products/${p._id}/starred`)
                  }
                  onToggleFeatured={(p) =>
                    toggleField(p, "isFeatured", `/v2/products/${p._id}/featured`)
                  }
                  onToggleHidePrice={(p) =>
                    toggleField(
                      p,
                      "hidePrice",
                      `/v2/products/${p._id}`,
                      { hidePrice: !p.hidePrice }
                    )
                  }
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onRenameCategory={handleRenameCategory}
                />
              </div>
            );
          })}

          {/* ── New Category inline ──────────────────────────────────────── */}
          {showNewCat ? (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Folder style={{ width: 15, height: 15, color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                className="crm-input"
                style={{ flex: 1 }}
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="New category name…"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                  if (e.key === "Escape") { setShowNewCat(false); setNewCatInput(""); }
                }}
              />
              <button
                className="crm-btn crm-btn-primary crm-btn-sm"
                disabled={creatingCat || !newCatInput.trim()}
                onClick={handleCreateCategory}
              >
                {creatingCat ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : "Create"}
              </button>
              <button
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={() => { setShowNewCat(false); setNewCatInput(""); }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCat(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-3)",
                background: "none",
                border: "1px dashed var(--border)",
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
                width: "fit-content",
                transition: "all 130ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              New Category
            </button>
          )}
        </div>
      )}

      {/* ── Product Modal ─────────────────────────────────────────────────── */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editingProduct}
        categories={categories}
        defaultCategory={defaultModalCat}
        defaultSite={activeSite}
        onSaved={() => fetchProducts()}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CategoryAccordion
// ═══════════════════════════════════════════════════════════════════════════════

function CategoryAccordion({
  catName,
  catInfo,
  products,
  isExpanded,
  deleteConfirmId,
  deleting,
  dragOverId,
  onToggleExpand,
  onToggleCatVisibility,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDeleteConfirm,
  onDeleteCancel,
  onToggleVisible,
  onToggleStar,
  onToggleFeatured,
  onToggleHidePrice,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRenameCategory,
}: {
  catName: string;
  catInfo?: Category;
  products: Product[];
  isExpanded: boolean;
  deleteConfirmId: string | null;
  deleting: boolean;
  dragOverId: string | null;
  onToggleExpand: () => void;
  onToggleCatVisibility?: () => void;
  onDeleteCategory?: () => void;
  onAddProduct: () => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
  onToggleVisible: (p: Product) => void;
  onToggleStar: (p: Product) => void;
  onToggleFeatured: (p: Product) => void;
  onToggleHidePrice: (p: Product) => void;
  onDragStart: (id: string, cat: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string, cat: string) => void;
  onRenameCategory?: (catId: string, newName: string) => Promise<void>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(catName);
  const [savingRename, setSavingRename] = useState(false);

  async function doRename() {
    const trimmed = renameVal.trim();
    if (!trimmed || trimmed === catName || !catInfo || !onRenameCategory) {
      setRenaming(false);
      setRenameVal(catName);
      return;
    }
    setSavingRename(true);
    await onRenameCategory(catInfo._id, trimmed);
    setSavingRename(false);
    setRenaming(false);
  }

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Category header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          background: "var(--bg-inset)",
          borderBottom: isExpanded ? "1px solid var(--border)" : "none",
          cursor: "pointer",
        }}
        onClick={onToggleExpand}
      >
        {/* Folder icon */}
        <span style={{ color: "var(--brand)", flexShrink: 0 }}>
          {isExpanded ? (
            <FolderOpen style={{ width: 16, height: 16 }} />
          ) : (
            <Folder style={{ width: 16, height: 16 }} />
          )}
        </span>

        {/* Name — or inline rename input */}
        {renaming ? (
          <div
            style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              className="crm-input"
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              autoFocus
              style={{ flex: 1, padding: "4px 8px", fontSize: "13px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") doRename();
                if (e.key === "Escape") { setRenaming(false); setRenameVal(catName); }
              }}
            />
            <button
              className="crm-btn crm-btn-primary crm-btn-sm"
              disabled={savingRename}
              onClick={doRename}
            >
              {savingRename ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} /> : "Save"}
            </button>
            <button
              className="crm-btn crm-btn-ghost crm-btn-sm"
              onClick={() => { setRenaming(false); setRenameVal(catName); }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text)",
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {catName}
            </span>
          </>
        )}

        {/* Count badge — total + hidden indicator */}
        {(() => {
          const hiddenCount = products.filter((p) => !p.visible).length;
          return (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "99px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-3)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {products.length}
              {hiddenCount > 0 && (
                <span
                  title={`${hiddenCount} hidden`}
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: "99px",
                    background: "var(--warn-bg)",
                    border: "1px solid var(--warn-b)",
                    color: "var(--warn-t)",
                  }}
                >
                  {hiddenCount} hidden
                </span>
              )}
            </span>
          );
        })()}

        {/* Category controls — stop propagation so clicks don't toggle */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visibility toggle */}
          {catInfo && onToggleCatVisibility && (
            <button
              title={catInfo.visible ? "Hide category" : "Show category"}
              onClick={onToggleCatVisibility}
              style={{
                padding: "4px 8px",
                borderRadius: "5px",
                fontSize: "11px",
                fontWeight: 600,
                border: `1px solid ${catInfo.visible ? "var(--ok-b)" : "var(--border)"}`,
                background: catInfo.visible ? "var(--ok-bg)" : "var(--bg-surface)",
                color: catInfo.visible ? "var(--ok-t)" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {catInfo.visible ? (
                <><Eye style={{ width: 12, height: 12 }} />Live</>
              ) : (
                <><EyeOff style={{ width: 12, height: 12 }} />Hidden</>
              )}
            </button>
          )}

          {/* Add product to this category */}
          <button
            title="Add product to this category"
            onClick={onAddProduct}
            style={{
              padding: "4px",
              borderRadius: "5px",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--brand)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
            }
          >
            <Plus style={{ width: 14, height: 14 }} />
          </button>

          {/* Rename category */}
          {catInfo && (
            <button
              title="Rename category"
              onClick={() => { setRenaming(true); setRenameVal(catName); }}
              style={{
                padding: "4px 6px",
                borderRadius: "5px",
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
              }}
            >
              <Pencil style={{ width: 11, height: 11 }} />
              Rename
            </button>
          )}

          {/* Delete category */}
          {catInfo && onDeleteCategory && (
            <button
              title="Delete category"
              onClick={onDeleteCategory}
              style={{
                padding: "4px",
                borderRadius: "5px",
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--err-t)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
              }
            >
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>

        {/* Expand indicator */}
        <span style={{ color: "var(--text-muted)", flexShrink: 0, marginLeft: "2px" }}>
          {isExpanded ? (
            <ChevronDown style={{ width: 14, height: 14 }} />
          ) : (
            <ChevronRight style={{ width: 14, height: 14 }} />
          )}
        </span>
      </div>

      {/* Product rows */}
      {isExpanded && (
        <div>
          {products.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              <Package
                style={{
                  width: 32,
                  height: 32,
                  margin: "0 auto 8px",
                  opacity: 0.4,
                }}
              />
              <p>No products in this category.</p>
              <button
                onClick={onAddProduct}
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--brand)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Add product
              </button>
            </div>
          ) : (
            products.map((product, idx) => {
              const isLast = idx === products.length - 1;
              const showDelete = deleteConfirmId === product._id;
              const isDragOver = dragOverId === product._id;

              return (
                <div
                  key={product._id}
                  draggable
                  onDragStart={() => onDragStart(product._id, catName)}
                  onDragOver={(e) => onDragOver(e, product._id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, product._id, catName)}
                  style={{
                    borderBottom: isLast ? "none" : "1px solid var(--border)",
                    background: isDragOver ? "var(--brand-soft)" : "transparent",
                    transition: "background 120ms",
                  }}
                >
                  {showDelete ? (
                    /* ── Inline delete confirm ─────────────────────────── */
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        background: "var(--err-bg)",
                        borderLeft: "3px solid var(--err-t)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--err-t)",
                          flex: 1,
                        }}
                      >
                        Delete{" "}
                        <strong>{product.name}</strong>?
                      </p>
                      <button
                        className="crm-btn crm-btn-secondary crm-btn-sm"
                        onClick={onDeleteCancel}
                      >
                        Cancel
                      </button>
                      <button
                        className="crm-btn crm-btn-sm"
                        style={{ background: "#dc2626", color: "#fff", border: "none" }}
                        disabled={deleting}
                        onClick={() => onDeleteConfirm(product._id)}
                      >
                        {deleting ? (
                          <Loader2
                            className="animate-spin"
                            style={{ width: 13, height: 13 }}
                          />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  ) : (
                    /* ── Normal product row ────────────────────────────── */
                    <ProductRow
                      product={product}
                      onEdit={() => onEditProduct(product)}
                      onDelete={() => onDeleteProduct(product._id)}
                      onToggleVisible={() => onToggleVisible(product)}
                      onToggleStar={() => onToggleStar(product)}
                      onToggleFeatured={() => onToggleFeatured(product)}
                      onToggleHidePrice={() => onToggleHidePrice(product)}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ProductRow
// ═══════════════════════════════════════════════════════════════════════════════

function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleVisible,
  onToggleStar,
  onToggleFeatured,
  onToggleHidePrice,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
  onToggleStar: () => void;
  onToggleFeatured: () => void;
  onToggleHidePrice: () => void;
}) {
  const thumb = product.images?.[0]?.secure_url;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 14px",
      }}
    >
      {/* Drag handle */}
      <GripVertical
        style={{
          width: 14,
          height: 14,
          color: "var(--text-muted)",
          flexShrink: 0,
          cursor: "grab",
        }}
      />

      {/* Thumbnail */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "6px",
          overflow: "hidden",
          background: "var(--bg-inset)",
          border: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Package style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
        )}
      </div>

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </p>
        {!product.hidePrice && product.price && (
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "1px" }}>
            {product.price}
            {product.priceUnit ? ` / ${product.priceUnit}` : ""}
          </p>
        )}
      </div>

      {/* Status badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        {/* Visible */}
        <button
          onClick={onToggleVisible}
          title={product.visible ? "Click to hide" : "Click to show"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            padding: "2px 7px",
            borderRadius: "99px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            border: `1px solid ${
              product.visible ? "var(--ok-b)" : "var(--border)"
            }`,
            background: product.visible ? "var(--ok-bg)" : "var(--bg-inset)",
            color: product.visible ? "var(--ok-t)" : "var(--text-muted)",
          }}
        >
          {product.visible ? (
            <><Eye style={{ width: 10, height: 10 }} />Live</>
          ) : (
            <><EyeOff style={{ width: 10, height: 10 }} />Hidden</>
          )}
        </button>

        {/* Star */}
        <button
          onClick={onToggleStar}
          title={product.isStarred ? "Unstar" : "Star"}
          style={{
            padding: "4px",
            borderRadius: "5px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: product.isStarred ? "#f59e0b" : "var(--text-muted)",
          }}
        >
          <Star
            style={{ width: 14, height: 14 }}
            fill={product.isStarred ? "currentColor" : "none"}
          />
        </button>

        {/* Featured */}
        <button
          onClick={onToggleFeatured}
          title={product.isFeatured ? "Unfeature" : "Feature"}
          style={{
            padding: "4px",
            borderRadius: "5px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: product.isFeatured ? "#f97316" : "var(--text-muted)",
          }}
        >
          <Zap
            style={{ width: 14, height: 14 }}
            fill={product.isFeatured ? "currentColor" : "none"}
          />
        </button>

        {/* Hide price toggle */}
        <button
          onClick={onToggleHidePrice}
          title={product.hidePrice ? "Price hidden — click to show" : "Price shown — click to hide"}
          style={{
            padding: "4px",
            borderRadius: "5px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: product.hidePrice ? "var(--text-3)" : "var(--text-muted)",
          }}
        >
          {product.hidePrice ? (
            <EyeOff style={{ width: 14, height: 14 }} />
          ) : (
            <Eye style={{ width: 14, height: 14 }} />
          )}
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Edit"
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "var(--text)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
          }
        >
          <Pencil style={{ width: 13, height: 13 }} />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete"
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--err-t)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--err-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Empty / Skeleton helpers
// ═══════════════════════════════════════════════════════════════════════════════

function SkeletonList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {/* Category header skeleton */}
          <div
            style={{
              height: "42px",
              background: "var(--bg-inset)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: 120,
                height: 14,
                borderRadius: 6,
                background: "var(--border)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
          {/* Rows */}
          {[1, 2].map((j) => (
            <div
              key={j}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: "var(--bg-inset)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  width: `${140 + j * 30}px`,
                  height: 13,
                  borderRadius: 5,
                  background: "var(--border)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyCategories({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "10px",
        color: "var(--text-muted)",
      }}
    >
      <Folder style={{ width: 40, height: 40, opacity: 0.4 }} />
      <p style={{ fontSize: 14, fontWeight: 600 }}>No categories yet</p>
      <p style={{ fontSize: 13 }}>Create one to start adding products.</p>
      <button className="crm-btn crm-btn-primary" onClick={onAdd}>
        <Plus style={{ width: 14, height: 14 }} />
        Create Category
      </button>
    </div>
  );
}
