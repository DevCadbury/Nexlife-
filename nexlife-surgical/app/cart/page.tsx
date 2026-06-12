"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Send, Download, X, Mail } from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────

function resolveImageUrl(img: any): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img?.secure_url ?? img?.url ?? "";
}

function stripId(name: string): string {
  return name.replace(/^[a-f0-9]{24}/i, "").trim() || name;
}

// ── Download-email modal ───────────────────────────────────────────────────────

interface DownloadModalProps {
  onConfirm: (email: string, name: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

function DownloadEmailModal({ onConfirm, onSkip, onClose }: DownloadModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(10,138,120,0.12)" }}>
              <Mail size={16} className="text-[#0A8A78]" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#0D2240]">Download Quote PDF</div>
              <div className="text-[11px] text-slate-400">Get a copy sent to your inbox</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Enter your email to receive a copy and stay updated on pricing. We&apos;ll never spam you.
          </p>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors"
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email.includes("@") && onConfirm(email, name)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={() => email.includes("@") && onConfirm(email, name)}
            disabled={!email.includes("@")}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "#0A8A78" }}
          >
            Download &amp; Subscribe
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 rounded-lg text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Download without email
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteRefId, setQuoteRefId] = useState("");

  // Prevent SSR/hydration mismatch — cart reads from localStorage which only exists client-side
  useEffect(() => { setMounted(true); }, []);

  // ── PDF generation ──────────────────────────────────────────────────────────

  function buildAndPrintPDF(downloaderEmail?: string, downloaderName?: string) {
    const frontendBase = typeof window !== "undefined" ? window.location.origin : "https://www.nexlifeinternational.in";
    const logoUrl = `${frontendBase}/images/nexlife-logo.png`;

    const customerName = downloaderName || formData.name || "";
    const customerEmail = downloaderEmail || formData.email || "";

    const itemRows = cart.map((item) => {
      const rawName = stripId(item.name);
      const rawPrice = item.price ?? "";
      const numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
      const hasPrice = rawPrice && !isNaN(numericPrice) && numericPrice > 0;
      const lineTotal = hasPrice ? `$${(numericPrice * item.quantity).toFixed(2)}` : "–";
      const unitPrice = hasPrice ? `$${numericPrice.toFixed(2)}` : "Contact for pricing";

      const imgUrl = resolveImageUrl(item.images?.[0]);
      const slug = (item as any).slug;
      const nameSlug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const resolvedSlug = slug || nameSlug || (item as any)._id || item.id;
      const productUrl = `${frontendBase}/product/${resolvedSlug}`;
      const rawCat = (item as any).category ?? "";
      const displayCat = /^[a-f0-9]{24}$/i.test(rawCat) ? "" : rawCat;

      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" alt="${rawName}" width="56" height="56" style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid #E2E8F0;display:block" />`
        : `<div style="width:56px;height:56px;border-radius:6px;background:#F1F5F9;border:1px solid #E2E8F0;display:block"></div>`;

      return `
        <tr style="border-bottom:1px solid #E8EEF4;vertical-align:top">
          <td style="padding:10px 14px">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:top;padding-right:12px">${imgHtml}</td>
              <td style="vertical-align:top">
                <a href="${productUrl}" style="color:#0D2240;font-size:13px;font-weight:600;text-decoration:none;display:block;margin-bottom:2px" target="_blank">${rawName}</a>
                ${displayCat ? `<div style="font-size:10px;color:#94A3B8;margin-bottom:2px">${displayCat}</div>` : ""}
                <div style="font-size:11px;color:#0A8A78;font-weight:600">${unitPrice}${(item as any).priceUnit ? ` / ${(item as any).priceUnit}` : ""}</div>
              </td>
            </tr></table>
          </td>
          <td style="padding:10px;text-align:center;color:#64748B;font-size:13px;vertical-align:middle">${item.quantity}</td>
          <td style="padding:10px;text-align:right;font-weight:700;color:#0D2240;font-size:13px;vertical-align:middle">${lineTotal}</td>
        </tr>`;
    }).join("");

    const totalStr = getCartTotal() > 0 ? `$${getCartTotal().toFixed(2)}` : "To be quoted";
    const printId = `nxl-cart-quote-${Date.now()}`;
    const refNo = `NXL-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const html = `
<div id="${printId}" style="display:none">
  <style>
    @media print {
      body > *:not(#${printId}) { display:none !important; }
      #${printId} { display:block !important; }
      @page { margin:14mm; size:A4 portrait; }
      html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
    #${printId}, #${printId} * { box-sizing:border-box; font-family:Arial,Helvetica,sans-serif; }
  </style>

  <!-- Header -->
  <div style="background:#fff;padding:18px 28px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0A8A78">
    <div>
      <img src="${logoUrl}" alt="Nexlife International" style="height:44px;width:auto;display:block" onerror="this.style.display='none'" />
      <div style="font-size:9px;color:#6B8EA0;text-transform:uppercase;letter-spacing:0.09em;margin-top:4px">Global Healthcare Solutions</div>
    </div>
    <div style="text-align:right">
      <div style="background:#0D2240;color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:3px;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:5px;display:inline-block">Quote Request</div>
      <div style="font-size:10px;color:#64748B">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div style="font-size:10px;color:#94A3B8;font-family:monospace;margin-top:2px">${refNo}</div>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,#0A8A78,#0D2240);margin-bottom:22px"></div>

  ${customerName || customerEmail ? `
  <div style="background:#F8FAFB;border:1px solid #E2E8F0;border-radius:8px;padding:14px 18px;margin-bottom:18px">
    <div style="font-size:10px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.09em;margin-bottom:9px">Customer Information</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${customerName ? `<td style="padding:3px 0;font-size:12px;color:#374151;width:50%"><strong style="color:#0D2240">Name:</strong> ${customerName}</td>` : "<td></td>"}
        ${customerEmail ? `<td style="padding:3px 0;font-size:12px;color:#374151"><strong style="color:#0D2240">Email:</strong> <a href="mailto:${customerEmail}" style="color:#0A8A78">${customerEmail}</a></td>` : "<td></td>"}
      </tr>
      <tr>
        ${formData.company ? `<td style="padding:3px 0;font-size:12px;color:#374151"><strong style="color:#0D2240">Company:</strong> ${formData.company}</td>` : "<td></td>"}
        ${formData.phone ? `<td style="padding:3px 0;font-size:12px;color:#374151"><strong style="color:#0D2240">Phone:</strong> ${formData.phone}</td>` : "<td></td>"}
      </tr>
    </table>
  </div>` : ""}

  <div style="font-size:10px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.09em;margin-bottom:9px">Products Requested</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E2E8F0;margin-bottom:18px">
    <thead>
      <tr style="background:#0D2240">
        <th style="padding:9px 14px;text-align:left;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:0.07em">Product</th>
        <th style="padding:9px 14px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:0.07em;width:70px">Qty</th>
        <th style="padding:9px 14px;text-align:right;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:0.07em;width:110px">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr style="background:#F0FAF8;border-top:2px solid #0A8A78">
        <td colspan="2" style="padding:12px 14px;font-weight:700;color:#0D2240;font-size:13px">Estimated Total</td>
        <td style="padding:12px 14px;font-weight:800;color:#0A8A78;font-size:15px;text-align:right">${totalStr}</td>
      </tr>
    </tfoot>
  </table>

  ${formData.message ? `
  <div style="border:1px solid #E2E8F0;overflow:hidden;margin-bottom:18px">
    <div style="background:#F7F8FA;padding:8px 14px;font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid #E2E8F0">Notes</div>
    <div style="padding:12px 14px;font-size:12px;color:#374151;line-height:1.7;white-space:pre-wrap">${formData.message}</div>
  </div>` : ""}

  <div style="border-top:2px solid #0A8A78;padding-top:12px;text-align:center">
    <div style="font-size:10px;color:#94A3B8;line-height:1.9">
      S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101 (Gujarat, India)<br/>
      <a href="mailto:info@nexlifeinternational.com" style="color:#0A8A78;font-weight:600;text-decoration:none">info@nexlifeinternational.com</a>
      &nbsp;·&nbsp; +91 96648 43790 &nbsp;·&nbsp; +91 84015 46910<br/>
      Ref: <strong>${refNo}</strong>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML("beforeend", html);
    window.print();
    setTimeout(() => { const el = document.getElementById(printId); if (el) el.remove(); }, 5000);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleDownloadClick() {
    // If user already filled the quote form, skip the modal
    if (formData.email) {
      buildAndPrintPDF(formData.email, formData.name);
      trackDownload(formData.email, formData.name);
    } else {
      setShowDownloadModal(true);
    }
  }

  function handleDownloadWithEmail(email: string, name: string) {
    setShowDownloadModal(false);
    buildAndPrintPDF(email, name);
    trackDownload(email, name);
  }

  function handleDownloadSkip() {
    setShowDownloadModal(false);
    buildAndPrintPDF();
  }

  async function trackDownload(email: string, name: string) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      // Pass cart items so backend can store them and show in CRM downloads tab
      const cartItemsPayload = cart.map((item) => ({
        name: stripId(item.name),
        qty: item.quantity,
      }));
      await fetch(`${backendUrl}/api/v2/quotes/track-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          referenceId: quoteRefId || undefined,
          cartItems: cartItemsPayload,
        }),
      });
    } catch {
      // non-critical — ignore errors
    }
  }

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const productNames = cart.map((item) => stripId(item.name)).join(", ");
      const res = await fetch(`${backendUrl}/api/v2/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          productName: productNames,
          quantity: String(cart.reduce((acc, item) => acc + item.quantity, 0)),
          unit: "units",
          message: `Cart items:\n${cart.map((item, i) => `${i + 1}. ${stripId(item.name)} (qty: ${item.quantity})`).join("\n")}\n\nAdditional notes:\n${formData.message || "None"}`,
          source: "surgical-cart",
        }),
      });
      const data = await res.json();
      if (data.referenceId) setQuoteRefId(data.referenceId);
      setQuoteSubmitted(true);
    } catch {
      const emailBody = `Quote Request\n\nProducts: ${cart.map((item) => item.name).join(", ")}\n\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
      window.location.href = `mailto:Info@nexlifeinternational.com?subject=Quote Request&body=${encodeURIComponent(emailBody)}`;
    }
  };

  // ── Empty cart state ───────────────────────────────────────────────────────

  // Show skeleton until mounted — avoids SSR/client mismatch (cart reads from localStorage)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#0A8A78] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(10,138,120,0.1)" }}>
            <ShoppingBag size={48} className="text-[#0A8A78]" />
          </div>
          <h1 className="text-2xl text-[#0D2240] mb-3" style={{ fontWeight: 700 }}>Your Cart is Empty</h1>
          <p className="text-slate-500 mb-6">Browse our catalog and add products to get started with your quote request.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:shadow-lg active:scale-95" style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}>
            <ShoppingBag size={18} />Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Download email modal */}
      {showDownloadModal && (
        <DownloadEmailModal
          onConfirm={handleDownloadWithEmail}
          onSkip={handleDownloadSkip}
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[#0A8A78] hover:underline mb-4">
            <ArrowLeft size={16} />Continue Shopping
          </Link>
          <h1 className="text-[#0D2240] text-3xl" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Shopping Cart</h1>
          <p className="text-slate-500 mt-2">Review your items and request a quote</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const imageUrl = resolveImageUrl(item.images?.[0]);
              const displayName = stripId(item.name);
              const rawPrice = item.price ?? "";
              const numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
              const hasPrice = rawPrice && !isNaN(numericPrice) && numericPrice > 0;

              return (
                <div key={item.id} className="bg-white rounded-lg border border-[#E2E8F0] p-5 transition-shadow hover:shadow-md">
                  <div className="flex gap-4">
                    {/* Product image */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#F7F8FA] border border-[#E2E8F0]">
                      {imageUrl ? (
                        // Use plain <img> to avoid Next.js domain restrictions for dynamic Cloudinary URLs
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={24} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {item.category && !/^[a-f0-9]{24}$/i.test(item.category) && (
                            <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 500 }}>{item.category}</p>
                          )}
                          <h3 className="text-[#0D2240] mb-1" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{displayName}</h3>
                          {item.priceUnit && <p className="text-sm text-slate-500">{item.priceUnit}</p>}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove item">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded flex items-center justify-center border border-[#E2E8F0] text-slate-600 hover:border-[#0A8A78] hover:text-[#0A8A78] transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="text-[#0D2240] w-12 text-center" style={{ fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded flex items-center justify-center border border-[#E2E8F0] text-slate-600 hover:border-[#0A8A78] hover:text-[#0A8A78] transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          {hasPrice ? (
                            <>
                              <div className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>${(numericPrice * item.quantity).toFixed(2)}</div>
                              <div className="text-xs text-slate-400">${numericPrice.toFixed(2)} each</div>
                            </>
                          ) : (
                            <div className="text-sm text-slate-500 italic">Contact for pricing</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={clearCart} className="w-full py-3 rounded-lg text-sm text-red-600 border-2 border-red-200 hover:bg-red-50 transition-colors" style={{ fontWeight: 600 }}>
              Clear All Items
            </button>
          </div>

          {/* Sidebar: Summary + Quote Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 sticky top-24">
              <h2 className="text-[#0D2240] text-lg mb-4" style={{ fontWeight: 700 }}>Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-[#E2E8F0]">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Items ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span className="text-[#0D2240]" style={{ fontWeight: 600 }}>
                    {getCartTotal() > 0 ? `$${getCartTotal().toFixed(2)}` : "Contact for pricing"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-500 text-xs">Calculated on quote</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Estimated Total</span>
                <span className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {getCartTotal() > 0 ? `$${getCartTotal().toFixed(2)}` : "TBD"}
                </span>
              </div>

              {/* Quote form / submit */}
              {!showQuoteForm ? (
                <button onClick={() => setShowQuoteForm(true)} className="w-full py-3 rounded-lg text-white transition-all hover:shadow-lg active:scale-95 mb-3" style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}>
                  Request Quote
                </button>
              ) : quoteSubmitted ? (
                <div className="text-center py-4 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "rgba(10,138,120,0.12)" }}>
                    <Send size={20} className="text-[#0A8A78]" />
                  </div>
                  <p className="text-[#0D2240] font-semibold text-sm mb-1">Quote Submitted!</p>
                  {quoteRefId && <p className="text-xs text-slate-500 font-mono mb-2">{quoteRefId}</p>}
                  <p className="text-xs text-slate-500">Check your email for confirmation.</p>
                </div>
              ) : (
                <form onSubmit={handleSendQuote} className="space-y-3 mb-3">
                  <input type="text" placeholder="Your Name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors" />
                  <input type="email" placeholder="Email Address *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors" />
                  <input type="text" placeholder="Company Name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors" />
                  <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors" />
                  <textarea placeholder="Additional requirements or notes..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] transition-colors resize-none" />
                  <button type="submit" className="w-full py-3 rounded-lg text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95" style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}>
                    <Send size={18} />Send Quote Request
                  </button>
                </form>
              )}

              {/* Download PDF button */}
              <button
                onClick={handleDownloadClick}
                className="w-full py-3 rounded-lg text-[#0D2240] border-2 border-[#E2E8F0] hover:border-[#0A8A78] hover:text-[#0A8A78] flex items-center justify-center gap-2 transition-all"
                style={{ fontWeight: 600 }}
              >
                <Download size={18} />
                Download / Print Quote PDF
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Our team will respond within 24 hours with detailed pricing and shipping information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
