"use client";

import { ReactNode, useEffect, useState } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { theme } from "@/theme";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider, useI18n } from "@/i18n/provider";
import type { Locale } from "antd/es/locale";

interface ProvidersProps {
  children: ReactNode;
}

function I18nAntdProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [antdLocale, setAntdLocale] = useState<Locale>(zhCN);

  useEffect(() => {
    let active = true;

    const loadLocale = async () => {
      if (locale === "zh-CN") {
        if (active) {
          setAntdLocale(zhCN);
        }
        return;
      }
      const localeModule =
        locale === "en-US"
          ? await import("antd/locale/en_US")
          : locale === "ja-JP"
            ? await import("antd/locale/ja_JP")
            : locale === "ko-KR"
              ? await import("antd/locale/ko_KR")
              : await import("antd/locale/zh_CN");
      if (active) {
        setAntdLocale(localeModule.default);
      }
    };

    loadLocale();

    return () => {
      active = false;
    };
  }, [locale]);
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
