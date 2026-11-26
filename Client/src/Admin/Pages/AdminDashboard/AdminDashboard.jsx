import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHash,
  FiHome,
  FiInbox,
  FiLayers,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { api } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatCard from "../../../ui/StatCard";
import StatusPill from "../../../ui/StatusPill";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [infra, setInfra] = useState({ districts: 0, panchayaths: 0, wards: 0, departments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, complaintRes, districtRes, panchayathRes, wardRes, deptRes] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/complaints").catch(() => ({ data: { data: [] } })),
          api.get("/district").catch(() => ({ data: { districtData: [] } })),
          api.get("/panchayath").catch(() => ({ data: { panchayathData: [] } })),
          api.get("/ward").catch(() => ({ data: { wardData: [] } })),
          api.get("/department").catch(() => ({ data: { departmentData: [] } })),
        ]);

      setStats(dashRes.data || {});
      setComplaints(complaintRes.data?.data || []);
      setInfra({
        districts: (districtRes.data?.districtData || []).length,
        panchayaths: (panchayathRes.data?.panchayathData || []).length,
        wards: (wardRes.data?.wardData || []).length,
        departments: (deptRes.data?.departmentData || []).length,
      });
    } catch {
      setError("We couldn't load the command center. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolutionRate =
    stats.complaints > 0 ? Math.round(((stats.resolved || 0) / stats.complaints) * 100) : 0;

  const recent = useMemo(() => complaints.slice(0, 5), [complaints]);

  const statusSplit = useMemo(() => {
    const order = ["Submitted", "Verified", "In Progress", "Resolved", "Closed", "Rejected"];
    return order
      .map((status) => ({
        status,
        count: complaints.filter((c) => c.complaintStatus === status).length,
      }))
      .filter((row) => row.count > 0);
  }, [complaints]);

  if (loading) {
    return (
      <div className="cc-page">
        <PageLoader label="Loading the command center" rows={4} />
      </div>
    );
  }

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Admin console"
        title="Your platform, at a glance."
        description="Live platform health, complaint activity, and the location hierarchy that routes every report."
        actions={
          <>
            <button type="button" className="cc-btn cc-btn--secondary" onClick={load}>
              <FiRefreshCw /> Refresh
            </button>
            <Link to="/admin/report" className="cc-btn cc-btn--primary">
              <FiBarChart2 /> Open reports
            </Link>
          </>
        }
      />

      {error && (
        <div className="cc-note cc-note--rose" style={{ marginBottom: 20 }} role="alert">
          {error}
        </div>
      )}

      <div className="cc-grid cc-grid--stats">
        <StatCard icon={FiUsers} label="Registered citizens" value={stats.users || 0} tone="brand" hint="Platform-wide" />
        <StatCard icon={FiShield} label="Authorities" value={stats.authorities || 0} tone="violet" hint="Active accounts" />
        <StatCard icon={FiFileText} label="Total complaints" value={stats.complaints || 0} tone="teal" hint="All jurisdictions" />
        <StatCard icon={FiCheckCircle} label="Resolved" value={stats.resolved || 0} tone="green" hint="Officially closed" />
        <StatCard icon={FiClock} label="Awaiting action" value={stats.pending || 0} tone="amber" hint="Needs review" />
      </div>

      <div className="cc-split cc-section">
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <h3>Latest complaints</h3>
              <p className={styles.headSub}>The newest reports across all jurisdictions.</p>
            </div>
            <Link to="/admin/ViewComplaint" className="cc-link">
              View all <FiArrowRight />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={FiInbox}
              title="No complaints yet"
              description="Once citizens start reporting issues, they will appear here for your oversight."
            />
          ) : (
            <div className="cc-table-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="cc-table cc-table--compact">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Citizen</th>
                    <th>Jurisdiction</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.complaintTitle}</strong>
                        <div className={styles.cellSub}>
                          {item.departmentId?.departmentName || "General"}
                        </div>
                      </td>
                      <td>{item.userId?.userName || "Anonymous"}</td>
                      <td>
                        {item.panchayathId?.panchayathName || "—"}
                        <div className={styles.cellSub}>{item.wardId?.wardName || "—"}</div>
                      </td>
                      <td>
                        <StatusPill status={item.complaintStatus || "Submitted"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="cc-stack">
          <section className={`cc-card cc-card--pad ${styles.rateCard}`}>
            <div className={styles.rateTop}>
              <span className={styles.rateIcon}>
                <FiActivity />
              </span>
              <div>
                <h3>Platform resolution rate</h3>
                <p>Share of all complaints marked resolved.</p>
              </div>
            </div>
            <p className={styles.rateValue}>{resolutionRate}%</p>
            <div className="cc-progress">
              <span style={{ width: `${resolutionRate}%` }} />
            </div>
            <div className={styles.rateLegend}>
              <span>
                <strong>{stats.resolved || 0}</strong> resolved
              </span>
              <span>
                <strong>{stats.complaints || 0}</strong> total
              </span>
            </div>
          </section>

          <section className={`cc-card cc-card--pad ${styles.splitCard}`}>
            <h3 className={styles.cardTitle}>Complaint mix</h3>
            {statusSplit.length === 0 ? (
              <p className={styles.empty}>No complaint data to summarise yet.</p>
            ) : (
              <ul className={styles.split}>
                {statusSplit.map((row) => (
                  <li key={row.status}>
                    <div className={styles.splitTop}>
                      <StatusPill status={row.status} />
                      <span>{row.count}</span>
                    </div>
                    <div className="cc-progress cc-progress--thin">
                      <span
                        style={{
                          width: `${Math.max(
                            6,
                            (row.count / (complaints.length || 1)) * 100
                          )}%`,
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
        <div className="cc-section-head">
          <div>
            <h2 className="cc-h3">Location hierarchy</h2>
            <p>The structure your complaints are routed through.</p>
          </div>
          <Link to="/admin/district" className="cc-link">
            Manage hierarchy <FiArrowRight />
          </Link>
        </div>

        <div className={styles.infraGrid}>
          {[
            { icon: FiMapPin, label: "Districts", value: infra.districts, to: "/admin/district" },
            { icon: FiHome, label: "Panchayaths", value: infra.panchayaths, to: "/admin/panchayath" },
            { icon: FiHash, label: "Wards", value: infra.wards, to: "/admin/ward" },
            { icon: FiLayers, label: "Departments", value: infra.departments, to: "/admin/department" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} className={styles.infraCard}>
                <span className={styles.infraIcon}>
                  <Icon />
                </span>
                <div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
                <FiArrowRight className={styles.infraArrow} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="cc-section">
        <div className={styles.actionsGrid}>
          {[
            {
              icon: FiShield,
              title: "Register an authority",
              text: "Give a panchayath officer access to the complaint queue.",
              to: "/admin/authorityregistration",
            },
            {
              icon: FiUsers,
              title: "Review citizens",
              text: "Browse the registered citizen directory.",
              to: "/admin/Userlist",
            },
            {
              icon: FiBarChart2,
              title: "Export reports",
              text: "Filter complaints by location and download CSV.",
              to: "/admin/report",
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.title} to={a.to} className={styles.actionCard}>
                <span className={styles.actionIcon}>
                  <Icon />
                </span>
                <div>
                  <h4>{a.title}</h4>
                  <p>{a.text}</p>
                </div>
                <FiArrowRight />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
