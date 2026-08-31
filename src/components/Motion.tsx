"use client";

import type { ComponentProps } from "react";
import * as motion from "motion/react-client";

type MotionProps = ComponentProps<typeof motion.div> & {
  as?: "div" | "h1" | "h2" | "p";
};

export function Motion({ as = "div", children, ...props }: MotionProps) {
  const Component =
    as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : as === "p" ? motion.p : motion.div;
  return <Component {...props}>{children}</Component>;
}
