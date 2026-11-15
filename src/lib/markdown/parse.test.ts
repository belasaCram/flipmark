import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDeck } from "./parse";

const DECKS = join(process.cwd(), "content/decks");
const sample = (name: string) => readFileSync(join(DECKS, name), "utf8");
const deckOf = (...cards: string[]) => `---\ntitle: T\n---\n\n${cards.join("\n\n---\n\n")}\n`;

describe("sample decks", () => {
  it.each(readdirSync(DECKS))("%s parses with no errors", (name) => {
    const { deck, errors } = parseDeck(sample(name), name);
    expect(errors).toEqual([]);
    expect(deck.cards.length).toBeGreaterThan(0);
  });

  it("parses all three card types", () => {
    const { deck } = parseDeck(sample("cloud-computing.md"));
    expect(deck.title).toBe("IT2511 Cloud Computing");
    expect(deck.subject).toBe("Cybersecurity");
    expect(deck.cards).toEqual([
      {
        id: "c1",
        type: "basic",
        q: "What does IDaaS provide?",
        a: "Authentication services managed by a third party: SSO, MFA, IGA.",
      },
      {
        id: "c2",
        type: "mcq",
        q: "Which tier of the container architecture stores images?",
        options: [
          { text: "Tier 2", correct: false },
          { text: "Tier 3", correct: true },
          { text: "Tier 4", correct: false },
        ],
        explain: "Registries store images and send them to orchestrators.",
      },
      {
        id: "c3",
        type: "tf",
        q: "Containers need their own OS like VMs.",
        a: false,
        explain: "Containers do not need an independent OS.",
      },
    ]);
  });

  it("keeps multi-line markdown, and --- inside a code fence stays in the card", () => {
    const { deck } = parseDeck(sample("flipmark-format.md"));
    expect(deck.cards).toHaveLength(9);
    const [, , table, fenced] = deck.cards;
    expect(table).toMatchObject({ type: "basic" });
    expect((table as { a: string }).a).toMatch(/^\| Type .*\n\| -+ .*\n(.*\n){2}.*`tf`/);
    expect((fenced as { a: string }).a).toContain("```md\n---\ntitle: My Deck\n---\n\n## Q: Question?\nA: Answer.\n```");
    const last = deck.cards[8];
    expect(last.explain).toBe(
      "Use **Export all decks** to back them up:\n- there is no database\n- clearing browser data deletes them",
    );
  });
});

describe("metadata", () => {
  it("falls back to the filename, then to a default title", () => {
    expect(parseDeck("## Q: a\nA: b", "My Notes.md").deck.title).toBe("My Notes");
    expect(parseDeck("## Q: a\nA: b").deck.title).toBe("Untitled deck");
  });

  it("gives each deck an id and a timestamp", () => {
    const { deck } = parseDeck("## Q: a\nA: b");
    expect(deck.id).toBeTruthy();
    expect(deck.createdAt).toBeGreaterThan(0);
    expect(deck.subject).toBeUndefined();
  });

  it("reports invalid frontmatter instead of throwing", () => {
    const { deck, errors } = parseDeck("---\ntitle: [oops\n---\n\n## Q: a\nA: b", "f.md");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^Frontmatter \(line 1\):/);
    expect(deck.title).toBe("f");
    expect(deck.cards).toHaveLength(1);
  });
});

describe("leniency", () => {
  it("handles CRLF line endings", () => {
    const { deck, errors } = parseDeck(sample("cloud-computing.md").replace(/\r?\n/g, "\r\n"));
    expect(errors).toEqual([]);
    expect(deck.cards).toHaveLength(3);
    expect(deck.cards[0]).toMatchObject({ a: "Authentication services managed by a third party: SSO, MFA, IGA." });
  });

  it("starts a new card at ## Q: even when the --- separator is missing", () => {
    const { deck, errors } = parseDeck("## Q: one\nA: 1\n\n## Q: two\nA: 2\n\n---\n");
    expect(errors).toEqual([]);
    expect(deck.cards.map((c) => c.q)).toEqual(["one", "two"]);
  });

  it("keeps bullets in a basic answer as answer text, not options", () => {
    const { deck } = parseDeck("## Q: list?\nA:\n- one\n- two");
    expect(deck.cards[0]).toMatchObject({ type: "basic", a: "- one\n- two" });
  });
});

describe("errors", () => {
  it("names the card number and line, and keeps the valid cards", () => {
    const { deck, errors } = parseDeck(
      deckOf(
        "## Q: fine\nA: yes", // card 1, line 5
        "## Q: two right\ntype: mcq\n- [x] a\n- [x] b", // card 2, line 10
        "## Q: also fine\ntype: tf\nA: TRUE", // card 3
      ),
    );
    expect(errors).toEqual(["Card 2 (line 10): mcq needs exactly one [x] option"]);
    expect(deck.cards.map((c) => c.id)).toEqual(["c1", "c3"]);
    expect(deck.cards[1]).toMatchObject({ type: "tf", a: true });
  });

  it.each([
    ["## Q: none right\ntype: mcq\n- a\n- b", "mcq needs exactly one [x] option"],
    ["## Q: one option\ntype: mcq\n- [x] a", "mcq needs at least 2 options"],
    ["## Q: maybe\ntype: tf\nA: maybe", "tf needs A: true or A: false"],
    ["## Q: no answer\ntype: tf", "tf needs A: true or A: false"],
    ["## Q: no answer", "basic needs an A: answer"],
    ["## Q:\nA: no question", "missing question text after ## Q:"],
    ["## Q: odd\ntype: cloze\nA: x", 'unknown type "cloze" (use basic, mcq, or tf)'],
    ["Some stray notes", 'expected a "## Q:" heading'],
  ])("%j -> %s", (card, message) => {
    const { deck, errors } = parseDeck(deckOf(card));
    expect(errors).toEqual([`Card 1 (line 5): ${message}`]);
    expect(deck.cards).toEqual([]);
  });

  it("reports an empty deck", () => {
    expect(parseDeck("---\ntitle: T\n---\n").errors).toEqual(["No cards found (each card starts with ## Q:)"]);
    expect(parseDeck("").errors).toHaveLength(1);
  });
});

describe("cardFaces", () => {
  it("builds front and back markdown for each card type", async () => {
    const { cardFaces } = await import("./faces");
    const [basic, mcq, tf] = parseDeck(sample("cloud-computing.md")).deck.cards.map(cardFaces);
    expect(basic).toEqual({
      front: "What does IDaaS provide?",
      back: "Authentication services managed by a third party: SSO, MFA, IGA.",
    });
    expect(mcq.front).toBe("Which tier of the container architecture stores images?\n\n- Tier 2\n- Tier 3\n- Tier 4");
    expect(mcq.back).toBe("**Tier 3**\n\nRegistries store images and send them to orchestrators.");
    expect(tf.back).toBe("**False**\n\nContainers do not need an independent OS.");
  });
});
