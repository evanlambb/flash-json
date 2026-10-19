import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSets, saveSets } from "../lib/setStorage";
import FlashcardApp from "./FlashcardApp";

const card = (id, front, status = "new") => ({ id, front, back: `${front}-back`, status });

function seedTwoSets(activeSetId = "a") {
  saveSets({
    sets: [
      { id: "a", name: "Biology", cards: [card("a1", "Mitochondria")] },
      { id: "b", name: "Spanish", cards: [card("b1", "Hola"), card("b2", "Adios", "know")] },
    ],
    activeSetId,
  });
}

const trigger = () => screen.getByRole("button", { name: /^Study set:/ });
const openSelector = async (user) => user.click(trigger());
const deckCardsHeading = () => screen.getByRole("heading", { name: /^Deck Cards/ });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FlashcardApp with study sets", () => {
  it("starts fresh with a default empty set", () => {
    render(<FlashcardApp />);
    expect(trigger()).toHaveTextContent("My Set");
    expect(screen.getByText("No cards yet")).toBeInTheDocument();
  });

  it("shows the active set's name, cards, and stats", () => {
    seedTwoSets("b");
    render(<FlashcardApp />);
    expect(trigger()).toHaveTextContent("Spanish");
    expect(deckCardsHeading()).toHaveTextContent("Deck Cards (2)");
    expect(screen.getByLabelText("Total Cards: 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Known: 1")).toBeInTheDocument();
  });

  it("switches sets from the header dropdown", async () => {
    const user = userEvent.setup();
    seedTwoSets("a");
    render(<FlashcardApp />);
    expect(screen.getByText("Mitochondria")).toBeInTheDocument();

    await openSelector(user);
    const list = screen.getByRole("list", { name: "Study sets" });
    expect(within(list).getAllByRole("button")).toHaveLength(2);
    expect(within(list).getByRole("button", { name: /Biology/ })).toHaveAttribute("aria-current", "true");

    await user.click(within(list).getByRole("button", { name: /Spanish/ }));
    expect(trigger()).toHaveTextContent("Spanish");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(deckCardsHeading()).toHaveTextContent("Deck Cards (2)");
    expect(screen.getByText("Hola")).toBeInTheDocument();
    expect(loadSets().activeSetId).toBe("b");
  });

  it("closes the dropdown with Escape", async () => {
    const user = userEvent.setup();
    render(<FlashcardApp />);
    await openSelector(user);
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("creates a new set and switches to it", async () => {
    const user = userEvent.setup();
    seedTwoSets();
    render(<FlashcardApp />);
    await openSelector(user);
    await user.click(screen.getByRole("button", { name: "New set" }));
    await user.type(screen.getByLabelText("New set name"), "Chemistry");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(trigger()).toHaveTextContent("Chemistry");
    expect(deckCardsHeading()).toHaveTextContent("Deck Cards (0)");
    expect(loadSets().sets.map((s) => s.name)).toEqual(["Biology", "Spanish", "Chemistry"]);
  });

  it("renames the active set", async () => {
    const user = userEvent.setup();
    seedTwoSets();
    render(<FlashcardApp />);
    await openSelector(user);
    await user.click(screen.getByRole("button", { name: "Rename set" }));
    const input = screen.getByLabelText("Rename set");
    expect(input).toHaveValue("Biology");
    await user.clear(input);
    await user.type(input, "Bio 101");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(trigger()).toHaveTextContent("Bio 101");
  });

  it("deletes the active set after confirmation, and shows an empty state after the last", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    seedTwoSets();
    render(<FlashcardApp />);

    await openSelector(user);
    await user.click(screen.getByRole("button", { name: "Delete set" }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(trigger()).toHaveTextContent("Biology");

    confirmSpy.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Delete set" }));
    expect(trigger()).toHaveTextContent("Spanish");

    await openSelector(user);
    await user.click(screen.getByRole("button", { name: "Delete set" }));
    expect(trigger()).toHaveTextContent("No set");
    expect(screen.getByText("No study sets yet")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Cards: 0")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^Deck Cards/ })).not.toBeInTheDocument();
  });

  it("creates a set from the empty state", async () => {
    const user = userEvent.setup();
    saveSets({ sets: [], activeSetId: null });
    render(<FlashcardApp />);
    expect(screen.getByText("No study sets yet")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Study set name"), "Fresh");
    await user.click(screen.getByRole("button", { name: "Create Set" }));
    expect(trigger()).toHaveTextContent("Fresh");
    expect(screen.queryByText("No study sets yet")).not.toBeInTheDocument();
  });
});

describe("Import flow with target set", () => {
  const openImport = async (user) => {
    await user.click(screen.getByRole("button", { name: "Import JSON" }));
    return screen.getByRole("dialog", { name: "Import JSON Deck" });
  };

  const pasteJson = async (user, dialog, value) => {
    const textarea = within(dialog).getByLabelText("Deck JSON");
    await user.click(textarea);
    await user.paste(value);
  };

  it("defaults the target to the active set", async () => {
    const user = userEvent.setup();
    seedTwoSets("b");
    render(<FlashcardApp />);
    const dialog = await openImport(user);
    expect(within(dialog).getByLabelText("Import into")).toHaveValue("b");
  });

  it("imports into a non-active existing set without touching the active set", async () => {
    const user = userEvent.setup();
    seedTwoSets("a");
    render(<FlashcardApp />);
    const dialog = await openImport(user);
    await user.selectOptions(within(dialog).getByLabelText("Import into"), "b");
    await pasteJson(user, dialog, JSON.stringify([{ front: "Gracias", back: "Thanks" }]));
    await user.click(within(dialog).getByRole("button", { name: "Import JSON" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Imported 1 card into Spanish.")).toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Biology");
    expect(deckCardsHeading()).toHaveTextContent("Deck Cards (1)");
    expect(loadSets().sets.find((s) => s.id === "b").cards).toHaveLength(3);
  });

  it("imports into a new set, creating and activating it", async () => {
    const user = userEvent.setup();
    seedTwoSets("a");
    render(<FlashcardApp />);
    const dialog = await openImport(user);
    await user.selectOptions(within(dialog).getByLabelText("Import into"), "New set…");
    await user.type(within(dialog).getByLabelText("New set name"), "Physics");
    await pasteJson(
      user,
      dialog,
      JSON.stringify([
        { front: "F", back: "ma" },
        { front: "E", back: "mc^2" },
      ]),
    );
    await user.click(within(dialog).getByRole("button", { name: "Import JSON" }));

    expect(screen.getByText("Imported 2 cards into Physics.")).toBeInTheDocument();
    expect(trigger()).toHaveTextContent("Physics");
    expect(deckCardsHeading()).toHaveTextContent("Deck Cards (2)");
  });

  it("shows errors in the modal for a missing new-set name and invalid JSON", async () => {
    const user = userEvent.setup();
    seedTwoSets("a");
    render(<FlashcardApp />);
    let dialog = await openImport(user);

    await user.selectOptions(within(dialog).getByLabelText("Import into"), "New set…");
    await pasteJson(user, dialog, JSON.stringify([{ front: "a", back: "b" }]));
    await user.click(within(dialog).getByRole("button", { name: "Import JSON" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Enter a name for the new study set.");

    await user.selectOptions(within(dialog).getByLabelText("Import into"), "a");
    const textarea = within(dialog).getByLabelText("Deck JSON");
    await user.clear(textarea);
    await pasteJson(user, dialog, "{not json");
    await user.click(within(dialog).getByRole("button", { name: "Import JSON" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Invalid JSON format.");
    expect(loadSets().sets).toHaveLength(2);

    // Closing resets the target back to the active set next time.
    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    dialog = await openImport(user);
    expect(within(dialog).getByLabelText("Import into")).toHaveValue("a");
    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
  });
});
