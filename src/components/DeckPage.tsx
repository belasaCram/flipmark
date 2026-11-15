"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Deck } from "@/lib/markdown/schema";
import { getDeck } from "@/lib/storage/db";
import { btn, muted } from "./ui";

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
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <nav className="flex items-center justify-between gap-3">
        <Link href="/" className={btn}>
          ← Library
        </Link>
        {deck && (
          <Link href={mode === "study" ? `${href}/quiz` : href} className={btn}>
            {mode === "study" ? "Quiz" : "Study"}
          </Link>
        )}
      </nav>
      {deck === undefined ? (
        <p className={muted}>Loading deck…</p>
      ) : !deck ? (
        <div role="alert" className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Deck not found</h1>
          <p className={muted}>It may have been deleted, or saved in a different browser. Decks live only on the device that added them.</p>
        </div>
      ) : (
        <>
          <header>
            {deck.subject && <p className="text-xs font-medium tracking-widest text-indigo-600 uppercase dark:text-indigo-400">{deck.subject}</p>}
            <h1 className="text-2xl font-semibold">{deck.title}</h1>
          </header>
          {children(deck)}
        </>
      )}
    </main>
  );
}
