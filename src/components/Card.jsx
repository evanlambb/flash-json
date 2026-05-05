function Card({ front, back, flipped, onFlip }) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="perspective-1000 h-72 w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <div
        className="transform-style-3d relative h-full w-full rounded-2xl transition-transform duration-500"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <CardFace label="Front" text={front} />
        <CardFace label="Back" text={back} back />
      </div>
    </button>
  );
}

function CardFace({ label, text, back = false }) {
  return (
    <div
      className="backface-hidden absolute inset-0 flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      style={{ transform: back ? "rotateY(180deg)" : "rotateY(0deg)" }}
    >
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-4 flex-1 overflow-auto text-balance text-xl text-slate-900">
        {text || <span className="text-slate-400">(empty)</span>}
      </div>
      <p className="mt-4 text-xs text-slate-400">Click card to flip</p>
    </div>
  );
}

export default Card;
