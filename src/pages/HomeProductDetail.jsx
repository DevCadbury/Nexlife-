import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Eye,
  Calendar,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/* ── Lazy image with blur-up ── */
const LazyImage = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default function HomeProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/home-products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    fetch(`${API_URL}/home-products`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const related = (data.items || [])
            .filter((p) => p._id !== product._id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [product]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Breadcrumb ── */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1.5">
            <Link
              to="/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Product Detail ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Column */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <LazyImage
                  src={product.image?.url}
                  alt={product.name}
                  className="aspect-square"
                />
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="space-y-6">
            {/* Category badge */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Tag className="w-3 h-3" />
                {product.category}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {product.views > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {product.views.toLocaleString()} views
                </span>
              )}
              {product.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* Labels / Product Details */}
            {product.labels?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Product Details
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-200 dark:divide-gray-800">
                  {product.labels.map((label, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 px-4 py-3 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition"
                    >
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px] shrink-0">
                        {label.key}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {label.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Inquire About This Product
                <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              More Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/home-product/${item._id}`)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center p-3">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    )}
                  </div>
                  <div className="px-3 py-2.5">
                    {item.category && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 block truncate">
                        {item.category}
                      </span>
                    )}
                    <p className="text-xs text-gray-700 dark:text-gray-200 font-medium mt-0.5 line-clamp-2 capitalize">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
