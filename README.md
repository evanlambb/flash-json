# Flash JSON

A minimal, browser-based flashcard app for studying decks defined as JSON. Cards are stored locally in your browser, so there's no account, no server, and no syncing — just import a deck and start studying.

Built with React 19, Vite, and Tailwind CSS.

## Features

- **Multiple study sets** — Keep separate sets (e.g. one per class), switch between them from the header dropdown, and create, rename, or delete sets. Each set has its own cards and progress.
- **JSON-first decks** — Paste or import an array of `{ front, back }` cards into an existing set or a brand-new one.
- **Three-state progress tracking** — Each card is `new`, `practicing`, or `know`. Progress is persisted to `localStorage` per set.
- **Focused study session** — Step through your deck, flip cards, and mark them as known or still learning.
- **Deck management** — Add, edit, remove, and bulk-import cards from the UI.
- **Light & dark mode** — Toggle from the header; preference is remembered.
- **Zero backend** — Everything runs in the browser; your deck never leaves your machine.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

### Build

```bash
npm run build
npm run preview
```

### Test

```bash
npm test
```

## Study sets

Click the set name in the header to switch sets or to create, rename, and delete them. All sets are saved in `localStorage` under the `flashcards-sets` key. Deleting every set is allowed; the app then prompts you to create a new one.

## Importing a deck

Use **Import JSON** in the **Manage Deck** section. Pick the set to import into (it defaults to the active set) or choose **New set…** and give it a name; importing into a new set switches to it. Then paste a JSON array of cards or upload a `.json` file. Each card must have a `front` and `back` string; `id` and `status` are optional.

```json
[
  {
    "front": "What is the time complexity of binary search?",
    "back": "O(log n)"
  },
  {
    "front": "Define a regular language.",
    "back": "A language accepted by some finite automaton."
  }
]
```

Allowed values for `status`: `"new"`, `"practicing"`, `"know"`. Invalid or missing values default to `"new"`.

## Project structure

```
src/
  components/      React UI (FlashcardApp, SetSelector, StudySession, DeckManager, Card)
  hooks/           useStudySets — sets, active set, card ops, persistence, import logic
  lib/             cardUtils, setStorage (localStorage helpers)
  test/            Vitest setup
  App.jsx          App shell
  main.jsx         Vite entry
```

## License

ISC — see [LICENSE](./LICENSE).
