"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { pageVariants, pageTransition } from "@/animations/variants";

export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
