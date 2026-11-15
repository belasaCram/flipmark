import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { parseDeck } from "./markdown/parse";
import type { Deck } from "./markdown/schema";

/** Sample decks from /content/decks, parsed at build time. Ids are stable so progress survives redeploys. */
export async function loadSampleDecks(): Promise<Deck[]> {
  "use cache";
  cacheLife("max"); // files only change on deploy
  const dir = join(process.cwd(), "content/decks");
  const names = (await readdir(dir)).filter((name) => name.endsWith(".md")).sort();
  return Promise.all(
    names.map(async (name) => ({
      ...parseDeck(await readFile(join(dir, name), "utf8"), name).deck,
      id: `sample-${name.replace(/\.md$/, "")}`,
    })),
  );
}
