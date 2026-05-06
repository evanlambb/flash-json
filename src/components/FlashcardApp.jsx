import { useFlashcards } from "../hooks/useFlashcards";
import DeckManager from "./DeckManager";
import StudySession from "./StudySession";

function FlashcardApp() {
  const flashcards = useFlashcards();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-3 sm:items-center sm:px-6">
          <div className="text-lg font-semibold tracking-tight">Flash JSON</div>

          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">CS 245</h1>
            <p className="text-xs text-slate-500">Study Set</p>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <StatValue value={flashcards.stats.total} tone="text-slate-900" label="Total Cards" />
            <VerticalDivider />
            <StatValue value={flashcards.stats.know} tone="text-emerald-700" label="Known" />
            <VerticalDivider />
            <StatValue
              value={flashcards.stats.stillLearning}
              tone="text-rose-700"
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
  return <span className="h-6 w-px bg-slate-300" aria-hidden="true" />;
}

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default FlashcardApp;
