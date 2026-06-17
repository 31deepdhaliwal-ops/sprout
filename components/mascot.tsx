"use client";

import { motion, useReducedMotion } from "motion/react";

export type MascotState = "balanced" | "tired" | "calm" | "celebrate";

/**
 * "Sprout" — the family's helper mascot.
 *  - balanced: content
 *  - tired: half-closed eyes + sweat
 *  - calm: serene "breathe" state
 *  - celebrate: arms up, sparkles — fires when a task is completed
 * All motion is gated on prefers-reduced-motion.
 */
export function Mascot({
  state = "balanced",
  size = 96,
  className,
}: {
  state?: MascotState;
  size?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ink = "#34312a";

  const anim = reduce
    ? {}
    : state === "celebrate"
      ? {
          animate: { scale: [1, 1.16, 1], rotate: [0, -4, 4, 0] },
          transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const },
        }
      : {
          animate: { scale: state === "tired" ? [1, 1.015, 1] : [1, 1.045, 1] },
          transition: {
            duration: state === "tired" ? 3 : 4.2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  const armsUp = state === "celebrate";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Sprout mascot"
    >
      <motion.g style={{ transformOrigin: "60px 72px" }} {...anim}>
        {/* sparkles on celebrate */}
        {state === "celebrate" && (
          <g fill="var(--apricot)">
            <rect x="20" y="34" width="6" height="6" rx="1.5" transform="rotate(45 23 37)" />
            <rect x="95" y="40" width="5" height="5" rx="1.5" transform="rotate(45 97 42)" />
            <rect x="30" y="16" width="4" height="4" rx="1" transform="rotate(45 32 18)" />
          </g>
        )}

        {/* sprout */}
        <path d="M60 30 C60 22 54 17 49 18 C52 22 53 27 60 30 Z" fill="var(--positive)" />
        <path d="M60 30 C60 22 66 17 71 18 C68 22 67 27 60 30 Z" fill="var(--positive)" />
        <rect x="58.6" y="28" width="2.8" height="10" rx="1.4" fill="var(--positive)" />

        {/* body */}
        <ellipse cx="60" cy="70" rx="40" ry="38" fill="var(--primary)" />
        <ellipse cx="60" cy="78" rx="26" ry="22" fill="#ffffff" opacity="0.14" />

        {/* arms */}
        {armsUp ? (
          <>
            <path d="M30 70 Q24 52 34 44" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M90 70 Q96 52 86 44" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M30 78 Q34 96 50 98" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M90 78 Q86 96 70 98" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* bundle (held only when not celebrating) */}
        {!armsUp && (
          <>
            <rect x="42" y="84" width="36" height="26" rx="9" fill="var(--apricot)" />
            <path d="M60 84 C56 79 52 79 50 82 C54 82 56 84 60 84 C64 84 66 82 70 82 C68 79 64 79 60 84 Z" fill="var(--accent)" />
          </>
        )}

        {/* eyes */}
        {state === "calm" ? (
          <>
            <path d="M46 64 Q51 60 56 64" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M64 64 Q69 60 74 64" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        ) : state === "tired" ? (
          <>
            <path d="M46 62 L56 62" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M64 62 L74 62" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M81 56 q3 5 0 8 q-3 -3 0 -8 Z" fill="#7fb8e6" />
          </>
        ) : reduce ? (
          <>
            <circle cx="51" cy="61" r="3.2" fill={ink} />
            <circle cx="69" cy="61" r="3.2" fill={ink} />
          </>
        ) : (
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={{ scaleY: [1, 1, 0.12, 1] }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 3.6,
              times: [0, 0.8, 0.9, 1],
              ease: "easeInOut",
            }}
          >
            <circle cx="51" cy="61" r="3.2" fill={ink} />
            <circle cx="69" cy="61" r="3.2" fill={ink} />
          </motion.g>
        )}

        {/* mouth */}
        {state === "tired" ? (
          <path d="M52 73 Q60 76 68 73" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        ) : state === "celebrate" ? (
          <path d="M50 70 Q60 84 70 70 Z" fill={ink} />
        ) : state === "calm" ? (
          <path d="M54 72 Q60 77 66 72" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M50 71 Q60 80 70 71" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}
      </motion.g>
    </svg>
  );
}
