"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons";

const STORAGE_KEY = "weather-theme";
const THEME_CHANGE_EVENT = "weather-theme-change";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY);

  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  // Without a stored choice the OS preference *is* the theme, so follow it
  // when the user changes it mid-session.
  media.addEventListener("change", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function isDarkPreferred(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored === "dark";
  return window.matchMedia(DARK_QUERY).matches;
}

function getSnapshot(): boolean {
  try {
    return isDarkPreferred();
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(STORAGE_KEY, nextIsDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="grid size-10 cursor-pointer place-items-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] text-[var(--accent-dark)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] active:scale-90"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
