"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTokens, darkTokens, TCTokens } from './cssTokens';

interface ThemeContextValue {
  tc: TCTokens;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  tc: lightTokens,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider
      value={{
        tc: isDark ? darkTokens : lightTokens,
        isDark,
        toggleTheme: () => setIsDark((prev) => !prev),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
