import type { AxiosError } from "axios";

type ErrorMessage = { message?: string; i18nKey?: string; code?: string; params?: Record<string, unknown> }

type ErrorPayload = {
  message?: string | ErrorMessage| string[];
  code?: string;
  i18nKey?: string;
  params?: Record<string, unknown>;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }
  const axiosError = error as AxiosError<ErrorPayload>;
  const dataMessage = axiosError.response?.data?.message;
  if (typeof dataMessage === "string" && dataMessage.trim()) {
    return dataMessage;
  }
  if (Array.isArray(dataMessage) && dataMessage.length) {
    return dataMessage.join(", ");
  }
  if (dataMessage && typeof dataMessage === "object") {
    const nested = (dataMessage as ErrorMessage).message;
    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }
  }
  if (typeof axiosError.message === "string" && axiosError.message.trim()) {
    return axiosError.message;
  }
  return fallback;
}
