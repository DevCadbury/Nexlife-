"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  ChevronRight,
  Loader2,
  Plus,
  X,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  _id: string;
  name: string;
  siteContext: string;
}

interface DynamicField {
  key: string;
  value: string;
  hidden: boolean;
}

interface ProductImage {
  secure_url: string;
  public_id: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  siteContext: string;
  price?: string;
  priceUnit?: string;
  hidePrice: boolean;
  isFeatured: boolean;
  isStarred: boolean;
  visible: boolean;
  images: ProductImage[];
  fields?: DynamicField[];
}

type SiteContext = "Surgical" | "General" | "Both";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  active,
  onToggle,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`crm-toggle ${active ? "active" : ""}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? "var(--brand)" : "var(--text-muted)" }}
      />
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { success, error: toastError } = useToast();

  // ── Loading state ──────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [siteContext, setSiteContext] = useState<SiteContext | "">("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [visible, setVisible] = useState(true);

  // Existing images
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  // New image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic fields
  const [fields, setFields] = useState<DynamicField[]>([]);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Fetch product + categories on mount ────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Load categories and all products in parallel
        const [catRes, productsRes] = await Promise.all([
          api.get("/v2/categories/admin/all"),
          api.get("/v2/products/admin/all"),
        ]);

        const cats: Category[] = catRes.data?.items ?? catRes.data?.categories ?? [];
        setCategories(cats);
        setCatLoading(false);

        const all: Product[] = productsRes.data?.items ?? productsRes.data?.products ?? [];
        const product = all.find((p) => p._id === id);

        if (!product) {
          setPageError("Product not found.");
          return;
        }

        // Pre-fill form
        setName(product.name);
        setCategory(product.category);
        // normalise siteContext to title-case
        const sc = product.siteContext;
        const normalised = sc.charAt(0).toUpperCase() + sc.slice(1).toLowerCase();
        if (["Surgical", "General", "Both"].includes(normalised)) {
          setSiteContext(normalised as SiteContext);
        } else {
          setSiteContext(sc as SiteContext);
        }
        setPrice(product.price ?? "");
        setPriceUnit(product.priceUnit ?? "");
        setShowPrice(!product.hidePrice);
        setIsFeatured(product.isFeatured);
        setIsStarred(product.isStarred);
        setVisible(product.visible);
        setExistingImages(product.images ?? []);
        setFields(product.fields ?? []);
      } catch {
        setPageError("Failed to load product data.");
      } finally {
        setPageLoading(false);
      }
    }
    if (id) load();
  }, [id, toastError]);

  // ── Image handling ─────────────────────────────────────────────────────────
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageError("");
    if (!file) { setImageFile(null); setImagePreview(null); return; }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setImageError("Only JPEG, PNG, WebP, or GIF images are allowed.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image must be 10 MB or smaller.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ── Dynamic fields helpers ─────────────────────────────────────────────────
  function addField() {
    setFields((prev) => [...prev, { key: "", value: "", hidden: false }]);
  }

  function updateField(index: number, patch: Partial<DynamicField>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!name.trim()) { setSubmitError("Product name is required."); return; }
    if (!category) { setSubmitError("Please select a category."); return; }
    if (!siteContext) { setSubmitError("Please select a site context."); return; }

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (!f.key.trim() || f.key.length > 100) {
        setSubmitError(`Field ${i + 1}: key must be 1–100 characters.`);
        return;
      }
      if (!f.value.trim() || f.value.length > 500) {
        setSubmitError(`Field ${i + 1}: value must be 1–500 characters.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", category);
      formData.append("siteContext", siteContext.toLowerCase());
      formData.append("hidePrice", String(!showPrice));
      formData.append("isFeatured", String(isFeatured));
      formData.append("isStarred", String(isStarred));
      formData.append("visible", String(visible));
      if (price.trim()) formData.append("price", price.trim());
      if (priceUnit.trim()) formData.append("priceUnit", priceUnit.trim());
      if (imageFile) formData.append("image", imageFile);
      if (fields.length > 0) {
        formData.append("fields", JSON.stringify(fields));
      }

      await api.patch(`/v2/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      success("Product updated successfully");
      router.push("/admin/products");
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to update product";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading / error state ──────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-slate-200 transition-colors">Admin</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/admin/products" className="hover:text-slate-200 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-200">Edit Product</span>
        </nav>
        <div className="bg-red-500/10 border border-red-700/40 rounded-lg px-4 py-6 text-sm text-red-400 text-center">
          {pageError}
        </div>
        <Link href="/admin/products">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            ← Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin" className="hover:text-slate-200 transition-colors">Admin</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/admin/products" className="hover:text-slate-200 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200">Edit Product</span>
      </nav>

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Edit Product</h1>
        <p className="text-sm text-slate-400 mt-0.5">Update product details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Basic Information</h2>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              Product Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              placeholder="Enter product name"
              className="w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              Category <span className="text-red-400">*</span>
            </label>
            {catLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading categories…
              </div>
            ) : (
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border-slate-700 text-slate-100"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Select>
            )}
          </div>

          {/* Site Context */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              Site Context <span className="text-red-400">*</span>
            </label>
            <Select
              value={siteContext}
              onChange={(e) => setSiteContext(e.target.value as SiteContext | "")}
              className="w-full bg-slate-900 border-slate-700 text-slate-100"
            >
              <option value="">Select context…</option>
              <option value="Surgical">Surgical</option>
              <option value="General">General</option>
              <option value="Both">Both</option>
            </Select>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Price (optional)</label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 999"
                className="w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Price Unit (optional)</label>
              <Input
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                placeholder="e.g. per unit"
                className="w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* ── Toggles ────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Visibility & Flags</h2>
          <div className="flex flex-wrap gap-2">
            <Toggle active={showPrice} onToggle={() => setShowPrice((v) => !v)} label="Show Price" />
            <Toggle active={isFeatured} onToggle={() => setIsFeatured((v) => !v)} label="Featured" />
            <Toggle active={isStarred} onToggle={() => setIsStarred((v) => !v)} label="Starred" />
            <Toggle active={visible} onToggle={() => setVisible((v) => !v)} label="Visible" />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Teal = active. &quot;Show Price&quot; enabled means price will be displayed publicly.
          </p>
        </div>

        {/* ── Image ──────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">Product Image</h2>

          {/* Existing images */}
          {existingImages.length > 0 && !imagePreview && (
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Current image</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-lg border border-slate-700 overflow-hidden bg-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.secure_url}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            {/* New image preview */}
            <div
              className="flex-shrink-0 w-20 h-20 rounded-lg border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="New image preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-7 h-7 text-slate-600" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-slate-700 text-slate-300 hover:text-white text-xs"
              >
                {existingImages.length > 0 ? "Replace Image" : "Choose Image"}
              </Button>
              {imageFile && (
                <p className="text-xs text-slate-400">{imageFile.name}</p>
              )}
              <p className="text-xs text-slate-500">
                JPEG, PNG, WebP, or GIF — max 10 MB. Replaces existing image.
              </p>
              {imageError && (
                <p className="text-xs text-red-400">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Dynamic Fields ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-200">Dynamic Fields</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addField}
              className="border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-slate-500">
              No dynamic fields. Click &quot;Add Field&quot; to add custom key/value pairs.
            </p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-md p-2"
                >
                  <Input
                    value={field.key}
                    onChange={(e) => updateField(index, { key: e.target.value })}
                    placeholder="Key"
                    maxLength={100}
                    className="flex-1 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs h-8 py-1"
                  />
                  <Input
                    value={field.value}
                    onChange={(e) => updateField(index, { value: e.target.value })}
                    placeholder="Value"
                    maxLength={500}
                    className="flex-[2] bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs h-8 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateField(index, { hidden: !field.hidden })}
                    title={field.hidden ? "Hidden — click to show" : "Visible — click to hide"}
                    className={`p-1.5 rounded transition-colors ${
                      field.hidden
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-teal-400 hover:text-teal-300"
                    }`}
                  >
                    {field.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-400">
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="text-white border-none flex items-center gap-2"
            style={{ background: "#0A8A78" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
