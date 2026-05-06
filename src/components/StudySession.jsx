import { useEffect, useMemo, useState } from "react";
import { shuffleArray } from "../lib/cardUtils";
import Card from "./Card";

function StudySession({ cards, onUpdateCard, onResetAllCardsToNew }) {
  const studyCandidates = useMemo(
    () => cards.filter((card) => card.status !== "know"),
    [cards],
  );

  const [queue, setQueue] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [shouldAutoStartAfterReset, setShouldAutoStartAfterReset] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const startSession = () => {
    setQueue(shuffleArray(studyCandidates).map((card) => card.id));
    setFlipped(false);
  };

  useEffect(() => {
    setQueue((prev) => prev.filter((id) => studyCandidates.some((card) => card.id === id)));
  }, [studyCandidates]);

  useEffect(() => {
    if (!shouldAutoStartAfterReset || studyCandidates.length === 0) return;
    setQueue(shuffleArray(studyCandidates).map((card) => card.id));
    setFlipped(false);
    setShouldAutoStartAfterReset(false);
  }, [shouldAutoStartAfterReset, studyCandidates]);

  const currentCard = useMemo(() => {
    if (queue.length === 0) return null;
    return cards.find((card) => card.id === queue[0]) || null;
  }, [cards, queue]);

  const handleKnow = () => {
    if (!currentCard) return;
    setFeedback("know");
    const currentCardId = currentCard.id;
    window.setTimeout(() => {
      onUpdateCard(currentCardId, { status: "know" });
      setQueue((prev) => prev.slice(1));
      setFlipped(false);
      setFeedback(null);
    }, 270);
  };

  const handleStillPracticing = () => {
    if (!currentCard) return;
    setFeedback("practicing");
    const currentCardId = currentCard.id;
    window.setTimeout(() => {
      onUpdateCard(currentCardId, { status: "practicing" });
      setQueue((prev) => [...prev.slice(1), currentCardId]);
      setFlipped(false);
      setFeedback(null);
    }, 270);
  };

  useEffect(() => {
    if (!currentCard) return;

    const onKeyDown = (event) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTypingTarget || feedback) return;

      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((prev) => !prev);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        handleStillPracticing();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        handleKnow();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentCard, feedback]);

  const hasCards = cards.length > 0;
  const allKnown = hasCards && cards.every((card) => card.status === "know");

  const handleResetDeck = () => {
    setShouldAutoStartAfterReset(true);
    onResetAllCardsToNew();
    setQueue([]);
    setFlipped(false);
  };

  if (!hasCards) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">No cards yet</h2>
        <p className="mt-2 text-slate-600">
          Add cards in Manage Deck to start your first study session.
        </p>
      </section>
    );
  }

  if (allKnown) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Congratulations!</h2>
        <p className="mt-2 text-slate-600">
          You marked every card as known. Ready for another round?
        </p>
        <button
          type="button"
          onClick={handleResetDeck}
          className="mt-6 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Reset Cards to New
        </button>
      </section>
    );
  }

  if (queue.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Session Complete</h2>
        <p className="mt-2 text-slate-600">
          You completed this round. Start another shuffled pass when ready.
        </p>
        <button
          type="button"
          onClick={startSession}
          className="mt-6 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Start Session
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Study Session</h2>

      {currentCard ? (
        <>
          <div className="mx-auto w-full max-w-2xl space-y-3">
            <Card
              front={currentCard.front}
              back={currentCard.back}
              flipped={flipped}
              onFlip={() => {
                if (feedback) return;
                setFlipped((prev) => !prev);
              }}
              feedback={feedback}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStillPracticing}
                disabled={Boolean(feedback)}
                className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Still Practicing
              </button>
              <button
                type="button"
                onClick={handleKnow}
                disabled={Boolean(feedback)}
                className="flex-1 rounded-md border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Know
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default StudySession;
