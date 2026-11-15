# Flipmark

Turn Markdown notes into 3D flip flashcards and quizzes. Everything runs in your browser: there is no backend, no account and no database.

## Features

- **Upload or paste** one or many `.md` files, with a preview of how many cards were found and which ones have errors.
- **Study mode**: 3D flip cards, shuffle, a progress bar, "Got it / Review again", and a round of only the cards you missed.
- **Quiz mode**: multiple choice and true/false with instant feedback, typed answers for basic cards, and a final score.
- **Search** across deck titles, subjects and the text of every card.
- **Export all decks / Import backup** as a JSON file, including your progress.
- A daily study streak, dark mode (follows your system setting) and reduced-motion support.

> **Your data stays on your device.** Decks are saved in IndexedDB and progress in `localStorage`. Clearing site data deletes them, so use **Export all decks** to keep a backup.

## Controls

| Action        | Mouse / touch        | Keyboard        |
| ------------- | -------------------- | --------------- |
| Flip the card | Click or tap         | Space, or Enter |
| Next card     | Swipe left, or Skip  | Right arrow     |
| Previous card | Swipe right          | Left arrow      |

## Deck format

One `.md` file is one deck. Frontmatter holds the metadata, each card starts with a `## Q:` heading, and cards are separated by a line containing only `---`.

```md
---
title: IT2511 Cloud Computing
subject: Cybersecurity
---

## Q: What does IDaaS provide?
A: Authentication services managed by a third party: SSO, MFA, IGA.

---

## Q: Which tier of the container architecture stores images?
type: mcq
- Tier 2
- [x] Tier 3
- Tier 4
explain: Registries store images and send them to orchestrators.

---

## Q: Containers need their own OS like VMs.
type: tf
A: false
explain: Containers do not need an independent OS.
```

Rules:

- `type` defaults to `basic`, which needs `A:`.
- `mcq` needs at least 2 options and exactly one marked `[x]`.
- `tf` needs `A: true` or `A: false`.
- `explain:` is optional on every type.
- Answers and explanations may span several lines and contain Markdown (bold, bullets, tables, code). A field runs until the next field line or the `---` separator.
- `title` falls back to the filename when it is missing. `subject` is optional.
- Field names are case-sensitive: `A:`, `type:` and `explain:`.
- A title that contains a colon must be quoted: `title: "Chapter 1: Intro"`.
- Uploading a deck with the same title as a saved one replaces it and keeps its progress.

More examples are in [content/decks](content/decks).

## Generate a deck with AI

Copy the prompt in [content/deck-prompt.md](content/deck-prompt.md) (or press **Copy AI deck prompt** in the app), paste it into any AI chat, add your notes at the end, and paste the result into Flipmark.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # parser and backup unit tests (Vitest)
npm run test:e2e   # end-to-end smoke test (Playwright; first run: npx playwright install chromium)
npm run build
```

Project layout:

```
content/decks/*.md         sample decks, loaded at build time
content/deck-prompt.md     the AI deck-generator prompt
src/app/                   library page, /deck/[id] (study), /deck/[id]/quiz
src/components/            Flashcard, Uploader, UploadPreview, DeckGrid, Study, Quiz
src/lib/markdown/          parser: markdown string -> { deck, errors }
src/lib/storage/           IndexedDB and JSON backup
src/lib/progress.ts        study progress (Zustand, persisted to localStorage)
e2e/                       Playwright smoke test
```

## Deployment

Push to GitHub and import the repository into Vercel. Next.js is detected automatically and no environment variables are needed.
