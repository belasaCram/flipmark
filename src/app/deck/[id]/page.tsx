import { Suspense } from "react";
import { Study } from "@/components/Study";

// The deck id is read in the browser (decks live in IndexedDB), so the shell is static.
export default function StudyPage() {
  return (
    <Suspense>
      <Study />
    </Suspense>
  );
}
