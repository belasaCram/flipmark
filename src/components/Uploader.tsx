"use client";

import { useState } from "react";
import { parseDeck } from "@/lib/markdown/parse";
import type { Deck } from "@/lib/markdown/schema";
import { btn, field, muted } from "./ui";

export type ParseResult = { name: string; deck: Deck; errors: string[] };

/** Drag-and-drop zone plus paste box. Parsing happens here, in the browser; nothing is uploaded. */
export function Uploader({ onParsed }: { onParsed: (results: ParseResult[]) => void }) {
  const [over, setOver] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const readFiles = async (list: FileList | null) => {
    const files = [...(list ?? [])].filter((file) => /\.(md|markdown|txt)$/i.test(file.name));
    if (!files.length) return setError("Only .md files are accepted.");
    setError("");
    onParsed(await Promise.all(files.map(async (file) => ({ name: file.name, ...parseDeck(await file.text(), file.name) }))));
  };

  return (
    <section aria-label="Add decks" className="grid gap-4 md:grid-cols-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void readFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors focus-within:border-indigo-500 ${
          over ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <input
          type="file"
          accept=".md,.markdown,text/markdown"
          multiple
          className="sr-only"
          onChange={(e) => {
            void readFiles(e.target.files);
            e.target.value = ""; // so the same file can be picked again
          }}
        />
        <span className="text-lg font-medium">
          Drop <code>.md</code> files here or <span className="underline">browse</span>
        </span>
        <span className={muted}>One file is one deck. Files are read in your browser and never uploaded.</span>
        {error && (
          <span role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </label>

      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onParsed([{ name: "Pasted markdown", ...parseDeck(text) }]);
        }}
      >
        <label htmlFor="paste" className="text-sm font-medium">
          Paste markdown
        </label>
        <textarea
          id="paste"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"---\ntitle: My deck\n---\n\n## Q: Question?\nA: Answer."}
          className={`${field} min-h-28 flex-1 font-mono`}
        />
        <button className={`${btn} self-start`} disabled={!text.trim()}>
          Preview deck
        </button>
      </form>
    </section>
  );
}
