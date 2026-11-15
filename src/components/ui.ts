// Shared class strings and tiny helpers for the UI. Colours are the semantic tokens from globals.css.
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
// min-h-11 = 44px, the minimum comfortable touch target.
const base = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 ${focus}`;

export const btn = `${base} border-border bg-surface hover:bg-surface-2`;
export const btnPrimary = `${base} border-transparent bg-primary text-primary-fg shadow-sm hover:brightness-110`;
export const btnGhost = `${base} border-transparent text-muted hover:bg-surface-2 hover:text-fg`;
export const panel = "rounded-2xl border border-border bg-surface p-5 shadow-sm";
export const field = `w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted/70 ${focus}`;
export const muted = "text-sm text-muted";
export const eyebrow = "text-xs font-semibold tracking-widest text-primary uppercase";
export const kbd = "rounded border border-current/30 px-1.5 font-mono text-[0.7rem] leading-5 opacity-70";

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
