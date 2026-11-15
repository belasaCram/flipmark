import { Library } from "@/components/Library";
import { loadDeckPrompt, loadSampleDecks } from "@/lib/content";

export default async function Home() {
  const [samples, prompt] = await Promise.all([loadSampleDecks(), loadDeckPrompt()]);
  return <Library samples={samples} prompt={prompt} />;
}
