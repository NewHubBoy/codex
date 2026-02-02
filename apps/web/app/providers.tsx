"use client";

import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { theme } from "@/theme";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
