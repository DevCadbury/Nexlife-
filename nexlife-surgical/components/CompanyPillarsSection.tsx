"use client";
import { Users, Heart, Building2, Globe, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users, Heart, Building2, Globe,
};

interface Pillar {
  icon: string;
  title: string;
  description: string;
  stat: string;
}

export function CompanyPillarsSection({ pillars }: { pillars: Pillar[] }) {
  return (
    <section className="py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs text-[#0A8A78] mb-2" style={{ fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            NEXLIFE INTERNATIONAL STANDS FOR
          </p>
          <h2 className="text-[#0D2240]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            The Four Pillars of Our Success
          </h2>
        </div>
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
            {pillars.map((pillar) => {
              const Icon = iconMap[pillar.icon] ?? Users;
              return (
                <div
                  key={pillar.title}
                  className="flex-shrink-0 w-64 sm:w-72 lg:w-auto snap-center group relative text-center bg-gradient-to-br from-white to-[#F7F8FA] rounded-2xl p-6 border border-[#E2E8F0] transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  style={{ boxShadow: "0 2px 12px rgba(13,34,64,0.06)" }}
                >
                  <div className="relative mb-4 mx-auto w-20 h-20">
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                      style={{ background: "linear-gradient(135deg, rgba(10,138,120,0.18) 0%, rgba(13,34,64,0.1) 100%)" }}
                    />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Icon size={36} className="text-[#0A8A78] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  <div
                    className="text-4xl font-bold text-[#0D2240] mb-2 transition-all duration-300 group-hover:text-[#0A8A78] group-hover:scale-110"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {pillar.stat}
                  </div>
                  <h3 className="text-[#0D2240] mb-2 group-hover:text-[#0A8A78] transition-colors" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>
      </div>
    </section>
  );
}
