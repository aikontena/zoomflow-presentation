import { useCallback, useEffect, useState } from "react";

const FAV_KEY = "zoomcanvas-favorite-icons";
const RECENT_KEY = "zoomcanvas-recent-icons";
const MAX_RECENT = 24;
const EVENT = "zoomcanvas-icon-prefs";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* storage unavailable */
  }
}

export function useIconPrefs() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const sync = useCallback(() => {
    setFavorites(read(FAV_KEY));
    setRecent(read(RECENT_KEY));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const toggleFavorite = useCallback((id: string) => {
    const current = read(FAV_KEY);
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    write(FAV_KEY, next);
    return next.includes(id);
  }, []);

  const pushRecent = useCallback((id: string) => {
    const current = read(RECENT_KEY);
    write(RECENT_KEY, [id, ...current.filter((r) => r !== id)].slice(0, MAX_RECENT));
  }, []);

  const clearRecent = useCallback(() => write(RECENT_KEY, []), []);

  return { favorites, recent, toggleFavorite, pushRecent, clearRecent };
}
