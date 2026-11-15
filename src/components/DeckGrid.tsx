"use client";

import Link from "next/link";
import { cardFaces } from "@/lib/markdown/faces";
import type { Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { ProgressBar } from "./ProgressBar";
import { btn, btnPrimary, muted, panel, plural } from "./ui";

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

  if (!rows.length) return <p className={muted}>No decks or cards match “{query.trim()}”.</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {rows.map(({ deck, hits }) => {
        const p = progress[deck.id];
        const known = deck.cards.filter((card) => p?.cards[card.id] === "known").length;
        const href = `/deck/${encodeURIComponent(deck.id)}`;
        return (
          <li key={deck.id} className={`${panel} flex flex-col gap-3`}>
            <div>
              {deck.subject && <p className="text-xs font-medium tracking-widest text-indigo-600 uppercase dark:text-indigo-400">{deck.subject}</p>}
              <h3 className="text-lg font-semibold">{deck.title}</h3>
              <p className={muted}>
                {plural(deck.cards.length, "card")}
                {hits > 0 && ` · ${plural(hits, "matching card")}`}
                {p?.quiz && ` · best quiz ${p.quiz.best}%`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={known} max={deck.cards.length} label={`${deck.title}: cards known`} />
              <span className={`${muted} shrink-0`}>
                {known}/{deck.cards.length} known
              </span>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <Link href={href} className={btnPrimary}>
                Study
              </Link>
              <Link href={`${href}/quiz`} className={btn}>
                Quiz
              </Link>
              <button className={`${btn} ml-auto`} onClick={() => onDelete(deck)} aria-label={`Delete ${deck.title}`}>
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
