"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import {
  FileText,
  Trash2,
  X,
  Printer,
  CheckCircle2,
  MailOpen,
  Clock,
  RefreshCw,
  Search,
  Download,
  Mail,
  User,
  Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quote {
  _id: string;
  referenceId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  productName?: string;
  productId?: string;
  quantity?: string;
  unit?: string;
  message?: string;
  status: "new" | "read" | "replied";
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface QuoteDownload {
  quoteId: string;
  referenceId: string;
  quoteName: string;
  quoteEmail: string;
  productName?: string;
  source: string;
  quoteCreatedAt: string;
  downloaderEmail: string;
  downloaderName: string;
  downloadedAt: string;
}

type StatusFilter = "all" | "new" | "read" | "replied";
type PageTab = "quotes" | "downloads";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Quote["status"] }) {
  const cfg = {
    new: { cls: "crm-badge-red", label: "New" },
    read: { cls: "crm-badge-gray", label: "Read" },
    replied: { cls: "crm-badge-green", label: "Replied" },
  };
  const { cls, label } = cfg[status] ?? cfg.read;
  return <span className={`crm-badge ${cls}`}>{label}</span>;
}

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch { return iso; }
}

function parseCartItems(message: string | undefined): { name: string; qty: number }[] {
  if (!message) return [];
  const items: { name: string; qty: number }[] = [];
  for (const line of message.split("\n")) {
    const m = line.match(/^\d+\.\s+(.+?)\s+\(qty:\s*(\d+)\)/);
    if (m) items.push({ name: m[1].trim(), qty: parseInt(m[2], 10) });
  }
  return items;
}

// ─── Print helper ─────────────────────────────────────────────────────────────

function printQuote(quote: Quote) {
  const printId = `nxl-print-${quote._id}`;
  const existing = document.getElementById(printId);
  if (existing) existing.remove();

  const isCart = quote.source === "surgical-cart";
  const cartItems = isCart ? parseCartItems(quote.message) : [];

  const infoRows = (
    [
      ["Reference Number", `<span style="font-family:monospace;font-weight:800;color:#0A8A78;font-size:14px">${quote.referenceId}</span>`],
      ["Date Received", fmtDate(quote.createdAt)],
      ["Status", quote.status.charAt(0).toUpperCase() + quote.status.slice(1)],
      ["Name", quote.name],
      ["Email", `<a href="mailto:${quote.email}" style="color:#0A8A78">${quote.email}</a>`],
      quote.company && ["Company / Hospital", quote.company],
      quote.phone && ["Phone", quote.phone],
      quote.country && ["Country", quote.country],
      !isCart && quote.productName && ["Product of Interest", quote.productName],
      !isCart && (quote.quantity || quote.unit) && ["Quantity", `${quote.quantity || ""} ${quote.unit || ""}`.trim()],
    ] as (string[] | false)[]
  ).filter(Boolean).map((row) => `
    <tr>
      <td style="padding:9px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#64748B;width:190px;vertical-align:top;font-size:12px">${(row as string[])[0]}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #E2E8F0;color:#0D2240;font-size:12px;line-height:1.5">${(row as string[])[1]}</td>
    </tr>`).join("");

  const cartRows = cartItems.map((item) => {
    const nameSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const productUrl = `https://nexlifeinternational.com/product/${nameSlug}`;
    return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:12px">
        <a href="${productUrl}" style="color:#0D2240;font-weight:600;text-decoration:none;display:block;margin-bottom:3px" target="_blank">${item.name}</a>
        <span style="font-size:10px;color:#0A8A78">${productUrl}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B;text-align:center">${item.qty}</td>
    </tr>`;
  }).join("");

  let additionalNotes = "";
  if (isCart && quote.message) {
    const m = quote.message.match(/Additional notes:\n([\s\S]*?)$/);
    const notes = m ? m[1].trim() : "";
    if (notes && notes !== "None") additionalNotes = notes;
  } else if (!isCart && quote.message) {
    additionalNotes = quote.message;
  }

  const html = `
<div id="${printId}" style="display:none">
  <style>
    @media print {
      body > *:not(#${printId}) { display:none !important; }
      #${printId} { display:block !important; }
      @page { margin:18mm; size:A4 portrait; }
    }
    #${printId} { font-family:Arial,Helvetica,sans-serif; color:#0D2240; max-width:800px; margin:0 auto; }
    #${printId} * { box-sizing:border-box; }
  </style>
  <div style="background:#fff;padding:18px 28px 14px;display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #0A8A78;margin-bottom:24px">
    <div>
      <img src="/nexlife_logo.png" alt="Nexlife International" style="height:40px;width:auto;margin-bottom:4px;display:block" onerror="this.style.display='none'" />
      <div style="font-size:9px;color:#6B8EA0;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px">Global Healthcare Solutions</div>
      <div style="font-size:10px;color:#94A3B8;margin-top:3px">info@nexlifeinternational.com · +91 96648 43790</div>
    </div>
    <div style="text-align:right">
      <div style="background:#0D2240;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:4px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px">Quote Request</div>
      <div style="font-size:10px;color:#64748B;margin-bottom:2px">Reference</div>
      <div style="font-size:18px;font-weight:800;color:#0A8A78;font-family:monospace;letter-spacing:0.06em">${quote.referenceId}</div>
      <div style="font-size:10px;color:#94A3B8;margin-top:2px">${fmtDate(quote.createdAt)}</div>
    </div>
  </div>
  <div style="font-size:11px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Customer Details</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;margin-bottom:20px"><tbody>${infoRows}</tbody></table>
  ${isCart && cartItems.length > 0 ? `
  <div style="font-size:11px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Products Requested</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;margin-bottom:20px">
    <thead><tr style="background:#F7F8FA">
      <th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E2E8F0">Product</th>
      <th style="padding:8px 14px;text-align:center;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E2E8F0">Qty</th>
    </tr></thead>
    <tbody>${cartRows}</tbody>
  </table>` : ""}
  ${additionalNotes ? `
  <div style="font-size:11px;font-weight:700;color:#0A8A78;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Message / Requirements</div>
  <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;font-size:12px;color:#374151;line-height:1.7;white-space:pre-wrap;margin-bottom:20px">${additionalNotes}</div>` : ""}
  <div style="border-top:2px solid #0A8A78;padding-top:14px;text-align:center">
    <div style="font-size:10px;color:#94A3B8;line-height:1.9">
      S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101 (Gujarat, India)<br/>
      <span style="color:#0A8A78;font-weight:700">info@nexlifeinternational.com</span> · +91 96648 43790 · +91 84015 46910<br/>
      <strong>Ref: ${quote.referenceId}</strong>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML("beforeend", html);
  window.print();
  setTimeout(() => { const el = document.getElementById(printId); if (el) el.remove(); }, 2000);
}

// ─── Quote Detail Modal ───────────────────────────────────────────────────────

function QuoteModal({
  quote, onClose, onStatusChange, onDelete, userRole,
}: {
  quote: Quote;
  onClose: () => void;
  onStatusChange: (id: string, status: Quote["status"]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  userRole?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCart = quote.source === "surgical-cart";
  const { data: productsData } = useSWR(isCart ? "/v2/products/admin/all" : null, fetcher, { revalidateOnFocus: false });
  const allProducts: any[] = productsData?.items ?? productsData?.products ?? [];

  // name → image URL map
  const productImageMap = new Map<string, string>();
  allProducts.forEach((p) => {
    const name = (p.name || "").replace(/^[a-f0-9]{24}/i, "").trim();
    const img = p.images?.[0]?.secure_url ?? "";
    if (name && img) productImageMap.set(name.toLowerCase(), img);
  });

  async function changeStatus(status: Quote["status"]) {
    setBusy(true);
    await onStatusChange(quote._id, status);
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true);
    await onDelete(quote._id);
    setBusy(false);
    onClose();
  }

  const rows: [string, string | undefined][] = [
    ["Reference ID", quote.referenceId],
    ["Full Name", quote.name],
    ["Email", quote.email],
    ["Company / Hospital", quote.company],
    ["Phone", quote.phone],
    ["Country", quote.country],
    ["Product of Interest", quote.productName],
    ["Product ID / SKU", quote.productId],
    ["Quantity", quote.quantity && quote.unit ? `${quote.quantity} ${quote.unit}` : (quote.quantity || quote.unit)],
    ["Source", quote.source],
    ["Date Received", fmtDate(quote.createdAt)],
    ["Last Updated", fmtDate(quote.updatedAt)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[92vh]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-soft)" }}>
              <FileText className="w-4 h-4" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{quote.referenceId}</div>
              <div className="text-[11px]" style={{ color: "var(--text-3)" }}>Quote Request</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={quote.status} />
            <button className="crm-icon-btn" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {rows.map(([label, value]) => value ? (
                <tr key={label}>
                  <td className="py-2 pr-3 font-semibold" style={{ color: "var(--text-3)", width: "170px", verticalAlign: "top", borderBottom: "1px solid var(--border)" }}>{label}</td>
                  <td className="py-2" style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
                    {label === "Email" ? <a href={`mailto:${value}`} style={{ color: "var(--brand)" }}>{value}</a>
                      : label === "Reference ID" ? <span className="font-mono font-bold">{value}</span>
                      : value}
                  </td>
                </tr>
              ) : null)}
            </tbody>
          </table>

          {/* Message / Cart Items */}
          {quote.message && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
                {isCart ? "Cart Items" : "Message / Requirements"}
              </div>
              {isCart ? (
                <div>
                  {parseCartItems(quote.message).length > 0 && (
                    <div className="rounded-lg overflow-hidden mb-3" style={{ border: "1px solid var(--border)" }}>
                      <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "var(--bg-inset)" }}>
                            <th className="px-3 py-2 text-left font-semibold" style={{ color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>Product</th>
                            <th className="px-3 py-2 text-center font-semibold" style={{ color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>Qty</th>
                            <th className="px-3 py-2 text-right" style={{ borderBottom: "1px solid var(--border)" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseCartItems(quote.message).map((item, i) => {
                            const nameSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                            const productUrl = `http://localhost:3001/product/${nameSlug}`;
                            const imgUrl = productImageMap.get(item.name.toLowerCase()) ?? "";
                            return (
                              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    {imgUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={imgUrl} alt={item.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)", flexShrink: 0 }} />
                                    ) : (
                                      <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <FileText style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{item.name}</div>
                                      <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-[10px]" style={{ color: "var(--brand)", textDecoration: "none" }}>{productUrl}</a>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center text-[12px]" style={{ color: "var(--text-3)" }}>{item.qty}</td>
                                <td className="px-3 py-2.5 text-right">
                                  <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold" style={{ color: "var(--brand)", textDecoration: "none" }}>View ›</a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(() => {
                    const m = quote.message.match(/Additional notes:\n([\s\S]*?)$/);
                    const notes = m ? m[1].trim() : "";
                    if (!notes || notes === "None") return null;
                    return (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-3)" }}>Additional Notes</div>
                        <div className="rounded-lg p-3 text-[12px] leading-relaxed whitespace-pre-wrap" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-2)" }}>{notes}</div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="rounded-lg p-4 text-[12px] leading-relaxed whitespace-pre-wrap" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-2)" }}>{quote.message}</div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-shrink-0 flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            {quote.status !== "read" && (
              <button className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5" disabled={busy} onClick={() => changeStatus("read")}>
                <MailOpen className="w-3.5 h-3.5" />Mark Read
              </button>
            )}
            {quote.status !== "replied" && (
              <button className="crm-btn crm-btn-primary crm-btn-sm flex items-center gap-1.5" disabled={busy} onClick={() => changeStatus("replied")}>
                <CheckCircle2 className="w-3.5 h-3.5" />Mark Replied
              </button>
            )}
            {quote.status !== "new" && (
              <button className="crm-btn crm-btn-ghost crm-btn-sm flex items-center gap-1.5" disabled={busy} onClick={() => changeStatus("new")}>
                <Clock className="w-3.5 h-3.5" />Mark New
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5" onClick={() => printQuote(quote)}>
              <Printer className="w-3.5 h-3.5" />Download PDF
            </button>
            {userRole === "superadmin" && (
              <button
                className={`crm-btn crm-btn-sm flex items-center gap-1.5 ${confirmDelete ? "crm-btn-danger" : "crm-btn-ghost"}`}
                disabled={busy}
                onClick={handleDelete}
                onBlur={() => setConfirmDelete(false)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Downloads Tab ────────────────────────────────────────────────────────────

function DownloadsTab() {
  const [search, setSearch] = useState("");
  const { data, mutate, isLoading } = useSWR("/v2/quotes/downloads", fetcher, { refreshInterval: 60000 });
  const allDownloads: QuoteDownload[] = data?.items || [];

  const downloads = search.trim()
    ? allDownloads.filter((d) => {
        const q = search.toLowerCase();
        return (
          d.downloaderEmail.toLowerCase().includes(q) ||
          d.downloaderName?.toLowerCase().includes(q) ||
          d.referenceId?.toLowerCase().includes(q) ||
          d.quoteName?.toLowerCase().includes(q)
        );
      })
    : allDownloads;

  return (
    <div className="space-y-4">
      {/* Search + refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            className="crm-input"
            style={{ paddingLeft: "32px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, reference…"
          />
        </div>
        <button className="crm-icon-btn" title="Refresh" onClick={() => mutate()}>
          <RefreshCw className="w-4 h-4" />
        </button>
        <span className="text-[12px]" style={{ color: "var(--text-3)" }}>{downloads.length} downloads</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded animate-pulse" style={{ background: "var(--bg-inset)" }} />)}
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Download className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No quote PDFs downloaded yet</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Downloads are tracked when users provide their email</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                  {["Downloader Email", "Name", "Quote Ref", "Quote Owner", "Product", "Downloaded At"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-3)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {downloads.map((d, idx) => (
                  <tr
                    key={`${d.quoteId}-${idx}`}
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 100ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-inset)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" style={{ color: "var(--brand)" }} />
                        <span style={{ color: "var(--brand)" }}>{d.downloaderEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-2)" }}>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        {d.downloaderName || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--brand)", whiteSpace: "nowrap" }}>
                      {d.referenceId || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-2)", maxWidth: "160px" }}>
                      <div className="truncate">{d.quoteName}</div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{d.quoteEmail}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-2)", maxWidth: "140px" }}>
                      <span className="truncate block">{d.productName || "—"}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {fmtDate(d.downloadedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [pageTab, setPageTab] = useState<PageTab>("quotes");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Quote | null>(null);

  const swrKey = filter === "all" ? "/v2/quotes" : `/v2/quotes?status=${filter}`;
  const { data, mutate, isLoading } = useSWR(swrKey, fetcher, { refreshInterval: 30000 });
  const { data: downloadsData } = useSWR("/v2/quotes/downloads", fetcher, { revalidateOnFocus: false });

  const { data: profile } = useSWR("/auth/me", fetcher, { revalidateOnFocus: false });
  const userRole = profile?.user?.role;

  const allQuotes: Quote[] = data?.items || [];
  const total: number = data?.total || 0;
  const totalDownloads: number = downloadsData?.total || 0;

  const quotes = search.trim()
    ? allQuotes.filter((q) => {
        const ql = search.toLowerCase();
        return (
          q.name?.toLowerCase().includes(ql) ||
          q.email?.toLowerCase().includes(ql) ||
          q.referenceId?.toLowerCase().includes(ql) ||
          q.productName?.toLowerCase().includes(ql) ||
          q.company?.toLowerCase().includes(ql) ||
          q.phone?.includes(ql)
        );
      })
    : allQuotes;

  async function handleStatusChange(id: string, status: Quote["status"]) {
    try {
      await api.patch(`/v2/quotes/${id}/status`, { status });
      mutate();
      setSelected((prev) => (prev?._id === id ? { ...prev, status } : prev));
    } catch (err) { console.error("Status update failed", err); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/v2/quotes/${id}`);
      mutate();
      setSelected(null);
    } catch (err) { console.error("Delete failed", err); }
  }

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "read", label: "Read" },
    { value: "replied", label: "Replied" },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: "var(--text)" }}>Quote Requests</h1>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
            Manage incoming product quote requests from the surgical website
          </p>
        </div>
        <button className="crm-icon-btn" title="Refresh" onClick={() => mutate()}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Page-level tabs: Quotes | Downloads */}
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
        <button
          onClick={() => setPageTab("quotes")}
          className="px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: pageTab === "quotes" ? "var(--bg-surface)" : "transparent",
            color: pageTab === "quotes" ? "var(--text)" : "var(--text-3)",
            boxShadow: pageTab === "quotes" ? "var(--shadow-sm)" : "none",
          }}
        >
          <FileText className="w-3.5 h-3.5" />
          Quotes
          <span className="ml-1 px-1.5 py-0 rounded-full text-[10px]" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
            {total}
          </span>
        </button>
        <button
          onClick={() => setPageTab("downloads")}
          className="px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: pageTab === "downloads" ? "var(--bg-surface)" : "transparent",
            color: pageTab === "downloads" ? "var(--text)" : "var(--text-3)",
            boxShadow: pageTab === "downloads" ? "var(--shadow-sm)" : "none",
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Downloaded
          {totalDownloads > 0 && (
            <span className="ml-1 px-1.5 py-0 rounded-full text-[10px]" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
              {totalDownloads}
            </span>
          )}
        </button>
      </div>

      {/* ── Quotes Tab ── */}
      {pageTab === "quotes" && (
        <>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {filterOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="crm-toggle"
                style={filter === value ? { background: "var(--brand-soft)", borderColor: "var(--brand)", color: "var(--brand)" } : {}}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: "380px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              className="crm-input"
              style={{ paddingLeft: "32px", paddingRight: search ? "32px" : undefined }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, reference, product…"
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            {isLoading ? (
              <div className="p-8 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded animate-pulse" style={{ background: "var(--bg-inset)" }} />)}
              </div>
            ) : quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <FileText className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No quote requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                      {["Reference ID", "Name", "Email", "Product", "Quantity", "Status", "Date", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-3)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr
                        key={q._id}
                        className="cursor-pointer"
                        style={{ borderBottom: "1px solid var(--border)", transition: "background 100ms" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-inset)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => setSelected(q)}
                      >
                        <td className="px-4 py-3 font-mono font-bold" style={{ color: "var(--brand)", whiteSpace: "nowrap" }}>{q.referenceId}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text)", whiteSpace: "nowrap" }}>{q.name}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-2)", maxWidth: "180px" }}><span className="truncate block">{q.email}</span></td>
                        <td className="px-4 py-3" style={{ color: "var(--text-2)", maxWidth: "160px" }}><span className="truncate block">{q.productName || "—"}</span></td>
                        <td className="px-4 py-3" style={{ color: "var(--text-3)", whiteSpace: "nowrap" }}>{q.quantity ? `${q.quantity} ${q.unit || ""}`.trim() : "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                        <td className="px-4 py-3" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(q.createdAt)}</td>
                        <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); printQuote(q); }}>
                          <button className="crm-icon-btn" title="Download PDF"><Printer className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Downloads Tab ── */}
      {pageTab === "downloads" && <DownloadsTab />}

      {/* Detail modal */}
      {selected && (
        <QuoteModal
          quote={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          userRole={userRole}
        />
      )}
    </div>
  );
}
