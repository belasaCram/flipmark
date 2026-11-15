// One small stroke-icon set so the app needs no icon library. Icons are decorative: pair them with text or an aria-label.
const paths = {
  logo: "M8 4h10a2 2 0 0 1 2 2v9M6 8h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z",
  upload: "M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  download: "M12 4v12m0 0-4-4m4 4 4-4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1ZM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  back: "M19 12H5m0 0 6 6m-6-6 6-6",
  next: "M5 12h14m0 0-6-6m6 6-6 6",
  check: "M5 13l4 4L19 7",
  x: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  shuffle: "M3 7h3a4 4 0 0 1 3.3 1.7l5.4 6.6A4 4 0 0 0 18 17h3m0 0-3-3m3 3-3 3M3 17h3a4 4 0 0 0 3.3-1.7M21 7h-3a4 4 0 0 0-3.3 1.7M21 7l-3-3m3 3-3 3",
  flip: "M4 12a8 8 0 0 1 14-5.3L20 9m0-5v5h-5M20 12a8 8 0 0 1-14 5.3L4 15m0 5v-5h5",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  flame: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9Z",
  theme: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0v18M12 7l5-2M12 12l8-3M12 17l7-2.5",
} as const;

export function Icon({ name, className = "size-4" }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={paths[name]} />
    </svg>
  );
}
