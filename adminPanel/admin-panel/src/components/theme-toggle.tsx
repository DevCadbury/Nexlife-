"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    // Default is LIGHT — only go dark if explicitly stored or OS prefers dark
    const initial = stored
      ? stored
      : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    // If no stored preference, save "light" as default so it persists
    if (!stored) {
      try { localStorage.setItem("theme", initial); } catch {}
    }
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      aria-label="Toggle theme"
      className="flex items-center justify-center w-full h-full"
      onClick={toggle}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
