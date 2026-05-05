import { useEffect, useMemo, useState } from "react";
import { shuffleArray } from "../lib/cardUtils";
import Card from "./Card";

function StudySession({ cards, onUpdateCard }) {
  const studyCandidates = useMemo(
    () => cards.filter((card) => card.status !== "know"),
    [cards],
  );

  const [queue, setQueue] = useState([]);
  const [flipped, setFlipped] = useState(false);

  const startSession = () => {
    setQueue(shuffleArray(studyCandidates).map((card) => card.id));
    setFlipped(false);
  };

  useEffect(() => {
    setQueue((prev) => prev.filter((id) => studyCandidates.some((card) => card.id === id)));
  }, [studyCandidates]);

  const currentCard = useMemo(() => {
    if (queue.length === 0) return null;
    return cards.find((card) => card.id === queue[0]) || null;
  }, [cards, queue]);

  const handleKnow = () => {
    if (!currentCard) return;
    onUpdateCard(currentCard.id, { status: "know" });
    setQueue((prev) => prev.slice(1));
    setFlipped(false);
  };

  const handleStillPracticing = () => {
    if (!currentCard) return;
    onUpdateCard(currentCard.id, { status: "practicing" });
    setQueue((prev) => [...prev.slice(1), currentCard.id]);
    setFlipped(false);
  };

  if (studyCandidates.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">All caught up</h2>
        <p className="mt-2 text-slate-600">
          Every card is marked as know. Add new cards or reset some statuses in Manage Deck.
        </p>
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
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Start Session
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Study Session</h2>
        <p className="text-sm text-slate-500">{queue.length} cards left in queue</p>
      </div>

      {currentCard ? (
        <>
          <Card
            front={currentCard.front}
            back={currentCard.back}
            flipped={flipped}
            onFlip={() => setFlipped((prev) => !prev)}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleStillPracticing}
              className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Still Practicing
            </button>
            <button
              type="button"
              onClick={handleKnow}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Know
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default StudySession;
