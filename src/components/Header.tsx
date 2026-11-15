"use client";

import Link from "next/link";
import { useIsClient } from "@/lib/hooks";
import { activeStreak, useProgress } from "@/lib/progress";
import { Icon } from "./Icon";
import { btnGhost, plural } from "./ui";

export function Header() {
  const isClient = useIsClient();
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-fg">
            <Icon name="logo" className="size-5" />
          </span>
          Flipmark
        </Link>
        <div className="ml-auto flex items-center gap-1">
          {isClient && <Streak />}
          <button
            className={`${btnGhost} px-3`}
            aria-label="Switch between light and dark theme"
            title="Switch theme"
            onClick={() => {
              const root = document.documentElement;
              const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
              root.dataset.theme = dark ? "light" : "dark";
              try {
                localStorage.setItem("flipmark-theme", root.dataset.theme);
              } catch {} // private mode: the choice just will not persist
            }}
          >
            <Icon name="theme" className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

// Rendered on the client only: the streak depends on today's date and localStorage.
function Streak() {
  const streak = useProgress(activeStreak);
  if (!streak) return null;
  return (
    <p className="flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-sm font-medium text-warn">
      <Icon name="flame" />
      {plural(streak, "day")} streak
    </p>
  );
}
