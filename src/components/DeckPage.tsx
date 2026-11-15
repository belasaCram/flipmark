"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Deck } from "@/lib/markdown/schema";
import { getDeck } from "@/lib/storage/db";
import { Icon } from "./Icon";
import { btnGhost, btnPrimary, eyebrow, muted, panel } from "./ui";

type Props = { mode: "study" | "quiz"; children: (deck: Deck) => ReactNode };

/** Loads the deck named in the URL from IndexedDB and renders the page frame around `children`. */
export function DeckPage({ mode, children }: Props) {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(); // undefined = loading, null = not found

  useEffect(() => {
    getDeck(decodeURIComponent(id)).then(
      (found) => setDeck(found ?? null),
      () => setDeck(null),
    );
  }, [id]);

  const href = `/deck/${id}`;
  const tab = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
      active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
    }`;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6">
      <nav aria-label="Deck" className="flex items-center justify-between gap-3">
        <Link href="/" className={`${btnGhost} -ml-3`}>
          <Icon name="back" />
          Library
        </Link>
        {deck && (
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
            <Link href={href} className={tab(mode === "study")} aria-current={mode === "study" ? "page" : undefined}>
              Study
            </Link>
            <Link href={`${href}/quiz`} className={tab(mode === "quiz")} aria-current={mode === "quiz" ? "page" : undefined}>
              Quiz
            </Link>
          </div>
        )}
      </nav>
      {deck === undefined ? (
        <div aria-busy="true" aria-label="Loading deck" className="h-80 animate-pulse rounded-2xl bg-surface-2" />
      ) : !deck ? (
        <div role="alert" className={`${panel} flex flex-col items-center gap-3 py-10 text-center`}>
          <h1 className="text-2xl font-semibold">Deck not found</h1>
          <p className={muted}>It may have been deleted, or saved in a different browser. Decks live only on the device that added them.</p>
          <Link href="/" className={btnPrimary}>
            Go to your library
          </Link>
        </div>
      ) : (
        <>
          <header>
            {deck.subject && <p className={eyebrow}>{deck.subject}</p>}
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{deck.title}</h1>
          </header>
          {children(deck)}
        </>
      )}
    </main>
  );
}
