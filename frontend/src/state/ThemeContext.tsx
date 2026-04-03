import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light";

const STORAGE_KEY = "ai-job-tracker-theme";

const Ctx = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  resolved: Theme;
} | null>(null);

function applyDom() {
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("dark");
  body.classList.remove("dark");
  root.style.colorScheme = "light";
  body.style.colorScheme = "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    applyDom();
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((_t: Theme) => {
    setThemeState("light");
  }, []);

  const toggleTheme = useCallback(() => {
    // no-op; dark mode removed
  }, []);

  useEffect(() => {
    applyDom();
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, resolved: theme }),
    [theme, setTheme, toggleTheme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
