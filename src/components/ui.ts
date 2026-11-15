// Shared class strings and tiny helpers for the UI.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
const base = `inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${focus}`;

export const btn = `${base} border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800`;
export const btnPrimary = `${base} border-transparent bg-indigo-600 text-white hover:bg-indigo-500`;
export const panel = "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900";
export const field = `w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 ${focus}`;
export const muted = "text-sm text-zinc-600 dark:text-zinc-400";

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
