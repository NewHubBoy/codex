import { Injectable } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_LOCALE, normalizeLocale, type SupportedLocale } from "./locale";

type Messages = Record<string, string>;

type TemplateParams = Record<string, string | number | boolean | null | undefined>;

function resolveLocalesPath() {
  const candidates = [
    path.resolve(process.cwd(), "locales"),
    path.resolve(process.cwd(), "apps/api/locales"),
    path.resolve(__dirname, "../../../locales")
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "zh-CN.json"))) {
      return candidate;
    }
  }
  return candidates[0];
}

function applyParams(template: string, params?: TemplateParams) {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (params[key] === undefined || params[key] === null) {
      return match;
    }
    return String(params[key]);
  });
}

@Injectable()
export class I18nService {
  private readonly localesPath = resolveLocalesPath();
  private readonly cache = new Map<SupportedLocale, Messages>();

  t(locale: string | null | undefined, key: string, params?: TemplateParams) {
    const normalized = normalizeLocale(locale ?? undefined);
    const messages = this.getMessages(normalized);
    const fallbackMessages = normalized === DEFAULT_LOCALE ? messages : this.getMessages(DEFAULT_LOCALE);
    const template = messages[key] ?? fallbackMessages[key] ?? key;
    return applyParams(template, params);
  }

  private getMessages(locale: SupportedLocale) {
    const cached = this.cache.get(locale);
    if (cached) {
      return cached;
    }
    const filePath = path.join(this.localesPath, `${locale}.json`);
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as Messages;
      this.cache.set(locale, parsed);
      return parsed;
    } catch {
      const empty: Messages = {};
      this.cache.set(locale, empty);
      return empty;
    }
  }
}
