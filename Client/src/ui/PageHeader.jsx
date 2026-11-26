import React from "react";
import styles from "./PageHeader.module.css";

const PageHeader = ({ eyebrow, title, description, actions, meta, children }) => (
  <header className={styles.header}>
    <div className={styles.text}>
      {eyebrow && <span className="cc-eyebrow">{eyebrow}</span>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {meta && <div className={styles.meta}>{meta}</div>}
      {children}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
);

export default PageHeader;
