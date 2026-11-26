import React, { useMemo, useState } from "react";
import { FiCheck, FiEye, FiEyeOff, FiLock, FiShield, FiX } from "react-icons/fi";
import { api } from "../../../api";
import PageHeader from "../../../ui/PageHeader";
import { useToast } from "../../../ui/Toast";
import styles from "./ChangePassword.module.css";

const RULES = [
  { label: "At least 6 characters", test: (v) => v.length >= 6 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
];

const ChangePassword = () => {
  const uid = sessionStorage.getItem("userId");
  const toast = useToast();

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [show, setShow] = useState({ old: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const checks = useMemo(() => RULES.map((r) => ({ ...r, ok: r.test(newPwd) })), [newPwd]);
  const strength = checks.filter((c) => c.ok).length;

  const handleChange = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!oldPwd.trim()) nextErrors.oldPwd = "Enter your current password";
    if (!newPwd.trim()) nextErrors.newPwd = "Create a new password";
    else if (strength < 4) nextErrors.newPwd = "Meet all four password requirements";
    else if (newPwd === oldPwd) nextErrors.newPwd = "Choose a password different from the current one";
    if (newPwd !== confPwd) nextErrors.confPwd = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await api.put(`/userPassword/${uid}`, {
        oldPassword: oldPwd,
        newPassword: newPwd,
      });
      toast.success("Password updated", res.data?.message || "Your account is now more secure.");
      setOldPwd("");
      setNewPwd("");
      setConfPwd("");
      setErrors({});
    } catch (err) {
      const message = err.response?.data?.message || "We couldn't update your password.";
      toast.error("Update failed", message);
      if (/old password/i.test(message)) {
        setErrors((prev) => ({ ...prev, oldPwd: message }));
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Account security"
        title="Protect your account."
        description="Choose a strong password you don't use anywhere else. You'll use it the next time you sign in."
      />

      <div className={styles.layout}>
        <form className={`cc-card ${styles.formCard}`} onSubmit={handleChange} noValidate>
          <div className="cc-card-head">
            <div>
              <h3>Change password</h3>
              <p className={styles.headSub}>Confirm your current password first.</p>
            </div>
            <span className={styles.shield}>
              <FiShield />
            </span>
          </div>

          <div className="cc-card-body">
            <div className={styles.fields}>
              <div className="cc-field">
                <label className="cc-label" htmlFor="current-password">
                  Current password
                </label>
                <div className="cc-input-wrap">
                  <FiLock />
                  <input
                    id="current-password"
                    className={`cc-input ${errors.oldPwd ? "is-invalid" : ""}`}
                    type={show.old ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={oldPwd}
                    maxLength={40}
                    onChange={(e) => {
                      setOldPwd(e.target.value);
                      setErrors((p) => ({ ...p, oldPwd: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="cc-input-action"
                    onClick={() => toggle("old")}
                    aria-label={show.old ? "Hide password" : "Show password"}
                  >
                    {show.old ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.oldPwd && <span className="cc-error">{errors.oldPwd}</span>}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="new-password">
                  New password
                </label>
                <div className="cc-input-wrap">
                  <FiLock />
                  <input
                    id="new-password"
                    className={`cc-input ${errors.newPwd ? "is-invalid" : ""}`}
                    type={show.next ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={newPwd}
                    maxLength={40}
                    onChange={(e) => {
                      setNewPwd(e.target.value);
                      setErrors((p) => ({ ...p, newPwd: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="cc-input-action"
                    onClick={() => toggle("next")}
                    aria-label={show.next ? "Hide password" : "Show password"}
                  >
                    {show.next ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.newPwd && <span className="cc-error">{errors.newPwd}</span>}
              </div>

              <div className={styles.strength}>
                <div className={styles.strengthBars}>
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={i < strength ? styles[`level${strength}`] : ""}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel}>
                  {strength === 0
                    ? "Password strength"
                    : strength < 3
                      ? "Weak"
                      : strength === 3
                        ? "Good"
                        : "Strong"}
                </span>
              </div>

              <ul className={styles.rules}>
                {checks.map((rule) => (
                  <li key={rule.label} className={rule.ok ? styles.ruleOk : ""}>
                    {rule.ok ? <FiCheck /> : <FiX />} {rule.label}
                  </li>
                ))}
              </ul>

              <div className="cc-field">
                <label className="cc-label" htmlFor="confirm-password">
                  Confirm new password
                </label>
                <div className="cc-input-wrap">
                  <FiLock />
                  <input
                    id="confirm-password"
                    className={`cc-input ${errors.confPwd ? "is-invalid" : ""}`}
                    type={show.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confPwd}
                    maxLength={40}
                    onChange={(e) => {
                      setConfPwd(e.target.value);
                      setErrors((p) => ({ ...p, confPwd: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="cc-input-action"
                    onClick={() => toggle("confirm")}
                    aria-label={show.confirm ? "Hide password" : "Show password"}
                  >
                    {show.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confPwd && <span className="cc-error">{errors.confPwd}</span>}
              </div>
            </div>
          </div>

          <div className="cc-card-foot">
            <button type="submit" className="cc-btn cc-btn--primary" disabled={saving}>
              {saving ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" /> Updating…
                </>
              ) : (
                <>
                  <FiLock /> Update password
                </>
              )}
            </button>
          </div>
        </form>

        <aside className={`cc-card cc-card--pad ${styles.tipsCard}`}>
          <span className={styles.tipsIcon}>
            <FiShield />
          </span>
          <h3>Security tips</h3>
          <ul className={styles.tips}>
            <li>Use a unique password that you don't use on other websites.</li>
            <li>Avoid personal details like your name, birthday, or phone number.</li>
            <li>Never share your password with anyone, including officials.</li>
            <li>Sign out when using a shared or public device.</li>
          </ul>
          <div className={styles.tipsNote}>
            Your aadhaar or ID details are never stored in Civic Connect.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChangePassword;
