"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A gentle fade-up on mount. Pass an increasing `delay` to siblings to stagger
 * a section into view (30–60ms apart reads best). Renders a plain div under
 * prefers-reduced-motion so nothing moves.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
