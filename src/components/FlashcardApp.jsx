import { useEffect, useId, useState } from "react";
import { useStudySets } from "../hooks/useStudySets";
import DeckManager from "./DeckManager";
import SetSelector from "./SetSelector";
import StudySession from "./StudySession";

function FlashcardApp() {
  const studySets = useStudySets();
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
            <h1 className="sr-only">{studySets.activeSet ? studySets.activeSet.name : "Flash JSON"}</h1>
            <SetSelector
              sets={studySets.sets}
              activeSetId={studySets.activeSetId}
              onSelect={studySets.setActiveSet}
              onCreate={studySets.createNewSet}
              onRename={studySets.renameSet}
              onDelete={studySets.deleteSet}
            />
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <StatValue
              value={studySets.stats.total}
              tone="text-slate-900 dark:text-[#d1d0c5]"
              label="Total Cards"
            />
            <VerticalDivider />
            <StatValue
              value={studySets.stats.know}
              tone="text-emerald-700 dark:text-[#e2b714]"
              label="Known"
            />
            <VerticalDivider />
            <StatValue
              value={studySets.stats.stillLearning}
              tone="text-rose-700 dark:text-[#646669]"
              label="Still Learning"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6">
        {studySets.activeSet ? (
          <>
            <section id="study-mode" className="scroll-mt-28 space-y-4">
              <StudySession
                key={studySets.activeSetId}
                cards={studySets.cards}
                onUpdateCard={studySets.updateCard}
                onResetAllCardsToNew={studySets.resetAllCardsToNew}
              />
            </section>

            <section id="manage-deck" className="mt-20 scroll-mt-28 space-y-4 border-t border-slate-200 pt-8 sm:mt-24">
              <SectionHeading
                title="Manage Deck"
                subtitle="Import, create, and edit cards in your study set."
              />
              <DeckManager
                cards={studySets.cards}
                sets={studySets.sets}
                activeSetId={studySets.activeSetId}
                onAddCard={studySets.addCard}
                onUpdateCard={studySets.updateCard}
                onRemoveCard={studySets.removeCard}
                onImportToSet={studySets.importCardsToSet}
                onImportToNewSet={studySets.importCardsToNewSet}
              />
            </section>
          </>
        ) : (
          <NoSetsState onCreate={studySets.createNewSet} />
        )}
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

function NoSetsState({ onCreate }) {
  const [name, setName] = useState("");
  const inputId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[#4a4d57] dark:bg-[#2c2e31]">
      <h2 className="text-2xl font-semibold tracking-tight">No study sets yet</h2>
      <p className="mt-2 text-slate-600 dark:text-[#646669]">
        Create a study set to start adding and importing cards.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3">
        <label htmlFor={inputId} className="sr-only">
          Study set name
        </label>
        <input
          id={inputId}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Study set name"
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-[#4a4d57] dark:bg-[#323437] dark:text-[#d1d0c5] dark:focus:border-[#e2b714]"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#e2b714] dark:bg-transparent dark:text-[#e2b714] dark:hover:bg-[#e2b714]/10"
        >
          Create Set
        </button>
      </form>
    </section>
  );
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
