"use client";

import { useState } from "react";
import { cardFaces } from "@/lib/markdown/faces";
import type { Deck } from "@/lib/markdown/schema";
import { Flashcard } from "./Flashcard";

// Temporary: stands in for study mode until Milestone 5.
export function FlashcardDemo({ deck }: { deck: Deck }) {
  const [i, setI] = useState(0);
  const last = deck.cards.length - 1;
  const go = (step: number) => setI((v) => Math.min(last, Math.max(0, v + step)));
  const button = "rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-700";

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="text-sm text-zinc-500">
        {deck.title} · {i + 1} / {deck.cards.length}
      </p>
      <Flashcard key={deck.cards[i].id} {...cardFaces(deck.cards[i])} onPrev={() => go(-1)} onNext={() => go(1)} />
      <div className="flex gap-3">
        <button className={button} onClick={() => go(-1)} disabled={i === 0}>
          ← Previous
        </button>
        <button className={button} onClick={() => go(1)} disabled={i === last}>
          Next →
        </button>
      </div>
      <p className="text-xs text-zinc-500">Click, tap or Space to flip · ← → or swipe to move</p>
    </div>
  );
}
