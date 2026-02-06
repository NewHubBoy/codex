"use client";

import { Layout } from "antd";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LoadingScene } from "@/components/common/LoadingScene";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const { Content } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, canAccessRoute, defaultRoute } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRouteAccess = canAccessRoute(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasRouteAccess) {
      return;
    }
    if (pathname !== defaultRoute) {
      router.replace(defaultRoute);
    }
  }, [defaultRoute, hasRouteAccess, isAuthenticated, isLoading, pathname, router]);

  const unauthorizedRedirecting = !isLoading && isAuthenticated && !hasRouteAccess;
  const showGate = isLoading || !isAuthenticated || unauthorizedRedirecting;
  const gateMessage = isLoading
    ? "验证登录中"
    : !isAuthenticated
      ? "正在跳转登录"
      : "当前角色无该页面访问权限";
  const gateDetail = isLoading
    ? "正在加载你的工作台"
    : !isAuthenticated
      ? "请稍候"
      : "正在跳转到可访问页面";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showGate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(248, 250, 252, 0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <LoadingScene message={gateMessage} detail={gateDetail} />
        </div>
      )}
      <Sidebar />
      <Layout style={{ marginLeft: 240 }}>
        <Header />
        <Content
          style={{
            margin: 24,
            minHeight: 280,
          }}
        >
          {isAuthenticated && hasRouteAccess ? children : null}
        </Content>
      </Layout>
    </Layout>
  );
}
