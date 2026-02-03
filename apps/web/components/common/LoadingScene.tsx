"use client";

import React from "react";
import styles from "./LoadingScene.module.css";

interface LoadingSceneProps {
  fullHeight?: boolean;
  message?: string;
  detail?: string;
}

export function LoadingScene({
  fullHeight = false,
  message = "加载中",
  detail = "正在同步最新数据",
}: LoadingSceneProps) {
  return (
    <div
      className={`${styles.shell}${fullHeight ? ` ${styles.shellFull}` : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.card}>
        <div className={styles.orbit}>
          <div className={`${styles.ring} ${styles.ringPrimary}`} />
          <div className={`${styles.ring} ${styles.ringSecondary}`} />
          <div className={styles.core} />
          <span className={`${styles.dot} ${styles.dotA}`} />
          <span className={`${styles.dot} ${styles.dotB}`} />
          <span className={`${styles.dot} ${styles.dotC}`} />
        </div>
        <div className={styles.text}>{message}</div>
        <div className={styles.sub}>{detail}</div>
        <div className={styles.bar}>
          <span className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
