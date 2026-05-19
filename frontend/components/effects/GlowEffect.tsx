"use client";

import { motion } from "framer-motion";

interface GlowEffectProps {
  className?: string;
  color?: string;
  size?: number;
  intensity?: "low" | "medium" | "high";
}

export function GlowEffect({
  className = "",
  color = "rgba(196, 169, 122, 0.3)",
  size = 300,
  intensity = "medium",
}: GlowEffectProps) {
  const opacityMap = { low: [0.15, 0.3], medium: [0.25, 0.5], high: [0.4, 0.7] };
  const [minOp, maxOp] = opacityMap[intensity];

  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{
        opacity: [minOp, maxOp, minOp],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
