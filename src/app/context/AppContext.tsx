"use client";

import React, { createContext, useContext, useState } from "react";
import type { User, Studio, PotteryEntry } from "@/types";

type AppContextType = {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;

  currentStudio: Studio | null;
  setCurrentStudio: (s: Studio | null) => void;

  currentThrow: PotteryEntry | null;
  setCurrentThrow: (t: PotteryEntry | null) => void;

  // Optional, but very handy for auth-protected API routes
  authToken: string | null;
  setAuthToken: (token: string | null) => void;

  // Optional: a simple flag you can use in UI
  isLoggedIn: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);
  const [currentThrow, setCurrentThrow] = useState<PotteryEntry | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    currentStudio,
    setCurrentStudio,
    currentThrow,
    setCurrentThrow,
    authToken,
    setAuthToken,
    isLoggedIn: !!currentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
}
