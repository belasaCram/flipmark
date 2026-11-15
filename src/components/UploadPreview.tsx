import type { Deck } from "@/lib/markdown/schema";
import type { ParseResult } from "./Uploader";
import { btn, btnPrimary, muted, panel, plural } from "./ui";

type Props = {
  results: ParseResult[];
  existingIds: Set<string>;
  onSave: (decks: Deck[]) => void;
  onCancel: () => void;
};

/** Shows what was parsed before anything is saved. Decks with no valid cards are not saved. */
export function UploadPreview({ results, existingIds, onSave, onCancel }: Props) {
  const savable = results.filter((r) => r.deck.cards.length).map((r) => r.deck);
  return (
    <section aria-label="Upload preview" className={`${panel} flex flex-col gap-4`}>
      <h2 className="text-lg font-semibold">Preview</h2>
      <ul className="flex flex-col gap-4">
        {results.map(({ name, deck, errors }, i) => (
          <li key={i} className="flex flex-col gap-1">
            <p>
              <strong>{deck.title}</strong> <span className={muted}>({name})</span>
            </p>
            <p className="text-sm">
              {plural(deck.cards.length, "card")} found, {plural(errors.length, "error")}
              {existingIds.has(deck.id) && deck.cards.length > 0 && (
                <span className="text-amber-700 dark:text-amber-400"> · replaces your saved deck with this title</span>
              )}
            </p>
            {errors.length > 0 && (
              <ul className="max-h-40 list-disc overflow-y-auto pl-5 text-sm text-red-600 dark:text-red-400">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <button className={btnPrimary} disabled={!savable.length} onClick={() => onSave(savable)}>
          Save {plural(savable.length, "deck")}
        </button>
        <button className={btn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
