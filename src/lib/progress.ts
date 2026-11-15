import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const progressSchema = z.record(
  z.string(),
  z.object({
    cards: z.record(z.string(), z.enum(["known", "missed"])),
    quiz: z.object({ correct: z.number(), total: z.number(), best: z.number() }).optional(),
  }),
);
export type Progress = z.infer<typeof progressSchema>;

type State = {
  decks: Progress;
  streak: number;
  lastDay: string;
  mark: (deckId: string, cardId: string, status: "known" | "missed") => void;
  saveQuiz: (deckId: string, correct: number, total: number) => void;
  reset: (deckId: string) => void;
};

/** Local calendar day as YYYY-MM-DD, `daysAgo` days back. */
const day = (daysAgo = 0) => new Date(Date.now() - daysAgo * 864e5).toLocaleDateString("en-CA");

/** Any study activity counts toward the daily streak. */
const touch = (s: State) =>
  s.lastDay === day() ? {} : { lastDay: day(), streak: s.lastDay === day(1) ? s.streak + 1 : 1 };

/** The streak only counts while it is still alive (studied today or yesterday). */
export const activeStreak = (s: State) => (s.lastDay === day() || s.lastDay === day(1) ? s.streak : 0);

export const useProgress = create<State>()(
  persist(
    (set) => ({
      decks: {},
      streak: 0,
      lastDay: "",
      mark: (deckId, cardId, status) =>
        set((s) => {
          const deck = s.decks[deckId] ?? { cards: {} };
          return { ...touch(s), decks: { ...s.decks, [deckId]: { ...deck, cards: { ...deck.cards, [cardId]: status } } } };
        }),
      saveQuiz: (deckId, correct, total) =>
        set((s) => {
          const deck = s.decks[deckId] ?? { cards: {} };
          const best = Math.max(deck.quiz?.best ?? 0, Math.round((correct / total) * 100));
          return { ...touch(s), decks: { ...s.decks, [deckId]: { ...deck, quiz: { correct, total, best } } } };
        }),
      reset: (deckId) => set((s) => ({ decks: Object.fromEntries(Object.entries(s.decks).filter(([id]) => id !== deckId)) })),
    }),
    { name: "flipmark-progress" },
  ),
);
