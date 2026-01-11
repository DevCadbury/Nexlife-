"use client";
import * as React from "react";

type Toast = {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
};

const ToastCtx = React.createContext<{
  add: (t: Omit<Toast, "id">) => void;
} | null>(null);

let _addGlobal: ((t: Omit<Toast, "id">) => void) | null = null;

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [list, setList] = React.useState<Toast[]>([]);
  const add = (t: Omit<Toast, "id">) => {
    try {

    } catch {}
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, ...t }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3000);
  };
  React.useEffect(() => {
    _addGlobal = add;
    return () => {
      if (_addGlobal === add) _addGlobal = null;
    };
  }, []);
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] grid gap-2">
        {list.map((t) => {
          const color =
            t.variant === "success"
              ? "text-[#2b9875]"
              : t.variant === "error"
              ? "text-[#ef4444]"
              : t.variant === "warning"
              ? "text-[#f59e0b]"
              : t.variant === "info"
              ? "text-[#38bdf8]"
              : "text-slate-300";
          return (
            <div
              key={t.id}
              className="flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs animate-[toastIn_.2s_ease-out]"
            >
              <div className="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px] border border-slate-700/60 shadow">
                <div className="flex gap-2 items-center">
                  <div
                    className={`${color} bg-white/5 backdrop-blur-xl p-1 rounded-lg`}
                  >
                    {/* icons */}
                    {t.variant === "success" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                    {t.variant === "error" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    {t.variant === "warning" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0 3.75h.008v.008H12v-.008Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12l9.75-9.75L21.75 12 12 21.75 2.25 12Z"
                        />
                      </svg>
                    )}
                    {t.variant === "info" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9.75h.008v.008H12V9.75Zm-.75 3h1.5v6h-1.5v-6Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25Z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="select-none">
                    <p className="text-white font-medium leading-tight">
                      {t.title ||
                        (t.variant === "success"
                          ? "Success"
                          : t.variant === "error"
                          ? "Error"
                          : t.variant === "warning"
                          ? "Notice"
                          : "Info")}
                    </p>
                    <p className="text-gray-400">{t.description || ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}
                  className="text-gray-500 hover:bg-white/5 p-1 rounded-md transition-colors ease-linear"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  const add = ctx?.add || _addGlobal;
  return {
    toast: (opts: Omit<Toast, "id">) => {
      try {

      } catch {}
      add?.(opts);
    },
    success: (description: string, title = "Success") => {
      const p = { description, title, variant: "success" as const };
      try {

      } catch {}
      add?.(p);
    },
    error: (description: string, title = "Error") => {
      const p = { description, title, variant: "error" as const };
      try {

      } catch {}
      add?.(p);
    },
    warn: (description: string, title = "Notice") => {
      const p = { description, title, variant: "warning" as const };
      try {

      } catch {}
      add?.(p);
    },
    info: (description: string, title = "Info") => {
      const p = { description, title, variant: "info" as const };
      try {

      } catch {}
      add?.(p);
    },
  };
}

// keyframes for subtle slide-in
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `@keyframes toastIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}`;
  document.head.appendChild(style);
}
