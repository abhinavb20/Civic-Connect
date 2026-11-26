import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCalendar,
  FiEdit3,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import Avatar from "../../../ui/Avatar";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import styles from "./MyProfile.module.css";

const MyProfile = () => {
  const uid = sessionStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return;
    api
      .get("/users")
      .then((res) => {
        const users = res.data?.users || [];
        setProfile(users.find((u) => u._id === uid) || null);
      })
      .catch(() => setError("We couldn't load your profile. Please refresh the page."))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return (
      <div className="cc-page">
        <PageLoader label="Loading your profile" rows={2} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="cc-page">
        <div className="cc-card">
          <div className="cc-empty">
            <div className="cc-empty-art">
              <FiAlertCircle />
            </div>
            <h3>Profile unavailable</h3>
            <p>{error || "We couldn't find your citizen record."}</p>
          </div>
        </div>
      </div>
    );
  }

  const ward = profile.wardId;
  const panchayath = ward?.panchayathId;
  const district = panchayath?.districtId;

  const facts = [
    { icon: FiMail, label: "Email address", value: profile.userEmail || "Not provided" },
    { icon: FiPhone, label: "Contact number", value: profile.userContact || "Not provided" },
    {
      icon: FiMapPin,
      label: "District",
      value: district?.districtName || "Not assigned",
    },
    {
      icon: FiMapPin,
      label: "Panchayath",
      value: panchayath?.panchayathName || "Not assigned",
    },
    {
      icon: FiMapPin,
      label: "Ward",
      value: ward?.wardName
        ? `${ward.wardName}${ward.wardNumber ? ` · ${ward.wardNumber}` : ""}`
        : "Not assigned",
    },
    {
      icon: FiCalendar,
      label: "Member since",
      value: profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="My profile"
        title="Your citizen identity."
        description="The details your ward authority uses to verify and respond to your reports."
        actions={
          <>
            <Link to="/user/editprofile" className="cc-btn cc-btn--secondary">
              <FiEdit3 /> Edit details
            </Link>
            <Link to="/user/changepassword" className="cc-btn cc-btn--primary">
              <FiLock /> Security settings
            </Link>
          </>
        }
      />

      <div className={styles.layout}>
        <aside className={`cc-card ${styles.identityCard}`}>
          <div className={styles.cover} aria-hidden="true" />
          <div className={styles.identityBody}>
            <Avatar
              src={profile.userPhoto ? fileUrl(profile.userPhoto) : ""}
              name={profile.userName}
              size="lg"
              className={styles.avatar}
            />
            <h2 className={styles.name}>{profile.userName}</h2>
            <span className={styles.tag}>
              <FiUser /> Verified citizen
            </span>
            <p className={styles.identityMeta}>
              {ward?.wardName ? `${ward.wardName} · ${panchayath?.panchayathName || ""}` : "Ward not assigned"}
            </p>

            <div className={styles.identityStats}>
              <div>
                <strong>{district?.districtName || "—"}</strong>
                <span>District</span>
              </div>
              <div>
                <strong>{panchayath?.panchayathName || "—"}</strong>
                <span>Panchayath</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="cc-stack">
          <section className="cc-card">
            <div className="cc-card-head">
              <div>
                <h3>Personal &amp; contact</h3>
                <p className={styles.headSub}>Used for official communication.</p>
              </div>
            </div>
            <div className={styles.factGrid}>
              {facts.slice(0, 2).map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className={styles.fact}>
                    <span className={styles.factIcon}>
                      <Icon />
                    </span>
                    <div>
                      <span className={styles.factLabel}>{f.label}</span>
                      <strong>{f.value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.addressRow}>
              <span className={styles.factIcon}>
                <FiMapPin />
              </span>
              <div>
                <span className={styles.factLabel}>Residential address</span>
                <strong>{profile.userAddress || "Not provided"}</strong>
              </div>
            </div>
          </section>

          <section className="cc-card">
            <div className="cc-card-head">
              <div>
                <h3>Jurisdiction</h3>
                <p className={styles.headSub}>
                  Your reports are routed using these boundaries.
                </p>
              </div>
              <Link to="/user/editprofile" className="cc-link">
                Request change
              </Link>
            </div>
            <div className={styles.factGrid}>
              {facts.slice(2).map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className={styles.fact}>
                    <span className={styles.factIcon}>
                      <Icon />
                    </span>
                    <div>
                      <span className={styles.factLabel}>{f.label}</span>
                      <strong>{f.value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="cc-note">
            <FiAlertCircle />
            <span>
              Need to change your ward? Ward changes affect where your reports are routed,
              so contact your panchayath office to update your registered address.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
