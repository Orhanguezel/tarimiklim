"use client";

export const FAVORITES_CHANGE_EVENT = "tarimiklim:favorites-change";

const STORAGE_KEY = "tarimiklim:favorites";

function normalize(slug: string) {
  return slug.trim().toLowerCase();
}

function emitFavoritesChange(slugs: string[]) {
  window.dispatchEvent(
    new CustomEvent<string[]>(FAVORITES_CHANGE_EVENT, { detail: slugs }),
  );
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((item): item is string => typeof item === "string").map(normalize)));
  } catch {
    return [];
  }
}

export function setFavorites(slugs: string[]) {
  if (typeof window === "undefined") return;

  const next = Array.from(new Set(slugs.map(normalize).filter(Boolean)));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitFavoritesChange(next);
}

export function isFavorite(slug: string) {
  return getFavorites().includes(normalize(slug));
}

export function toggleFavorite(slug: string) {
  const normalized = normalize(slug);
  if (!normalized) return getFavorites();

  const current = getFavorites();
  const next = current.includes(normalized)
    ? current.filter((item) => item !== normalized)
    : [...current, normalized];

  setFavorites(next);
  return next;
}

export function subscribeFavorites(callback: (slugs: string[]) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const detail = event instanceof CustomEvent && Array.isArray(event.detail)
      ? event.detail
      : getFavorites();
    callback(detail);
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback(getFavorites());
  };

  window.addEventListener(FAVORITES_CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(FAVORITES_CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
