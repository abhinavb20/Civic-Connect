import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import Avatar from "../../../ui/Avatar";
import EmptyState from "../../../ui/EmptyState";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import { useConfirm } from "../../../ui/ConfirmDialog";
import { useToast } from "../../../ui/Toast";
import styles from "./Userlist.module.css";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "—";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      const sorted = [...(res.data?.users || [])].sort((a, b) =>
        (a.userName || "").localeCompare(b.userName || "")
      );
      setUsers(sorted);
    } catch {
      setError("We couldn't load the citizen directory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Delete ${item.userName}?`,
      message:
        "This permanently removes the citizen account. Complaints they already filed are kept for record, but they will no longer be able to sign in.",
      confirmLabel: "Delete citizen",
    });
    if (!ok) return;

    setDeletingId(item._id);
    try {
      await api.delete(`/users/${item._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== item._id));
      toast.success("Citizen deleted", `${item.userName} has been removed.`);
    } catch {
      toast.error("Couldn't delete citizen", "Please try again in a moment.");
    } finally {
      setDeletingId(null);
    }
  };

  const districts = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      const district = u.wardId?.panchayathId?.districtId;
      if (district?._id) map.set(district._id, district.districtName);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [users]);

  const stats = useMemo(() => {
    const panchayaths = new Set();
    const wards = new Set();
    users.forEach((u) => {
      if (u.wardId?.panchayathId?._id) panchayaths.add(u.wardId.panchayathId._id);
      if (u.wardId?._id) wards.add(u.wardId._id);
    });
    return {
      total: users.length,
      panchayaths: panchayaths.size,
      wards: wards.size,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const ward = u.wardId;
      const panchayath = ward?.panchayathId;
      const district = panchayath?.districtId;
      const matchesQuery =
        !q ||
        u.userName?.toLowerCase().includes(q) ||
        u.userEmail?.toLowerCase().includes(q) ||
        u.userContact?.toLowerCase().includes(q) ||
        u.userAddress?.toLowerCase().includes(q) ||
        ward?.wardName?.toLowerCase().includes(q) ||
        panchayath?.panchayathName?.toLowerCase().includes(q) ||
        district?.districtName?.toLowerCase().includes(q);
      const matchesDistrict = !districtFilter || district?._id === districtFilter;
      return matchesQuery && matchesDistrict;
    });
  }, [users, query, districtFilter]);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Community"
        title="Citizens"
        description="Everyone registered on Civic Connect, with the ward they report from. Use this directory to verify accounts or remove duplicates."
        actions={
          <button
            type="button"
            className="cc-btn cc-btn--secondary"
            onClick={loadUsers}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spin : ""} /> Refresh
          </button>
        }
        meta={
          <span className="cc-badge cc-badge--brand">
            {users.length} registered {users.length === 1 ? "citizen" : "citizens"}
          </span>
        }
      />

      {error && (
        <div className="cc-note cc-note--rose" style={{ marginBottom: 20 }} role="alert">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <FiUsers />
          </span>
          <div>
            <strong>{stats.total}</strong>
            <span>Registered citizens</span>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statIcon} ${styles.teal}`}>
            <FiMapPin />
          </span>
          <div>
            <strong>{stats.panchayaths}</strong>
            <span>Panchayaths reached</span>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statIcon} ${styles.violet}`}>
            <FiUser />
          </span>
          <div>
            <strong>{stats.wards}</strong>
            <span>Wards represented</span>
          </div>
        </div>
      </div>

      <section className={`cc-card ${styles.card}`}>
        <div className={styles.cardHead}>
          <div>
            <h3>Citizen directory</h3>
            <p className={styles.headSub}>
              {query || districtFilter
                ? `${filtered.length} of ${users.length} shown`
                : `${users.length} ${users.length === 1 ? "account" : "accounts"}`}
            </p>
          </div>
          <div className={styles.tools}>
            <div className="cc-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search name, email, ward, or address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search citizens"
              />
            </div>
            <select
              className={`cc-select ${styles.filterSelect}`}
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <PageLoader label="Loading the citizen directory" rows={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title={users.length === 0 ? "No citizens yet" : "No matching citizens"}
            description={
              users.length === 0
                ? "Citizens appear here as soon as they complete registration."
                : "Try a different search term or district."
            }
            action={
              users.length > 0 ? (
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={() => {
                    setQuery("");
                    setDistrictFilter("");
                  }}
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        ) : (
          <div className={styles.tableScroll}>
            <table className={`cc-table ${styles.table}`}>
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>Contact</th>
                  <th>Jurisdiction</th>
                  <th>Address</th>
                  <th className="cc-td-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const ward = u.wardId;
                  const panchayath = ward?.panchayathId;
                  const district = panchayath?.districtId;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className={styles.person}>
                          <Avatar
                            src={u.userPhoto ? fileUrl(u.userPhoto) : ""}
                            name={u.userName}
                          />
                          <div>
                            <strong>{u.userName}</strong>
                            <span>Joined {formatDate(u.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contact}>
                          <span className={styles.email}>{u.userEmail || "No email"}</span>
                          <span>{u.userContact || "No contact"}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.jurisdiction}>
                          <span className="cc-badge cc-badge--brand">
                            <FiMapPin /> {district?.districtName || "Unassigned"}
                          </span>
                          <span className={styles.jurisdictionSub}>
                            {panchayath?.panchayathName || "—"}
                            {ward?.wardName ? ` · ${ward.wardName}` : ""}
                            {ward?.wardNumber ? ` (#${ward.wardNumber})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className={styles.address}>{u.userAddress || "—"}</td>
                      <td className="cc-td-actions">
                        <button
                          type="button"
                          className="cc-btn cc-btn--sm cc-btn--danger"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u._id}
                        >
                          <FiTrash2 /> {deletingId === u._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Userlist;
