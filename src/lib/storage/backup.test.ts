import { describe, expect, it, vi } from "vitest";

const saved: unknown[] = [];
vi.mock("./db", () => ({
  getDecks: async () => [],
  saveDecks: async (decks: unknown[]) => void saved.push(...decks),
}));

import { useProgress } from "../progress";
import { importBackup } from "./backup";

const deck = { id: "d", title: "D", cards: [{ id: "c1", type: "tf", q: "q", a: true }], createdAt: 1 };

describe("importBackup", () => {
  it("rejects files that are not a Flipmark backup", async () => {
    await expect(importBackup("not json")).rejects.toThrow("not valid JSON");
    await expect(importBackup('{"decks": []}')).rejects.toThrow("not a Flipmark backup");
    const badCard = { app: "flipmark", version: 1, decks: [{ ...deck, cards: [{ id: "c1", type: "tf", q: "q" }] }] };
    await expect(importBackup(JSON.stringify(badCard))).rejects.toThrow("not a Flipmark backup");
    expect(saved).toEqual([]);
  });

  it("saves decks and merges progress", async () => {
    const backup = { app: "flipmark", version: 1, decks: [deck], progress: { d: { cards: { c1: "known" } } } };
    expect(await importBackup(JSON.stringify(backup))).toBe(1);
    expect(saved).toEqual([deck]);
    expect(useProgress.getState().decks.d.cards.c1).toBe("known");
  });
});
