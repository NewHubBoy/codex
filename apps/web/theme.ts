"use client";

import { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    // 品牌色
    colorPrimary: "#1677ff",
    colorPrimaryHover: "#4096ff",
    colorPrimaryActive: "#0958d9",
    colorPrimaryBg: "#e6f4ff",

    // 成功/警告/错误色
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",

    // 文字色
    colorText: "rgba(0, 0, 0, 0.85)",
    colorTextSecondary: "rgba(0, 0, 0, 0.45)",
    colorTextTertiary: "rgba(0, 0, 0, 0.25)",
    colorTextDisabled: "rgba(0, 0, 0, 0.25)",

    // 边框和背景
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#f0f0f0",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f5f5",

    // 圆角
    borderRadius: 6,

    // 字号
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,

    // 动画
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",
  },
  components: {
    Layout: {
      siderBg: "#001529",
      headerBg: "#ffffff",
      headerPadding: "0 24px",
    },
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
      darkItemSelectedBg: "#1677ff",
      darkItemSelectedColor: "#ffffff",
    },
    Table: {
      headerBg: "#fafafa",
      rowHoverBg: "#f5f5f5",
      borderColor: "#f0f0f0",
    },
    Card: {
      headerBg: "#fafafa",
      paddingLG: 24,
    },
    Form: {
      labelColor: "rgba(0, 0, 0, 0.85)",
      verticalLabelPadding: "0 0 8px",
    },
    Input: {
      activeBorderColor: "#1677ff",
      hoverBorderColor: "#4096ff",
    },
    Select: {
      optionSelectedBg: "#e6f4ff",
    },
    Button: {
      primaryShadow: "0 2px 4px rgba(22, 119, 255, 0.3)",
      defaultShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    Modal: {
      headerBg: "#fafafa",
      contentBg: "#ffffff",
    },
    Tabs: {
      inkBarColor: "#1677ff",
      itemSelectedColor: "#1677ff",
      itemHoverColor: "#4096ff",
    },
    Tag: {
      defaultBg: "#f5f5f5",
    },
    Breadcrumb: {
      separatorMargin: 8,
    },
  },
};
