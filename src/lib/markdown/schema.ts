import { z } from "zod";

const base = {
  id: z.string(),
  q: z.string().min(1, "missing question text after ## Q:"),
  explain: z.string().optional(),
};

export const cardSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("basic"), a: z.string().min(1, "basic needs an A: answer") }),
  z.object({
    ...base,
    type: z.literal("mcq"),
    options: z
      .array(z.object({ text: z.string().min(1, "mcq option is empty"), correct: z.boolean() }))
      .min(2, "mcq needs at least 2 options")
      .refine((o) => o.filter((x) => x.correct).length === 1, "mcq needs exactly one [x] option"),
  }),
  z.object({
    ...base,
    type: z.literal("enum"),
    items: z.array(z.string().min(1, "enum item is empty")).min(2, "enum needs at least 2 items"),
  }),
  z.object({ ...base, type: z.literal("tf"), a: z.boolean({ error: "tf needs A: true or A: false" }) }),
]);

export const deckSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  subject: z.string().optional(),
  cards: z.array(cardSchema),
  createdAt: z.number(),
});

export type Card = z.infer<typeof cardSchema>;
export type Deck = z.infer<typeof deckSchema>;
