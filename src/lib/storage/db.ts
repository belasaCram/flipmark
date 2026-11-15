import { openDB, type IDBPDatabase } from "idb";
import type { Deck } from "../markdown/schema";

let connection: Promise<IDBPDatabase> | undefined;
const db = () =>
  (connection ??= openDB("flipmark", 1, {
    upgrade: (database) => void database.createObjectStore("decks", { keyPath: "id" }),
  }));

export const getDecks = async (): Promise<Deck[]> => (await db()).getAll("decks");
export const getDeck = async (id: string): Promise<Deck | undefined> => (await db()).get("decks", id);
export const deleteDeck = async (id: string): Promise<void> => (await db()).delete("decks", id);

/** Saves decks in one transaction; a deck with an existing id is replaced. */
export async function saveDecks(decks: Deck[]): Promise<void> {
  const tx = (await db()).transaction("decks", "readwrite");
  await Promise.all([...decks.map((deck) => tx.store.put(deck)), tx.done]);
}
