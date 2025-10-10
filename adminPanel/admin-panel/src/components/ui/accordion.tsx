"use client";
import * as React from "react";

export function Accordion({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden">
      {children}
    </div>
  );
}

export function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm bg-slate-900/50 hover:bg-slate-900"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium">{title}</span>
        <span className="text-xs text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-3 text-sm">{children}</div>}
    </div>
  );
}
