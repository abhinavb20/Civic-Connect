import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCompass, FiHome } from "react-icons/fi";
import Logo from "../ui/Logo";
import styles from "./NotFound.module.css";

const NotFound = () => (
  <div className={styles.page}>
    <div className={styles.grid} aria-hidden="true" />
    <header className={styles.head}>
      <Link to="/" aria-label="Civic Connect home">
        <Logo variant="light" />
      </Link>
    </header>

    <main className={styles.main}>
      <span className={styles.code}>404</span>
      <span className={styles.eyebrow}>
        <FiCompass /> Page not found
      </span>
      <h1 className={styles.title}>This street doesn&apos;t exist yet.</h1>
      <p className={styles.text}>
        The page you are looking for may have moved, been renamed, or never existed.
        Let&apos;s get you back to a working part of the city.
      </p>
      <div className={styles.actions}>
        <Link to="/" className="cc-btn cc-btn--primary cc-btn--lg">
          <FiHome /> Back to home
        </Link>
        <Link to="/login" className={`cc-btn cc-btn--secondary cc-btn--lg ${styles.secondary}`}>
          <FiArrowLeft /> Sign in instead
        </Link>
      </div>
      <nav className={styles.links} aria-label="Helpful links">
        <Link to="/userregistration">Create an account</Link>
        <span aria-hidden="true">•</span>
        <Link to="/user/">Citizen portal</Link>
        <span aria-hidden="true">•</span>
        <Link to="/authority/">Authority portal</Link>
      </nav>
    </main>

    <footer className={styles.foot}>
      <span>© {new Date().getFullYear()} Civic Connect</span>
      <span>Built for accountable communities</span>
    </footer>
  </div>
);

export default NotFound;
