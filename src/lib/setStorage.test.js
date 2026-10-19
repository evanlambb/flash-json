import { describe, expect, it } from "vitest";
import { SETS_STORAGE_KEY, createSet, loadSets, saveSets } from "./setStorage";

const writeRaw = (value) => window.localStorage.setItem(SETS_STORAGE_KEY, value);

describe("createSet", () => {
  it("creates an empty set with a trimmed name and unique id", () => {
    const a = createSet("  Spanish  ");
    const b = createSet("French");
    expect(a).toMatchObject({ name: "Spanish", cards: [] });
    expect(typeof a.id).toBe("string");
    expect(a.id).not.toBe(b.id);
  });
});

describe("loadSets / saveSets", () => {
  it("returns empty state with hasStoredState=false when nothing is stored", () => {
    expect(loadSets()).toEqual({ sets: [], activeSetId: null, hasStoredState: false });
  });

  it("ignores the legacy single-deck key", () => {
    window.localStorage.setItem("flashcards-deck", JSON.stringify([{ front: "a", back: "b" }]));
    expect(loadSets().hasStoredState).toBe(false);
  });

  it("round-trips sets and the active id", () => {
    const sets = [
      { id: "s1", name: "One", cards: [{ id: "c1", front: "f", back: "b", status: "know" }] },
      { id: "s2", name: "Two", cards: [] },
    ];
    saveSets({ sets, activeSetId: "s2" });
    expect(loadSets()).toEqual({ sets, activeSetId: "s2", hasStoredState: true });
  });

  it("treats an explicitly empty saved list as stored state", () => {
    saveSets({ sets: [], activeSetId: null });
    expect(loadSets()).toEqual({ sets: [], activeSetId: null, hasStoredState: true });
  });

  it("falls back on malformed JSON", () => {
    writeRaw("{not json");
    expect(loadSets()).toEqual({ sets: [], activeSetId: null, hasStoredState: false });
  });

  it("falls back on the wrong top-level shape", () => {
    writeRaw(JSON.stringify([1, 2, 3]));
    expect(loadSets().hasStoredState).toBe(false);
    writeRaw(JSON.stringify({ sets: "nope" }));
    expect(loadSets().hasStoredState).toBe(false);
  });

  it("drops invalid sets, duplicate ids, and invalid cards", () => {
    writeRaw(
      JSON.stringify({
        sets: [
          { id: "s1", name: "Good", cards: [{ front: "q", back: "a", status: "bogus" }, null, {}] },
          { id: "s1", name: "Duplicate", cards: [] },
          { id: 5, name: "Bad id", cards: [] },
          { id: "s3", name: 42, cards: [] },
          { id: "s4", name: "No cards" },
          null,
        ],
        activeSetId: "s1",
      }),
    );
    const { sets, activeSetId } = loadSets();
    expect(sets).toHaveLength(1);
    expect(sets[0].name).toBe("Good");
    expect(sets[0].cards).toHaveLength(1);
    expect(sets[0].cards[0]).toMatchObject({ front: "q", back: "a", status: "new" });
    expect(activeSetId).toBe("s1");
  });

  it("falls back to the first set when activeSetId is invalid", () => {
    writeRaw(
      JSON.stringify({
        sets: [
          { id: "s1", name: "One", cards: [] },
          { id: "s2", name: "Two", cards: [] },
        ],
        activeSetId: "missing",
      }),
    );
    expect(loadSets().activeSetId).toBe("s1");
  });
});
