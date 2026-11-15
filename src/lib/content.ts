import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { parseDeck } from "./markdown/parse";
import type { Deck } from "./markdown/schema";

const CONTENT = join(process.cwd(), "content");

/** Sample decks from /content/decks, parsed at build time. */
export async function loadSampleDecks(): Promise<Deck[]> {
  "use cache";
  cacheLife("max"); // files only change on deploy
  const names = (await readdir(join(CONTENT, "decks"))).filter((name) => name.endsWith(".md")).sort();
  return Promise.all(
    names.map(async (name) => parseDeck(await readFile(join(CONTENT, "decks", name), "utf8"), name).deck),
  );
}

/** The "generate a deck with AI" prompt shown in the UI and linked from the README. */
export async function loadDeckPrompt(): Promise<string> {
  "use cache";
  cacheLife("max");
  return readFile(join(CONTENT, "deck-prompt.md"), "utf8");
}
