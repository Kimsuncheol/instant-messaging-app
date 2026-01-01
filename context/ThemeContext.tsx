"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// WhatsApp color palettes
const whatsappDark = {
  panelBg: "#111B21",
  panelBgDeep: "#0B141A",
  headerBg: "#202C33",
  tealGreen: "#00A884",
  tealGreenDark: "#008069",
  primaryText: "#E9EDEF",
  secondaryText: "#8696A0",
  border: "#2A3942",
  inputBg: "#2A3942",
  outgoingBubble: "#005C4B",
  incomingBubble: "#202C33",
};

const whatsappLight = {
  panelBg: "#FFFFFF",
  panelBgDeep: "#F0F2F5",
  headerBg: "#008069",
  tealGreen: "#00A884",
  tealGreenDark: "#008069",
  primaryText: "#111B21",
  secondaryText: "#667781",
  border: "#E9EDEF",
  inputBg: "#F0F2F5",
  outgoingBubble: "#D9FDD3",
  incomingBubble: "#FFFFFF",
};

const createAppTheme = (mode: "light" | "dark") => {
  const colors = mode === "dark" ? whatsappDark : whatsappLight;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.tealGreen,
        dark: colors.tealGreenDark,
      },
      background: {
        default: colors.panelBgDeep,
        paper: colors.panelBg,
      },
      text: {
        primary: colors.primaryText,
        secondary: colors.secondaryText,
      },
      divider: colors.border,
    },
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Helvetica, "Lucida Grande", Arial, sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
          },
          contained: {
            backgroundColor: colors.tealGreen,
            "&:hover": {
              backgroundColor: colors.tealGreenDark,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors.inputBg,
              borderRadius: 8,
              "& fieldset": {
                border: "none",
              },
            },
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">("dark");

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (saved) {
      setModeState(saved);
    }
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPreference(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const resolvedMode = mode === "system" ? systemPreference : mode;

  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
