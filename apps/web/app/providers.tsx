"use client";

import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import zhCN from "antd/locale/zh_CN";
import { theme } from "@/theme";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider, useI18n } from "@/i18n/provider";

interface ProvidersProps {
  children: ReactNode;
}

function I18nAntdProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const antdLocale =
    locale === "en-US"
      ? enUS
      : locale === "ja-JP"
        ? jaJP
        : locale === "ko-KR"
          ? koKR
          : zhCN;
  return (
    <ConfigProvider theme={theme} locale={antdLocale}>
      <App
        message={{
          maxCount: 3,
          duration: 2,
          top: 64
        }}
      >
        {children}
      </App>
    </ConfigProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AntdRegistry>
      <I18nProvider>
        <I18nAntdProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </I18nAntdProvider>
      </I18nProvider>
    </AntdRegistry>
  );
}
