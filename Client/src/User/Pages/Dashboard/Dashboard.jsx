import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiFileText,
  FiInbox,
  FiLock,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import Avatar from "../../../ui/Avatar";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatCard from "../../../ui/StatCard";
import StatusPill from "../../../ui/StatusPill";
import styles from "./Dashboard.module.css";

const ACTIVE_STATUSES = ["Submitted", "Verified", "In Progress"];

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName") || "Citizen";

  const load = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const [complaintRes, userRes] = await Promise.all([
        api.get(`/complaintByUser/${userId}`),
        api.get(`/user/${userId}`).catch(() => null),
      ]);
      setComplaints(complaintRes.data?.data || []);
      setProfile(userRes?.data?.user || null);
    } catch {
      setError("We couldn't load your dashboard right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const active = complaints.filter((c) => ACTIVE_STATUSES.includes(c.complaintStatus)).length;
    const resolved = complaints.filter((c) => c.complaintStatus === "Resolved").length;
    const closed = complaints.filter((c) =>
      ["Closed", "Rejected"].includes(c.complaintStatus)
    ).length;
    return { total, active, resolved, closed };
  }, [complaints]);

  const breakdown = useMemo(() => {
    const order = ["Submitted", "Verified", "In Progress", "Resolved", "Closed", "Rejected"];
    return order
      .map((status) => ({
        status,
        count: complaints.filter((c) => c.complaintStatus === status).length,
      }))
      .filter((row) => row.count > 0);
  }, [complaints]);

  const recent = complaints.slice(0, 5);
  const resolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const ward = profile?.wardId;

  if (loading && complaints.length === 0) {
    return (
      <div className="cc-page">
        <PageLoader label="Loading your civic overview" rows={4} />
      </div>
    );
  }

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Citizen portal"
        title={`Welcome back, ${userName.split(" ")[0]}.`}
        description="A live view of the reports you have filed, their progress, and what your ward is working on."
        actions={
          <>
            <button type="button" className="cc-btn cc-btn--secondary" onClick={load} disabled={loading}>
              <FiRefreshCw className={loading ? styles.spin : ""} /> Refresh
            </button>
            <Link to="/user/complaint" className="cc-btn cc-btn--primary">
              <FiPlus /> File a report
            </Link>
          </>
        }
      />

      {error && (
        <div className={`cc-note cc-note--rose ${styles.errorNote}`} role="alert">
          <FiXCircle /> {error}
        </div>
      )}

      <div className="cc-grid cc-grid--stats">
        <StatCard
          icon={FiFileText}
          label="Total reports filed"
          value={stats.total}
          hint="All time"
          tone="brand"
        />
        <StatCard
          icon={FiClock}
          label="Awaiting action"
          value={stats.active}
          hint="In progress"
          tone="amber"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Resolved"
          value={stats.resolved}
          hint="Official closure"
          tone="green"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Resolution rate"
          value={resolutionRate}
          suffix="%"
          hint="Of your reports"
          tone="teal"
        />
      </div>

      <div className="cc-split cc-section">
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <h3>Recent reports</h3>
              <p className={styles.headSub}>
                Your latest submissions and their official status.
              </p>
            </div>
            <Link to="/user/complaint" className="cc-link">
              View all <FiArrowRight />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={FiInbox}
              title="No reports yet"
              description="When something in your neighbourhood needs attention, file a report with photo evidence and we'll route it to the right ward authority."
              action={
                <Link to="/user/complaint" className="cc-btn cc-btn--primary">
                  <FiEdit3 /> File your first report
                </Link>
              }
            />
          ) : (
            <ul className={styles.recentList}>
              {recent.map((item) => (
                <li key={item._id} className={styles.recentItem}>
                  {item.complaintPhotos?.[0] ? (
                    <img
                      src={fileUrl(item.complaintPhotos[0])}
                      alt=""
                      className={styles.recentThumb}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.recentIcon}>
                      <FiFileText />
                    </span>
                  )}
                  <div className={styles.recentBody}>
                    <strong>{item.complaintTitle}</strong>
                    <span className={styles.recentMeta}>
                      {item.departmentId?.departmentName || "General"}
                      <span className={styles.metaDot} />
                      {item.wardId?.wardName || "Your ward"}
                    </span>
                  </div>
                  <StatusPill status={item.complaintStatus || "Submitted"} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="cc-stack">
          <section className={`cc-card cc-card--pad ${styles.profileCard}`}>
            <div className={styles.profileTop}>
              <Avatar
                src={profile?.userPhoto ? fileUrl(profile.userPhoto) : ""}
                name={userName}
                size="lg"
              />
              <div>
                <h3 className={styles.profileName}>{userName}</h3>
                <span className={styles.profileRole}>Verified citizen</span>
              </div>
            </div>

            <dl className={styles.profileFacts}>
              <div>
                <dt>
                  <FiMapPin /> Ward
                </dt>
                <dd>
                  {ward?.wardName
                    ? `${ward.wardName}${ward.wardNumber ? ` · ${ward.wardNumber}` : ""}`
                    : "Not assigned"}
                </dd>
              </div>
              <div>
                <dt>
                  <FiUsers /> Panchayath
                </dt>
                <dd>{ward?.panchayathId?.panchayathName || "Not assigned"}</dd>
              </div>
            </dl>

            <div className={styles.profileActions}>
              <Link to="/user/myprofile" className="cc-btn cc-btn--secondary cc-btn--sm cc-btn--block">
                View profile
              </Link>
              <Link to="/user/editprofile" className="cc-btn cc-btn--ghost cc-btn--sm cc-btn--block">
                Edit details
              </Link>
            </div>
          </section>

          <section className={`cc-card cc-card--pad ${styles.breakdownCard}`}>
            <h3 className={styles.cardTitle}>Status breakdown</h3>
            {breakdown.length === 0 ? (
              <p className={styles.breakdownEmpty}>
                Your reports will be summarised here once you file the first one.
              </p>
            ) : (
              <ul className={styles.breakdown}>
                {breakdown.map((row) => (
                  <li key={row.status}>
                    <div className={styles.breakdownTop}>
                      <StatusPill status={row.status} />
                      <span className={styles.breakdownCount}>{row.count}</span>
                    </div>
                    <div className="cc-progress cc-progress--thin">
                      <span
                        style={{
                          width: `${Math.max(6, (row.count / stats.total) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="cc-section">
        <div className={styles.quickGrid}>
          {[
            {
              icon: FiEdit3,
              title: "File a new report",
              text: "Add photos and the exact location of the issue.",
              to: "/user/complaint",
              label: "Start a report",
            },
            {
              icon: FiUsers,
              title: "Community hub",
              text: "Support issues raised by people in nearby wards.",
              to: "/user/allcomplaints",
              label: "Browse community",
            },
            {
              icon: FiLock,
              title: "Account security",
              text: "Update your password and keep your account safe.",
              to: "/user/changepassword",
              label: "Security settings",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.to} className={styles.quickCard}>
                <span className={styles.quickIcon}>
                  <Icon />
                </span>
                <h4>{card.title}</h4>
                <p>{card.text}</p>
                <span className={styles.quickLink}>
                  {card.label} <FiArrowRight />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
