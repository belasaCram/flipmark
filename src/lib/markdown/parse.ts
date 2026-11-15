import matter from "gray-matter";
import { cardSchema, type Card, type Deck } from "./schema";

const FENCE = /^\s*(```|~~~)/;
const SEPARATOR = /^---\s*$/;
const HEADING = /^##\s*Q:\s*(.*)$/;
// Field names are case-sensitive on purpose, so prose like "Type: public cloud" stays answer text.
const FIELD = /^(A|type|explain):\s*(.*)$/;
const OPTION = /^\s*[-*]\s+(\[[xX]\]\s*)?(.*)$/;
const TYPES = ["basic", "mcq", "tf"];

const text = (lines: string[]) => lines.join("\n").trim();

export function parseDeck(md: string, filename?: string): { deck: Deck; errors: string[] } {
  let src = md.replace(/\r\n?/g, "\n");
  const errors: string[] = [];

  // AI chat tools often return the whole deck inside a ```md code fence. Unwrap it.
  const wrapper = src.match(/^\s*(?:`{3,}|~{3,})[a-z]*[ \t]*\n\s*(?=---\n|##\s*Q:)/i)?.[0] ?? "";
  if (wrapper) src = src.slice(wrapper.length).replace(/\n[ \t]*(?:`{3,}|~{3,})\s*$/, "\n");

  let data: Record<string, unknown> = {};
  let content = src;
  try {
    ({ data, content } = matter(src));
  } catch {
    errors.push("Frontmatter (line 1): invalid YAML, check the title and subject lines");
    content = src.replace(/^---\n[\s\S]*?\n---\n?/, "");
  }
  // Frontmatter is stripped from the top only, so the line difference maps content lines back to file lines.
  const offset = wrapper.split("\n").length - 1 + src.split("\n").length - content.split("\n").length;

  // Split into card blocks: a new block starts after `---` or at a `## Q:` heading (outside code fences).
  const blocks: { line: number; lines: string[] }[] = [];
  let open = false;
  let fenced = false;
  content.split("\n").forEach((line, i) => {
    if (FENCE.test(line)) fenced = !fenced;
    else if (!fenced && SEPARATOR.test(line)) return void (open = false);
    else if (!fenced && HEADING.test(line)) open = false;
    if (!open) {
      if (!line.trim()) return;
      blocks.push({ line: offset + i + 1, lines: [] });
      open = true;
    }
    blocks[blocks.length - 1].lines.push(line);
  });

  const cards: Card[] = [];
  blocks.forEach((block, i) => {
    const fail = (message: string) => void errors.push(`Card ${i + 1} (line ${block.line}): ${message}`);
    const heading = block.lines[0].match(HEADING);
    if (!heading) return fail('expected a "## Q:" heading');

    // Lines belong to the current field until the next field line. `type:` takes no continuation.
    const fields = { q: [heading[1]], a: [] as string[], explain: [] as string[] };
    let current: keyof typeof fields = "q";
    let type: string | undefined;
    let inFence = false;
    for (const line of block.lines.slice(1)) {
      const isFence = FENCE.test(line);
      if (isFence) inFence = !inFence;
      const field = !inFence && !isFence ? line.match(FIELD) : null;
      const key = field?.[1] === "A" ? "a" : "explain";
      if (field?.[1] === "type" && type === undefined) {
        type = field[2].trim().toLowerCase();
        current = "q";
      } else if (field && field[1] !== "type" && !fields[key].length) {
        current = key;
        fields[key].push(field[2]);
      } else fields[current].push(line);
    }

    type ??= "basic";
    if (!TYPES.includes(type)) return fail(`unknown type "${type}" (use basic, mcq, or tf)`);

    const common = { id: `c${i + 1}`, type, explain: text(fields.explain) || undefined };
    const a = text(fields.a);
    let raw: unknown;
    if (type === "mcq") {
      // Bullets before A:/explain: are the options; everything else there is question text.
      const options = fields.q.slice(1).flatMap((line) => {
        const m = line.match(OPTION);
        return m ? [{ text: m[2].trim(), correct: Boolean(m[1]) }] : [];
      });
      const q = [fields.q[0], ...fields.q.slice(1).filter((line) => !OPTION.test(line))];
      raw = { ...common, q: text(q), options };
    } else if (type === "tf") {
      raw = { ...common, q: text(fields.q), a: /^true$/i.test(a) ? true : /^false$/i.test(a) ? false : undefined };
    } else {
      raw = { ...common, q: text(fields.q), a };
    }

    const result = cardSchema.safeParse(raw);
    if (result.success) cards.push(result.data);
    else fail(result.error.issues[0].message);
  });

  if (!blocks.length) errors.push("No cards found (each card starts with ## Q:)");

  const title = typeof data.title === "string" || typeof data.title === "number" ? String(data.title).trim() : "";
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const deckTitle = title || filename?.replace(/\.md$/i, "") || "Untitled deck";
  return {
    deck: {
      // Derived from the title, so re-uploading an edited deck replaces it and keeps its progress.
      id: deckTitle.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "deck",
      title: deckTitle,
      ...(subject && { subject }),
      cards,
      createdAt: Date.now(),
    },
    errors,
  };
}
