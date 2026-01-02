"use client";

import React, { createContext, useContext, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useLocale } from "./LocaleContext";

type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | "locale";
type TimeFormat = "12h" | "24h" | "locale";

// Map our app locales to Intl locale codes
const localeMap: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  zh: "zh-CN",
  ja: "ja-JP",
  hi: "hi-IN",
  de: "de-DE",
  it: "it-IT",
  ru: "ru-RU",
};

interface DateFormatContextType {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  setDateFormat: (format: DateFormat) => void;
  setTimeFormat: (format: TimeFormat) => void;
  formatTime: (timestamp: Timestamp | null) => string;
  formatDate: (timestamp: Timestamp | null) => string;
  formatDateTime: (timestamp: Timestamp | null) => string;
  formatRelativeTime: (timestamp: Timestamp | null) => string;
  getIntlLocale: () => string;
}

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

export function DateFormatProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  
  const [dateFormat, setDateFormatState] = useState<DateFormat>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dateFormat") as DateFormat | null;
      if (saved && ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "locale"].includes(saved)) {
        return saved;
      }
    }
    return "locale"; // Default to locale-aware formatting
  });

  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timeFormat") as TimeFormat | null;
      if (saved && ["12h", "24h", "locale"].includes(saved)) {
        return saved;
      }
    }
    return "locale"; // Default to locale-aware formatting
  });

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
    localStorage.setItem("dateFormat", format);
  };

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem("timeFormat", format);
  };

  // Get the Intl-compatible locale code
  const getIntlLocale = (): string => {
    return localeMap[locale] || "en-US";
  };

  const formatTime = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const intlLocale = getIntlLocale();
    
    if (timeFormat === "locale") {
      // Use locale-default time formatting
      return new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } else if (timeFormat === "24h") {
      return new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } else {
      return new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    }
  };

  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const intlLocale = getIntlLocale();
    
    if (dateFormat === "locale") {
      // Use locale-default date formatting
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
    
    // Manual formatting for explicit format choices
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    switch (dateFormat) {
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const formatDateTime = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const intlLocale = getIntlLocale();
    
    if (dateFormat === "locale" && timeFormat === "locale") {
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
    
    return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
  };

  const formatRelativeTime = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const intlLocale = getIntlLocale();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return formatTime(timestamp);
    } else if (isYesterday) {
      // Use Intl for "Yesterday" in the correct language
      const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });
      return rtf.format(-1, "day");
    } else {
      // For older dates, show abbreviated date using locale
      return new Intl.DateTimeFormat(intlLocale, {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  return (
    <DateFormatContext.Provider
      value={{
        dateFormat,
        timeFormat,
        setDateFormat,
        setTimeFormat,
        formatTime,
        formatDate,
        formatDateTime,
        formatRelativeTime,
        getIntlLocale,
      }}
    >
      {children}
    </DateFormatContext.Provider>
  );
}

export function useDateFormat() {
  const context = useContext(DateFormatContext);
  if (context === undefined) {
    throw new Error("useDateFormat must be used within a DateFormatProvider");
  }
  return context;
}
