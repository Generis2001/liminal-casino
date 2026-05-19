"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/stores/gameStore";
import {
  Home,
  Gamepad2,
  Radio,
  CircleDot,
  Spade,
  Cherry,
  TrendingUp,
  Trophy,
  Gift,
  Landmark,
  User,
  Clock,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/lobby", label: "Casino Lobby", icon: Gamepad2 },
  { href: "/live", label: "Live Games", icon: Radio },
  { divider: true },
  { href: "/roulette", label: "Roulette", icon: CircleDot },
  { href: "/blackjack", label: "Blackjack", icon: Spade },
  { href: "/slots", label: "Slots", icon: Cherry },
  { divider: true },
  { href: "/predictions", label: "Predictions", icon: TrendingUp },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/rewards", label: "Rewards & VIP", icon: Gift },
  { href: "/treasury", label: "Treasury", icon: Landmark },
  { divider: true },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/history", label: "History", icon: Clock },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const isOpen = useGameStore((s) => s.isSidebarOpen);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-16 bottom-0 z-30 bg-[var(--bg-primary)] border-r border-[var(--border-color)] overflow-y-auto overflow-x-hidden"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="py-4 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return (
              <div
                key={`div-${i}`}
                className="my-2 mx-3 h-px bg-[var(--border-color)]"
              />
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href!}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-accent-gold/10 text-accent-gold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-gold rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
