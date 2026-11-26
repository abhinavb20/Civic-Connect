import React, { useEffect, useRef } from "react";
import { FiX, FiZoomIn } from "react-icons/fi";
import styles from "./Lightbox.module.css";

const Lightbox = ({ src, caption, onClose }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.classList.add("no-scroll");
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        ref={closeRef}
        className={styles.close}
        onClick={onClose}
        aria-label="Close image preview"
      >
        <FiX />
      </button>
      <figure className={styles.figure}>
        <img src={src} alt={caption || "Complaint evidence"} className={styles.image} />
        {caption && (
          <figcaption className={styles.caption}>
            <FiZoomIn /> {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
};

export default Lightbox;
