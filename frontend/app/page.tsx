"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Particles } from "@/components/effects/Particles";
import { GlowEffect } from "@/components/effects/GlowEffect";
import { useLiminalAuth } from "@/hooks/useLiminalAuth";
import { Loader2, Mail, Wallet, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const { ready, authenticated, login } = useLiminalAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/home");
    }
  }, [ready, authenticated, router]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    login();
    // Reset after a moment in case modal is dismissed
    setTimeout(() => setIsLoggingIn(false), 3000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Particles count={50} />

      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GlowEffect className="top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2" size={600} intensity="low" color="rgba(196, 169, 122, 0.08)" />
        <GlowEffect className="bottom-[20%] right-[20%]" size={450} intensity="low" color="rgba(176, 141, 88, 0.06)" />
        <GlowEffect className="top-[60%] left-[60%]" size={350} intensity="low" color="rgba(232, 213, 176, 0.05)" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(rgba(196,169,122,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(196,169,122,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="glass-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial pointer-events-none opacity-30" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="flex justify-center mb-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/liminal-logo.svg" alt="Liminal" className="w-12 h-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-6"
          >
            <span className="text-[10px] tracking-[0.35em] uppercase text-[var(--text-muted)] font-medium">
              Powered by Arc
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-3 relative"
          >
            <motion.div
              className="absolute inset-0 -inset-x-8 -inset-y-4"
              style={{ background: "radial-gradient(ellipse at center, rgba(196,169,122,0.15) 0%, transparent 65%)", filter: "blur(20px)" }}
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.04, 0.98] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <h1 className="relative font-display font-black text-[3.2rem] md:text-[3.8rem] leading-[1.05] tracking-[-0.02em]" style={{
              background: "linear-gradient(145deg, #c4a97a 0%, #e8d5b0 35%, #d4be94 55%, #967545 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              the LIMINAL space
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center text-[11px] text-[var(--text-muted)] mb-10 tracking-[0.15em] uppercase"
          >
            Decentralized Casino on Arc Testnet
          </motion.p>

          {/* Primary CTA — Privy login */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="space-y-3"
          >
            {/* Enter Liminal with Privy */}
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: "0 4px 32px rgba(196,169,122,0.25)" }}
              whileTap={{ scale: 0.985 }}
              onClick={handleLogin}
              disabled={!ready || isLoggingIn}
              id="privy-login-btn"
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 hover:from-accent-gold/20 hover:to-accent-gold/10 hover:border-accent-gold/50 transition-all duration-300 disabled:opacity-40 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-gold/15 border border-accent-gold/20 flex items-center justify-center flex-shrink-0">
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 text-accent-gold animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C4A97A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--text-primary)] text-[14px] leading-tight">
                    Enter Liminal with Privy
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Email · Wallet · Social · Embedded
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-accent-gold/60 group-hover:text-accent-gold transition-colors" />
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--border-color)]" />
              <span className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>

            {/* Quick method hints */}
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={!ready}
                id="email-login-btn"
                className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all duration-200 text-left group"
              >
                <Mail className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent-gold transition-colors flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Email</p>
                  <p className="text-[10px] text-[var(--text-muted)]">OTP login</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={!ready}
                id="wallet-login-btn"
                className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all duration-200 text-left group"
              >
                <Wallet className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent-gold transition-colors flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Wallet</p>
                  <p className="text-[10px] text-[var(--text-muted)]">MetaMask · Zerion</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Loading overlay while Privy initializes */}
          <AnimatePresence>
            {!ready && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
              >
                <Loader2 className="w-6 h-6 text-accent-gold animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-10 pt-5 border-t border-[var(--border-color)]"
          >
            <div className="flex items-center justify-center gap-6 text-[9px] text-[var(--text-muted)] tracking-[0.2em] uppercase">
              <span>Decentralized</span>
              <span className="w-1 h-1 rounded-full bg-accent-gold/40" />
              <span>Provably Fair</span>
              <span className="w-1 h-1 rounded-full bg-accent-gold/40" />
              <span>USDC Native</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-4"
        >
          <span className="text-[10px] text-[var(--text-muted)] tracking-wide">
            Arc Testnet · Chain ID 5042002 · Secured by Privy
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
