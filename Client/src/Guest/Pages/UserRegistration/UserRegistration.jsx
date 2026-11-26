import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCamera,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiImage,
  FiLock,
  FiMail,
  FiMapPin,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";
import { api } from "../../../api";
import AuthLayout from "../../../ui/AuthLayout";
import { useToast } from "../../../ui/Toast";
import styles from "./UserRegistration.module.css";

const REGISTER_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

const emptyErrors = {
  fullName: "",
  email: "",
  password: "",
  contact: "",
  address: "",
  district: "",
  panchayath: "",
  ward: "",
};

const UserRegistration = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [wards, setWards] = useState([]);

  const [districtId, setDistrictId] = useState("");
  const [panchayathId, setPanchayathId] = useState("");
  const [wardId, setWardId] = useState("");

  const [errors, setErrors] = useState(emptyErrors);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [loadingWards, setLoadingWards] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInput = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  useEffect(() => {
    let alive = true;
    api
      .get("/district")
      .then((res) => {
        if (alive) setDistricts(res.data?.districtData || []);
      })
      .catch(() => {
        if (alive) setLocationError("We couldn't load the location list. Refresh to try again.");
      })
      .finally(() => {
        if (alive) setLoadingLocations(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const onDistrictChange = async (value) => {
    setDistrictId(value);
    setPanchayathId("");
    setWardId("");
    setPanchayaths([]);
    setWards([]);
    setErrors((prev) => ({ ...prev, district: "", panchayath: "", ward: "" }));
    if (!value) return;
    try {
      const res = await api.get(`/panchayathByDistrict/${value}`);
      setPanchayaths(res.data?.panchayathData || []);
    } catch {
      setPanchayaths([]);
    }
  };

  const onPanchayathChange = async (value) => {
    setPanchayathId(value);
    setWardId("");
    setWards([]);
    setErrors((prev) => ({ ...prev, panchayath: "", ward: "" }));
    if (!value) return;
    setLoadingWards(true);
    try {
      const res = await api.get(`/wardByPanchayath/${value}`);
      setWards(res.data?.wardData || []);
    } catch {
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (submitting || success) return;

    const nextErrors = { ...emptyErrors };

    if (!fullName.trim()) nextErrors.fullName = "Enter your full name";
    else if (fullName.trim().length < 2) nextErrors.fullName = "Enter at least 2 characters";

    if (!email.trim()) nextErrors.email = "Enter your email address";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      nextErrors.email = "Enter a valid email address";

    if (!password.trim()) nextErrors.password = "Create a password";
    else if (password.length < 6) nextErrors.password = "Use at least 6 characters";

    if (!contact.trim()) nextErrors.contact = "Enter a contact number";
    else if (!/^[0-9+\s-]{10,15}$/.test(contact.trim()))
      nextErrors.contact = "Enter a valid contact number";

    if (!address.trim()) nextErrors.address = "Enter your residential address";
    if (!districtId) nextErrors.district = "Select your district";
    if (!panchayathId) nextErrors.panchayath = "Select your panchayath";
    if (!wardId) nextErrors.ward = "Select your ward";

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      const firstKey = Object.keys(nextErrors).find((key) => nextErrors[key]);
      document.getElementById(`reg-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    setFormError("");

    const fd = new FormData();
    fd.append("wardId", wardId);
    fd.append("fullName", fullName.trim());
    fd.append("contact", contact.trim());
    fd.append("email", email.trim());
    fd.append("password", password);
    fd.append("address", address.trim());
    if (photo) fd.append("photo", photo);

    try {
      await api.post("/userregistration", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      toast.success("Account created", "You can now sign in with your new citizen account.");
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        "Registration failed. That email may already be in use — try signing in instead.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        image={REGISTER_IMAGE}
        imageAlt="Community members working together"
        eyebrow="Citizen registration"
        title="Your voice now has a direct line to your ward."
        description="Report issues with photo evidence, follow official updates, and support the problems your community cares about most."
        bullets={[
          "Ward-mapped account for accurate routing",
          "Photo evidence on every complaint",
          "A permanent history of every report",
        ]}
      >
        <div className={styles.successCard}>
          <span className={styles.successIcon}>
            <FiCheckCircle />
          </span>
          <h2 className={styles.title}>You&apos;re all set, {fullName.split(" ")[0]}.</h2>
          <p className={styles.subtitle}>
            Your citizen account has been created. Sign in to file your first report and
            see updates from your local authority.
          </p>
          <div className={styles.successActions}>
            <button
              type="button"
              className="cc-btn cc-btn--primary cc-btn--lg cc-btn--block"
              onClick={() => navigate("/login")}
            >
              Continue to sign in <FiArrowRight />
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--ghost cc-btn--block"
              onClick={() => {
                setSuccess(false);
                setFormError("");
                setFullName("");
                setEmail("");
                setPassword("");
                setContact("");
                setAddress("");
                setPhoto(null);
                setDistrictId("");
                setPanchayathId("");
                setWardId("");
                setPanchayaths([]);
                setWards([]);
              }}
            >
              Register another account
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      image={REGISTER_IMAGE}
      imageAlt="Community members working together"
      eyebrow="Citizen registration"
      title="Your voice now has a direct line to your ward."
      description="Report issues with photo evidence, follow official updates, and support the problems your community cares about most."
      bullets={[
        "Ward-mapped account for accurate routing",
        "Photo evidence on every complaint",
        "A permanent history of every report",
      ]}
    >
      <div className={styles.head}>
        <span className={styles.eyebrow}>Create an account</span>
        <h2 className={styles.title}>Citizen registration</h2>
        <p className={styles.subtitle}>
          Already registered?{" "}
          <Link to="/login" className={styles.inlineLink}>
            Sign in instead
          </Link>
        </p>
      </div>

      {formError && (
        <div className={styles.alert} role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <fieldset className="cc-fieldset">
          <legend className="cc-fieldset-legend">
            <FiUserCheck /> Personal details
          </legend>

          <div className="cc-form-grid">
            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-fullName">
                Full name
              </label>
              <div className="cc-input-wrap">
                <FiUser />
                <input
                  id="reg-fullName"
                  className={`cc-input ${errors.fullName ? "is-invalid" : ""}`}
                  placeholder="Your full name"
                  value={fullName}
                  maxLength={40}
                  autoComplete="name"
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearError("fullName");
                  }}
                  aria-invalid={Boolean(errors.fullName)}
                />
              </div>
              {errors.fullName && <span className="cc-error">{errors.fullName}</span>}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-contact">
                Contact number
              </label>
              <input
                id="reg-contact"
                className={`cc-input ${errors.contact ? "is-invalid" : ""}`}
                placeholder="+91 90000 00000"
                inputMode="tel"
                value={contact}
                maxLength={15}
                autoComplete="tel"
                onChange={(e) => {
                  setContact(e.target.value);
                  clearError("contact");
                }}
                aria-invalid={Boolean(errors.contact)}
              />
              {errors.contact && <span className="cc-error">{errors.contact}</span>}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-email">
                Email address
              </label>
              <div className="cc-input-wrap">
                <FiMail />
                <input
                  id="reg-email"
                  className={`cc-input ${errors.email ? "is-invalid" : ""}`}
                  type="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  maxLength={60}
                  autoComplete="email"
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
              <label className="cc-label" htmlFor="reg-password">
                Password
              </label>
              <div className="cc-input-wrap">
                <FiLock />
                <input
                  id="reg-password"
                  className={`cc-input ${errors.password ? "is-invalid" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  maxLength={30}
                  autoComplete="new-password"
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
              {errors.password ? (
                <span className="cc-error">{errors.password}</span>
              ) : (
                <span className="cc-hint">Use a mix of letters and numbers.</span>
              )}
            </div>

            <div className="cc-field cc-col-span-2">
              <label className="cc-label" htmlFor="reg-address">
                Residential address
              </label>
              <textarea
                id="reg-address"
                className={`cc-textarea ${errors.address ? "is-invalid" : ""}`}
                placeholder="House name, street, landmark, and post office"
                value={address}
                rows={3}
                maxLength={220}
                autoComplete="street-address"
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearError("address");
                }}
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address && <span className="cc-error">{errors.address}</span>}
            </div>
          </div>
        </fieldset>

        <fieldset className="cc-fieldset">
          <legend className="cc-fieldset-legend">
            <FiMapPin /> Your location
          </legend>
          <p className={styles.sectionHint}>
            Your ward decides which local authority receives your reports, so choose
            carefully.
          </p>

          {locationError && (
            <div className={`cc-note cc-note--amber ${styles.locationNote}`}>
              {locationError}
            </div>
          )}

          <div className="cc-form-grid cc-form-grid--3">
            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-district">
                District
              </label>
              <select
                id="reg-district"
                className={`cc-select ${errors.district ? "is-invalid" : ""}`}
                value={districtId}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={loadingLocations}
                aria-invalid={Boolean(errors.district)}
              >
                <option value="">
                  {loadingLocations ? "Loading districts…" : "Select district"}
                </option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.districtName}
                  </option>
                ))}
              </select>
              {errors.district && <span className="cc-error">{errors.district}</span>}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-panchayath">
                Panchayath
              </label>
              <select
                id="reg-panchayath"
                className={`cc-select ${errors.panchayath ? "is-invalid" : ""}`}
                value={panchayathId}
                onChange={(e) => onPanchayathChange(e.target.value)}
                disabled={!districtId}
                aria-invalid={Boolean(errors.panchayath)}
              >
                <option value="">
                  {districtId ? "Select panchayath" : "Select a district first"}
                </option>
                {panchayaths.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.panchayathName}
                  </option>
                ))}
              </select>
              {errors.panchayath && <span className="cc-error">{errors.panchayath}</span>}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="reg-ward">
                Ward
              </label>
              <select
                id="reg-ward"
                className={`cc-select ${errors.ward ? "is-invalid" : ""}`}
                value={wardId}
                onChange={(e) => {
                  setWardId(e.target.value);
                  clearError("ward");
                }}
                disabled={!panchayathId || loadingWards}
                aria-invalid={Boolean(errors.ward)}
              >
                <option value="">
                  {!panchayathId
                    ? "Select a panchayath first"
                    : loadingWards
                      ? "Loading wards…"
                      : "Select ward"}
                </option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName}
                    {w.wardNumber ? ` (Ward ${w.wardNumber})` : ""}
                  </option>
                ))}
              </select>
              {errors.ward && <span className="cc-error">{errors.ward}</span>}
            </div>
          </div>
        </fieldset>

        <fieldset className="cc-fieldset">
          <legend className="cc-fieldset-legend">
            <FiCamera /> Profile photo <span className={styles.optional}>(optional)</span>
          </legend>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="cc-sr-only"
            id="reg-photo"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />

          <label htmlFor="reg-photo" className="cc-file">
            <span className="cc-file-icon">
              {preview ? <img src={preview} alt="" className={styles.preview} /> : <FiImage />}
            </span>
            <span>
              <strong>{photo ? photo.name : "Upload a profile photo"}</strong>
              <span>{photo ? "Click to choose a different image" : "JPG or PNG, up to a few MB"}</span>
            </span>
          </label>
          {photo && (
            <button
              type="button"
              className={`cc-btn cc-btn--ghost cc-btn--sm ${styles.removePhoto}`}
              onClick={() => {
                setPhoto(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Remove photo
            </button>
          )}
        </fieldset>

        <div className={styles.submitRow}>
          <button
            type="submit"
            className="cc-btn cc-btn--primary cc-btn--lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Creating account…
              </>
            ) : (
              <>
                Create citizen account <FiArrowRight />
              </>
            )}
          </button>
          <p className={styles.legal}>
            By creating an account you agree to use Civic Connect responsibly and provide
            accurate information.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default UserRegistration;
