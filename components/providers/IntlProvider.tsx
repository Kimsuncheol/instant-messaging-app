"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLocale } from "@/context/LocaleContext";
import enMessages from "@/messages/en.json";
import koMessages from "@/messages/ko.json";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const messages = locale === "ko" ? koMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
