import type { Deck } from "@/lib/markdown/schema";
import { Icon } from "./Icon";
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
    <section aria-label="Upload preview" className={`${panel} flex flex-col gap-5`}>
      <h2 className="text-lg font-semibold">Check before saving</h2>
      <ul className="flex flex-col divide-y divide-border">
        {results.map(({ name, deck, errors }, i) => {
          const ok = deck.cards.length > 0;
          return (
            <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                <Icon name={ok ? "check" : "x"} className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p>
                  <strong>{deck.title}</strong> <span className={muted}>({name})</span>
                </p>
                <p className="text-sm">
                  {plural(deck.cards.length, "card")} found, {plural(errors.length, "error")}
                  {existingIds.has(deck.id) && ok && <span className="font-medium text-warn"> · replaces your saved deck with this title</span>}
                  {!ok && <span className="font-medium text-danger"> · nothing to save</span>}
                </p>
                {errors.length > 0 && (
                  <ul className="max-h-40 list-disc overflow-y-auto rounded-lg bg-danger-soft py-2 pr-3 pl-7 text-sm text-danger">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
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
