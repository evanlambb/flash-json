import { useEffect, useId, useRef, useState } from "react";

const actionButtonClass =
  "w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#d1d0c5] dark:hover:bg-[#3a3d44]";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-[#4a4d57] dark:bg-[#323437] dark:text-[#d1d0c5] dark:focus:border-[#e2b714]";

const primaryButtonClass =
  "rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#e2b714] dark:bg-transparent dark:text-[#e2b714] dark:hover:bg-[#e2b714]/10";

const secondaryButtonClass =
  "rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-[#4a4d57] dark:text-[#d1d0c5] dark:hover:bg-[#3a3d44]";

function SetSelector({ sets, activeSetId, onSelect, onCreate, onRename, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  // "list" shows the sets; "create" / "rename" show a name form.
  const [mode, setMode] = useState("list");
  const [nameInput, setNameInput] = useState("");
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const inputId = useId();

  const activeSet = sets.find((set) => set.id === activeSetId) ?? null;

  const close = ({ restoreFocus = false } = {}) => {
    setIsOpen(false);
    setMode("list");
    setNameInput("");
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close({ restoreFocus: true });
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id) => {
    onSelect(id);
    close({ restoreFocus: true });
  };

  const startCreate = () => {
    setMode("create");
    setNameInput("");
  };

  const startRename = () => {
    if (!activeSet) return;
    setMode("rename");
    setNameInput(activeSet.name);
  };

  const handleDelete = () => {
    if (!activeSet) return;
    const confirmed = window.confirm(
      `Delete "${activeSet.name}" and all of its cards? This cannot be undone.`,
    );
    if (!confirmed) return;
    onDelete(activeSet.id);
    close({ restoreFocus: true });
  };

  const handleSubmitName = (event) => {
    event.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (mode === "create") {
      onCreate(trimmed);
    } else if (mode === "rename" && activeSet) {
      onRename(activeSet.id, trimmed);
    }
    close({ restoreFocus: true });
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Study set: ${activeSet ? activeSet.name : "none selected"}. Change study set`}
        className="inline-flex max-w-[16rem] items-center gap-2 rounded-md px-3 py-1 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-[#2c2e31] dark:focus-visible:ring-[#e2b714]"
      >
        <span className="truncate text-xl font-semibold tracking-tight">
          {activeSet ? activeSet.name : "No set"}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform dark:text-[#646669] ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          className="absolute left-1/2 z-30 mt-2 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-xl dark:border-[#4a4d57] dark:bg-[#2c2e31]"
        >
          {mode === "list" ? (
            <>
              {sets.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500 dark:text-[#646669]">No study sets yet.</p>
              ) : (
                <ul className="max-h-64 overflow-y-auto" aria-label="Study sets">
                  {sets.map((set) => {
                    const isActive = set.id === activeSetId;
                    return (
                      <li key={set.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(set.id)}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-[#3a3d44] ${
                            isActive
                              ? "font-semibold text-slate-900 dark:text-[#e2b714]"
                              : "text-slate-700 dark:text-[#d1d0c5]"
                          }`}
                        >
                          <span className="truncate">{set.name}</span>
                          <span className="shrink-0 text-xs font-normal text-slate-500 dark:text-[#646669]">
                            {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-2 space-y-0.5 border-t border-slate-200 pt-2 dark:border-[#4a4d57]">
                <button type="button" onClick={startCreate} className={actionButtonClass}>
                  New set
                </button>
                <button
                  type="button"
                  onClick={startRename}
                  disabled={!activeSet}
                  className={actionButtonClass}
                >
                  Rename set
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!activeSet}
                  className={actionButtonClass}
                >
                  Delete set
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitName} className="space-y-3 p-2">
              <label htmlFor={inputId} className="block text-sm font-medium">
                {mode === "create" ? "New set name" : "Rename set"}
              </label>
              <input
                id={inputId}
                type="text"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                autoFocus
                className={inputClass}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setMode("list")} className={secondaryButtonClass}>
                  Cancel
                </button>
                <button type="submit" disabled={!nameInput.trim()} className={primaryButtonClass}>
                  {mode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SetSelector;
