import { useState } from "react";

function DeckManager({ cards, onAddCard, onUpdateCard, onRemoveCard, onImportCards }) {
  const [importText, setImportText] = useState("");
  const [importFeedback, setImportFeedback] = useState(null);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  const handleImport = () => {
    const result = onImportCards(importText);
    if (result.ok) {
      setImportFeedback({ type: "success", message: `Imported ${result.count} cards.` });
      setImportText("");
    } else {
      setImportFeedback({ type: "error", message: result.message });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    setImportFeedback(null);
  };

  const handleAddCard = () => {
    onAddCard(newCardFront, newCardBack);
    setNewCardFront("");
    setNewCardBack("");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Import JSON Deck</h2>
        <p className="mt-1 text-sm text-slate-500">
          Paste JSON array like [{`{"front":"Hola","back":"Hello"}`}]
        </p>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder='[{"front":"Question","back":"Answer"}]'
          className="mt-4 h-36 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-400 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleImport}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Import JSON
          </button>
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Upload .json
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        {importFeedback ? (
          <p
            className={`mt-3 text-sm ${
              importFeedback.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {importFeedback.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Add Card</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <textarea
            value={newCardFront}
            onChange={(event) => setNewCardFront(event.target.value)}
            placeholder="Front"
            className="h-24 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          <textarea
            value={newCardBack}
            onChange={(event) => setNewCardBack(event.target.value)}
            placeholder="Back"
            className="h-24 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCard}
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Add Card
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Deck Cards ({cards.length})</h2>
        <div className="mt-4 space-y-3">
          {cards.length === 0 ? (
            <p className="text-sm text-slate-500">No cards yet. Add or import cards above.</p>
          ) : (
            cards.map((card) => (
              <article key={card.id} className="rounded-lg border border-slate-200 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <textarea
                    value={card.front}
                    onChange={(event) => onUpdateCard(card.id, { front: event.target.value })}
                    className="h-20 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                  <textarea
                    value={card.back}
                    onChange={(event) => onUpdateCard(card.id, { back: event.target.value })}
                    className="h-20 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusSelect
                    value={card.status}
                    onChange={(status) => onUpdateCard(card.id, { status })}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveCard(card.id)}
                    className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
      Status
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-normal text-slate-700 focus:border-indigo-400 focus:outline-none"
      >
        <option value="new">New</option>
        <option value="practicing">Practicing</option>
        <option value="know">Know</option>
      </select>
    </label>
  );
}

export default DeckManager;
