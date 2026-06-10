"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  ChevronRight,
  Loader2,
  Star,
  Package,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage {
  secure_url: string;
  public_id: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  siteContext: string;
  images: ProductImage[];
  isStarred: boolean;
  sequence: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StarredProductsPage() {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [unstarring, setUnstarring] = useState<Record<string, boolean>>({});
  const [reordering, setReordering] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStarred = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/v2/products/admin/all");
      const all: Product[] = res.data?.items ?? res.data?.products ?? [];
      const starred = all
        .filter((p) => p.isStarred)
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
      setProducts(starred);
    } catch {
      toastError("Failed to load starred products");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { fetchStarred(); }, [fetchStarred]);

  // ── Unstar ─────────────────────────────────────────────────────────────────
  async function handleUnstar(product: Product) {
    setUnstarring((prev) => ({ ...prev, [product._id]: true }));
    // Optimistic remove
    setProducts((prev) => prev.filter((p) => p._id !== product._id));
    try {
      await api.patch(`/v2/products/${product._id}/starred`);
      success(`"${product.name}" unstarred`);
    } catch (err: any) {
      // Revert
      setProducts((prev) => {
        const reverted = [...prev, product].sort(
          (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)
        );
        return reverted;
      });
      toastError(err?.response?.data?.error ?? "Failed to unstar product");
    } finally {
      setUnstarring((prev) => ({ ...prev, [product._id]: false }));
    }
  }

  // ── Reorder (move up / move down) ─────────────────────────────────────────
  function moveItem(index: number, direction: "up" | "down") {
    const newProducts = [...products];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;
    [newProducts[index], newProducts[targetIndex]] = [
      newProducts[targetIndex],
      newProducts[index],
    ];
    setProducts(newProducts);
  }

  async function saveOrder() {
    setReordering(true);
    try {
      const payload = products.map((p, i) => ({ id: p._id, sequence: i + 1 }));
      await api.post("/v2/products/reorder", { products: payload });
      success("Order saved");
      fetchStarred();
    } catch (err: any) {
      toastError(err?.response?.data?.error ?? "Failed to save order");
    } finally {
      setReordering(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin" className="hover:text-slate-200 transition-colors">Admin</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/admin/products" className="hover:text-slate-200 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200">Starred</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
            Starred Products
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage products that appear in the starred section
          </p>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 1 && (
            <Button
              onClick={saveOrder}
              disabled={reordering}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Save Order
            </Button>
          )}
          <Link href="/admin/products/new">
            <Button
              size="sm"
              className="text-white border-none text-xs flex items-center gap-1.5"
              style={{ background: "#0A8A78" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Star className="w-10 h-10 text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No starred products yet.</p>
          <p className="text-xs text-slate-500">
            Star products from the Product Manager.
          </p>
          <Link href="/admin/products">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:text-white text-xs mt-1"
            >
              Go to Product Manager
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => {
            const thumb = product.images?.[0]?.secure_url;
            return (
              <div
                key={product._id}
                className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="w-full h-36 bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-slate-600" />
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 mr-auto">
                      #{index + 1}
                    </span>
                    <button
                      disabled={index === 0}
                      onClick={() => moveItem(index, "up")}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === products.length - 1}
                      onClick={() => moveItem(index, "down")}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unstar button */}
                  <Button
                    onClick={() => handleUnstar(product)}
                    disabled={unstarring[product._id]}
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-700/40 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 text-xs flex items-center justify-center gap-1.5"
                  >
                    {unstarring[product._id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Star className="w-3.5 h-3.5" fill="currentColor" />
                    )}
                    Unstar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
