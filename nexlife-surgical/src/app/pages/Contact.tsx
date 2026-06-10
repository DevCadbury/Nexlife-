import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

const contactDetails = [
  {
    icon: Phone,
    label: "Phone",
    lines: ["+1 (800) 639-5433", "+1 (713) 842-1090"],
    href: "tel:+18006395433",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["sales@nexlifeinternational.com", "support@nexlifeinternational.com"],
    href: "mailto:sales@nexlifeinternational.com",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    lines: ["1240 Medical Park Drive", "Houston, TX 77030, USA"],
    href: null,
  },
  {
    icon: Clock,
    label: "Business Hours",
    lines: ["Mon – Fri: 8:00 AM – 6:00 PM CST", "Sat: 9:00 AM – 1:00 PM CST"],
    href: null,
  },
];

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiry: string;
  message: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  inquiry: "General Inquiry",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = () => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.message.trim()) errs.message = "Please provide a message";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

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
            Contact NexLife International
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed" style={{ fontSize: "0.95rem" }}>
            Whether you're requesting a bulk quote, need compliance documentation, or have a general inquiry — our team typically responds within 4 business hours.
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
                  Reach Our Team
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Our procurement specialists and customer support team are ready to assist with orders, quotes, and compliance queries.
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
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=700&q=80&fm=webp"
                  alt="NexLife International headquarters facility"
                  className="w-full h-full object-cover opacity-60"
                  width={700}
                  height={300}
                  loading="lazy"
                />
                <div
                  className="flex items-center justify-center gap-2 -mt-14 relative z-10"
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#0D2240]"
                    style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid #E2E8F0", fontWeight: 500 }}
                  >
                    <MapPin size={14} className="text-[#0A8A78]" />
                    Houston, TX 77030, USA
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              {submitted ? (
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
                    Thank you for reaching out. A NexLife specialist will respond to your inquiry within 4 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(initialForm); }}
                    className="mt-6 px-5 py-2.5 rounded text-sm text-white transition-colors"
                    style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
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
                        <Field
                          label="Full Name *"
                          id="name"
                          type="text"
                          placeholder="Dr. Jane Smith"
                          value={form.name}
                          onChange={handleChange("name")}
                          error={errors.name}
                        />
                        <Field
                          label="Email Address *"
                          id="email"
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
                          id="company"
                          type="text"
                          placeholder="General Hospital Inc."
                          value={form.company}
                          onChange={handleChange("company")}
                        />
                        <Field
                          label="Phone Number"
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={form.phone}
                          onChange={handleChange("phone")}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="inquiry"
                          className="block text-sm text-slate-700 mb-1.5"
                          style={{ fontWeight: 500 }}
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="inquiry"
                          value={form.inquiry}
                          onChange={handleChange("inquiry")}
                          className="w-full rounded border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#0D2240] outline-none focus:border-[#0A8A78] bg-white transition-colors"
                          style={{ appearance: "none" }}
                        >
                          {[
                            "General Inquiry",
                            "Bulk / Hospital Quote",
                            "Product Information",
                            "Compliance Documentation",
                            "Distribution Partnership",
                            "Shipping & Logistics",
                            "Other",
                          ].map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm text-slate-700 mb-1.5"
                          style={{ fontWeight: 500 }}
                        >
                          Message *
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Please describe your inquiry, including product names and estimated quantities if applicable..."
                          value={form.message}
                          onChange={handleChange("message")}
                          className="w-full rounded border px-3.5 py-2.5 text-sm text-[#0D2240] outline-none resize-none transition-colors leading-relaxed"
                          style={{
                            borderColor: errors.message ? "#EF4444" : "#E2E8F0",
                          }}
                          onFocus={(e) => { if (!errors.message) e.target.style.borderColor = "#0A8A78"; }}
                          onBlur={(e) => { if (!errors.message) e.target.style.borderColor = "#E2E8F0"; }}
                        />
                        {errors.message && (
                          <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm text-white transition-all duration-150 active:scale-[0.98]"
                        style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#098872")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A8A78")}
                      >
                        <Send size={15} />
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
