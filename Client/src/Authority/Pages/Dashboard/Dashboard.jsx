import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInbox,
  FiMapPin,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { api } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatCard from "../../../ui/StatCard";
import StatusPill from "../../../ui/StatusPill";
import styles from "./Dashboard.module.css";

const ACTIVE = ["Submitted", "Verified", "In Progress"];

const AuthorityDashboard = () => {
  const authorityName = sessionStorage.getItem("authorityName") || "Authority";
  const authorityId = sessionStorage.getItem("authorityId");

  const [stats, setStats] = useState({ users: 0, totalComplaints: 0, resolved: 0, pending: 0 });
  const [complaints, setComplaints] = useState([]);
  const [panchayath, setPanchayath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = React.useCallback(async () => {
    if (!authorityId) return;
    setLoading(true);
    setError("");
    try {
      const authRes = await api.get(`/authority/${authorityId}`);
      const authority = authRes.data || {};
      setPanchayath(authority.panchayathId || null);
      const panchayathId = authority.panchayathId?._id;

      if (!panchayathId) {
        setError(
          "Your authority account is not linked to a panchayath yet. Ask an administrator to assign one."
        );
        setLoading(false);
        return;
      }

      const [statRes, complaintRes] = await Promise.all([
        api.get(`/authority/dashboard/${panchayathId}`),
        api.get(`/complaintByPanchayath/${panchayathId}`),
      ]);

      setStats(statRes.data || {});
      setComplaints(complaintRes.data?.data || []);
    } catch {
      setError("We couldn't load your operations dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authorityId]);

  useEffect(() => {
    load();
  }, [load]);

  const queue = useMemo(
    () =>
      complaints
        .filter((c) => ACTIVE.includes(c.complaintStatus))
        .sort((a, b) => (b.supportCount || 0) - (a.supportCount || 0))
        .slice(0, 5),
    [complaints]
  );

  const statusCounts = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const key = c.complaintStatus || "Submitted";
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [complaints]);

  const resolutionRate =
    stats.totalComplaints > 0
      ? Math.round((stats.resolved / stats.totalComplaints) * 100)
      : 0;

  const contributions = useMemo(
    () => Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    [statusCounts]
  );

  if (loading) {
    return (
      <div className="cc-page">
        <PageLoader label="Loading your operations dashboard" rows={4} />
      </div>
    );
  }

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow={panchayath?.panchayathName || "Authority portal"}
        title={`Good to see you, ${authorityName}.`}
        description="Your ward-level overview of citizen reports, open cases, and resolution progress."
        actions={
          <>
            <button type="button" className="cc-btn cc-btn--secondary" onClick={load}>
              <FiRefreshCw /> Refresh
            </button>
            <Link to="/authority/view-complaints" className="cc-btn cc-btn--primary">
              <FiInbox /> Open complaint queue
            </Link>
          </>
        }
        meta={
          panchayath?.panchayathName ? (
            <span className="cc-badge cc-badge--brand">
              <FiMapPin /> {panchayath.panchayathName}
            </span>
          ) : null
        }
      />

      {error && (
        <div className="cc-note cc-note--amber" style={{ marginBottom: 20 }} role="alert">
          {error}
        </div>
      )}

      <div className="cc-grid cc-grid--stats">
        <StatCard icon={FiFileText} label="Total complaints" value={stats.totalComplaints || 0} hint="In your panchayath" tone="brand" />
        <StatCard icon={FiClock} label="Awaiting action" value={stats.pending || 0} hint="Needs review" tone="amber" />
        <StatCard icon={FiCheckCircle} label="Resolved" value={stats.resolved || 0} hint="Officially closed" tone="green" />
        <StatCard icon={FiTrendingUp} label="Resolution rate" value={resolutionRate} suffix="%" hint="Of all cases" tone="teal" />
      </div>

      <div className="cc-split cc-section">
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <h3>Priority queue</h3>
              <p className={styles.headSub}>Open cases ranked by community support.</p>
            </div>
            <Link to="/authority/view-complaints" className="cc-link">
              View queue <FiArrowRight />
            </Link>
          </div>

          {queue.length === 0 ? (
            <EmptyState
              icon={FiInbox}
              title="Nothing in the queue"
              description="There are no open complaints in your panchayath right now. New reports will appear here automatically."
              action={
                <Link to="/authority/view-complaints" className="cc-btn cc-btn--secondary">
                  View all complaints
                </Link>
              }
            />
          ) : (
            <ul className={styles.queue}>
              {queue.map((item) => (
                <li key={item._id} className={styles.queueItem}>
                  <span className={styles.support}>
                    <FiUsers />
                    {item.supportCount || 0}
                  </span>
                  <div className={styles.queueBody}>
                    <strong>{item.complaintTitle}</strong>
                    <span className={styles.queueMeta}>
                      {item.wardId?.wardName || "Ward"}
                      <span className={styles.metaDot} />
                      {item.departmentId?.departmentName || "General"}
                    </span>
                  </div>
                  <StatusPill status={item.complaintStatus || "Submitted"} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="cc-stack">
          <section className={`cc-card cc-card--pad ${styles.jurisdiction}`}>
            <span className={styles.jurisdictionIcon}>
              <FiMapPin />
            </span>
            <h3>Your jurisdiction</h3>
            <p>
              {panchayath?.panchayathName
                ? `You are responsible for complaints raised in ${panchayath.panchayathName}.`
                : "Your panchayath assignment is pending."}
            </p>
            <dl className={styles.jurisdictionFacts}>
              <div>
                <dt>Open cases</dt>
                <dd>{stats.pending || 0}</dd>
              </div>
              <div>
                <dt>Citizens</dt>
                <dd>{stats.users || 0}</dd>
              </div>
            </dl>
            <Link to="/authority/view-complaints" className="cc-btn cc-btn--primary cc-btn--sm cc-btn--block">
              Manage complaints
            </Link>
          </section>

          <section className={`cc-card cc-card--pad ${styles.breakdownCard}`}>
            <h3 className={styles.cardTitle}>Status at a glance</h3>
            {contributions.length === 0 ? (
              <p className={styles.empty}>No complaints have been filed yet.</p>
            ) : (
              <ul className={styles.breakdown}>
                {contributions.map(([status, count]) => (
                  <li key={status}>
                    <div className={styles.breakdownTop}>
                      <StatusPill status={status} />
                      <span>{count}</span>
                    </div>
                    <div className="cc-progress cc-progress--thin">
                      <span
                        style={{
                          width: `${Math.max(6, (count / (complaints.length || 1)) * 100)}%`,
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
    </div>
  );
};

export default AuthorityDashboard;
