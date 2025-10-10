"use client";
import * as React from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const C = React.createContext<Ctx | null>(null);

export function AlertDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <C.Provider value={{ open, setOpen }}>{children}</C.Provider>;
}

export function AlertDialogTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = React.useContext(C)!;
  return (
    <button onClick={() => ctx.setOpen(true)} className="contents">
      {children}
    </button>
  );
}

export function AlertDialogContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = React.useContext(C)!;
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => ctx.setOpen(false)}
      />
      <div className="relative w-full max-w-md border border-slate-800 rounded-xl bg-slate-950 p-4">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="font-bold mb-2">{children}</div>;
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(C)!;
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        className="rounded bg-slate-800 px-3 py-2 text-sm"
        onClick={() => ctx.setOpen(false)}
      >
        Cancel
      </button>
      {children}
    </div>
  );
}
