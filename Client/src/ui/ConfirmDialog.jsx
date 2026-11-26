/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiHelpCircle } from "react-icons/fi";
import styles from "./ConfirmDialog.module.css";

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolver = useRef(null);
  const confirmRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        tone: "danger",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        ...options,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setState(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  }, []);

  useEffect(() => {
    if (!state) return;
    const previous = document.activeElement;
    document.body.classList.add("no-scroll");
    const id = window.setTimeout(() => confirmRef.current?.focus(), 40);

    const onKey = (e) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Tab" && confirmRef.current) {
        e.preventDefault();
        confirmRef.current.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.classList.remove("no-scroll");
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [state, close]);

  const Icon = state?.tone === "danger" ? FiAlertTriangle : FiHelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(false);
          }}
        >
          <div
            className="cc-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cc-confirm-title"
            aria-describedby="cc-confirm-desc"
          >
            <div className="cc-modal-head">
              <span className={`${styles.icon} ${styles[state.tone] || ""}`}>
                <Icon />
              </span>
              <div>
                <h3 id="cc-confirm-title" className="cc-h3">
                  {state.title || "Are you sure?"}
                </h3>
                {state.message && (
                  <p id="cc-confirm-desc" className={styles.message}>
                    {state.message}
                  </p>
                )}
              </div>
            </div>
            <div className="cc-modal-actions">
              <button
                type="button"
                className="cc-btn cc-btn--secondary"
                onClick={() => close(false)}
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                ref={confirmRef}
                className={`cc-btn ${
                  state.tone === "danger" ? "cc-btn--danger-solid" : "cc-btn--primary"
                }`}
                onClick={() => close(true)}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
};
