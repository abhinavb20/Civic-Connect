import React from "react";
import styles from "./BootScreen.module.css";
import Logo from "./Logo";

const BootScreen = ({ closing }) => (
  <div className={`${styles.boot} ${closing ? styles.closing : ""}`} aria-hidden="true">
    <div className={styles.glow} />
    <div className={styles.inner}>
      <div className={styles.markWrap}>
        <Logo variant="light" size="lg" markOnly />
      </div>
      <div className={styles.wordmark}>
        Civic<span>Connect</span>
      </div>
      <p className={styles.tagline}>Civic reporting, made accountable.</p>
      <div className={styles.bar}>
        <span />
      </div>
    </div>
    <p className={styles.foot}>Secure civic infrastructure</p>
  </div>
);

export default BootScreen;
