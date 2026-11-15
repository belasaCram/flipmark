---
title: Flipmark Deck Format
subject: Getting Started
---

## Q: How does every card in a Flipmark deck start?
A: With a `## Q:` heading followed by the question.

---

## Q: What separates one card from the next?
A: A line containing only `---`.
explain: The same marker also wraps the frontmatter at the top of the file.

---

## Q: What are the three card types?
A:
| Type    | Needs                                |
| ------- | ------------------------------------ |
| `basic` | `A:` answer                          |
| `mcq`   | 2+ options, exactly one `[x]`        |
| `tf`    | `A: true` or `A: false`              |

---

## Q: What does a minimal deck file look like?
A: Frontmatter, then cards:

```md
---
title: My Deck
---

## Q: Question?
A: Answer.
```

---

## Q: Which card type is used when `type` is not given?
type: mcq
- [x] basic
- mcq
- tf
explain: `type` defaults to **basic**, which needs a `Q:` and an `A:`.

---

## Q: How many options may be marked `[x]` in an mcq card?
type: mcq
- None
- [x] Exactly one
- At least two
- Any number
explain: An mcq card needs at least 2 options and exactly one correct one.

---

## Q: The `explain:` field is optional on every card type.
type: tf
A: true

---

## Q: A deck without a `title` in its frontmatter is rejected.
type: tf
A: false
explain: The title falls back to the filename.

---

## Q: Where are uploaded decks stored?
A: In your browser only (IndexedDB). They never leave the device.
explain: Use **Export all decks** to back them up:
- there is no database
- clearing browser data deletes them
