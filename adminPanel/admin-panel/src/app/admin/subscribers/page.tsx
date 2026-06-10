"use client";

import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { useMemo, useRef, useState, useEffect } from "react";
import {
  Mail, Phone, Globe, MessageCircle, Building2,
  Search, Plus, Download, Upload, Users, Calendar,
  Trash2, CheckSquare, Square, FileSpreadsheet,
  Loader2, X, Pencil, StickyNote,
  FileText, Send, ChevronRight, RefreshCw, Star,
  UserPlus, ArrowRight, Check,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscriber {
  email: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  website?: string;
  internalNote?: string;
  createdAt?: string;
  added_at?: string;
  added_by?: string;
  source?: string;
  staff_name?: string;
  is_locked?: boolean;
  deleted_by_admin?: boolean;
  deleted_by_super?: boolean;
}

interface SubscriberProfile {
  subscriber: Subscriber & { notes?: Note[] };
  quotes: { _id: string; referenceId: string; productName?: string; source: string; status: string; createdAt: string; message?: string }[];
  campaigns: { _id: string; name: string; subject: string; sentAt: string; status: string }[];
  activityLogs: { _id: string; type: string; actorName?: string; createdAt: string; meta?: any }[];
}

interface Note {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

interface SubscriberListResponse { total: number; items: Subscriber[]; }
interface SubscriberStats { total: number; active: number; locked?: number; adminDeleted?: number; }

const emptyForm = { email: "", name: "", phone: "", whatsapp: "", company: "", website: "", internalNote: "" };
type SubscriberForm = typeof emptyForm;

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)); }
  catch { return iso; }
}

function fmtDateShort(iso?: string) {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso)); }
  catch { return iso; }
}

// ─── Contact Action Buttons ───────────────────────────────────────────────────

function ContactActions({ subscriber }: { subscriber: Subscriber }) {
  const phone = subscriber.phone?.replace(/\D/g, "");
  const wa = (subscriber.whatsapp || subscriber.phone || "").replace(/\D/g, "");
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <a href={`mailto:${subscriber.email}`} title="Send email"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:shadow-sm"
        style={{ background: "var(--brand-soft)", color: "var(--brand)", border: "1px solid var(--brand)" }}>
        <Mail className="w-3.5 h-3.5" />Email
      </a>
      {phone && (
        <a href={`tel:${subscriber.phone}`} title="Call"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:shadow-sm"
          style={{ background: "var(--bg-inset)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
          <Phone className="w-3.5 h-3.5" />Call
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:shadow-sm"
          style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac" }}>
          <MessageCircle className="w-3.5 h-3.5" />WhatsApp
        </a>
      )}
      {subscriber.website && (
        <a href={subscriber.website.startsWith("http") ? subscriber.website : `https://${subscriber.website}`}
          target="_blank" rel="noopener noreferrer" title="Website"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:shadow-sm"
          style={{ background: "var(--bg-inset)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
          <Globe className="w-3.5 h-3.5" />Website
        </a>
      )}
    </div>
  );
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────

function NotesPanel({ email, notes, onUpdate }: { email: string; notes: Note[]; onUpdate: () => void }) {
  const { success: toastOk, error: toastErr } = useToast();
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function addNote() {
    if (!newText.trim() || saving) return;
    setSaving(true);
    try {
      await api.post(`/subscribers/${encodeURIComponent(email)}/notes`, { text: newText.trim() });
      setNewText("");
      onUpdate();
      toastOk("Note added");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to add note");
    } finally { setSaving(false); }
  }

  async function saveEdit(noteId: string) {
    if (!editText.trim()) return;
    try {
      await api.patch(`/subscribers/${encodeURIComponent(email)}/notes/${noteId}`, { text: editText.trim() });
      setEditingId(null);
      onUpdate();
      toastOk("Note updated");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to update note");
    }
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/subscribers/${encodeURIComponent(email)}/notes/${noteId}`);
      onUpdate();
      toastOk("Note deleted");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to delete note");
    }
  }

  return (
    <div className="space-y-3">
      {/* Add note */}
      <div className="space-y-2">
        <textarea
          className="crm-input resize-none w-full"
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new internal note…"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addNote(); }}
        />
        <button onClick={addNote} disabled={saving || !newText.trim()} className="crm-btn crm-btn-primary crm-btn-sm flex items-center gap-1.5">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Note
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="py-6 text-center text-[12px]" style={{ color: "var(--text-muted)" }}>No notes yet</div>
      ) : [...notes].reverse().map((note) => (
        <div key={note.id} className="rounded-lg p-3 text-[12px]"
          style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
          {editingId === note.id ? (
            <div className="space-y-2">
              <textarea
                className="crm-input resize-none w-full"
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit(note.id)} className="crm-btn crm-btn-primary crm-btn-sm">Save</button>
                <button onClick={() => setEditingId(null)} className="crm-btn crm-btn-secondary crm-btn-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-2)" }}>{note.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {fmtDate(note.updatedAt || note.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} className="crm-icon-btn">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="crm-icon-btn"
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--err-t)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Profile Drawer ───────────────────────────────────────────────────────────

function ProfileDrawer({
  email, onClose, canEdit, onRefresh,
}: {
  email: string; onClose: () => void; canEdit: boolean; onRefresh: () => void;
}) {
  const { data, mutate, isLoading } = useSWR<SubscriberProfile>(
    `/subscribers/profile/${encodeURIComponent(email)}`, fetcher,
    { revalidateOnFocus: false }
  );
  const { success: toastOk, error: toastErr } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SubscriberForm>(emptyForm);
  const [activeSection, setActiveSection] = useState<"overview" | "quotes" | "campaigns" | "activity" | "notes">("overview");

  useEffect(() => {
    if (data?.subscriber) {
      setForm({
        email: data.subscriber.email || "",
        name: data.subscriber.name || "",
        phone: data.subscriber.phone || "",
        whatsapp: data.subscriber.whatsapp || "",
        company: data.subscriber.company || "",
        website: data.subscriber.website || "",
        internalNote: data.subscriber.internalNote || "",
      });
    }
  }, [data?.subscriber]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await api.patch(`/subscribers/${encodeURIComponent(email)}`, form);
      await mutate();
      onRefresh();
      setEditing(false);
      toastOk("Profile updated");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const sub = data?.subscriber;
  const initial = (sub?.name || sub?.email || "?")[0].toUpperCase();

  const sourceLabel: Record<string, string> = {
    "quote_download": "PDF Download",
    "pdf-download": "PDF Download",
    "surgical-cart": "Cart Quote",
    "surgical": "Quote Form",
    "manual": "Manual",
    "import": "CSV Import",
    "system": "System",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer */}
      <div
        className="ml-auto h-full flex flex-col overflow-hidden"
        style={{
          width: "min(560px, 100vw)",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={onClose} className="crm-icon-btn flex-shrink-0"><X className="w-4 h-4" /></button>
          {isLoading ? (
            <div className="h-4 w-40 rounded animate-pulse" style={{ background: "var(--border)" }} />
          ) : (
            <>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0"
                style={{ background: "var(--brand)" }}>{initial}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold truncate" style={{ color: "var(--text)" }}>{sub?.name || sub?.email}</div>
                {sub?.name && <div className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>{sub.email}</div>}
              </div>
              {canEdit && !editing && (
                <button onClick={() => setEditing(true)} className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />Edit
                </button>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3 flex-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded animate-pulse" style={{ background: "var(--bg-inset)" }} />)}
          </div>
        ) : !sub ? (
          <div className="flex-1 flex items-center justify-center p-10 text-center" style={{ color: "var(--text-muted)" }}>
            <p>Profile not found</p>
          </div>
        ) : (
          <>
            {/* Edit form */}
            {editing ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-3)" }}>EDIT PROFILE</p>
                {([
                  { key: "email", label: "Email *", type: "email" },
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "whatsapp", label: "WhatsApp Number", type: "tel" },
                  { key: "company", label: "Company / Hospital", type: "text" },
                  { key: "website", label: "Website URL", type: "url" },
                ] as { key: keyof SubscriberForm; label: string; type: string }[]).map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="crm-label">{label}</label>
                    <input
                      type={type}
                      className="crm-input"
                      value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="crm-label">Internal Notes</label>
                  <textarea
                    className="crm-input resize-none"
                    rows={4}
                    value={form.internalNote}
                    onChange={(e) => setForm((p) => ({ ...p, internalNote: e.target.value }))}
                    placeholder="Notes visible only to your team…"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} disabled={saving} className="crm-btn crm-btn-primary flex items-center gap-1.5">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="crm-btn crm-btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Contact + meta block */}
                <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <ContactActions subscriber={sub} />

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
                    {sub.company && (
                      <div className="flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        <div>
                          <div style={{ color: "var(--text-3)" }}>Company</div>
                          <div className="font-medium" style={{ color: "var(--text)" }}>{sub.company}</div>
                        </div>
                      </div>
                    )}
                    {sub.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        <div>
                          <div style={{ color: "var(--text-3)" }}>Phone</div>
                          <div className="font-medium" style={{ color: "var(--text)" }}>{sub.phone}</div>
                        </div>
                      </div>
                    )}
                    {sub.whatsapp && (
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        <div>
                          <div style={{ color: "var(--text-3)" }}>WhatsApp</div>
                          <div className="font-medium" style={{ color: "var(--text)" }}>{sub.whatsapp}</div>
                        </div>
                      </div>
                    )}
                    {sub.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        <div>
                          <div style={{ color: "var(--text-3)" }}>Website</div>
                          <a href={sub.website.startsWith("http") ? sub.website : `https://${sub.website}`}
                            target="_blank" rel="noopener noreferrer"
                            className="font-medium truncate block max-w-[160px]"
                            style={{ color: "var(--brand)" }}>
                            {sub.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                      <div>
                        <div style={{ color: "var(--text-3)" }}>Subscribed</div>
                        <div className="font-medium" style={{ color: "var(--text)" }}>{fmtDateShort(sub.added_at || sub.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                      <div>
                        <div style={{ color: "var(--text-3)" }}>Source</div>
                        <div className="font-medium" style={{ color: "var(--text)" }}>
                          {sourceLabel[sub.source || ""] || sub.source || "Manual"}
                        </div>
                      </div>
                    </div>
                    {sub.staff_name && (
                      <div className="flex items-start gap-2 col-span-2">
                        <UserPlus className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                        <div>
                          <div style={{ color: "var(--text-3)" }}>Added by</div>
                          <div className="font-medium" style={{ color: "var(--text)" }}>{sub.staff_name}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {sub.internalNote && (
                    <div className="mt-4 rounded-lg p-3 text-[12px] leading-relaxed"
                      style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <StickyNote className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Internal Note</span>
                      </div>
                      <p className="whitespace-pre-wrap">{sub.internalNote}</p>
                    </div>
                  )}
                </div>

                {/* Section tabs */}
                <div className="flex items-center gap-0.5 px-4 py-2 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)" }}>
                  {([
                    { id: "overview", label: "Overview" },
                    { id: "quotes", label: `Quotes${data?.quotes.length ? ` (${data.quotes.length})` : ""}` },
                    { id: "campaigns", label: `Campaigns${data?.campaigns.length ? ` (${data.campaigns.length})` : ""}` },
                    { id: "notes", label: `Notes${(sub as any).notes?.length ? ` (${(sub as any).notes.length})` : ""}` },
                    { id: "activity", label: "Activity" },
                  ] as { id: typeof activeSection; label: string }[]).map(({ id, label }) => (
                    <button key={id} onClick={() => setActiveSection(id)}
                      className="px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all"
                      style={{
                        background: activeSection === id ? "var(--brand-soft)" : "transparent",
                        color: activeSection === id ? "var(--brand)" : "var(--text-3)",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Section content */}
                <div className="p-5">
                  {activeSection === "overview" && (
                    <div className="space-y-4">
                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Quotes", value: data?.quotes.length ?? 0, icon: FileText, color: "var(--brand)" },
                          { label: "Campaigns", value: data?.campaigns.length ?? 0, icon: Send, color: "#8b5cf6" },
                          { label: "Notes", value: (sub as any).notes?.length ?? 0, icon: StickyNote, color: "#f59e0b" },
                        ].map(({ label, value, icon: Icon, color }) => (
                          <div key={label} className="rounded-lg p-3 text-center"
                            style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
                            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
                            <div className="text-[18px] font-bold" style={{ color: "var(--text)" }}>{value}</div>
                            <div className="text-[10px]" style={{ color: "var(--text-3)" }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Latest quote */}
                      {data?.quotes[0] && (
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Latest Quote</div>
                          <div className="rounded-lg p-3" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-mono font-bold" style={{ color: "var(--brand)" }}>{data.quotes[0].referenceId}</span>
                              <span className={`crm-badge text-[10px] ${data.quotes[0].status === "new" ? "crm-badge-red" : data.quotes[0].status === "replied" ? "crm-badge-green" : "crm-badge-gray"}`}>{data.quotes[0].status}</span>
                            </div>
                            {data.quotes[0].productName && (
                              <div className="text-[12px] mt-1 truncate" style={{ color: "var(--text-2)" }}>{data.quotes[0].productName}</div>
                            )}
                            <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{fmtDate(data.quotes[0].createdAt)}</div>
                          </div>
                        </div>
                      )}

                      {/* Latest note */}
                      {((sub as any).notes as Note[] | undefined)?.[0] && (
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Latest Note</div>
                          <div className="rounded-lg p-3 text-[12px] leading-relaxed"
                            style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                            <p className="whitespace-pre-wrap line-clamp-4">{((sub as any).notes as Note[])[((sub as any).notes as Note[]).length - 1].text}</p>
                            <div className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
                              {fmtDate(((sub as any).notes as Note[])[((sub as any).notes as Note[]).length - 1].createdAt)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === "quotes" && (
                    <div className="space-y-2">
                      {data?.quotes.length === 0 ? (
                        <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-[13px]">No quotes yet</p>
                        </div>
                      ) : data?.quotes.map((q) => (
                        <div key={q._id} className="rounded-lg p-3" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[12px] font-mono font-bold" style={{ color: "var(--brand)" }}>{q.referenceId}</span>
                                <span className={`crm-badge text-[10px] flex-shrink-0 ${q.status === "new" ? "crm-badge-red" : q.status === "replied" ? "crm-badge-green" : "crm-badge-gray"}`}>{q.status}</span>
                              </div>
                              {q.productName && <div className="text-[12px] truncate" style={{ color: "var(--text-2)" }}>{q.productName}</div>}
                              <div className="text-[10px] mt-1 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <Calendar className="w-3 h-3" />{fmtDate(q.createdAt)}
                                <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>{q.source}</span>
                              </div>
                              {q.message && (
                                <details className="mt-2">
                                  <summary className="text-[11px] cursor-pointer" style={{ color: "var(--brand)" }}>View message</summary>
                                  <div className="mt-1.5 p-2 rounded text-[11px] whitespace-pre-wrap leading-relaxed"
                                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                                    {q.message}
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection === "campaigns" && (
                    <div className="space-y-2">
                      {data?.campaigns.length === 0 ? (
                        <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                          <Send className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-[13px]">No campaigns sent to this subscriber yet</p>
                        </div>
                      ) : data?.campaigns.map((c) => (
                        <div key={c._id} className="rounded-lg p-3" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{c.subject || c.name}</div>
                              <div className="text-[10px] mt-1 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                                <Calendar className="w-3 h-3" />
                                Sent {fmtDate(c.sentAt)}
                              </div>
                            </div>
                            <span className="crm-badge crm-badge-teal text-[10px] flex-shrink-0">{c.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSection === "notes" && (
                    <NotesPanel
                      email={email}
                      notes={((sub as any).notes as Note[] | undefined) ?? []}
                      onUpdate={() => mutate()}
                    />
                  )}

                  {activeSection === "activity" && (
                    <div className="space-y-2">
                      {data?.activityLogs.length === 0 ? (
                        <div className="py-10 text-center" style={{ color: "var(--text-muted)" }}>
                          <p className="text-[13px]">No activity recorded</p>
                        </div>
                      ) : data?.activityLogs.map((log) => (
                        <div key={log._id} className="flex items-start gap-2.5 text-[12px]">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--brand)" }} />
                          <div className="flex-1 min-w-0">
                            <span style={{ color: "var(--text-2)" }}>
                              {log.type.replace("subscriber.", "").replace(".", " ")}
                            </span>
                            {log.actorName && <span style={{ color: "var(--text-3)" }}> by {log.actorName}</span>}
                            <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                              <Calendar className="w-3 h-3" />{fmtDate(log.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function SubscriberFormModal({
  initialData, editingEmail, onClose, onSaved, canEdit,
}: {
  initialData?: Partial<SubscriberForm>;
  editingEmail?: string;
  onClose: () => void;
  onSaved: () => void;
  canEdit: boolean;
}) {
  const { success: toastOk, error: toastErr } = useToast();
  const [form, setForm] = useState<SubscriberForm>({ ...emptyForm, ...initialData });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.email.trim() || saving) return;
    setSaving(true);
    try {
      if (editingEmail) {
        await api.patch(`/subscribers/${encodeURIComponent(editingEmail)}`, form);
        toastOk("Subscriber updated");
      } else {
        const res = await api.post("/subscribers", form);
        toastOk(res.data?.alreadyExists ? "Subscriber already exists — details updated" : "Subscriber added");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof SubscriberForm; label: string; type: string; required?: boolean }[] = [
    { key: "email", label: "Email Address", type: "email", required: true },
    { key: "name", label: "Full Name", type: "text" },
    { key: "phone", label: "Phone Number", type: "tel" },
    { key: "whatsapp", label: "WhatsApp Number", type: "tel" },
    { key: "company", label: "Company / Hospital", type: "text" },
    { key: "website", label: "Website URL", type: "url" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="text-[14px] font-bold" style={{ color: "var(--text)" }}>
            {editingEmail ? "Edit Subscriber" : "Add Subscriber"}
          </div>
          <button onClick={onClose} className="crm-icon-btn"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ key, label, type, required }) => (
              <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
                <label className="crm-label">{label}{required && " *"}</label>
                <input
                  type={type}
                  className="crm-input"
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={key === "email" ? "email@company.com" : ""}
                  required={required}
                  disabled={!canEdit && key === "email" && !!editingEmail}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="crm-label">Internal Notes</label>
              <textarea
                className="crm-input resize-none"
                rows={3}
                value={form.internalNote}
                onChange={(e) => setForm((p) => ({ ...p, internalNote: e.target.value }))}
                placeholder="Notes visible only to your team…"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="crm-btn crm-btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.email.trim()} className="crm-btn crm-btn-primary flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {editingEmail ? "Save Changes" : "Add Subscriber"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubscribersPage() {
  const { data, mutate } = useSWR<SubscriberListResponse>("/subscribers", fetcher);
  const { data: statsData, mutate: mutateStats } = useSWR<SubscriberStats>("/subscribers/stats", fetcher);
  const { data: profile } = useSWR("/auth/me", fetcher);
  const { success: toastOk, error: toastErr } = useToast();

  const role = profile?.user?.role;
  const canSuperManage = role === "superadmin" || role === "dev";

  const [search, setSearch] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<{ open: boolean; editing?: string; initial?: Partial<SubscriberForm> }>({ open: false });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const refreshAll = () => Promise.all([mutate(), mutateStats()]);

  const subscribers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items || []).filter((s) =>
      !q || [s.email, s.name, s.phone, s.company, s.internalNote].join(" ").toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const allSelected = subscribers.length > 0 && subscribers.every((s) => selectedEmails.includes(s.email));

  function toggleSelect(email: string) {
    setSelectedEmails((prev) => prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]);
  }

  function toggleAll() {
    if (allSelected) setSelectedEmails((prev) => prev.filter((e) => !subscribers.some((s) => s.email === e)));
    else setSelectedEmails((prev) => [...new Set([...prev, ...subscribers.map((s) => s.email)])]);
  }

  async function handleDelete(email: string) {
    if (!confirm(`Remove ${email} from subscriber list?`)) return;
    try {
      await api.delete(`/subscribers/${encodeURIComponent(email)}`);
      await refreshAll();
      toastOk("Subscriber removed");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to remove");
    }
  }

  async function handleBulkDelete() {
    if (!selectedEmails.length || !confirm(`Delete ${selectedEmails.length} subscribers?`)) return;
    try {
      await api.delete("/subscribers/bulk", { data: { emails: selectedEmails } });
      setSelectedEmails([]);
      await refreshAll();
      toastOk("Subscribers deleted");
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to delete");
    }
  }

  async function handleBulkAdd() {
    if (!bulkText.trim() || bulkLoading) return;
    setBulkLoading(true);
    try {
      const res = await api.post("/subscribers/bulk-emails", { emails: bulkText });
      await refreshAll();
      toastOk(`Added ${res.data.added}, updated ${res.data.updated}, skipped ${res.data.skipped}`);
      setBulkText("");
      setShowBulkInput(false);
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Failed to add");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/subscribers/import", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshAll();
      toastOk(`Imported: ${res.data.added} added, ${res.data.updated} updated, ${res.data.skipped} skipped`);
    } catch (e: any) {
      toastErr(e?.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  }

  async function downloadTemplate() {
    try {
      const res = await api.get("/subscribers/template", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a"); a.href = url; a.download = "subscribers-template.csv";
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { toastErr("Download failed"); }
  }

  const sourceTag: Record<string, { label: string; color: string; bg: string }> = {
    "quote_download": { label: "PDF Download", color: "#f59e0b", bg: "#fef3c7" },
    "pdf-download": { label: "PDF Download", color: "#f59e0b", bg: "#fef3c7" },
    "surgical-cart": { label: "Cart Quote", color: "#0A8A78", bg: "rgba(10,138,120,0.1)" },
    "surgical": { label: "Quote Form", color: "#0A8A78", bg: "rgba(10,138,120,0.1)" },
    "import": { label: "Imported", color: "#6366f1", bg: "#eef2ff" },
    "system": { label: "System", color: "#64748b", bg: "#f1f5f9" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: "var(--text)" }}>Subscribers</h1>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>
            {statsData?.active ?? 0} active · {statsData?.total ?? 0} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedEmails.length > 0 && canSuperManage && (
            <button onClick={handleBulkDelete} className="crm-btn crm-btn-sm flex items-center gap-1.5" style={{ background: "var(--err-bg)", color: "var(--err-t)", border: "1px solid var(--err-b)" }}>
              <Trash2 className="w-3.5 h-3.5" />Delete ({selectedEmails.length})
            </button>
          )}
          <button onClick={() => setShowBulkInput((v) => !v)} className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />Bulk Add
          </button>
          <button onClick={downloadTemplate} className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />Template
          </button>
          <label className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5 cursor-pointer">
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import CSV
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" disabled={importing}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
          </label>
          <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || ""}/api/export/contacts.csv`} className="crm-btn crm-btn-secondary crm-btn-sm flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />Export CSV
          </a>
          <button onClick={() => setFormModal({ open: true })} className="crm-btn crm-btn-primary crm-btn-sm flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Subscriber
          </button>
        </div>
      </div>

      {/* Bulk email input */}
      {showBulkInput && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Bulk Add Emails</p>
            <button onClick={() => setShowBulkInput(false)} className="crm-icon-btn"><X className="w-3.5 h-3.5" /></button>
          </div>
          <textarea
            className="crm-input resize-none w-full"
            rows={4}
            placeholder="Paste emails separated by commas, spaces, or new lines…"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <button onClick={handleBulkAdd} disabled={bulkLoading || !bulkText.trim()} className="crm-btn crm-btn-primary crm-btn-sm flex items-center gap-1.5">
            {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            Add Emails
          </button>
        </div>
      )}

      {/* Search + stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
          <input className="crm-input" style={{ paddingLeft: "32px" }} placeholder="Search email, name, company…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="crm-icon-btn" onClick={() => refreshAll()} title="Refresh"><RefreshCw className="w-4 h-4" /></button>
        <span className="text-[12px]" style={{ color: "var(--text-3)" }}>{subscribers.length} subscribers</span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface2)" }}>
                <th className="px-4 py-3 text-left" style={{ color: "var(--text-3)", width: 40 }}>
                  {canSuperManage && (
                    <button onClick={toggleAll}>
                      {allSelected ? <CheckSquare className="w-4 h-4" style={{ color: "var(--brand)" }} /> : <Square className="w-4 h-4" />}
                    </button>
                  )}
                </th>
                {["Subscriber", "Company", "Phone", "Source", "Added", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-3)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center" style={{ color: "var(--text-muted)" }}>
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-[13px]">{search ? "No subscribers match your search" : "No subscribers yet"}</p>
                  </td>
                </tr>
              ) : subscribers.map((sub) => {
                const src = sourceTag[sub.source || ""] ?? { label: sub.source || "Manual", color: "var(--text-3)", bg: "var(--bg-inset)" };
                return (
                  <tr key={sub.email}
                    className="cursor-pointer"
                    style={{ borderBottom: "1px solid var(--border)", transition: "background 80ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-inset)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setProfileEmail(sub.email)}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {canSuperManage && (
                        <button onClick={() => toggleSelect(sub.email)}>
                          {selectedEmails.includes(sub.email)
                            ? <CheckSquare className="w-4 h-4" style={{ color: "var(--brand)" }} />
                            : <Square className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                        </button>
                      )}
                    </td>

                    {/* Subscriber */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                          style={{ background: "var(--brand)" }}>
                          {(sub.name || sub.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          {sub.name && <div className="font-semibold truncate max-w-[180px]" style={{ color: "var(--text)" }}>{sub.name}</div>}
                          <div className="truncate max-w-[180px]" style={{ color: sub.name ? "var(--text-3)" : "var(--text)" }}>{sub.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3" style={{ color: "var(--text-2)", maxWidth: "140px" }}>
                      {sub.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                          <span className="truncate">{sub.company}</span>
                        </div>
                      ) : "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3" style={{ color: "var(--text-2)", whiteSpace: "nowrap" }}>
                      {sub.phone || "—"}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: src.bg, color: src.color }}>
                        {src.label}
                      </span>
                    </td>

                    {/* Added date */}
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmtDateShort(sub.added_at || sub.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <a href={`mailto:${sub.email}`} className="crm-icon-btn" title="Email" onClick={(e) => e.stopPropagation()}>
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {(sub.whatsapp || sub.phone) && (
                          <a href={`https://wa.me/${(sub.whatsapp || sub.phone || "").replace(/\D/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="crm-icon-btn" title="WhatsApp" onClick={(e) => e.stopPropagation()}>
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {canSuperManage && (
                          <button onClick={(e) => { e.stopPropagation(); setFormModal({ open: true, editing: sub.email, initial: sub as any }); }}
                            className="crm-icon-btn" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.email); }}
                          className="crm-icon-btn" title="Remove"
                          onMouseEnter={(el) => (el.currentTarget.style.color = "var(--err-t)")}
                          onMouseLeave={(el) => (el.currentTarget.style.color = "")}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setProfileEmail(sub.email)} className="crm-icon-btn" title="View Profile">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile drawer */}
      {profileEmail && (
        <ProfileDrawer
          email={profileEmail}
          onClose={() => setProfileEmail(null)}
          canEdit={canSuperManage}
          onRefresh={refreshAll}
        />
      )}

      {/* Add/Edit modal */}
      {formModal.open && (
        <SubscriberFormModal
          initialData={formModal.initial}
          editingEmail={formModal.editing}
          onClose={() => setFormModal({ open: false })}
          onSaved={refreshAll}
          canEdit={canSuperManage}
        />
      )}
    </div>
  );
}
