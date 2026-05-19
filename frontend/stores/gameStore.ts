import { create } from "zustand";

interface GameState {
  // Active game state
  activeGame: "roulette" | "blackjack" | "slots" | null;
  isPlaying: boolean;
  lastResult: {
    won: boolean;
    payout: number;
    game: string;
    details: Record<string, unknown>;
  } | null;

  // Bet state
  currentBet: number;
  selectedBetType: number;
  selectedChoice: number;

  // UI state
  isSidebarOpen: boolean;
  showResultModal: boolean;
  
  // Actions
  setActiveGame: (game: GameState["activeGame"]) => void;
  setIsPlaying: (playing: boolean) => void;
  setLastResult: (result: GameState["lastResult"]) => void;
  setCurrentBet: (amount: number) => void;
  setSelectedBetType: (type: number) => void;
  setSelectedChoice: (choice: number) => void;
  toggleSidebar: () => void;
  setShowResultModal: (show: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  activeGame: null,
  isPlaying: false,
  lastResult: null,
  currentBet: 10,
  selectedBetType: 0,
  selectedChoice: 0,
  isSidebarOpen: true,
  showResultModal: false,

  setActiveGame: (game) => set({ activeGame: game }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setLastResult: (result) => set({ lastResult: result, showResultModal: !!result }),
  setCurrentBet: (amount) => set({ currentBet: amount }),
  setSelectedBetType: (type) => set({ selectedBetType: type }),
  setSelectedChoice: (choice) => set({ selectedChoice: choice }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setShowResultModal: (show) => set({ showResultModal: show }),
  resetGame: () =>
    set({
      isPlaying: false,
      lastResult: null,
      currentBet: 10,
      selectedBetType: 0,
      selectedChoice: 0,
      showResultModal: false,
    }),
}));
