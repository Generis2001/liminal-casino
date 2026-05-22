"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback } from "react";

export interface LiminalUser {
  id: string;
  email?: string;
  createdAt?: Date;
}

export interface LiminalWallet {
  address: string;
  chainId?: number;
  walletClientType?: string;
}

export interface UseLiminalAuth {
  /** True once Privy has finished initializing */
  ready: boolean;
  /** True if the user is logged in */
  authenticated: boolean;
  /** Privy user object */
  user: LiminalUser | null;
  /** Primary wallet (embedded or external) */
  wallet: LiminalWallet | null;
  /** Shorthand for wallet?.address */
  address: string | null;
  /** Open Privy login modal */
  login: () => void;
  /** Log the user out */
  logout: () => Promise<void>;
}

export function useLiminalAuth(): UseLiminalAuth {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Prefer external wallets (MetaMask, Zerion) over embedded
  const externalWallet = wallets.find((w) => w.walletClientType !== "privy");
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const primaryWallet = externalWallet ?? embeddedWallet ?? null;

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const liminalUser: LiminalUser | null = user
    ? {
        id: user.id,
        email: user.email?.address,
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
      }
    : null;

  const liminalWallet: LiminalWallet | null = primaryWallet
    ? {
        address: primaryWallet.address,
        walletClientType: primaryWallet.walletClientType,
      }
    : null;

  return {
    ready,
    authenticated,
    user: liminalUser,
    wallet: liminalWallet,
    address: liminalWallet?.address ?? null,
    login: handleLogin,
    logout: handleLogout,
  };
}
