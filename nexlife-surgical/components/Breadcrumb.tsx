import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0A8A78] transition-colors whitespace-nowrap group"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[#0A8A78]/10">
          <Home size={14} />
        </div>
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-sm text-slate-600 hover:text-[#0A8A78] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{
                  color: isLast ? "#0D2240" : "#64748B",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
