import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { api } from "../../../api";
import Avatar from "../../../ui/Avatar";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import { useConfirm } from "../../../ui/ConfirmDialog";
import { useToast } from "../../../ui/Toast";
import styles from "./Authority.module.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  contact: "",
};

const AuthorityRegistration = () => {
  const [form, setForm] = useState(initialForm);
  const [districtId, setDistrictId] = useState("");
  const [panchayathId, setPanchayathId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadAuthorities = useCallback(async () => {
    try {
      const res = await api.get("/authority");
      setAuthorities(res.data?.authorityData || []);
    } catch {
      toast.error("Couldn't load authorities", "Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadDistricts = useCallback(async () => {
    try {
      const res = await api.get("/district");
      setDistricts(res.data?.districtData || []);
    } catch {
      toast.error("Couldn't load districts", "Please refresh the page and try again.");
    }
  }, [toast]);

  useEffect(() => {
    loadDistricts();
    loadAuthorities();
  }, [loadDistricts, loadAuthorities]);

  const fetchPanchayaths = async (dId) => {
    setDistrictId(dId);
    setPanchayathId("");
    setErrors((prev) => ({ ...prev, district: "", panchayath: "" }));
    if (!dId) {
      setPanchayaths([]);
      return;
    }
    try {
      const res = await api.get(`/panchayathByDistrict/${dId}`);
      setPanchayaths(res.data?.panchayathData || []);
    } catch {
      setPanchayaths([]);
      toast.error("Couldn't load panchayaths", "Please choose the district again.");
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setDistrictId("");
    setPanchayathId("");
    setPanchayaths([]);
    setErrors({});
    setShowPassword(false);
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!districtId) nextErrors.district = "Choose a district.";
    if (!panchayathId) nextErrors.panchayath = "Choose a panchayath.";
    if (!form.name.trim()) nextErrors.name = "Enter the authority's full name.";
    if (!form.email.trim()) nextErrors.email = "Enter an official email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (!form.password.trim()) nextErrors.password = "Create a sign-in password.";
    else if (form.password.length < 6) nextErrors.password = "Use at least 6 characters.";
    if (!form.contact.trim()) nextErrors.contact = "Enter a contact number.";
    else if (!/^[0-9+\s-]{10,15}$/.test(form.contact.trim()))
      nextErrors.contact = "Enter a valid contact number.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.post("/authority", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        contact: form.contact.trim(),
        panchayathId,
      });
      toast.success(
        "Authority created",
        `${form.name.trim()} can now sign in and manage complaints for this panchayath.`
      );
      resetForm();
      await loadAuthorities();
    } catch {
      toast.error("Couldn't create authority", "Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Revoke access for ${item.authorityName}?`,
      message:
        "This permanently deletes the authority account. Their panchayath will be left without an officer until a new authority is registered.",
      confirmLabel: "Revoke access",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/authority/${item._id}`);
      setAuthorities((prev) => prev.filter((a) => a._id !== item._id));
      toast.success("Access revoked", `${item.authorityName} has been removed.`);
    } catch {
      toast.error("Couldn't revoke access", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return authorities;
    return authorities.filter(
      (a) =>
        a.authorityName?.toLowerCase().includes(q) ||
        a.authorityEmail?.toLowerCase().includes(q) ||
        a.authorityContact?.toLowerCase().includes(q) ||
        a.panchayathId?.panchayathName?.toLowerCase().includes(q)
    );
  }, [authorities, query]);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Access & governance"
        title="Authorities"
        description="Issue panchayath-level officer accounts. Each authority sees only the complaints raised inside their own panchayath."
        meta={
          <span className="cc-badge cc-badge--violet">
            {authorities.length} authority {authorities.length === 1 ? "account" : "accounts"}
          </span>
        }
      />

      <div className={styles.layout}>
        <section className={`cc-card ${styles.formCard}`}>
          <div className="cc-card-head">
            <div>
              <h3>Register an authority</h3>
              <p className={styles.headSub}>
                Assign one officer to a panchayath. They'll handle its complaint queue.
              </p>
            </div>
            <span className={styles.headIcon}>
              <FiShield />
            </span>
          </div>

          <form className="cc-card-body" onSubmit={handleSave} noValidate>
            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-district">
                <span>
                  <FiMapPin /> District
                </span>
              </label>
              <select
                id="authority-district"
                className={`cc-select ${errors.district ? "is-invalid" : ""}`}
                value={districtId}
                onChange={(e) => fetchPanchayaths(e.target.value)}
              >
                <option value="">Choose a district</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.districtName}
                  </option>
                ))}
              </select>
              {errors.district && (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.district}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-panchayath">
                <span>
                  <FiHome /> Panchayath
                </span>
              </label>
              <select
                id="authority-panchayath"
                className={`cc-select ${errors.panchayath ? "is-invalid" : ""}`}
                value={panchayathId}
                onChange={(e) => {
                  setPanchayathId(e.target.value);
                  setErrors((prev) => ({ ...prev, panchayath: "" }));
                }}
                disabled={!districtId}
              >
                <option value="">
                  {districtId ? "Choose a panchayath" : "Select a district first"}
                </option>
                {panchayaths.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.panchayathName}
                  </option>
                ))}
              </select>
              {errors.panchayath ? (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.panchayath}
                </span>
              ) : (
                <span className="cc-hint">
                  {districtId && panchayaths.length === 0
                    ? "No panchayaths in this district yet."
                    : "Scope of this officer's complaint queue."}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-name">
                <span>
                  <FiUser /> Full name
                </span>
              </label>
              <input
                id="authority-name"
                className={`cc-input ${errors.name ? "is-invalid" : ""}`}
                placeholder="Officer's full name"
                maxLength={60}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
              {errors.name && (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.name}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-email">
                <span>
                  <FiMail /> Official email
                </span>
              </label>
              <input
                id="authority-email"
                type="email"
                className={`cc-input ${errors.email ? "is-invalid" : ""}`}
                placeholder="officer@panchayath.gov"
                maxLength={80}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
              {errors.email && (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.email}
                </span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-password">
                <span>
                  <FiLock /> Sign-in password
                </span>
              </label>
              <div className="cc-input-wrap">
                <FiLock />
                <input
                  id="authority-password"
                  type={showPassword ? "text" : "password"}
                  className={`cc-input ${errors.password ? "is-invalid" : ""}`}
                  placeholder="At least 6 characters"
                  maxLength={40}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
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
                <span className="cc-hint">Share this with the officer securely.</span>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-label" htmlFor="authority-contact">
                <span>
                  <FiPhone /> Contact number
                </span>
              </label>
              <input
                id="authority-contact"
                className={`cc-input ${errors.contact ? "is-invalid" : ""}`}
                placeholder="+91 98765 43210"
                maxLength={15}
                inputMode="tel"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
              />
              {errors.contact && (
                <span className="cc-error">
                  <FiAlertCircle /> {errors.contact}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="cc-btn cc-btn--primary cc-btn--block"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                <>
                  <FiPlus /> Create authority
                </>
              )}
            </button>
          </form>

          <div className={styles.formNote}>
            Authority accounts cannot manage other panchayaths or the location hierarchy.
          </div>
        </section>

        <section className={`cc-card ${styles.tableCard}`}>
          <div className={styles.tableHead}>
            <div>
              <h3>Official directory</h3>
              <p className={styles.headSub}>
                {query
                  ? `${filtered.length} of ${authorities.length} shown`
                  : `${authorities.length} active ${authorities.length === 1 ? "account" : "accounts"}`}
              </p>
            </div>
            <div className="cc-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search name, email, or panchayath"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search authorities"
              />
            </div>
          </div>

          {loading ? (
            <PageLoader label="Loading authorities" rows={2} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FiShield}
              title={authorities.length === 0 ? "No authorities yet" : "No matching authorities"}
              description={
                authorities.length === 0
                  ? "Register an authority to put a panchayath's complaint queue under someone's care."
                  : "Try a different search term."
              }
              action={
                authorities.length > 0 ? (
                  <button
                    type="button"
                    className="cc-btn cc-btn--secondary"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </button>
                ) : null
              }
            />
          ) : (
            <div className={styles.tableScroll}>
              <table className={`cc-table ${styles.table}`}>
                <thead>
                  <tr>
                    <th>Authority</th>
                    <th>Jurisdiction</th>
                    <th>Contact</th>
                    <th className="cc-td-actions">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <div className={styles.person}>
                          <Avatar name={a.authorityName} size="sm" />
                          <div>
                            <strong>{a.authorityName}</strong>
                            <span className={styles.personSub}>Authority officer</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.jurisdiction}>
                          <strong>{a.panchayathId?.panchayathName || "Unassigned"}</strong>
                          <span>{a.panchayathId?.panchayathName ? "Panchayath officer" : "Awaiting assignment"}</span>
                        </span>
                      </td>
                      <td>
                        <span className={styles.contact}>
                          <strong>{a.authorityEmail}</strong>
                          <span>{a.authorityContact || "No contact"}</span>
                        </span>
                      </td>
                      <td className="cc-td-actions">
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--danger"
                          onClick={() => handleDelete(a)}
                          disabled={deletingId === a._id}
                        >
                          <FiTrash2 /> {deletingId === a._id ? "Revoking…" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthorityRegistration;
