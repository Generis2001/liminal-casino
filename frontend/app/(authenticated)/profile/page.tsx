"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { PageTransition } from "@/components/effects/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/Counter";
import { staggerContainer, staggerItem } from "@/animations/variants";
import { truncateAddress } from "@/lib/utils";
import { useUSDCBalance } from "@/lib/useUSDCBalance";
import { User, Copy, ExternalLink, Trophy, Flame, Target, LogOut, Edit2, Check, X, Camera, Wallet } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLiminalAuth } from "@/hooks/useLiminalAuth";

export default function ProfilePage() {
  const { address } = useAccount();
  const { logout, login, authenticated } = useLiminalAuth();
  const { value: usdcBalanceValue } = useUSDCBalance();
  
  const [copied, setCopied] = useState(false);
  
  // Customization States
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount/address change
  useEffect(() => {
    if (address) {
      const savedAvatar = localStorage.getItem(`liminal_avatar_${address}`);
      const savedName = localStorage.getItem(`liminal_name_${address}`);
      setAvatarDataUrl(savedAvatar);
      setDisplayName(savedName || "");
      setTempName(savedName || "");
    } else {
      setAvatarDataUrl(null);
      setDisplayName("");
      setTempName("");
    }
  }, [address]);

  const copyAddress = () => {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && address) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Auto-compress the image to safely fit inside localStorage
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxDim = 256; // 256x256 is plenty for an avatar
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG at 80% quality
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          
          try {
            setAvatarDataUrl(compressedDataUrl);
            localStorage.setItem(`liminal_avatar_${address}`, compressedDataUrl);
          } catch (err) {
            console.error("[Liminal] Failed to save avatar to local storage", err);
            alert("Image is still too large. Try a smaller file.");
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      setAvatarDataUrl(null);
      localStorage.removeItem(`liminal_avatar_${address}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveName = () => {
    const trimmed = tempName.trim();
    if (address && trimmed.length > 0 && trimmed.length <= 20) {
      setDisplayName(trimmed);
      localStorage.setItem(`liminal_name_${address}`, trimmed);
      setIsEditingName(false);
    }
  };

  const cancelNameEdit = () => {
    setTempName(displayName);
    setIsEditingName(false);
  };

  return (
    <PageTransition>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={staggerItem}>
          <Card glow className="p-6">
            <div className="flex items-start gap-5">
              
              {/* Editable Avatar */}
              <div 
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold/30 to-accent-warm/20 flex items-center justify-center cursor-pointer overflow-hidden group shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-accent-gold" />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                
                {/* Remove Button */}
                {avatarDataUrl && (
                  <button 
                    onClick={handleRemoveAvatar}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              {/* Editable Display Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 w-full max-w-sm">
                      <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={20}
                        placeholder="Enter username..."
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-sm font-semibold text-white focus:outline-none focus:border-accent-gold w-full"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveName()}
                      />
                      <button onClick={saveName} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelNameEdit} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col group">
                      <div className="flex items-center gap-2">
                        <h2 className={`text-lg truncate ${displayName ? 'font-display font-bold tracking-wide' : 'font-mono font-semibold'}`}>
                          {displayName || (address ? truncateAddress(address) : "Not Connected")}
                        </h2>
                        <button 
                          onClick={() => {
                            setTempName(displayName);
                            setIsEditingName(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-accent-gold transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      {displayName && address && (
                        <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                          {truncateAddress(address)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                  <button onClick={copyAddress} className="text-xs text-[var(--text-muted)] hover:text-accent-gold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md">
                    <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy Address"}
                  </button>
                  <a href={`https://testnet.arcscan.app/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] hover:text-accent-gold flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Explorer
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 text-center" hover={false}>
            <Target className="w-5 h-5 text-accent-gold mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Total Bets</p>
            <p className="text-2xl font-bold font-display">156</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Wins</p>
            <p className="text-2xl font-bold font-display text-emerald-400">89</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Best Streak</p>
            <p className="text-2xl font-bold font-display text-orange-400">12</p>
          </Card>
          <Card className="p-5 text-center" hover={false}>
            <p className="text-xs text-[var(--text-muted)]">Balance</p>
            <AnimatedCounter value={usdcBalanceValue} prefix="$" decimals={2} className="text-2xl font-bold font-display text-[var(--text-primary)]" />
            <p className="text-xs text-[var(--text-muted)]">USDC</p>
          </Card>
        </motion.div>

        {/* Game Breakdown */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <h3 className="font-display font-semibold mb-4">Game Breakdown</h3>
            <div className="space-y-3">
              {[
                { game: "Roulette", bets: 72, wins: 38, wagered: 4500, color: "bg-red-500" },
                { game: "Blackjack", bets: 45, wins: 28, wagered: 3200, color: "bg-emerald-500" },
                { game: "Slots", bets: 39, wins: 23, wagered: 1800, color: "bg-purple-500" },
              ].map((g) => (
                <div key={g.game} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${g.color}`} />
                  <span className="text-sm font-medium w-24">{g.game}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div className={`h-full rounded-full ${g.color}/60`} style={{ width: `${(g.wins / g.bets) * 100}%` }} />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] w-16 text-right">{g.wins}/{g.bets}</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] w-20 text-right">${g.wagered}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Disconnect or Reconnect */}
        <motion.div variants={staggerItem}>
          {(authenticated && address) ? (
            <Button variant="danger" className="w-full" onClick={() => logout()}>
              <LogOut className="w-4 h-4" /> Disconnect Wallet
            </Button>
          ) : (
            <Button className="w-full bg-accent-gold text-black hover:bg-accent-gold/90 transition-colors" onClick={() => login()}>
              <Wallet className="w-4 h-4" /> Reconnect Wallet
            </Button>
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
