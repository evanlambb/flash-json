# Flash JSON

A minimal, browser-based flashcard app for studying decks defined as JSON. Cards are stored locally in your browser, so there's no account, no server, and no syncing — just import a deck and start studying.

Built with React 19, Vite, and Tailwind CSS.

## Features

- **JSON-first decks** — Paste or import an array of `{ front, back }` cards and they show up instantly.
- **Three-state progress tracking** — Each card is `new`, `practicing`, or `know`. Progress is persisted to `localStorage`.
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

## Importing a deck

Use the **Manage Deck** section to paste a JSON array of cards. Each card must have a `front` and `back` string; `id` and `status` are optional.

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
  components/      React UI (FlashcardApp, StudySession, DeckManager, Card)
  hooks/           useFlashcards — state, persistence, import logic
  lib/             cardUtils, deckStorage (localStorage helpers)
  App.jsx          App shell
  main.jsx         Vite entry
```

## License

ISC — see [LICENSE](./LICENSE).
