"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A small, soft confetti burst — fires once from its parent's centre. Mix of
 * colour-token dots and a few ⭐ (the points motif). Kept gentle to suit the
 * calm palette, and skipped entirely under prefers-reduced-motion.
 *
 * Render it conditionally (e.g. `{burst && <Confetti />}`) so it only mounts on
 * a real client interaction — never during SSR, so the random spread is safe.
 */
const COLORS = ["var(--primary)", "var(--accent)", "var(--apricot)", "var(--positive)"];

export function Confetti({ count = 12 }: { count?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const dist = 24 + Math.random() * 28;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 8, // bias the spray slightly upward
      rotate: (Math.random() - 0.5) * 220,
      duration: 0.65 + Math.random() * 0.25,
      color: COLORS[i % COLORS.length],
      size: 5 + Math.round(Math.random() * 4),
      star: i % 4 === 0,
    };
  });

  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: 1, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          style={
            p.star
              ? { fontSize: p.size + 6, lineHeight: 1 }
              : {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size % 2 ? 9999 : 2,
                  backgroundColor: p.color,
                }
          }
        >
          {p.star ? "⭐" : null}
        </motion.span>
      ))}
    </span>
  );
}
