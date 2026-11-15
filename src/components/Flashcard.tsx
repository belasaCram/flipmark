"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";

type Props = { front: string; back: string; onPrev?: () => void; onNext?: () => void };

const TILT_DEG = 12;
const SWIPE_PX = 80;
const spring = { stiffness: 260, damping: 26 };

/** 3D flip card. Starts on the front; give it a `key` per card so it resets when the card changes. */
export function Flashcard({ front, back, onPrev, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const dragged = useRef(false);
  const tiltX = useSpring(0, spring);
  const tiltY = useSpring(0, spring);

  // Page-wide shortcuts, so the card does not need focus. Other controls keep their own keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as Element).closest?.("input, textarea, select, button, a, [contenteditable]")) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  return (
    <div
      className="w-full max-w-xl perspective-[1200px]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        tiltY.set(((e.clientX - r.left) / r.width - 0.5) * TILT_DEG);
        tiltX.set((0.5 - (e.clientY - r.top) / r.height) * TILT_DEG);
      }}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        className="h-80 cursor-pointer touch-pan-y rounded-2xl outline-none transform-3d focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:h-96"
        style={{ rotateX: tiltX, rotateY: tiltY }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={(_, info) => {
          // The click that ends a drag fires before this timeout, so it is ignored below.
          setTimeout(() => (dragged.current = false));
          if (info.offset.x > SWIPE_PX) onPrev?.();
          else if (info.offset.x < -SWIPE_PX) onNext?.();
        }}
        onClick={() => !dragged.current && setFlipped((f) => !f)}
        onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && setFlipped((f) => !f)}
      >
        <motion.div
          className="relative size-full transform-3d"
          initial={false}
          animate={{ rotateY: flipped && !reduce ? 180 : 0 }}
          transition={{ type: "spring", ...spring }}
        >
          <Face label="Question" hidden={flipped} fade={!!reduce}>
            {front}
          </Face>
          <Face label="Answer" hidden={!flipped} fade={!!reduce} back>
            {back}
          </Face>
        </motion.div>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {flipped ? `Answer: ${back}` : ""}
      </p>
    </div>
  );
}

function Face(props: { label: string; children: string; hidden: boolean; fade: boolean; back?: boolean }) {
  // Reduced motion: both faces stay unrotated and cross-fade instead of flipping.
  const side = props.fade ? (props.hidden ? "opacity-0" : "") : props.back ? "rotate-y-180" : "";
  return (
    <div
      aria-hidden={props.hidden}
      className={`absolute inset-0 flex flex-col overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg transition-opacity duration-200 backface-hidden dark:border-zinc-800 dark:bg-zinc-900 ${side} ${props.hidden ? "pointer-events-none" : ""}`}
    >
      <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{props.label}</span>
      <div className="my-auto py-2 text-center text-lg">
        <Markdown>{props.children}</Markdown>
      </div>
    </div>
  );
}
