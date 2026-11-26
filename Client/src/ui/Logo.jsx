import React from "react";
import styles from "./Logo.module.css";

const Logo = ({ variant = "dark", size = "md", className = "", markOnly = false }) => {
  return (
    <span
      className={`${styles.logo} ${styles[variant]} ${styles[size]} ${className}`}
      aria-label="Civic Connect"
    >
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="url(#cc-logo-grad)" />
          <circle cx="20" cy="20" r="9.7" stroke="white" strokeWidth="2.3" opacity="0.95" />
          <path
            d="M15.4 20.2l3 3 6.2-6.4"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="30.5" cy="9.5" r="2.6" fill="#4ee0cd" />
          <defs>
            <linearGradient id="cc-logo-grad" x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#1F5EFF" />
              <stop offset="1" stopColor="#0B9E90" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {!markOnly && (
        <span className={styles.text}>
          Civic<span className={styles.textAccent}>Connect</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
