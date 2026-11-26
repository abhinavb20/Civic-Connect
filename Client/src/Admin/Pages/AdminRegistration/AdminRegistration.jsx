import React, { useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { api } from "../../../api";
import PageHeader from "../../../ui/PageHeader";
import { useToast } from "../../../ui/Toast";
import styles from "./AdminRegistration.module.css";

const CAPABILITIES = [
  "Manage districts, panchayaths, wards, and departments",
  "Register authority accounts for each panchayath",
  "Review every complaint across jurisdictions",
  "Export filtered complaint reports",
];

const AdminRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter the administrator's name.";
    else if (name.trim().length < 2) nextErrors.name = "Use at least 2 characters.";
    if (!email.trim()) nextErrors.email = "Enter an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (!password.trim()) nextErrors.password = "Create a password.";
    else if (password.length < 6) nextErrors.password = "Use at least 6 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await api.post("/admin", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      toast.success(
        "Administrator created",
        res.data?.msg || `${name.trim()} can now sign in to the admin console.`
      );
      resetForm();
    } catch {
      toast.error("Couldn't create administrator", "Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="System access"
        title="Administrators"
        description="Create platform-level accounts for trusted staff. Administrators can see and change everything — issue them sparingly."
      />

      <div className={styles.layout}>
        <form className={`cc-card ${styles.formCard}`} onSubmit={handleSubmit} noValidate>
          <div className="cc-card-head">
            <div>
              <h3>New administrator</h3>
              <p className={styles.headSub}>
                The account works immediately with the credentials you set.
              </p>
            </div>
            <span className={styles.headIcon}>
              <FiKey />
            </span>
          </div>

          <div className="cc-card-body">
            <div className={styles.fields}>
              <div className="cc-field">
                <label className="cc-label" htmlFor="admin-name">
                  <span>
                    <FiUser /> Full name
                  </span>
                </label>
                <input
                  id="admin-name"
                  className={`cc-input ${errors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Ananya Menon"
                  maxLength={60}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />
                {errors.name && (
                  <span className="cc-error">
                    <FiAlertCircle /> {errors.name}
                  </span>
                )}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="admin-email">
                  <span>
                    <FiMail /> Email address
                  </span>
                </label>
                <input
                  id="admin-email"
                  type="email"
                  className={`cc-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="admin@civicconnect.gov"
                  maxLength={80}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {errors.email && (
                  <span className="cc-error">
                    <FiAlertCircle /> {errors.email}
                  </span>
                )}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="admin-password">
                  <span>
                    <FiLock /> Password
                  </span>
                </label>
                <div className="cc-input-wrap">
                  <FiLock />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    className={`cc-input ${errors.password ? "is-invalid" : ""}`}
                    placeholder="At least 6 characters"
                    maxLength={40}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="cc-input-action"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password ? (
                  <span className="cc-error">
                    <FiAlertCircle /> {errors.password}
                  </span>
                ) : (
                  <span className="cc-hint">
                    Share the password with the administrator through a secure channel.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="cc-card-foot">
            <div className={styles.actions}>
              <button
                type="button"
                className="cc-btn cc-btn--ghost"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </button>
              <button type="submit" className="cc-btn cc-btn--primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  <>
                    <FiKey /> Create administrator
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <aside className={`cc-card cc-card--pad ${styles.aside}`}>
          <span className={styles.asideIcon}>
            <FiShield />
          </span>
          <h3>Platform-level access</h3>
          <p className={styles.asideLead}>
            An administrator account is the highest level of trust in Civic Connect. It can:
          </p>
          <ul className={styles.capabilities}>
            {CAPABILITIES.map((item) => (
              <li key={item}>
                <span className={styles.check}>
                  <FiCheck />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.asideNote}>
            There is no audit trail for admin actions yet. Only create accounts for people you
            trust to change live civic data.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminRegistration;
