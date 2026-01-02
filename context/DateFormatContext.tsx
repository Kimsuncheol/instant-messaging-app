"use client";

import React, { createContext, useContext, useState } from "react";
import { Timestamp } from "firebase/firestore";

type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
type TimeFormat = "12h" | "24h";

interface DateFormatContextType {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  setDateFormat: (format: DateFormat) => void;
  setTimeFormat: (format: TimeFormat) => void;
  formatTime: (timestamp: Timestamp | null) => string;
  formatDate: (timestamp: Timestamp | null) => string;
  formatDateTime: (timestamp: Timestamp | null) => string;
  formatRelativeTime: (timestamp: Timestamp | null) => string;
}

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

export function DateFormatProvider({ children }: { children: React.ReactNode }) {
  const [dateFormat, setDateFormatState] = useState<DateFormat>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dateFormat") as DateFormat | null;
      if (saved && ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(saved)) {
        return saved;
      }
    }
    return "MM/DD/YYYY";
  });

  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timeFormat") as TimeFormat | null;
      if (saved && ["12h", "24h"].includes(saved)) {
        return saved;
      }
    }
    return "12h";
  });

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
    localStorage.setItem("dateFormat", format);
  };

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem("timeFormat", format);
  };

  const formatTime = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    
    if (timeFormat === "24h") {
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
  };

  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
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
    return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
  };

  const formatRelativeTime = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return formatTime(timestamp);
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      // For older dates, show abbreviated date
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      if (dateFormat === "MM/DD/YYYY") {
        return `${month}/${day}`;
      } else if (dateFormat === "DD/MM/YYYY") {
        return `${day}/${month}`;
      } else {
        return `${month}-${day}`;
      }
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
