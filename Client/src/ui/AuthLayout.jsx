import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiShield } from "react-icons/fi";
import Logo from "./Logo";
import styles from "./AuthLayout.module.css";

const AuthLayout = ({
  image,
  imageAlt = "",
  eyebrow,
  title,
  description,
  bullets = [],
  wide = false,
  children,
}) => (
  <div className={styles.page}>
    <aside className={styles.panel}>
      <img src={image} alt={imageAlt} className={styles.panelImage} />
      <span className={styles.panelOverlay} aria-hidden="true" />
      <span className={styles.panelGrid} aria-hidden="true" />

      <div className={styles.panelContent}>
        <Link to="/" className={styles.panelLogo} aria-label="Civic Connect home">
          <Logo variant="light" />
        </Link>

        <div className={styles.panelCopy}>
          <span className={styles.panelEyebrow}>
            <FiShield /> {eyebrow}
          </span>
          <h1>{title}</h1>
          <p>{description}</p>
          {bullets.length > 0 && (
            <ul className={styles.bullets}>
              {bullets.map((item) => (
                <li key={item}>
                  <span className={styles.bulletIcon}>
                    <FiCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.panelFoot}>
          <span className={styles.liveDot} />
          Secure civic infrastructure · Role-based access
        </div>
      </div>
    </aside>

    <main className={styles.main}>
      <div className={styles.topRow}>
        <Link to="/" className={styles.back}>
          <FiArrowLeft /> Back to website
        </Link>
        <span className={styles.support}>
          Need help? <a href="mailto:support@civicconnect.gov">Contact support</a>
        </span>
      </div>

      <div className={`${styles.formArea} ${wide ? styles.wide : ""}`}>
        <div className={styles.mobileBrand}>
          <Link to="/" aria-label="Civic Connect home">
            <Logo />
          </Link>
        </div>
        {children}
      </div>

      <p className={styles.legal}>
        © {new Date().getFullYear()} Civic Connect · Built for accountable communities
      </p>
    </main>
  </div>
);

export default AuthLayout;
