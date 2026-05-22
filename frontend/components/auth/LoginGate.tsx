"use client";

import { motion } from "framer-motion";
import { useLiminalAuth } from "@/hooks/useLiminalAuth";
import { Loader2 } from "lucide-react";

interface LoginGateProps {
  children: React.ReactNode;
}

/**
 * Wraps any page/section to require Privy auth.
 * Shows a branded loading state while Privy initializes,
 * then redirects to login if not authenticated.
 */
export function LoginGate({ children }: LoginGateProps) {
  const { ready, authenticated } = useLiminalAuth();

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
            Initializing
          </p>
        </motion.div>
      </div>
    );
  }

  if (!authenticated) {
    // Render nothing — the (authenticated) layout handles redirect
    return null;
  }

  return <>{children}</>;
}
