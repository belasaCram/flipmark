import { z } from "zod";
import { deckSchema } from "../markdown/schema";
import { progressSchema, useProgress } from "../progress";
import { getDecks, saveDecks } from "./db";

const backupSchema = z.object({
  app: z.literal("flipmark"),
  version: z.literal(1),
  decks: z.array(deckSchema),
  progress: progressSchema.optional(),
});

/** All decks plus study progress, as a JSON string. */
export async function exportBackup(): Promise<string> {
  const backup: z.infer<typeof backupSchema> = {
    app: "flipmark",
    version: 1,
    decks: await getDecks(),
    progress: useProgress.getState().decks,
  };
  return JSON.stringify(backup, null, 2);
}

/** Validates and merges a backup into this browser. Returns the number of decks imported. */
export async function importBackup(json: string): Promise<number> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const backup = backupSchema.safeParse(data);
  if (!backup.success) throw new Error("That file is not a Flipmark backup.");
  await saveDecks(backup.data.decks);
  useProgress.setState((s) => ({ decks: { ...s.decks, ...backup.data.progress } }));
  return backup.data.decks.length;
}
