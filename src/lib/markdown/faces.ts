import type { Card } from "./schema";

/** Markdown for the two sides of a flashcard. */
export function cardFaces(card: Card): { front: string; back: string } {
  const explain = card.explain ? `\n\n${card.explain}` : "";
  if (card.type === "mcq") {
    return {
      front: `${card.q}\n\n${card.options.map((o) => `- ${o.text}`).join("\n")}`,
      back: `**${card.options.find((o) => o.correct)?.text ?? ""}**${explain}`,
    };
  }
  return { front: card.q, back: (card.type === "tf" ? `**${card.a ? "True" : "False"}**` : card.a) + explain };
}
