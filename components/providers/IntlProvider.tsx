"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { useLocale } from "@/context/LocaleContext";
import enMessages from "@/messages/en.json";
import koMessages from "@/messages/ko.json";
import esMessages from "@/messages/es.json";
import frMessages from "@/messages/fr.json";
import zhMessages from "@/messages/zh.json";
import jaMessages from "@/messages/ja.json";
import hiMessages from "@/messages/hi.json";
import deMessages from "@/messages/de.json";
import itMessages from "@/messages/it.json";
import ruMessages from "@/messages/ru.json";

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  
  const getMessages = () => {
    switch (locale) {
      case "ko": return koMessages;
      case "es": return esMessages;
      case "fr": return frMessages;
      case "zh": return zhMessages;
      case "ja": return jaMessages;
      case "hi": return hiMessages;
      case "de": return deMessages;
      case "it": return itMessages;
      case "ru": return ruMessages;
      default: return enMessages;
    }
  };
  
  const messages = getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
