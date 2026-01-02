"use client";

import React, { createContext, useContext, useState } from "react";

type Locale = "en" | "ko" | "es" | "fr" | "zh" | "ja" | "hi" | "de" | "it" | "ru";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("locale") as Locale | null;
      const validLocales: Locale[] = ["en", "ko", "es", "fr", "zh", "ja", "hi", "de", "it", "ru"];
      if (savedLocale && validLocales.includes(savedLocale)) {
        return savedLocale;
      }
    }
    return "en";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
