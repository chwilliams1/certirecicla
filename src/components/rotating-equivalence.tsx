"use client";

import { useState, useEffect, useCallback } from "react";

interface Equivalence {
  emoji: string;
  value: string;
  label: string;
}

interface RotatingEquivalenceProps {
  equivalences: Equivalence[];
  interval?: number;
}

export function RotatingEquivalence({ equivalences, interval = 5000 }: RotatingEquivalenceProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % equivalences.length);
  }, [equivalences.length]);

  useEffect(() => {
    if (paused || equivalences.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [paused, next, interval, equivalences.length]);

  if (equivalences.length === 0) return null;

  const eq = equivalences[current];

  return (
    <div
      className="flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => setPaused((p) => !p)}
    >
      <p key={current} className="text-base text-sage-600 equiv-enter">
        <span className="mr-1.5">{eq.emoji}</span>
        {eq.value} {eq.label}
      </p>
    </div>
  );
}
