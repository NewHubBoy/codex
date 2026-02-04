export const SUPPORTED_LOCALES = ["zh-CN", "en-US", "ja-JP", "ko-KR"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "zh-CN";

export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) {
    return DEFAULT_LOCALE;
  }
  const token = input.split(",")[0]?.trim();
  if (!token) {
    return DEFAULT_LOCALE;
  }
  const lower = token.toLowerCase();
  if (lower.startsWith("zh")) {
    return "zh-CN";
  }
  if (lower.startsWith("en")) {
    return "en-US";
  }
  if (lower.startsWith("ja")) {
    return "ja-JP";
  }
  if (lower.startsWith("ko")) {
    return "ko-KR";
  }
  const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === lower);
  return exact ?? DEFAULT_LOCALE;
}
