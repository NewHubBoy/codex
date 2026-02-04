import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "./i18n.service";

type ErrorParams = Record<string, string | number | boolean | null | undefined>;

function buildPayload(
  i18n: I18nService,
  locale: string,
  code: string,
  i18nKey: string,
  params?: ErrorParams
) {
  return {
    code,
    i18nKey,
    message: i18n.t(locale, i18nKey, params),
    params
  };
}

export function badRequest(
  i18n: I18nService,
  locale: string,
  code: string,
  i18nKey: string,
  params?: ErrorParams
) {
  return new BadRequestException(buildPayload(i18n, locale, code, i18nKey, params));
}

export function notFound(
  i18n: I18nService,
  locale: string,
  code: string,
  i18nKey: string,
  params?: ErrorParams
) {
  return new NotFoundException(buildPayload(i18n, locale, code, i18nKey, params));
}

export type TransitionErrorFactory = (params: {
  entity: string;
  from: string;
  to: string;
}) => Error;
