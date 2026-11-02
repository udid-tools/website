"use client";

import { type ComponentProps, useSyncExternalStore } from "react";
import * as motion from "motion/react-client";

type MotionProps = ComponentProps<typeof motion.div> & {
  as?: "div" | "h1" | "h2" | "p";
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function Motion({ as = "div", children, ...props }: MotionProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => true
  );
  const Component =
    as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : as === "p" ? motion.p : motion.div;
  return (
    <Component
      {...props}
      // Content must be readable before hydration and when JavaScript is unavailable.
      initial={false}
      {...(reducedMotion ? { transition: { duration: 0, delay: 0 } } : {})}
    >
      {children}
    </Component>
  );
}
