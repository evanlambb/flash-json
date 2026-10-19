import { generateId, normalizeImportedCard } from "./cardUtils";

export const SETS_STORAGE_KEY = "flashcards-sets";

const EMPTY_STATE = Object.freeze({ sets: [], activeSetId: null });

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function createSet(name) {
  return {
    id: generateId(),
    name: typeof name === "string" ? name.trim() : "",
    cards: [],
  };
}

function normalizeSet(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.name !== "string") return null;
  if (!Array.isArray(raw.cards)) return null;

  return {
    id: raw.id,
    name: raw.name,
    cards: raw.cards.map(normalizeImportedCard).filter(Boolean),
  };
}

/**
 * Returns `{ sets, activeSetId, hasStoredState }`.
 * `hasStoredState` is false when nothing was saved yet (first visit), so the
 * caller can decide whether to seed a default set.
 */
export function loadSets() {
  if (!hasStorage()) return { ...EMPTY_STATE, hasStoredState: false };

  let raw;
  try {
    raw = window.localStorage.getItem(SETS_STORAGE_KEY);
  } catch {
    return { ...EMPTY_STATE, hasStoredState: false };
  }
  if (!raw) return { ...EMPTY_STATE, hasStoredState: false };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...EMPTY_STATE, hasStoredState: false };
  }

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sets)) {
    return { ...EMPTY_STATE, hasStoredState: false };
  }

  // Drop invalid sets and duplicate ids.
  const seen = new Set();
  const sets = [];
  for (const candidate of parsed.sets) {
    const set = normalizeSet(candidate);
    if (!set || seen.has(set.id)) continue;
    seen.add(set.id);
    sets.push(set);
  }

  const activeSetId = sets.some((set) => set.id === parsed.activeSetId)
    ? parsed.activeSetId
    : (sets[0]?.id ?? null);

  return { sets, activeSetId, hasStoredState: true };
}

export function saveSets({ sets, activeSetId }) {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify({ sets, activeSetId }));
  } catch {
    // Ignore storage errors (e.g. quota exceeded or private browsing restrictions).
  }
}
