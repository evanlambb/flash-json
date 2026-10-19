let idCounter = 0;

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `card-${Date.now()}-${idCounter}`;
}

export function createCard(front = "", back = "") {
  return {
    id: generateId(),
    front,
    back,
    status: "new",
  };
}

export function normalizeImportedCard(raw) {
  if (!raw || typeof raw !== "object") return null;

  const front = typeof raw.front === "string" ? raw.front.trim() : "";
  const back = typeof raw.back === "string" ? raw.back.trim() : "";

  if (!front && !back) return null;

  const status = ["new", "practicing", "know"].includes(raw.status) ? raw.status : "new";

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : generateId(),
    front,
    back,
    status,
  };
}

export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
