"use client";

import Link from "next/link";
import { useState } from "react";
import { useHotkeys } from "@/lib/hooks";
import type { Card, Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { DeckPage } from "./DeckPage";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { ProgressBar } from "./ProgressBar";
import { btn, btnPrimary, field, kbd, muted, panel } from "./ui";

export function Quiz() {
  const [attempt, setAttempt] = useState(0);
  return (
    <DeckPage mode="quiz">{(deck) => <QuizRun key={attempt} deck={deck} onRetry={() => setAttempt((n) => n + 1)} />}</DeckPage>
  );
}

/** Typed answers are matched loosely: case, spacing and punctuation are ignored. */
const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

const correctAnswer = (card: Card) =>
  card.type === "mcq" ? (card.options.find((o) => o.correct)?.text ?? "") : card.type === "tf" ? (card.a ? "True" : "False") : card.a;

function QuizRun({ deck, onRetry }: { deck: Deck; onRetry: () => void }) {
  const [cards] = useState(() => shuffle(deck.cards));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // the option or typed text the user answered with
  // null = unanswered, "self" = typed answer shown and waiting for the user to grade themselves
  const [result, setResult] = useState<boolean | "self" | null>(null);
  const [typed, setTyped] = useState("");
  const saveQuiz = useProgress((s) => s.saveQuiz);
  const best = useProgress((s) => s.decks[deck.id]?.quiz?.best);

  const total = cards.length;
  const card: Card | undefined = cards[i];
  const options = card?.type === "mcq" ? card.options.map((o) => o.text) : card?.type === "tf" ? ["True", "False"] : [];

  // Number keys pick an option while the question is unanswered.
  useHotkeys(Object.fromEntries(options.map((option, n) => [String(n + 1), result === null ? () => pick(option) : undefined])));

  const grade = (ok: boolean) => {
    setResult(ok);
    if (ok) setScore((n) => n + 1);
  };
  function pick(answer: string) {
    if (!card) return;
    setPicked(answer);
    grade(answer === correctAnswer(card));
  }

  if (!card) {
    const percent = total ? Math.round((score / total) * 100) : 0;
    return (
      <section className={`${panel} flex flex-col items-center gap-4 py-10 text-center`} aria-live="polite">
        <h2 className="text-2xl font-semibold">{percent >= 80 ? "Great work!" : percent >= 50 ? "Getting there" : "Keep practicing"}</h2>
        <p className="text-6xl font-semibold tracking-tight text-primary tabular-nums">
          {score} / {total}
        </p>
        <p className={muted}>
          {percent}% correct{best !== undefined && ` · best ${best}%`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button className={btnPrimary} onClick={onRetry}>
            Try again
          </button>
          <Link href={`/deck/${encodeURIComponent(deck.id)}`} className={btn}>
            Back to study
          </Link>
        </div>
      </section>
    );
  }

  const next = () => {
    if (i === total - 1) saveQuiz(deck.id, score, total);
    setI(i + 1);
    setPicked(null);
    setResult(null);
    setTyped("");
  };

  const optionStyle = (option: string) =>
    result === null
      ? ""
      : option === correctAnswer(card)
        ? "border-success bg-success-soft text-success"
        : option === picked
          ? "border-danger bg-danger-soft text-danger"
          : "opacity-50";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={i} max={total} label="Questions answered" />
        <span className={`${muted} shrink-0 tabular-nums`}>
          Question {i + 1} of {total}
        </span>
      </div>

      <div className={`${panel} py-7 text-xl font-medium`}>
        <Markdown>{card.q}</Markdown>
      </div>

      {card.type === "basic" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPicked(typed);
            if (normalize(typed) === normalize(card.a)) grade(true);
            else setResult("self");
          }}
        >
          <label htmlFor="answer" className="text-sm font-medium">
            Type your answer from memory
          </label>
          <textarea
            id="answer"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            readOnly={result !== null}
            className={`${field} min-h-20`}
          />
          {result === null && <button className={`${btnPrimary} self-start`}>Check answer</button>}
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((option, n) => (
            <button
              key={option}
              disabled={result !== null}
              onClick={() => pick(option)}
              className={`${btn} min-h-14 justify-start gap-3 px-4 py-3 text-left text-base disabled:opacity-100 ${optionStyle(option)}`}
            >
              <kbd aria-hidden="true" className={kbd}>
                {n + 1}
              </kbd>
              <span className="flex-1">{option}</span>
              {/* An icon as well as colour, so the result does not rely on colour alone. */}
              {result !== null && option === correctAnswer(card) && <Icon name="check" className="size-5" />}
              {result !== null && option === picked && option !== correctAnswer(card) && <Icon name="x" className="size-5" />}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="flex flex-col gap-3">
        {result !== null && (
          <div className={`${panel} flex flex-col gap-3`}>
            {result === "self" ? (
              <p className="font-semibold">Compare with the answer:</p>
            ) : (
              <p className={`flex items-center gap-2 font-semibold ${result ? "text-success" : "text-danger"}`}>
                <Icon name={result ? "check" : "x"} className="size-5" />
                {result ? "Correct!" : "Not quite."}
              </p>
            )}
            <Markdown>{`**Answer:** ${card.type === "basic" ? `\n\n${card.a}` : correctAnswer(card)}`}</Markdown>
            {card.explain && (
              <div className={muted}>
                <Markdown>{card.explain}</Markdown>
              </div>
            )}
            {result === "self" ? (
              <div className="flex flex-wrap gap-2">
                <button className={btnPrimary} onClick={() => grade(true)}>
                  I got it right
                </button>
                <button className={btn} onClick={() => grade(false)}>
                  I got it wrong
                </button>
              </div>
            ) : (
              <button className={`${btnPrimary} self-start`} onClick={next} autoFocus>
                {i === total - 1 ? "See score" : "Next question"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
