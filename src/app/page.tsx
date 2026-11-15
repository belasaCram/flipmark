import { FlashcardDemo } from "@/components/FlashcardDemo";
import { loadSampleDecks } from "@/lib/sample-decks";

export default async function Home() {
  const decks = await loadSampleDecks();
  const deck = decks.find((d) => d.id === "sample-flipmark-format") ?? decks[0];
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">Flipmark</h1>
      <FlashcardDemo deck={deck} />
    </main>
  );
}
