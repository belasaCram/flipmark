"use client";

import Link from "next/link";
import { useState } from "react";
import { cardFaces } from "@/lib/markdown/faces";
import type { Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { DeckPage } from "./DeckPage";
import { Flashcard } from "./Flashcard";
import { ProgressBar } from "./ProgressBar";
import { btn, btnPrimary, muted, panel, plural } from "./ui";

export function Study() {
  return <DeckPage mode="study">{(deck) => <StudyRun deck={deck} />}</DeckPage>;
}

function StudyRun({ deck }: { deck: Deck }) {
  const all = deck.cards.map((card) => card.id);
  // A round is the list of cards being studied now: the whole deck, a shuffle of it, or only the missed ones.
  const [round, setRound] = useState({ ids: all, pos: 0 });
  const status = useProgress((s) => s.decks[deck.id]?.cards) ?? {};
  const mark = useProgress((s) => s.mark);

  const card = deck.cards.find((c) => c.id === round.ids[round.pos]);
  const start = (ids: string[]) => setRound({ ids, pos: 0 });
  // `pos` may reach ids.length, which is the "round complete" screen.
  const move = (step: number) => setRound((r) => ({ ...r, pos: Math.min(r.ids.length, Math.max(0, r.pos + step)) }));
  const missed = round.ids.filter((id) => status[id] === "missed");

  if (!card) {
    return (
      <section className={`${panel} flex flex-col items-center gap-4 text-center`} aria-live="polite">
        <h2 className="text-xl font-semibold">Round complete</h2>
        <p className={muted}>
          {round.ids.length - missed.length} of {plural(round.ids.length, "card")} marked “Got it”
          {missed.length > 0 && `, ${missed.length} to review`}.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {missed.length > 0 && (
            <button className={btnPrimary} onClick={() => start(missed)}>
              Review {plural(missed.length, "missed card")}
            </button>
          )}
          <button className={missed.length ? btn : btnPrimary} onClick={() => start(all)}>
            Study all again
          </button>
          <Link href={`/deck/${encodeURIComponent(deck.id)}/quiz`} className={btn}>
            Take the quiz
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-5">
      <div className="flex w-full items-center gap-3">
        <ProgressBar value={round.pos} max={round.ids.length} label="Cards studied this round" />
        <span className={`${muted} shrink-0`}>
          {round.pos + 1} / {round.ids.length}
        </span>
      </div>

      <Flashcard key={card.id} {...cardFaces(card)} onPrev={() => move(-1)} onNext={() => move(1)} />

      <div className="flex flex-wrap justify-center gap-3">
        <button
          className={btn}
          onClick={() => {
            mark(deck.id, card.id, "missed");
            move(1);
          }}
        >
          Review again
        </button>
        <button
          className={btnPrimary}
          onClick={() => {
            mark(deck.id, card.id, "known");
            move(1);
          }}
        >
          Got it
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button className={btn} onClick={() => move(-1)} disabled={round.pos === 0}>
          ← Previous
        </button>
        <button className={btn} onClick={() => start(shuffle(all))}>
          Shuffle
        </button>
        <button className={btn} onClick={() => move(1)}>
          Skip →
        </button>
      </div>
      <p className="text-xs text-zinc-500">Click, tap or Space to flip · ← → or swipe to move</p>
    </section>
  );
}
