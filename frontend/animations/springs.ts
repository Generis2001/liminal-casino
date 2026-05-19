import type { Transition } from "framer-motion";

// ─── Bubble Button Spring ───────────────────────────────────────────
export const bubbleSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

export const buttonTap = {
  scale: 0.95,
  transition: bubbleSpring,
};

export const buttonHover = {
  scale: 1.03,
  transition: {
    type: "spring" as const,
    stiffness: 300,
    damping: 10,
  },
};

// ─── Smooth Spring ──────────────────────────────────────────────────
export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
};

// ─── Bouncy Spring ──────────────────────────────────────────────────
export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 12,
  mass: 0.5,
};

// ─── Gentle Spring ──────────────────────────────────────────────────
export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 1,
};

// ─── Slot Reel Spring ───────────────────────────────────────────────
export const reelSpring: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 15,
  mass: 2,
};

// ─── Card Flip Spring ───────────────────────────────────────────────
export const cardFlipSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1.2,
};
