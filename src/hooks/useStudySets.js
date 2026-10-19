import { useCallback, useEffect, useMemo, useState } from "react";
import { createCard, normalizeImportedCard } from "../lib/cardUtils";
import { createSet, loadSets, saveSets } from "../lib/setStorage";

export const DEFAULT_SET_NAME = "My Set";

const EMPTY_CARDS = [];

function getInitialState() {
  const { sets, activeSetId, hasStoredState } = loadSets();
  if (!hasStoredState) {
    // First visit (or unreadable data): start fresh with one empty set.
    const seed = createSet(DEFAULT_SET_NAME);
    return { sets: [seed], activeSetId: seed.id };
  }
  return { sets, activeSetId };
}

/** Parses a JSON payload into normalized cards. */
export function parseCardPayload(payloadText) {
  let parsed;
  try {
    parsed = JSON.parse(payloadText);
  } catch {
    return { ok: false, message: "Invalid JSON format." };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, message: "JSON payload must be an array." };
  }

  const cards = parsed.map(normalizeImportedCard).filter(Boolean);
  if (cards.length === 0) {
    return { ok: false, message: "No valid cards found in payload." };
  }

  return { ok: true, cards };
}

function computeStats(cards) {
  const know = cards.filter((card) => card.status === "know").length;
  const practicing = cards.filter((card) => card.status === "practicing").length;
  const fresh = cards.filter((card) => card.status === "new").length;
  return {
    total: cards.length,
    know,
    active: cards.length - know,
    stillLearning: cards.length - know,
    practicing,
    new: fresh,
  };
}

export function useStudySets() {
  const [state, setState] = useState(getInitialState);
  const { sets, activeSetId } = state;

  useEffect(() => {
    saveSets(state);
  }, [state]);

  const activeSet = useMemo(
    () => sets.find((set) => set.id === activeSetId) ?? null,
    [sets, activeSetId],
  );
  const cards = activeSet ? activeSet.cards : EMPTY_CARDS;

  // ---- Set management -------------------------------------------------------

  const setActiveSet = useCallback((id) => {
    setState((prev) =>
      prev.sets.some((set) => set.id === id) ? { ...prev, activeSetId: id } : prev,
    );
  }, []);

  const createNewSet = useCallback((name) => {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return null;
    const nextSet = createSet(trimmed);
    setState((prev) => ({ sets: [...prev.sets, nextSet], activeSetId: nextSet.id }));
    return nextSet.id;
  }, []);

  const renameSet = useCallback((id, name) => {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      sets: prev.sets.map((set) => (set.id === id ? { ...set, name: trimmed } : set)),
    }));
  }, []);

  const deleteSet = useCallback((id) => {
    setState((prev) => {
      const index = prev.sets.findIndex((set) => set.id === id);
      if (index === -1) return prev;

      const nextSets = prev.sets.filter((set) => set.id !== id);
      let nextActiveId = prev.activeSetId;
      if (prev.activeSetId === id) {
        // Prefer the set that slid into this position, otherwise the previous one.
        const neighbor = nextSets[index] ?? nextSets[index - 1] ?? null;
        nextActiveId = neighbor ? neighbor.id : null;
      }
      return { sets: nextSets, activeSetId: nextActiveId };
    });
  }, []);

  // ---- Card operations (scoped to the active set) ---------------------------

  const updateActiveCards = useCallback((updater) => {
    setState((prev) => {
      if (!prev.activeSetId) return prev;
      return {
        ...prev,
        sets: prev.sets.map((set) =>
          set.id === prev.activeSetId ? { ...set, cards: updater(set.cards) } : set,
        ),
      };
    });
  }, []);

  const addCard = useCallback(
    (front = "", back = "") => {
      const nextCard = createCard(front, back);
      updateActiveCards((prev) => [nextCard, ...prev]);
    },
    [updateActiveCards],
  );

  const updateCard = useCallback(
    (id, updates) => {
      updateActiveCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...updates } : card)),
      );
    },
    [updateActiveCards],
  );

  const removeCard = useCallback(
    (id) => {
      updateActiveCards((prev) => prev.filter((card) => card.id !== id));
    },
    [updateActiveCards],
  );

  const resetAllCardsToNew = useCallback(() => {
    updateActiveCards((prev) => prev.map((card) => ({ ...card, status: "new" })));
  }, [updateActiveCards]);

  // ---- Import ---------------------------------------------------------------

  const importCardsToSet = useCallback(
    (payloadText, setId) => {
      const target = sets.find((set) => set.id === setId);
      if (!target) {
        return { ok: false, message: "Choose a study set to import into." };
      }

      const result = parseCardPayload(payloadText);
      if (!result.ok) return result;

      setState((prev) => ({
        ...prev,
        sets: prev.sets.map((set) =>
          set.id === setId ? { ...set, cards: [...result.cards, ...set.cards] } : set,
        ),
      }));
      return { ok: true, count: result.cards.length, setName: target.name };
    },
    [sets],
  );

  const importCardsToNewSet = useCallback((payloadText, name) => {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      return { ok: false, message: "Enter a name for the new study set." };
    }

    const result = parseCardPayload(payloadText);
    if (!result.ok) return result;

    const nextSet = { ...createSet(trimmed), cards: result.cards };
    setState((prev) => ({ sets: [...prev.sets, nextSet], activeSetId: nextSet.id }));
    return { ok: true, count: result.cards.length, setName: trimmed };
  }, []);

  const stats = useMemo(() => computeStats(cards), [cards]);

  return {
    sets,
    activeSetId,
    activeSet,
    setActiveSet,
    createNewSet,
    renameSet,
    deleteSet,
    cards,
    stats,
    addCard,
    updateCard,
    removeCard,
    resetAllCardsToNew,
    importCardsToSet,
    importCardsToNewSet,
  };
}
