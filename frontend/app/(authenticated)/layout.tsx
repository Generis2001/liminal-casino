"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useGameStore } from "@/stores/gameStore";
import { AnimatePresence } from "framer-motion";
import { useLiminalAuth } from "@/hooks/useLiminalAuth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useUSDCBlockSync } from "@/lib/useUSDCBalance";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useUSDCBlockSync();
  const { ready, authenticated } = useLiminalAuth();
  const router = useRouter();
  const isSidebarOpen = useGameStore((s) => s.isSidebarOpen);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Privy initializing
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/liminal-logo.svg" alt="Liminal" className="w-10 h-10 opacity-60" />
          <Loader2 className="w-5 h-5 text-accent-gold animate-spin" />
          <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
            Loading
          </p>
        </motion.div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className={`flex-1 min-h-[calc(100vh-64px)] transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
