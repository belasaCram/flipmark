"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { exportBackup, importBackup } from "@/lib/storage/backup";
import { deleteDeck, getDecks, saveDecks } from "@/lib/storage/db";
import { DeckGrid } from "./DeckGrid";
import { Icon } from "./Icon";
import { UploadPreview } from "./UploadPreview";
import { Uploader, type ParseResult } from "./Uploader";
import { btn, field, muted, panel, plural } from "./ui";

export function Library({ samples, prompt }: { samples: Deck[]; prompt: string }) {
  const [decks, setDecks] = useState<Deck[] | null>(null); // null while IndexedDB loads
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<ParseResult[] | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState({ text: "", ok: true });
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
    work()
      .then(
        (text) => setNotice({ text, ok: true }),
        (e: unknown) => setNotice({ text: e instanceof Error ? e.message : "Something went wrong.", ok: false }),
      )
      .then(refresh);

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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Turn your notes into flashcards</h1>
        <p className="max-w-xl text-muted">
          Drop in Markdown, flip through 3D cards, then quiz yourself. Everything stays in your browser.
        </p>
      </div>

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
          <button className={btn} onClick={copyPrompt} title="Copy a prompt that turns your notes into a deck">
            <Icon name="copy" />
            Copy AI deck prompt
          </button>
          <button className={btn} onClick={exportAll} disabled={!decks?.length}>
            <Icon name="download" />
            Export all decks
          </button>
          <button className={btn} onClick={() => importInput.current?.click()}>
            <Icon name="upload" />
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

        <div role="status">
          {notice.text && (
            <p
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
            >
              <Icon name={notice.ok ? "check" : "x"} className="mt-0.5 size-4" />
              {notice.text}
            </p>
          )}
        </div>

        {failed ? (
          <p role="alert" className={`${panel} text-danger`}>
            Could not open browser storage. Private browsing or blocked site data can cause this.
          </p>
        ) : !decks ? (
          <div aria-busy="true" aria-label="Loading your decks" className="grid gap-4 sm:grid-cols-2">
            <div className="h-44 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-44 animate-pulse rounded-2xl bg-surface-2" />
          </div>
        ) : decks.length ? (
          <>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decks and cards"
                aria-label="Search decks and cards"
                className={`${field} min-h-11 pl-9`}
              />
            </div>
            <DeckGrid decks={decks} query={query} onDelete={remove} />
          </>
        ) : (
          <div className={`${panel} flex flex-col items-center gap-1 py-10 text-center`}>
            <p className="text-lg font-medium">No decks yet</p>
            <p className={muted}>Drop a file or paste markdown above, or start with a sample deck below.</p>
          </div>
        )}

        {decks && unusedSamples.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={muted}>Try a sample:</span>
            {unusedSamples.map((sample) => (
              <button key={sample.id} className={btn} onClick={() => save([sample])}>
                <Icon name="plus" />
                {sample.title}
              </button>
            ))}
          </div>
        )}

        <p className="rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">
          Decks and progress are stored only in this browser. Clearing site data deletes them, so use{" "}
          <strong>Export all decks</strong> to keep a backup.
        </p>
      </section>
    </main>
  );
}
