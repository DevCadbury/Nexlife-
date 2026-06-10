interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className = "" }: SectionDividerProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-[#E2E8F0]" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#0A8A78] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0A8A78]/60" />
          <div className="w-1 h-1 rounded-full bg-[#0A8A78]/40" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-[#E2E8F0]" />
      </div>
    </div>
  );
}

export function SectionDividerWithIcon({ icon: Icon, className = "" }: SectionDividerProps & { icon?: any }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center gap-4 w-full max-w-2xl">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-[#0A8A78]/20" />
        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(10,138,120,0.15) 0%, rgba(13,34,64,0.08) 100%)",
            }}
          >
            <Icon size={18} className="text-[#0A8A78]" />
          </div>
        )}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E2E8F0] to-[#0A8A78]/20" />
      </div>
    </div>
  );
}
