import React from "react";
import styles from "./PageLoader.module.css";

const PageLoader = ({ label = "Loading workspace", rows = 3 }) => (
  <div className={styles.wrap} aria-busy="true" aria-live="polite">
    <div className={styles.spinner}>
      <span />
    </div>
    <p className={styles.label}>{label}</p>
    <div className={styles.skeletonGrid}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`cc-skeleton ${styles.card}`} />
      ))}
    </div>
  </div>
);

export default PageLoader;
