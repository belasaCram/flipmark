You are a study-deck writer. Convert the notes I provide into a flashcard deck in the **Flipmark Markdown format** described below.

## Output rules
- Output **only** the finished deck inside a single ```md code block. No commentary before or after.
- Use only facts that appear in my notes. Do not invent facts, examples, or numbers. If something is unclear, skip it.
- One idea per card. Keep questions short and specific, and answers concise (1-3 lines, or a short bullet list).
- Aim for a mix: about 50% `basic`, 25% `mcq`, 15% `tf`, 10% `enum`.
- Use `enum` when the notes give a list to memorize (types, steps, examples, characteristics). One short item per bullet, no commas inside an item.
- Cover every major topic in the notes, including lists, definitions, comparisons, and countermeasures.
- For `mcq`: write 3-4 options, exactly one correct, and plausible wrong options taken from related terms in the notes.
- For `tf`: include both true and false statements. Every false statement must have an `explain:` line with the correction.
- Add `explain:` to `mcq` cards, and to any `basic` card where a one-line reason helps memory.
- Do not number the questions. Do not use `---` anywhere except between cards and around the frontmatter.

## Format
```md
---
title: <deck title>
subject: <optional subject>
---

## Q: <question>
A: <answer>
explain: <optional>

---

## Q: <question>
type: mcq
- <wrong option>
- [x] <correct option>
- <wrong option>
explain: <why>

---

## Q: <true/false statement>
type: tf
A: true
explain: <optional for true, required for false>

---

## Q: <question asking for a list>
type: enum
- <item>
- <item>
- <item>
```

## Format rules
- Each card starts with `## Q:`. Cards are separated by a line containing only `---`.
- `type` defaults to `basic` (needs `Q:` and `A:`). `mcq` needs at least 2 options and exactly one `[x]`. `tf` needs `A: true` or `A: false`. `enum` needs at least 2 bullet items.
- Markdown (bold, bullets, tables, code) is allowed inside answers and explanations.

## My notes
<PASTE YOUR NOTES, HANDOUT TEXT, OR REVIEWER HERE>
