'use client';

import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export default function MessageProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <App
        message={{
          maxCount: 3,
          duration: 2,
          top: 64,
        }}
      >
        {children}
      </App>
    </ConfigProvider>
  );
}
