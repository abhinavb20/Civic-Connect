import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiInbox,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import Avatar from "../../../ui/Avatar";
import EmptyState from "../../../ui/EmptyState";
import Lightbox from "../../../ui/Lightbox";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatusPill from "../../../ui/StatusPill";
import { useToast } from "../../../ui/Toast";
import styles from "./ViewComplaint.module.css";

const STATUS_OPTIONS = ["Submitted", "Verified", "In Progress", "Resolved", "Closed", "Rejected"];
const OPEN_STATUSES = ["Submitted", "Verified", "In Progress"];
const PAGE_SIZE = 15;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [preview, setPreview] = useState(null);

  const toast = useToast();

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/complaints");
      setComplaints(res.data?.data || []);
    } catch {
      setError("We couldn't load the complaint registry. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, filter]);

  const updateStatus = async (item, status) => {
    if (status === item.complaintStatus) return;
    const previous = item.complaintStatus;
    setSavingId(item._id);
    setComplaints((prev) =>
      prev.map((c) => (c._id === item._id ? { ...c, complaintStatus: status } : c))
    );
    try {
      await api.put(`/complaint/${item._id}/status`, { status });
      toast.success(
        "Status updated",
        `${item.complaintTitle} is now marked ${status.toLowerCase()}.`
      );
    } catch {
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === item._id ? { ...c, complaintStatus: previous || "Submitted" } : c
        )
      );
      toast.error("Couldn't update status", "Please try again in a moment.");
    } finally {
      setSavingId(null);
    }
  };

  const counts = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => OPEN_STATUSES.includes(c.complaintStatus)).length;
    const resolved = complaints.filter((c) => c.complaintStatus === "Resolved").length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, open, resolved, rate };
  }, [complaints]);

  const availableStatuses = useMemo(() => {
    const present = new Set(
      complaints.map((c) => c.complaintStatus).filter((s) => STATUS_OPTIONS.includes(s))
    );
    return ["All", ...STATUS_OPTIONS.filter((s) => present.has(s))];
  }, [complaints]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesFilter = filter === "All" || c.complaintStatus === filter;
      const matchesQuery =
        !q ||
        c.complaintTitle?.toLowerCase().includes(q) ||
        c.complaintContent?.toLowerCase().includes(q) ||
        c.userId?.userName?.toLowerCase().includes(q) ||
        c.panchayathId?.panchayathName?.toLowerCase().includes(q) ||
        c.wardId?.wardName?.toLowerCase().includes(q) ||
        c.departmentId?.departmentName?.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [complaints, filter, query]);

  const visible = filtered.slice(0, limit);

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Oversight"
        title="Complaint registry"
        description="Every report filed across the platform. Use this read-only view to audit how authorities are responding, and unblock cases when needed."
        actions={
          <button
            type="button"
            className="cc-btn cc-btn--secondary"
            onClick={loadComplaints}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spin : ""} /> Refresh
          </button>
        }
        meta={
          <>
            <span className="cc-badge cc-badge--brand">{counts.total} total</span>
            <span className="cc-badge cc-badge--amber">{counts.open} open</span>
          </>
        }
      />

      {error && (
        <div className="cc-note cc-note--rose" style={{ marginBottom: 20 }} role="alert">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryIcon}>
            <FiFileText />
          </span>
          <div>
            <strong>{counts.total}</strong>
            <span>All submissions</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.amber}`}>
            <FiClock />
          </span>
          <div>
            <strong>{counts.open}</strong>
            <span>Awaiting resolution</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.green}`}>
            <FiCheckCircle />
          </span>
          <div>
            <strong>{counts.resolved}</strong>
            <span>Resolved</span>
          </div>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryIcon} ${styles.teal}`}>
            <FiTrendingUp />
          </span>
          <div>
            <strong>{counts.rate}%</strong>
            <span>Resolution rate</span>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className="cc-search">
          <FiSearch />
          <input
            type="search"
            placeholder="Search complaint, citizen, ward, or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search complaints"
          />
        </div>
        <div className={styles.filters}>
          {availableStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`cc-chip ${filter === status ? "is-active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
              {status !== "All" && (
                <span className="cc-chip-count">
                  {complaints.filter((c) => c.complaintStatus === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading the complaint registry" rows={3} />
      ) : filtered.length === 0 ? (
        <div className="cc-card">
          <EmptyState
            icon={FiInbox}
            title={complaints.length === 0 ? "No complaints yet" : "No matching complaints"}
            description={
              complaints.length === 0
                ? "When citizens file reports, they will appear here for platform-wide oversight."
                : "Try a different search term or status filter."
            }
            action={
              complaints.length > 0 ? (
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={`cc-table ${styles.table}`}>
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Complaint</th>
                    <th>Jurisdiction</th>
                    <th>Evidence</th>
                    <th>Status</th>
                    <th style={{ width: 48 }} aria-label="Expand" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const isOpen = Boolean(expanded[item._id]);
                    const photos = item.complaintPhotos || [];
                    return (
                      <React.Fragment key={item._id}>
                        <tr className={isOpen ? styles.openRow : ""}>
                          <td>
                            <div className={styles.person}>
                              <Avatar name={item.userId?.userName} size="sm" />
                              <strong>{item.userId?.userName || "Anonymous"}</strong>
                            </div>
                          </td>
                          <td className={styles.complaintCell}>
                            <strong>{item.complaintTitle}</strong>
                            <span>{item.departmentId?.departmentName || "General"}</span>
                          </td>
                          <td>
                            <div className={styles.jurisdiction}>
                              <span>
                                <FiMapPin />
                                {item.panchayathId?.panchayathName || "—"}
                              </span>
                              <span>
                                {item.wardId?.wardName || "—"}
                                {item.wardId?.wardNumber ? ` · #${item.wardId.wardNumber}` : ""}
                              </span>
                            </div>
                          </td>
                          <td>
                            {photos.length > 0 ? (
                              <div className={styles.thumbs}>
                                {photos.slice(0, 2).map((img, i) => (
                                  <button
                                    key={`${item._id}-thumb-${i}`}
                                    type="button"
                                    className={styles.thumb}
                                    onClick={() =>
                                      setPreview({ src: fileUrl(img), caption: item.complaintTitle })
                                    }
                                    aria-label={`View evidence ${i + 1} for ${item.complaintTitle}`}
                                  >
                                    <img src={fileUrl(img)} alt="" loading="lazy" />
                                  </button>
                                ))}
                                {photos.length > 2 && (
                                  <span className={styles.moreCount}>+{photos.length - 2}</span>
                                )}
                              </div>
                            ) : (
                              <span className={styles.noMedia}>None</span>
                            )}
                          </td>
                          <td>
                            <select
                              className={`cc-select ${styles.statusSelect}`}
                              value={item.complaintStatus || "Submitted"}
                              onChange={(e) => updateStatus(item, e.target.value)}
                              disabled={savingId === item._id}
                              aria-label={`Status for ${item.complaintTitle}`}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.expandBtn}
                              onClick={() =>
                                setExpanded((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
                              }
                              aria-expanded={isOpen}
                              aria-label={
                                isOpen
                                  ? `Hide details for ${item.complaintTitle}`
                                  : `Show details for ${item.complaintTitle}`
                              }
                            >
                              <FiChevronDown className={isOpen ? styles.chevronUp : ""} />
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className={styles.detailRow}>
                            <td colSpan={6}>
                              <div className={styles.detail}>
                                <div className={styles.detailMain}>
                                  <h4>Full report</h4>
                                  <p>
                                    {item.complaintContent ||
                                      "No additional description was provided."}
                                  </p>

                                  {photos.length > 0 && (
                                    <div className={styles.detailGallery}>
                                      {photos.map((img, i) => (
                                        <button
                                          key={`${item._id}-detail-${i}`}
                                          type="button"
                                          className={styles.detailThumb}
                                          onClick={() =>
                                            setPreview({
                                              src: fileUrl(img),
                                              caption: `${item.complaintTitle} — evidence ${i + 1}`,
                                            })
                                          }
                                        >
                                          <img
                                            src={fileUrl(img)}
                                            alt={`Evidence ${i + 1}`}
                                            loading="lazy"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <aside className={styles.detailSide}>
                                  <div className={styles.detailMeta}>
                                    <span>
                                      <FiMapPin />{" "}
                                      {[
                                        item.panchayathId?.panchayathName,
                                        item.wardId?.wardName,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ") || "Jurisdiction unavailable"}
                                    </span>
                                    <span>
                                      <FiFileText />{" "}
                                      {item.departmentId?.departmentName || "General"}
                                    </span>
                                    <span>
                                      <FiCalendar /> Filed {formatDate(item.createdAt)}
                                    </span>
                                  </div>
                                  <div className={styles.detailStatus}>
                                    <span>Current status</span>
                                    <StatusPill status={item.complaintStatus || "Submitted"} />
                                  </div>
                                  <code className={styles.idChip}>#{item._id.slice(-8)}</code>
                                </aside>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.footer}>
            <span className={styles.footerText}>
              Showing {visible.length} of {filtered.length}
              {filtered.length !== complaints.length ? ` (filtered from ${complaints.length})` : ""}
            </span>
            {limit < filtered.length && (
              <button
                type="button"
                className="cc-btn cc-btn--secondary cc-btn--sm"
                onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              >
                Load more
              </button>
            )}
          </div>
        </>
      )}

      <Lightbox
        src={preview?.src}
        caption={preview?.caption}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default ViewComplaint;
