import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SETS_STORAGE_KEY, loadSets, saveSets } from "../lib/setStorage";
import { DEFAULT_SET_NAME, useStudySets } from "./useStudySets";

const payload = (cards) => JSON.stringify(cards);

function seed(sets, activeSetId) {
  saveSets({ sets, activeSetId });
}

describe("useStudySets", () => {
  it("seeds one empty default set on first load and persists it", () => {
    const { result } = renderHook(() => useStudySets());
    expect(result.current.sets).toHaveLength(1);
    expect(result.current.activeSet.name).toBe(DEFAULT_SET_NAME);
    expect(result.current.cards).toEqual([]);
    expect(loadSets().sets).toHaveLength(1);
  });

  it("does not reseed when the user previously deleted every set", () => {
    seed([], null);
    const { result } = renderHook(() => useStudySets());
    expect(result.current.sets).toEqual([]);
    expect(result.current.activeSetId).toBeNull();
    expect(result.current.activeSet).toBeNull();
    expect(result.current.cards).toEqual([]);
    expect(result.current.stats.total).toBe(0);
  });

  it("creates a set, makes it active, and ignores empty names", () => {
    const { result } = renderHook(() => useStudySets());
    let id;
    act(() => {
      id = result.current.createNewSet("  Spanish ");
    });
    expect(result.current.activeSetId).toBe(id);
    expect(result.current.activeSet.name).toBe("Spanish");
    expect(result.current.sets).toHaveLength(2);

    let emptyId;
    act(() => {
      emptyId = result.current.createNewSet("   ");
    });
    expect(emptyId).toBeNull();
    expect(result.current.sets).toHaveLength(2);
  });

  it("switches the active set and ignores unknown ids", () => {
    seed(
      [
        { id: "a", name: "A", cards: [] },
        { id: "b", name: "B", cards: [] },
      ],
      "a",
    );
    const { result } = renderHook(() => useStudySets());
    act(() => result.current.setActiveSet("b"));
    expect(result.current.activeSetId).toBe("b");
    act(() => result.current.setActiveSet("nope"));
    expect(result.current.activeSetId).toBe("b");
    expect(JSON.parse(window.localStorage.getItem(SETS_STORAGE_KEY)).activeSetId).toBe("b");
  });

  it("renames a set and ignores empty names", () => {
    seed([{ id: "a", name: "A", cards: [] }], "a");
    const { result } = renderHook(() => useStudySets());
    act(() => result.current.renameSet("a", " Renamed "));
    expect(result.current.activeSet.name).toBe("Renamed");
    act(() => result.current.renameSet("a", "  "));
    expect(result.current.activeSet.name).toBe("Renamed");
  });

  it("deleting the active set switches to an adjacent set", () => {
    seed(
      [
        { id: "a", name: "A", cards: [] },
        { id: "b", name: "B", cards: [] },
        { id: "c", name: "C", cards: [] },
      ],
      "b",
    );
    const { result } = renderHook(() => useStudySets());
    act(() => result.current.deleteSet("b"));
    expect(result.current.sets.map((s) => s.id)).toEqual(["a", "c"]);
    expect(result.current.activeSetId).toBe("c");
    act(() => result.current.deleteSet("c"));
    expect(result.current.activeSetId).toBe("a");
  });

  it("deleting a non-active set keeps the active set", () => {
    seed(
      [
        { id: "a", name: "A", cards: [] },
        { id: "b", name: "B", cards: [] },
      ],
      "a",
    );
    const { result } = renderHook(() => useStudySets());
    act(() => result.current.deleteSet("b"));
    expect(result.current.activeSetId).toBe("a");
  });

  it("deleting the last set leaves no active set", () => {
    const { result } = renderHook(() => useStudySets());
    act(() => result.current.deleteSet(result.current.activeSetId));
    expect(result.current.sets).toEqual([]);
    expect(result.current.activeSetId).toBeNull();
    expect(loadSets()).toEqual({ sets: [], activeSetId: null, hasStoredState: true });
  });

  it("card operations only affect the active set, and stats are per set", () => {
    seed(
      [
        { id: "a", name: "A", cards: [{ id: "x", front: "x", back: "x", status: "know" }] },
        { id: "b", name: "B", cards: [] },
      ],
      "b",
    );
    const { result } = renderHook(() => useStudySets());

    act(() => result.current.addCard("front", "back"));
    expect(result.current.cards).toHaveLength(1);
    const cardId = result.current.cards[0].id;

    act(() => result.current.updateCard(cardId, { status: "practicing" }));
    expect(result.current.stats).toMatchObject({ total: 1, know: 0, practicing: 1, stillLearning: 1 });

    const setA = result.current.sets.find((s) => s.id === "a");
    expect(setA.cards).toEqual([{ id: "x", front: "x", back: "x", status: "know" }]);

    act(() => result.current.setActiveSet("a"));
    expect(result.current.stats).toMatchObject({ total: 1, know: 1, stillLearning: 0 });

    act(() => result.current.resetAllCardsToNew());
    expect(result.current.cards[0].status).toBe("new");
    expect(result.current.sets.find((s) => s.id === "b").cards[0].status).toBe("practicing");

    act(() => result.current.setActiveSet("b"));
    act(() => result.current.removeCard(cardId));
    expect(result.current.cards).toEqual([]);
    expect(result.current.sets.find((s) => s.id === "a").cards).toHaveLength(1);
  });

  it("imports into a specific (non-active) existing set", () => {
    seed(
      [
        { id: "a", name: "A", cards: [] },
        { id: "b", name: "B", cards: [] },
      ],
      "a",
    );
    const { result } = renderHook(() => useStudySets());
    let res;
    act(() => {
      res = result.current.importCardsToSet(payload([{ front: "q", back: "a" }, { front: "q2", back: "a2" }]), "b");
    });
    expect(res).toEqual({ ok: true, count: 2, setName: "B" });
    expect(result.current.activeSetId).toBe("a");
    expect(result.current.cards).toEqual([]);
    expect(result.current.sets.find((s) => s.id === "b").cards).toHaveLength(2);
  });

  it("imports into a new set, creating and activating it", () => {
    const { result } = renderHook(() => useStudySets());
    let res;
    act(() => {
      res = result.current.importCardsToNewSet(payload([{ front: "q", back: "a" }]), " Imported ");
    });
    expect(res).toEqual({ ok: true, count: 1, setName: "Imported" });
    expect(result.current.sets).toHaveLength(2);
    expect(result.current.activeSet.name).toBe("Imported");
    expect(result.current.cards).toHaveLength(1);
  });

  it("returns errors for bad imports without changing state", () => {
    const { result } = renderHook(() => useStudySets());
    const id = result.current.activeSetId;
    const before = result.current.sets;

    let res;
    act(() => {
      res = result.current.importCardsToSet("{bad", id);
    });
    expect(res).toEqual({ ok: false, message: "Invalid JSON format." });

    act(() => {
      res = result.current.importCardsToSet(JSON.stringify({ front: "a" }), id);
    });
    expect(res).toEqual({ ok: false, message: "JSON payload must be an array." });

    act(() => {
      res = result.current.importCardsToSet(payload([{}, null]), id);
    });
    expect(res).toEqual({ ok: false, message: "No valid cards found in payload." });

    act(() => {
      res = result.current.importCardsToSet(payload([{ front: "a", back: "b" }]), "missing");
    });
    expect(res.ok).toBe(false);

    act(() => {
      res = result.current.importCardsToNewSet(payload([{ front: "a", back: "b" }]), "   ");
    });
    expect(res).toEqual({ ok: false, message: "Enter a name for the new study set." });

    act(() => {
      res = result.current.importCardsToNewSet("{bad", "Name");
    });
    expect(res.ok).toBe(false);

    expect(result.current.sets).toBe(before);
  });
});
