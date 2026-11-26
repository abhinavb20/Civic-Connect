import React, { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** Animated number counter used for real, API-backed statistics. */
const CountUp = ({ value = 0, duration = 1300, decimals = 0, suffix = "", prefix = "" }) => {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);
  const frame = useRef(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, reduced]);

  const shown = reduced ? target : display;
  const formatted = Number(shown).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
