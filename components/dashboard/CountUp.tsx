"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
}

/**
 * Animate a number from 0 to `value` on mount / when value changes.
 * Degrades gracefully: if the tab is hidden (rAF is paused) or the user
 * prefers reduced motion, it shows the final value immediately — never stuck
 * at 0 — and animates once the tab becomes visible.
 */
export function CountUp({ value, format, duration = 900 }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setDisplay(value * eased);
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      setDisplay(0);
      raf.current = requestAnimationFrame(tick);
    };

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(value);
      return;
    }

    if (typeof document !== "undefined" && document.hidden) {
      setDisplay(value); // don't animate while paused
      const onVisible = () => {
        if (!document.hidden) {
          document.removeEventListener("visibilitychange", onVisible);
          animate();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        document.removeEventListener("visibilitychange", onVisible);
        if (raf.current) cancelAnimationFrame(raf.current);
      };
    }

    animate();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <>{format(display)}</>;
}
