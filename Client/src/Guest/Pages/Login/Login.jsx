import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { api } from "../../../api";
import AuthLayout from "../../../ui/AuthLayout";
import { useToast } from "../../../ui/Toast";
import styles from "./Login.module.css";

const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80";

const ROLE_DESTINATIONS = {
  admin: { path: "/admin/", idKey: "adminId", nameKey: "adminName", label: "Admin console" },
  user: { path: "/user/", idKey: "userId", nameKey: "userName", label: "Citizen portal" },
  authority: {
    path: "/authority/",
    idKey: "authorityId",
    nameKey: "authorityName",
    label: "Authority portal",
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const clearError = (field) => {
    setFormError("");
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const handleLogin = async (event) => {
    event?.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email address";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (!password.trim()) nextErrors.password = "Enter your password";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError("");

    try {
      const res = await api.post("/login", { email: email.trim(), password });
      const { role, id, name, msg } = res.data || {};
      const destination = ROLE_DESTINATIONS[role];

      if (!destination || !id) {
        setFormError("We couldn't determine your account type. Please contact support.");
        return;
      }

      Object.keys(ROLE_DESTINATIONS).forEach((key) => {
        const info = ROLE_DESTINATIONS[key];
        sessionStorage.removeItem(info.idKey);
        sessionStorage.removeItem(info.nameKey);
      });

      sessionStorage.setItem(destination.idKey, id);
      sessionStorage.setItem(destination.nameKey, name || destination.label);
      toast.success(msg || "Signed in", `Welcome to the ${destination.label.toLowerCase()}.`);
      navigate(destination.path, { replace: true });
    } catch (err) {
      setFormError(
        err.response?.data?.msg ||
          "We couldn't sign you in. Check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      image={LOGIN_IMAGE}
      imageAlt="Local government officials collaborating in a meeting"
      eyebrow="Welcome back"
      title="Sign in to the portal that serves your community."
      description="One secure sign-in for citizens, local authorities, and administrators. Your account decides which workspace you see."
      bullets={[
        "Real-time complaint status and official updates",
        "Role-scoped access to the right jurisdiction",
        "Photo evidence attached to every report",
      ]}
    >
      <div className={styles.head}>
        <span className={styles.eyebrow}>Sign in</span>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>
          New to Civic Connect?{" "}
          <Link to="/userregistration" className={styles.inlineLink}>
            Create a citizen account
          </Link>
        </p>
      </div>

      {formError && (
        <div className={styles.alert} role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleLogin} noValidate className={styles.form}>
        <div className="cc-field">
          <label className="cc-label" htmlFor="login-email">
            Email address
          </label>
          <div className="cc-input-wrap">
            <FiMail />
            <input
              id="login-email"
              className={`cc-input ${errors.email ? "is-invalid" : ""}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              maxLength={60}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email && <span className="cc-error">{errors.email}</span>}
        </div>

        <div className="cc-field">
          <label className="cc-label" htmlFor="login-password">
            Password
          </label>
          <div className="cc-input-wrap">
            <FiLock />
            <input
              id="login-password"
              className={`cc-input ${errors.password ? "is-invalid" : ""}`}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              minLength={6}
              maxLength={30}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="cc-input-action"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="cc-error">{errors.password}</span>}
        </div>

        <button
          type="submit"
          className="cc-btn cc-btn--primary cc-btn--lg cc-btn--block"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in <FiArrowRight />
            </>
          )}
        </button>
      </form>

      <div className={styles.roles}>
        <p className={styles.rolesTitle}>One login, three workspaces</p>
        <ul className={styles.roleList}>
          <li>
            <strong>Citizens</strong> file and track reports
          </li>
          <li>
            <strong>Authorities</strong> resolve ward complaints
          </li>
          <li>
            <strong>Admins</strong> manage the platform
          </li>
        </ul>
      </div>

      <p className={styles.note}>
        Accounts are provisioned by your local body. Citizens can self-register with
        their ward details.
      </p>
    </AuthLayout>
  );
};

export default Login;
