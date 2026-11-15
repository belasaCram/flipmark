import { useEffect, useSyncExternalStore } from "react";

/** False during prerender and hydration, true afterwards. Use it to gate UI that depends on browser-only state. */
export const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** Page-wide single-key shortcuts. Ignored while typing in a field or holding a modifier. */
export function useHotkeys(keys: Record<string, (() => void) | undefined>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
      const action = keys[e.key];
      if (!action) return;
      e.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
}
