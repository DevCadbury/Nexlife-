"use client";
import * as React from "react";

export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return <div data-tabs-value={value}>{children}</div>;
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border border-slate-800 rounded-xl bg-slate-900/50 p-1 w-full overflow-x-auto">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  active,
  onClick,
  children,
}: {
  value: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg border ${
        active
          ? "border-indigo-600 bg-indigo-600/20 text-indigo-200"
          : "border-transparent text-slate-300 hover:bg-slate-800/50"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  when,
  active,
  children,
}: {
  when: string;
  active: boolean;
  children: React.ReactNode;
}) {
  if (!active) return null;
  return <div className="mt-3">{children}</div>;
}
