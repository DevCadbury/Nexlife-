"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, CheckCircle2, Phone, Mail, MapPin, Clock } from "lucide-react";

const UNITS = ["units", "boxes", "cases", "pallets"];

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
    label: "Address",
    lines: ["S-223, Angel Business Center – 2", "Mota Varachha, Surat - 394101"],
    href: null,
  },
  {
    icon: Clock,
    label: "Business Hours",
    lines: ["Mon – Sat: 9:00 AM – 6:00 PM IST"],
    href: null,
  },
];

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

  useEffect(() => {
    const prod = searchParams.get("product");
    if (prod) setForm((prev) => ({ ...prev, productName: prod }));
  }, [searchParams]);

  const validate = () => {
    const errs: Partial<QuoteFormState> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Valid email required";
    if (!form.message.trim()) errs.message = "Message / requirements are required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
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

  const handleChange =
    (field: keyof QuoteFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center py-20 rounded-xl border border-[#E2E8F0]"
        style={{ backgroundColor: "#F7F8FA" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "rgba(10,138,120,0.12)" }}
        >
          <CheckCircle2 size={40} className="text-[#0A8A78]" />
        </div>
        <h2
          className="text-[#0D2240] mb-2"
          style={{ fontWeight: 800, fontSize: "1.6rem" }}
        >
          Quote Request Submitted!
        </h2>
        {referenceId && (
          <div
            className="px-8 py-4 rounded-xl mb-5 border"
            style={{
              backgroundColor: "rgba(10,138,120,0.08)",
              borderColor: "rgba(10,138,120,0.25)",
            }}
          >
            <p
              className="text-xs text-[#0A8A78] mb-1"
              style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Your Reference Number
            </p>
            <p
              className="text-[#0D2240] font-mono"
              style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "0.08em" }}
            >
              {referenceId}
            </p>
          </div>
        )}
        <p className="text-slate-500 max-w-md leading-relaxed text-sm mb-8">
          We have received your quote request and will prepare a detailed, competitive quote for
          you. Expect a response at{" "}
          <strong className="text-[#0D2240]">{form.email}</strong> within 24 business hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm(initialQuote);
            setReferenceId("");
          }}
          className="px-6 py-3 rounded text-sm text-white transition-colors"
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
        style={{ boxShadow: "0 2px 16px rgba(13,34,64,0.08)" }}
      >
        <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F7F8FA]">
          <h2 className="text-[#0D2240]" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
            Quote Request Form
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fields marked with * are required. We respond within 24 business hours.
          </p>
        </div>

        <div className="p-6 space-y-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name *"
              id="q-name"
              type="text"
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
            />
            <Field
              label="Email Address *"
              id="q-email"
              type="email"
              placeholder="jane@hospital.org"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Company / Hospital"
              id="q-company"
              type="text"
              placeholder="General Hospital Inc."
              value={form.company}
              onChange={handleChange("company")}
            />
            <Field
              label="Phone"
              id="q-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={handleChange("phone")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Country"
              id="q-country"
              type="text"
              placeholder="e.g. United Arab Emirates"
              value={form.country}
              onChange={handleChange("country")}
            />
            <Field
              label="Product of Interest"
              id="q-product"
              type="text"
              placeholder="e.g. Surgical Gloves, Sutures…"
              value={form.productName}
              onChange={handleChange("productName")}
            />
          </div>

          {/* Quantity & Unit */}
          <div>
            <label
              className="block text-sm text-slate-700 mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Quantity &amp; Unit
            </label>
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
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="q-message"
              className="block text-sm text-slate-700 mb-1.5"
              style={{ fontWeight: 500 }}
            >
              Message / Additional Requirements *
            </label>
            <textarea
              id="q-message"
              rows={5}
              placeholder="Please describe your requirements, specifications, delivery timeline, certifications needed, or any other details…"
              value={form.message}
              onChange={handleChange("message")}
              className="w-full rounded border px-3.5 py-2.5 text-sm text-[#0D2240] outline-none resize-none transition-colors leading-relaxed"
              style={{ borderColor: errors.message ? "#EF4444" : "#E2E8F0" }}
              onFocus={(e) => {
                if (!errors.message) e.target.style.borderColor = "#0A8A78";
              }}
              onBlur={(e) => {
                if (!errors.message) e.target.style.borderColor = "#E2E8F0";
              }}
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">{errors.message}</p>
            )}
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

function QuoteFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <QuoteFormInner />
    </Suspense>
  );
}

export default function QuotePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="py-14 lg:py-20 bg-[#F7F8FA]"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs text-[#0A8A78] mb-3"
            style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Get a Price
          </p>
          <h1
            className="text-[#0D2240] mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Request a Quote
          </h1>
          <p
            className="text-slate-500 max-w-xl mx-auto leading-relaxed"
            style={{ fontSize: "0.95rem" }}
          >
            Submit your product requirements and our specialist team will prepare a detailed,
            competitive quote within 24 business hours.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Contact info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2
                  className="text-[#0D2240] mb-1"
                  style={{ fontWeight: 700, fontSize: "1.25rem" }}
                >
                  Why Request a Quote?
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Get a personalized, competitive price for your exact quantity and product
                  specifications — tailored for hospitals, distributors, and procurement teams.
                </p>
              </div>

              {/* Value props */}
              {[
                { emoji: "⚡", title: "24-Hour Response", desc: "Dedicated team reviews every request same business day" },
                { emoji: "💰", title: "Competitive Pricing", desc: "Volume discounts for bulk orders and long-term contracts" },
                { emoji: "🌍", title: "Global Delivery", desc: "Export-ready with full documentation across 50+ countries" },
                { emoji: "✅", title: "Certified Products", desc: "WHO-GMP, ISO, and CE certified surgical supplies" },
              ].map(({ emoji, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-white"
                  style={{ boxShadow: "0 1px 4px rgba(13,34,64,0.04)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ backgroundColor: "rgba(10,138,120,0.10)" }}
                  >
                    {emoji}
                  </div>
                  <div>
                    <p className="text-sm text-[#0D2240] mb-0.5" style={{ fontWeight: 600 }}>
                      {title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              {/* Contact info */}
              <div
                className="rounded-lg border border-[#E2E8F0] p-4"
                style={{ backgroundColor: "#F7F8FA" }}
              >
                <p
                  className="text-xs text-[#0A8A78] mb-3"
                  style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Or Contact Us Directly
                </p>
                {contactDetails.map(({ icon: Icon, label, lines, href }) => (
                  <div key={label} className="flex gap-3 mb-3 last:mb-0">
                    <Icon size={15} className="text-[#0A8A78] flex-shrink-0 mt-0.5" />
                    <div>
                      {lines.map((line, i) =>
                        href && i === 0 ? (
                          <a
                            key={i}
                            href={href}
                            className="block text-xs text-[#0D2240] hover:text-[#0A8A78] transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={i} className="text-xs text-slate-500">
                            {line}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote form */}
            <div className="lg:col-span-3">
              <QuoteFormWithSuspense />
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
      <label
        htmlFor={id}
        className="block text-sm text-slate-700 mb-1.5"
        style={{ fontWeight: 500 }}
      >
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
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = "#0A8A78";
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = "#E2E8F0";
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
