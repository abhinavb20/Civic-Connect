import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiUser,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import Avatar from "../../../ui/Avatar";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import { useToast } from "../../../ui/Toast";
import styles from "./EditProfile.module.css";

const EditProfile = () => {
  const uid = sessionStorage.getItem("userId");
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : photoUrl), [photo, photoUrl]);

  useEffect(
    () => () => {
      if (photo && preview) URL.revokeObjectURL(preview);
    },
    [photo, preview]
  );

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    api
      .get(`/user/${uid}`)
      .then((res) => {
        const u = res.data?.user || {};
        setFullName(u.userName || "");
        setEmail(u.userEmail || "");
        setContact(u.userContact || "");
        setAddress(u.userAddress || "");
        setPhotoUrl(u.userPhoto ? fileUrl(u.userPhoto) : "");
      })
      .catch(() => toast.error("Couldn't load profile", "Please refresh and try again."))
      .finally(() => setLoading(false));
  }, [uid, toast]);

  const handleSave = async (event) => {
    event?.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Name is required";
    else if (fullName.trim().length < 2) nextErrors.fullName = "Use at least 2 characters";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email";
    if (!contact.trim()) nextErrors.contact = "Contact is required";
    else if (!/^[0-9+\s-]{10,15}$/.test(contact.trim()))
      nextErrors.contact = "Enter a valid contact number";
    if (!address.trim()) nextErrors.address = "Address is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("contact", contact.trim());
      formData.append("address", address.trim());
      if (photo) formData.append("photo", photo);

      await api.put(`/user/${uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      sessionStorage.setItem("userName", fullName.trim());
      if (photo) setPhotoUrl(URL.createObjectURL(photo));
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Profile updated", "Your details have been saved.");
    } catch {
      toast.error("Update failed", "Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cc-page">
        <PageLoader label="Loading your profile" rows={2} />
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="cc-page">
        <div className="cc-card">
          <div className="cc-empty">
            <h3>Session expired</h3>
            <p>Sign in again to edit your profile.</p>
            <Link to="/login" className="cc-btn cc-btn--primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Account settings"
        title="Edit your details."
        description="Keep your contact information accurate so your ward authority can reach you about the reports you file."
        actions={
          <Link to="/user/myprofile" className="cc-btn cc-btn--secondary">
            <FiArrowLeft /> Back to profile
          </Link>
        }
      />

      <form className={styles.layout} onSubmit={handleSave} noValidate>
        <aside className={`cc-card cc-card--pad ${styles.photoCard}`}>
          <div className={styles.photoWrap}>
            <Avatar src={preview} name={fullName} size="lg" className={styles.avatar} />
            <label htmlFor="profile-photo" className={styles.camera} title="Change photo">
              <FiCamera />
            </label>
            <input
              ref={fileRef}
              id="profile-photo"
              type="file"
              accept="image/*"
              className="cc-sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(file);
              }}
            />
          </div>
          <h3>{fullName || "Your name"}</h3>
          <span className={styles.role}>Citizen account</span>
          <p className={styles.photoHint}>
            Upload a clear photo. It helps authorities recognise you when following up.
          </p>
          <button
            type="button"
            className="cc-btn cc-btn--secondary cc-btn--sm cc-btn--block"
            onClick={() => fileRef.current?.click()}
          >
            <FiCamera /> Change photo
          </button>
        </aside>

        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <h3>Personal information</h3>
              <p className={styles.headSub}>All fields are required.</p>
            </div>
            <span className={styles.editBadge}>
              <FiCheck /> Verified account
            </span>
          </div>

          <div className="cc-card-body">
            <div className="cc-form-grid">
              <div className="cc-field">
                <label className="cc-label" htmlFor="edit-fullName">
                  <FiUser /> Full name
                </label>
                <input
                  id="edit-fullName"
                  className={`cc-input ${errors.fullName ? "is-invalid" : ""}`}
                  value={fullName}
                  maxLength={40}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((p) => ({ ...p, fullName: "" }));
                  }}
                />
                {errors.fullName && <span className="cc-error">{errors.fullName}</span>}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="edit-email">
                  <FiMail /> Email address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  className={`cc-input ${errors.email ? "is-invalid" : ""}`}
                  value={email}
                  maxLength={60}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                />
                {errors.email && <span className="cc-error">{errors.email}</span>}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="edit-contact">
                  <FiPhone /> Contact number
                </label>
                <input
                  id="edit-contact"
                  className={`cc-input ${errors.contact ? "is-invalid" : ""}`}
                  value={contact}
                  maxLength={15}
                  inputMode="tel"
                  onChange={(e) => {
                    setContact(e.target.value);
                    setErrors((p) => ({ ...p, contact: "" }));
                  }}
                />
                {errors.contact && <span className="cc-error">{errors.contact}</span>}
              </div>

              <div className="cc-field">
                <label className="cc-label">
                  <FiMapPin /> Ward assignment
                </label>
                <input className="cc-input" value="Managed by your panchayath office" disabled />
                <span className="cc-hint">
                  Contact your panchayath to change your registered ward.
                </span>
              </div>

              <div className="cc-field cc-col-span-2">
                <label className="cc-label" htmlFor="edit-address">
                  <FiMapPin /> Residential address
                </label>
                <textarea
                  id="edit-address"
                  className={`cc-textarea ${errors.address ? "is-invalid" : ""}`}
                  rows={3}
                  maxLength={220}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((p) => ({ ...p, address: "" }));
                  }}
                />
                {errors.address && <span className="cc-error">{errors.address}</span>}
              </div>
            </div>
          </div>

          <div className="cc-card-foot">
            <div className={styles.actions}>
              <Link to="/user/myprofile" className="cc-btn cc-btn--ghost">
                Cancel
              </Link>
              <button type="submit" className="cc-btn cc-btn--primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" /> Saving…
                  </>
                ) : (
                  <>
                    <FiSave /> Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default EditProfile;
