"use client";

import Link from "next/link";
import { useState } from "react";
import { useHotkeys } from "@/lib/hooks";
import { cardFaces } from "@/lib/markdown/faces";
import type { Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { DeckPage } from "./DeckPage";
import { Flashcard } from "./Flashcard";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { btn, btnGhost, btnPrimary, kbd, muted, panel, plural } from "./ui";

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
  const answer = (result: "known" | "missed") => {
    if (!card) return;
    mark(deck.id, card.id, result);
    move(1);
  };
  const missed = round.ids.filter((id) => status[id] === "missed");

  useHotkeys({ "1": () => answer("missed"), "2": () => answer("known") });

  if (!card) {
    const got = round.ids.length - missed.length;
    return (
      <section className={`${panel} flex flex-col items-center gap-5 py-10 text-center`} aria-live="polite">
        <span className="grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <Icon name="check" className="size-7" />
        </span>
        <h2 className="text-2xl font-semibold">Round complete</h2>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <ProgressBar value={got} max={round.ids.length} label="Cards marked Got it this round" />
          <p className={muted}>
            {got} of {plural(round.ids.length, "card")} marked “Got it”
            {missed.length > 0 && `, ${missed.length} to review`}.
          </p>
        </div>
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

  const answerBtn = "flex min-h-14 items-center justify-center gap-2 rounded-xl border text-base font-semibold transition duration-150 hover:brightness-95 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <section className="flex flex-col items-center gap-5">
      <div className="flex w-full items-center gap-3">
        <ProgressBar value={round.pos} max={round.ids.length} label="Cards studied this round" />
        <span className={`${muted} shrink-0 tabular-nums`}>
          {round.pos + 1} / {round.ids.length}
        </span>
      </div>

      <Flashcard key={card.id} {...cardFaces(card)} onPrev={() => move(-1)} onNext={() => move(1)} />

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        <button className={`${answerBtn} border-danger/40 bg-danger-soft text-danger`} onClick={() => answer("missed")}>
          <Icon name="x" className="size-5" />
          Review again
          <kbd aria-hidden="true" className={`${kbd} hidden sm:inline`}>
            1
          </kbd>
        </button>
        <button className={`${answerBtn} border-success/40 bg-success-soft text-success`} onClick={() => answer("known")}>
          <Icon name="check" className="size-5" />
          Got it
          <kbd aria-hidden="true" className={`${kbd} hidden sm:inline`}>
            2
          </kbd>
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-1">
        <button className={btnGhost} onClick={() => move(-1)} disabled={round.pos === 0}>
          <Icon name="back" />
          Previous
        </button>
        <button className={btnGhost} onClick={() => start(shuffle(all))}>
          <Icon name="shuffle" />
          Shuffle
        </button>
        <button className={btnGhost} onClick={() => move(1)}>
          Skip
          <Icon name="next" />
        </button>
      </div>
      <p className="hidden text-xs text-muted sm:block">
        <kbd className={kbd}>Space</kbd> flip · <kbd className={kbd}>←</kbd> <kbd className={kbd}>→</kbd> move · swipe works too
      </p>
    </section>
  );
}
