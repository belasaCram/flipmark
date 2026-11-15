"use client";

import Link from "next/link";
import { cardFaces } from "@/lib/markdown/faces";
import type { Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { btn, btnGhost, btnPrimary, eyebrow, muted, panel, plural } from "./ui";

type Props = { decks: Deck[]; query: string; onDelete: (deck: Deck) => void };

/** Deck cards with progress. `query` searches titles, subjects and the text of every card. */
export function DeckGrid({ decks, query, onDelete }: Props) {
  const progress = useProgress((s) => s.decks);
  const q = query.trim().toLowerCase();
  const rows = decks
    .map((deck) => ({
      deck,
      hits: q ? deck.cards.filter((card) => Object.values(cardFaces(card)).join("\n").toLowerCase().includes(q)).length : 0,
    }))
    .filter(({ deck, hits }) => !q || hits || `${deck.title} ${deck.subject ?? ""}`.toLowerCase().includes(q));

  if (!rows.length) {
    return (
      <p className={`${panel} ${muted} text-center`}>
        No decks or cards match “{query.trim()}”.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {rows.map(({ deck, hits }) => {
        const p = progress[deck.id];
        const known = deck.cards.filter((card) => p?.cards[card.id] === "known").length;
        const href = `/deck/${encodeURIComponent(deck.id)}`;
        return (
          <li key={deck.id} className={`${panel} flex flex-col gap-4 transition-shadow hover:shadow-md`}>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                {deck.subject && <p className={eyebrow}>{deck.subject}</p>}
                <h3 className="text-lg leading-snug font-semibold text-balance">{deck.title}</h3>
                <p className={muted}>
                  {plural(deck.cards.length, "card")}
                  {hits > 0 && ` · ${plural(hits, "matching card")}`}
                  {p?.quiz && ` · best quiz ${p.quiz.best}%`}
                </p>
              </div>
              <button
                className={`${btnGhost} -mt-2 -mr-2 px-3 hover:text-danger`}
                onClick={() => onDelete(deck)}
                aria-label={`Delete ${deck.title}`}
                title="Delete deck"
              >
                <Icon name="trash" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={known} max={deck.cards.length} label={`${deck.title}: cards known`} />
              <span className={`${muted} shrink-0 tabular-nums`}>
                {known}/{deck.cards.length} known
              </span>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2">
              <Link href={href} className={btnPrimary}>
                Study
              </Link>
              <Link href={`${href}/quiz`} className={btn}>
                Quiz
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
