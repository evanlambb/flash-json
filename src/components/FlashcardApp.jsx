import { useState } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
import DeckManager from "./DeckManager";
import StudySession from "./StudySession";

const VIEWS = {
  study: "study",
  manage: "manage",
};

function FlashcardApp() {
  const [view, setView] = useState(VIEWS.study);
  const flashcards = useFlashcards();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Flashcards</h1>
            <p className="text-sm text-slate-500">
              {flashcards.stats.total} total, {flashcards.stats.active} to study
            </p>
          </div>
          <nav className="flex gap-2 rounded-lg bg-slate-100 p-1">
            <NavButton
              active={view === VIEWS.study}
              onClick={() => setView(VIEWS.study)}
            >
              Study Mode
            </NavButton>
            <NavButton
              active={view === VIEWS.manage}
              onClick={() => setView(VIEWS.manage)}
            >
              Manage Deck
            </NavButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {view === VIEWS.study ? (
          <StudySession cards={flashcards.cards} onUpdateCard={flashcards.updateCard} />
        ) : (
          <DeckManager
            cards={flashcards.cards}
            onAddCard={flashcards.addCard}
            onUpdateCard={flashcards.updateCard}
            onRemoveCard={flashcards.removeCard}
            onImportCards={flashcards.importCards}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export default FlashcardApp;
