import type { Variants } from "framer-motion";

// Respects prefers-reduced-motion via framer-motion's built-in support.
// When motion is reduced, framer-motion uses instant transitions.

export const messageVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export const userMessageVariants: Variants = {
  hidden: { opacity: 0, x: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
};

export const assistantMessageVariants: Variants = {
  hidden: { opacity: 0, x: -12, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

export const typingDotVariants: Variants = {
  pulse: {
    opacity: [0.3, 1, 0.3],
    transition: { repeat: Infinity, duration: 1, ease: "easeInOut" },
  },
};

export const panelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const sidebarItemVariants: Variants = {
  idle: { x: 0 },
  hover: { x: 2, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
