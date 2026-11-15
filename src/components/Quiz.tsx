"use client";

import Link from "next/link";
import { useState } from "react";
import type { Card, Deck } from "@/lib/markdown/schema";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { DeckPage } from "./DeckPage";
import { Markdown } from "./Markdown";
import { ProgressBar } from "./ProgressBar";
import { btn, btnPrimary, field, muted, panel } from "./ui";

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
  const card = cards[i];

  if (!card) {
    const percent = total ? Math.round((score / total) * 100) : 0;
    return (
      <section className={`${panel} flex flex-col items-center gap-4 text-center`} aria-live="polite">
        <h2 className="text-xl font-semibold">Quiz complete</h2>
        <p className="text-5xl font-semibold">
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

  const grade = (ok: boolean) => {
    setResult(ok);
    if (ok) setScore((n) => n + 1);
  };
  const pick = (answer: string) => {
    setPicked(answer);
    grade(answer === correctAnswer(card));
  };
  const next = () => {
    if (i === total - 1) saveQuiz(deck.id, score, total);
    setI(i + 1);
    setPicked(null);
    setResult(null);
    setTyped("");
  };

  const options = card.type === "mcq" ? card.options.map((o) => o.text) : card.type === "tf" ? ["True", "False"] : [];
  const optionStyle = (option: string) =>
    result === null
      ? ""
      : option === correctAnswer(card)
        ? "border-green-600 bg-green-50 dark:bg-green-950/50"
        : option === picked
          ? "border-red-600 bg-red-50 dark:bg-red-950/50"
          : "opacity-60";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={i} max={total} label="Questions answered" />
        <span className={`${muted} shrink-0`}>
          Question {i + 1} of {total}
        </span>
      </div>

      <div className={`${panel} text-lg`}>
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
          {options.map((option) => (
            <button
              key={option}
              disabled={result !== null}
              onClick={() => pick(option)}
              className={`${btn} justify-start rounded-xl px-4 py-3 text-left text-base disabled:opacity-100 ${optionStyle(option)}`}
            >
              {option}
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
              <p className={`font-semibold ${result ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
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
