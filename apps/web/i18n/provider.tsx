"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, normalizeLocale, resolveLocale, type SupportedLocale } from "./locale";
import zhCN from "@/locales/zh-CN.json";
import enUS from "@/locales/en-US.json";
import jaJP from "@/locales/ja-JP.json";
import koKR from "@/locales/ko-KR.json";

export type I18nMessages = Record<string, string>;

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number | boolean | null | undefined>) => string;
};

const MESSAGES: Record<SupportedLocale, I18nMessages> = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "ja-JP": jaJP,
  "ko-KR": koKR
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyParams(template: string, params?: Record<string, string | number | boolean | null | undefined>) {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = resolveLocale();
    setLocaleState(initial);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    const normalized = normalizeLocale(next);
    setLocaleState(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", normalized);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = normalized;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number | boolean | null | undefined>) => {
      const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
      const fallback = MESSAGES[DEFAULT_LOCALE];
      const template = messages[key] ?? fallback[key] ?? key;
      if (process.env.NODE_ENV !== "production" && template === key) {
        // eslint-disable-next-line no-console
        console.warn(`Missing i18n key: ${key}`);
      }
      return applyParams(template, params);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
