"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Particles } from "@/components/effects/Particles";
import { GlowEffect } from "@/components/effects/GlowEffect";
import { ARC_CHAIN_ID } from "@/lib/arcChain";

const wallets = [
  {
    id: "metaMask",
    name: "MetaMask",
    description: "Popular browser extension wallet",
    icon: "/metamask.svg",
  },
  {
    id: "injected",
    name: "Zerion",
    description: "Smart wallet for DeFi",
    icon: "/zerion.svg",
  },
];

export default function LoginPage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { switchChain } = useSwitchChain();
  const router = useRouter();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      if (chainId !== ARC_CHAIN_ID) {
        switchChain?.({ chainId: ARC_CHAIN_ID });
      } else {
        router.push("/home");
      }
    }
  }, [isConnected, address, chainId, router, switchChain]);

  const handleConnect = (walletId: string) => {
    setConnectingWallet(walletId);

    // Find the best matching connector
    const connector = connectors.find((c) => {
      const cId = c.id.toLowerCase();
      const cName = c.name.toLowerCase();
      const target = walletId.toLowerCase();
      return cId.includes(target) || cName.includes(target);
    });

    if (connector) {
      connect(
        { connector },
        {
          onError: () => setConnectingWallet(null),
          onSuccess: () => setConnectingWallet(null),
        }
      );
    } else {
      // Fallback: use the first available connector
      const fallback = connectors[0];
      if (fallback) {
        connect(
          { connector: fallback },
          {
            onError: () => setConnectingWallet(null),
            onSuccess: () => setConnectingWallet(null),
          }
        );
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Particles count={50} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GlowEffect className="top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2" size={600} intensity="low" color="rgba(196, 169, 122, 0.08)" />
        <GlowEffect className="bottom-[20%] right-[20%]" size={450} intensity="low" color="rgba(176, 141, 88, 0.06)" />
        <GlowEffect className="top-[60%] left-[60%]" size={350} intensity="low" color="rgba(232, 213, 176, 0.05)" />
      </div>

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

          {/* Liminal logo */}
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
            Connect to Arc Testnet
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-3"
          >
            {wallets.map((wallet, index) => (
              <motion.button
                key={wallet.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.12, duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.015, boxShadow: "0 4px 24px rgba(196,169,122,0.12)" }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleConnect(wallet.id)}
                disabled={isPending}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-accent-gold/20 hover:bg-[var(--bg-card-hover)] transition-all duration-300 disabled:opacity-40 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wallet.icon} alt={wallet.name} className="w-11 h-11 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--text-primary)] text-[14px] leading-tight">
                    {wallet.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {connectingWallet === wallet.id && isPending ? "Awaiting approval..." : wallet.description}
                  </p>
                </div>
                {connectingWallet === wallet.id && isPending ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-accent-gold/60 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="mt-4 px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10"
              >
                <p className="text-[11px] text-red-400 text-center">
                  {error.message.includes("rejected") || error.message.includes("denied")
                    ? "Connection declined — please try again"
                    : "Connection interrupted — please retry"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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
            Arc Testnet · Chain ID 5042002
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
