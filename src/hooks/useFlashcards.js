import { useCallback, useEffect, useMemo, useState } from "react";
import { createCard, normalizeImportedCard } from "../lib/cardUtils";
import { loadDeck, saveDeck } from "../lib/deckStorage";

export function useFlashcards() {
  const [cards, setCards] = useState(() => loadDeck());

  useEffect(() => {
    saveDeck(cards);
  }, [cards]);

  const addCard = useCallback((front = "", back = "") => {
    const nextCard = createCard(front, back);
    setCards((prev) => [nextCard, ...prev]);
  }, []);

  const updateCard = useCallback((id, updates) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    );
  }, []);

  const removeCard = useCallback((id) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const importCards = useCallback((payloadText) => {
    let parsed;
    try {
      parsed = JSON.parse(payloadText);
    } catch (error) {
      return { ok: false, message: "Invalid JSON format." };
    }

    if (!Array.isArray(parsed)) {
      return { ok: false, message: "JSON payload must be an array." };
    }

    const normalized = parsed.map(normalizeImportedCard).filter(Boolean);
    if (normalized.length === 0) {
      return { ok: false, message: "No valid cards found in payload." };
    }

    setCards((prev) => [...normalized, ...prev]);
    return { ok: true, count: normalized.length };
  }, []);

  const stats = useMemo(() => {
    const know = cards.filter((card) => card.status === "know").length;
    return {
      total: cards.length,
      know,
      active: cards.length - know,
    };
  }, [cards]);

  return {
    cards,
    stats,
    addCard,
    updateCard,
    removeCard,
    importCards,
  };
}
