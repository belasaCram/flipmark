"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Deck } from "@/lib/markdown/schema";
import { activeStreak, useProgress } from "@/lib/progress";
import { exportBackup, importBackup } from "@/lib/storage/backup";
import { deleteDeck, getDecks, saveDecks } from "@/lib/storage/db";
import { DeckGrid } from "./DeckGrid";
import { UploadPreview } from "./UploadPreview";
import { Uploader, type ParseResult } from "./Uploader";
import { btn, field, muted, plural } from "./ui";

export function Library({ samples, prompt }: { samples: Deck[]; prompt: string }) {
  const [decks, setDecks] = useState<Deck[] | null>(null); // null while IndexedDB loads
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<ParseResult[] | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  const resetProgress = useProgress((s) => s.reset);

  const refresh = useCallback(
    () =>
      getDecks().then(
        (all) => setDecks(all.sort((a, b) => b.createdAt - a.createdAt)),
        () => setFailed(true),
      ),
    [],
  );
  useEffect(() => void refresh(), [refresh]);

  // Every write goes through here so a storage failure (quota, private mode) is shown, not swallowed.
  const run = (work: () => Promise<string>) =>
    work().then(setNotice, (e: unknown) => setNotice(e instanceof Error ? e.message : "Something went wrong.")).then(refresh);

  const save = (toSave: Deck[]) =>
    run(async () => {
      await saveDecks(toSave);
      setPending(null);
      return `Saved ${plural(toSave.length, "deck")}.`;
    });

  const remove = (deck: Deck) => {
    if (!confirm(`Delete “${deck.title}” and its progress? This cannot be undone.`)) return;
    void run(async () => {
      await deleteDeck(deck.id);
      resetProgress(deck.id);
      return `Deleted “${deck.title}”.`;
    });
  };

  const exportAll = () =>
    run(async () => {
      const url = URL.createObjectURL(new Blob([await exportBackup()], { type: "application/json" }));
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: `flipmark-backup-${new Date().toLocaleDateString("en-CA")}.json`,
      });
      link.click();
      URL.revokeObjectURL(url);
      return "Backup downloaded.";
    });

  const copyPrompt = () =>
    run(async () => {
      await navigator.clipboard.writeText(prompt);
      return "Prompt copied. Paste it into any AI chat with your notes, then paste the result here.";
    });

  const savedIds = new Set(decks?.map((d) => d.id));
  const unusedSamples = samples.filter((s) => !savedIds.has(s.id));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Flipmark</h1>
          <p className={muted}>Turn Markdown notes into 3D flashcards and quizzes.</p>
        </div>
        {decks && <Streak />}
      </header>

      {pending ? (
        <UploadPreview results={pending} existingIds={savedIds} onSave={save} onCancel={() => setPending(null)} />
      ) : (
        <Uploader onParsed={setPending} />
      )}

      <section aria-labelledby="decks-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="decks-heading" className="mr-auto text-xl font-semibold">
            Your decks
          </h2>
          <button className={btn} onClick={copyPrompt}>
            Copy AI deck prompt
          </button>
          <button className={btn} onClick={exportAll} disabled={!decks?.length}>
            Export all decks
          </button>
          <button className={btn} onClick={() => importInput.current?.click()}>
            Import backup
          </button>
          <input
            ref={importInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Import backup file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void run(async () => `Imported ${plural(await importBackup(await file.text()), "deck")}.`);
            }}
          />
        </div>

        <p role="status" className="min-h-5 text-sm text-indigo-700 dark:text-indigo-300">
          {notice}
        </p>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          Decks and progress are stored only in this browser. Clearing site data deletes them, so use{" "}
          <strong>Export all decks</strong> to keep a backup.
        </p>

        {failed ? (
          <p role="alert" className="text-red-600 dark:text-red-400">
            Could not open browser storage. Private browsing or blocked site data can cause this.
          </p>
        ) : !decks ? (
          <p className={muted}>Loading your decks…</p>
        ) : decks.length ? (
          <>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search decks and cards"
              aria-label="Search decks and cards"
              className={field}
            />
            <DeckGrid decks={decks} query={query} onDelete={remove} />
          </>
        ) : (
          <p className={muted}>No decks yet. Drop a file or paste markdown above, or start with a sample deck.</p>
        )}

        {decks && unusedSamples.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={muted}>Sample decks:</span>
            {unusedSamples.map((sample) => (
              <button key={sample.id} className={btn} onClick={() => save([sample])}>
                + {sample.title}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// Mounted only after the decks load, so the date-based streak is never computed during prerender.
function Streak() {
  const streak = useProgress(activeStreak);
  if (!streak) return null;
  return (
    <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      🔥 {plural(streak, "day")} streak
    </p>
  );
}
