function Card({ front, back, flipped, onFlip, feedback }) {
  const feedbackMotionClass =
    feedback === "know"
      ? "translate-x-10 opacity-80 rotate-1"
      : feedback === "practicing"
        ? "-translate-x-10 opacity-80 -rotate-1"
        : "translate-x-0 opacity-100 rotate-0";

  return (
    <button
      type="button"
      onClick={onFlip}
      className={`card-perspective h-80 w-full rounded-2xl text-left transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${feedbackMotionClass} ${
        feedback ? "cursor-default" : "cursor-pointer"
      }`}
      disabled={Boolean(feedback)}
    >
      <div
        className="transform-style-3d relative h-full w-full rounded-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{ transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
      >
        <CardFace label="Term" text={front} feedback={feedback} />
        <CardFace label="Definition" text={back} back feedback={feedback} />
      </div>
    </button>
  );
}

function CardFace({ label, text, back = false, feedback }) {
  const feedbackToneClass =
    feedback === "know"
      ? "border-emerald-300 bg-emerald-100"
      : feedback === "practicing"
        ? "border-rose-300 bg-rose-100"
        : "border-slate-200 bg-white";

  return (
    <div
      className={`backface-hidden absolute inset-0 flex h-full w-full flex-col rounded-2xl border p-7 shadow-sm transition-colors duration-[225ms] ${feedbackToneClass}`}
      style={{ transform: back ? "rotateX(180deg)" : "rotateX(0deg)" }}
    >
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <div className="mt-6 flex-1 overflow-auto text-balance text-2xl text-slate-900">
        {text || <span className="text-slate-400">(empty)</span>}
      </div>
      <p className="mt-4 text-xs text-slate-400">Click card to flip</p>
    </div>
  );
}

export default Card;
