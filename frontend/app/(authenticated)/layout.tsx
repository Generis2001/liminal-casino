"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useGameStore } from "@/stores/gameStore";
import { AnimatePresence } from "framer-motion";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const isSidebarOpen = useGameStore((s) => s.isSidebarOpen);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="flex">
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
