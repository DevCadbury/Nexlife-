import { Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <div
        className="text-[#0A8A78] mb-4"
        style={{ fontSize: "5rem", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1 }}
      >
        404
      </div>
      <h1 className="text-[#0D2240] mb-3" style={{ fontWeight: 700, fontSize: "1.5rem" }}>
        Page Not Found
      </h1>
      <p className="text-slate-500 max-w-sm leading-relaxed text-sm mb-8">
        The page you're looking for doesn't exist or has been moved. Use the links below to get back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm text-white transition-colors"
          style={{ backgroundColor: "#0A8A78", fontWeight: 600 }}
        >
          <ArrowLeft size={15} />
          Return Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm transition-colors border border-[#E2E8F0] text-[#0D2240] hover:bg-[#F7F8FA]"
          style={{ fontWeight: 500 }}
        >
          <Search size={15} />
          Browse Products
        </Link>
      </div>
    </div>
  );
}
