const STORAGE_KEY = "flashcards-deck";

export function loadDeck() {
  if (typeof window === "undefined" || !window.localStorage) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeck(cards) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Ignore storage errors (e.g. quota exceeded or private browsing restrictions).
  }
}
