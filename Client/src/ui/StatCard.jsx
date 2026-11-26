import React from "react";
import CountUp from "./CountUp";
import styles from "./StatCard.module.css";

const StatCard = ({
  icon: Icon,
  label,
  value,
  suffix = "",
  decimals = 0,
  hint,
  tone = "brand",
  loading = false,
  footer,
  animate = true,
}) => {
  const numeric = typeof value === "number" && Number.isFinite(value);

  return (
    <article className={`${styles.card} ${styles[tone]}`}>
      <div className={styles.top}>
        <div className={styles.icon}>
          {Icon ? <Icon /> : null}
        </div>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {loading ? (
          <span className="cc-skeleton cc-skeleton--title" style={{ width: 74, display: "inline-block" }} />
        ) : numeric && animate ? (
          <CountUp value={value} decimals={decimals} suffix={suffix} />
        ) : (
          <>
            {value}
            {suffix}
          </>
        )}
      </p>
      {footer && <div className={styles.footer}>{footer}</div>}
      <span className={styles.glow} aria-hidden="true" />
    </article>
  );
};

export default StatCard;
