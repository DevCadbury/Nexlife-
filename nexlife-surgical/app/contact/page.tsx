"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send, FileText } from "lucide-react";

const contactDetails = [
  {
    icon: Phone,
    label: "Phone",
    lines: ["+91 96648 43790", "+91 84015 46910"],
    href: "tel:+919664843790",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["Info@nexlifeinternational.com"],
    href: "mailto:Info@nexlifeinternational.com",
  },
  {
    icon: MapPin,
    label: "Office Address",
    lines: ["S-223, Angel Business Center – 2", "Near ABC Circle, Mota Varachha", "Surat - 394101 (Gujarat)"],
    href: null,
  },
  {
    icon: Clock,
    label: "Business Hours",
    lines: ["Mon – Sat: 9:00 AM – 6:00 PM", "IST (UTC +5:30)"],
    href: null,
  },
];

// ── Contact form ──────────────────────────────────────────────────────────────

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiry: string;
  message: string;
}

const initialContact: ContactFormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  inquiry: "General Inquiry",
  message: "",
};

function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialContact);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormState>>({});

  const validate = () => {
    const errs: Partial<ContactFormState> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.message.trim()) errs.message = "Please provide a message";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          subject: form.inquiry,
          message: form.message,
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (field: keyof ContactFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center py-16 rounded-xl border border-[#E2E8F0]"
        style={{ backgroundColor: "#F7F8FA" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: "rgba(10,138,120,0.12)" }}
        >
          <CheckCircle2 size={32} className="text-[#0A8A78]" />
        </div>
        <h2 className="text-[#0D2240] mb-2" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
          Message Received
        </h2>
        <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
          Thank you for reaching out. A Nexlife specialist will respond to your inquiry within 24 business hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(initialContact); }}
          className="mt-6 px-5 py-2.5 rounded text-sm text-white transition-colors"
          style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="rounded-xl border border-[#E2E8F0] overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(13,34,64,0.07)" }}
      >
        <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F7F8FA]">
          <h2 className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Send Us a Message
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">All fields marked with * are required.</p>
        </div>
        <div className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" id="c-name" type="text" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange("name")} error={errors.name} />
            <Field label="Email Address *" id="c-email" type="email" placeholder="jane@hospital.org" value={form.email} onChange={handleChange("email")} error={errors.email} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company / Hospital" id="c-company" type="text" placeholder="General Hospital Inc." value={form.company} onChange={handleChange("company")} />
            <Field label="Phone Number" id="c-phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange("phone")} />
          </div>
          <div>
            <label htmlFor="c-inquiry" className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Inquiry Type</label>
            <select
              id="c-inquiry"
              value={form.inquiry}
              onChange={handleChange("inquiry")}
              className="w-full rounded border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] bg-white transition-colors"
              style={{ appearance: "none" }}
            >
              {["General Inquiry","Bulk / Hospital Quote","Product Information","Compliance Documentation","Distribution Partnership","Shipping & Logistics","Other"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="c-message" className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Message *</label>
            <textarea
              id="c-message"
              rows={5}
              placeholder="Please describe your inquiry, including product names and estimated quantities if applicable..."
              value={form.message}
              onChange={handleChange("message")}
              className="w-full rounded border px-3.5 py-2.5 text-sm text-[#0D2240] outline-none resize-none transition-colors leading-relaxed"
              style={{ borderColor: errors.message ? "#EF4444" : "#E2E8F0" }}
              onFocus={(e) => { if (!errors.message) e.target.style.borderColor = "#0A8A78"; }}
              onBlur={(e) => { if (!errors.message) e.target.style.borderColor = "#E2E8F0"; }}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
          >
            <Send size={15} />
            {loading ? "Sending…" : "Send Message"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Quote form ────────────────────────────────────────────────────────────────

interface QuoteFormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  productName: string;
  quantity: string;
  unit: string;
  message: string;
}

const initialQuote: QuoteFormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  country: "",
  productName: "",
  quantity: "",
  unit: "units",
  message: "",
};

const UNITS = ["units", "boxes", "cases", "pallets"];

function QuoteFormInner() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<QuoteFormState>(() => ({
    ...initialQuote,
    productName: searchParams.get("product") || "",
  }));
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<QuoteFormState>>({});

  // Update product from URL param if it changes
  useEffect(() => {
    const prod = searchParams.get("product");
    if (prod) setForm((prev) => ({ ...prev, productName: prod }));
  }, [searchParams]);

  const validate = () => {
    const errs: Partial<QuoteFormState> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.message.trim()) errs.message = "Message / requirements are required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${backendUrl}/api/v2/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "surgical" }),
      });
      const data = await res.json();
      if (data.referenceId) setReferenceId(data.referenceId);
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (field: keyof QuoteFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof typeof errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center py-16 rounded-xl border border-[#E2E8F0]"
        style={{ backgroundColor: "#F7F8FA" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: "rgba(10,138,120,0.12)" }}
        >
          <CheckCircle2 size={32} className="text-[#0A8A78]" />
        </div>
        <h2 className="text-[#0D2240] mb-2" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
          Quote Request Submitted
        </h2>
        {referenceId && (
          <div
            className="px-6 py-3 rounded-lg mb-4 border"
            style={{ backgroundColor: "rgba(10,138,120,0.08)", borderColor: "rgba(10,138,120,0.25)" }}
          >
            <p className="text-xs text-[#0A8A78] mb-1" style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Your Reference Number</p>
            <p className="text-[#0D2240] font-mono" style={{ fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.06em" }}>{referenceId}</p>
          </div>
        )}
        <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
          We have received your quote request. Our team will contact you within 24 business hours with a detailed response.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(initialQuote); setReferenceId(""); }}
          className="mt-6 px-5 py-2.5 rounded text-sm text-white transition-colors"
          style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
        >
          Submit Another Quote
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="rounded-xl border border-[#E2E8F0] overflow-hidden"
        style={{ boxShadow: "0 2px 12px rgba(13,34,64,0.07)" }}
      >
        <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F7F8FA]">
          <h2 className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Request a Quote
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">All fields marked with * are required.</p>
        </div>
        <div className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *" id="q-name" type="text" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange("name")} error={errors.name} />
            <Field label="Email Address *" id="q-email" type="email" placeholder="jane@hospital.org" value={form.email} onChange={handleChange("email")} error={errors.email} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company / Hospital" id="q-company" type="text" placeholder="General Hospital Inc." value={form.company} onChange={handleChange("company")} />
            <Field label="Phone" id="q-phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange("phone")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country" id="q-country" type="text" placeholder="e.g. United Arab Emirates" value={form.country} onChange={handleChange("country")} />
            <Field label="Product of Interest" id="q-product" type="text" placeholder="e.g. Surgical Gloves" value={form.productName} onChange={handleChange("productName")} />
          </div>

          {/* Quantity & Unit side by side */}
          <div>
            <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Quantity &amp; Unit</label>
            <div className="flex gap-3">
              <input
                id="q-quantity"
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={form.quantity}
                onChange={handleChange("quantity")}
                className="flex-1 rounded border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0D2240] outline-none transition-colors"
                onFocus={(e) => (e.target.style.borderColor = "#0A8A78")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              <select
                id="q-unit"
                value={form.unit}
                onChange={handleChange("unit")}
                className="w-32 rounded border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0D2240] outline-none bg-white transition-colors"
                style={{ appearance: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#0A8A78")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="q-message" className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>Message / Additional Requirements *</label>
            <textarea
              id="q-message"
              rows={5}
              placeholder="Please describe your requirements, specifications, delivery timeline, or any other details..."
              value={form.message}
              onChange={handleChange("message")}
              className="w-full rounded border px-3.5 py-2.5 text-sm text-[#0D2240] outline-none resize-none transition-colors leading-relaxed"
              style={{ borderColor: errors.message ? "#EF4444" : "#E2E8F0" }}
              onFocus={(e) => { if (!errors.message) e.target.style.borderColor = "#0A8A78"; }}
              onBlur={(e) => { if (!errors.message) e.target.style.borderColor = "#E2E8F0"; }}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
          >
            <FileText size={15} />
            {loading ? "Submitting…" : "Submit Quote Request"}
          </button>
        </div>
      </div>
    </form>
  );
}

function QuoteForm() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-slate-500">Loading…</div>}>
      <QuoteFormInner />
    </Suspense>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "contact" | "quote";

export default function ContactPage() {
  const [tab, setTab] = useState<Tab>("contact");

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="py-14 lg:py-20 bg-[#F7F8FA]" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#0A8A78] mb-3" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Get in Touch
          </p>
          <h1
            className="text-[#0D2240] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            {tab === "quote" ? "Request a Quote" : "Get In Touch"}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
            {tab === "quote"
              ? "Submit your product requirements and we'll send you a competitive quote within 24 business hours."
              : "We'd love to hear from you. Contact our team for inquiries, quotes, or partnership opportunities."}
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2 className="text-[#0D2240] mb-1" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  Nexlife International
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Have a business inquiry or partnership opportunity? Reach out directly.
                </p>
              </div>

              {contactDetails.map(({ icon: Icon, label, lines, href }) => (
                <div
                  key={label}
                  className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-white"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.04)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(10,138,120,0.10)" }}
                  >
                    <Icon size={18} className="text-[#0A8A78]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5" style={{ fontWeight: 500 }}>{label}</p>
                    {lines.map((line, i) => (
                      href && i === 0 ? (
                        <a key={i} href={href} className="block text-sm text-[#0D2240] hover:text-[#0A8A78] transition-colors" style={{ fontWeight: 500 }}>
                          {line}
                        </a>
                      ) : (
                        <p key={i} className="text-sm text-slate-600">{line}</p>
                      )
                    ))}
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div
                className="rounded-lg overflow-hidden border border-[#E2E8F0]"
                style={{ height: "200px", backgroundColor: "#F0F4F8" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fm=webp"
                  alt="Nexlife International office location"
                  className="w-full h-full object-cover opacity-60"
                  width={700}
                  height={300}
                  loading="lazy"
                />
                <div className="flex items-center justify-center gap-2 -mt-14 relative z-10">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#0D2240]"
                    style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid #E2E8F0", fontWeight: 500 }}
                  >
                    <MapPin size={14} className="text-[#0A8A78]" />
                    Surat, Gujarat, India
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:col-span-3">
              {/* Tab switcher */}
              <div
                className="flex rounded-lg mb-6 overflow-hidden"
                style={{ border: "1px solid #E2E8F0", backgroundColor: "#F7F8FA" }}
              >
                {([
                  { key: "contact" as Tab, label: "Contact Us", icon: Mail },
                  { key: "quote" as Tab, label: "Request a Quote", icon: FileText },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-all duration-150"
                    style={{
                      fontWeight: 600,
                      backgroundColor: tab === key ? "#0D2240" : "transparent",
                      color: tab === key ? "#ffffff" : "#64748B",
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>

              {tab === "contact" ? <ContactForm /> : <QuoteForm />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Shared Field component ────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function Field({ label, id, type, placeholder, value, onChange, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 500 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded border px-3.5 py-2.5 text-sm text-[#0D2240] outline-none transition-colors"
        style={{ borderColor: error ? "#EF4444" : "#E2E8F0" }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = "#0A8A78"; }}
        onBlur={(e) => { if (!error) e.target.style.borderColor = "#E2E8F0"; }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
