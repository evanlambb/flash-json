import { useEffect, useState } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
import DeckManager from "./DeckManager";
import StudySession from "./StudySession";

function FlashcardApp() {
  const flashcards = useFlashcards();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("flashcards-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("flashcards-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-[#4a4d57] dark:bg-[#323437]/95">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-3 sm:items-center sm:px-6">
          <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <span>Flash JSON</span>
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-[#4a4d57] dark:bg-[#2c2e31] dark:text-[#d1d0c5] dark:hover:border-[#e2b714] dark:hover:text-[#e2b714]"
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">CS 245</h1>
            <p className="text-xs text-slate-500 dark:text-[#646669]">Study Set</p>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <StatValue
              value={flashcards.stats.total}
              tone="text-slate-900 dark:text-[#d1d0c5]"
              label="Total Cards"
            />
            <VerticalDivider />
            <StatValue
              value={flashcards.stats.know}
              tone="text-emerald-700 dark:text-[#e2b714]"
              label="Known"
            />
            <VerticalDivider />
            <StatValue
              value={flashcards.stats.stillLearning}
              tone="text-rose-700 dark:text-[#646669]"
              label="Still Learning"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        <section id="study-mode" className="scroll-mt-28 space-y-4">
          <StudySession
            cards={flashcards.cards}
            onUpdateCard={flashcards.updateCard}
            onResetAllCardsToNew={flashcards.resetAllCardsToNew}
          />
        </section>

        <section id="manage-deck" className="mt-20 scroll-mt-28 space-y-4 border-t border-slate-200 pt-8 sm:mt-24">
          <SectionHeading
            title="Manage Deck"
            subtitle="Import, create, and edit cards in your study set."
          />
          <DeckManager
            cards={flashcards.cards}
            onAddCard={flashcards.addCard}
            onUpdateCard={flashcards.updateCard}
            onRemoveCard={flashcards.removeCard}
            onImportCards={flashcards.importCards}
          />
        </section>
      </main>
    </div>
  );
}

function StatValue({ value, tone, label }) {
  return (
    <p className={`px-3 text-xl font-semibold leading-none ${tone}`} aria-label={`${label}: ${value}`}>
      {value}
    </p>
  );
}

function VerticalDivider() {
  return <span className="h-6 w-px bg-slate-300 dark:bg-[#4a4d57]" aria-hidden="true" />;
}

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-[#646669]">{subtitle}</p>
    </div>
  );
}

export default FlashcardApp;
