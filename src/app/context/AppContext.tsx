"use client";

import React, { createContext, useContext, useState } from "react";
import type { User, Studio, StudioInvite, PotteryEntry } from "@/types";

type AppContextType = {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  currentStudio: Studio | null;
  setCurrentStudio: (s: Studio | null) => void;
  currentThrow: PotteryEntry | null;
  setCurrentThrow: (t: PotteryEntry | null) => void;

  authToken: string | null;
  setAuthToken: (token: string | null) => void;

  // user-level pending invites (for nav badge + InvitesPanel)
  pendingInvites: StudioInvite[];
  setPendingInvites: (invites: StudioInvite[]) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);
  const [currentThrow, setCurrentThrow] = useState<PotteryEntry | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<StudioInvite[]>([]);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    currentStudio,
    setCurrentStudio,
    currentThrow,
    setCurrentThrow,
    authToken,
    setAuthToken,
    pendingInvites,
    setPendingInvites,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within an AppProvider");
  return ctx;
}
