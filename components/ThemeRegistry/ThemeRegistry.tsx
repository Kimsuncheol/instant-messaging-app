"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
