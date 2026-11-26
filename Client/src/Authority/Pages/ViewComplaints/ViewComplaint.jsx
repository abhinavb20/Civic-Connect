import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiImage,
  FiInbox,
  FiMapPin,
  FiMessageSquare,
  FiPaperclip,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiThumbsUp,
  FiX,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import Lightbox from "../../../ui/Lightbox";
import PageHeader from "../../../ui/PageHeader";
import PageLoader from "../../../ui/PageLoader";
import StatusPill from "../../../ui/StatusPill";
import { useToast } from "../../../ui/Toast";
import styles from "./ViewComplaint.module.css";

const STATUS_OPTIONS = ["Submitted", "Verified", "In Progress", "Resolved", "Closed", "Rejected"];
const PREVIEW_LENGTH = 180;

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Open");

  const [statusInputs, setStatusInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyPhotos, setReplyPhotos] = useState({});
  const [expanded, setExpanded] = useState({});
  const [openEditor, setOpenEditor] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fileRefs = useRef({});
  const toast = useToast();

  const loadComplaints = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const authorityId = sessionStorage.getItem("authorityId");
      if (!authorityId) return;
      const authRes = await api.get(`/authority/${authorityId}`);
      const panchayathId = authRes.data?.panchayathId?._id;
      if (!panchayathId) {
        setError(
          "Your account isn't linked to a panchayath yet. An administrator needs to assign one before complaints can appear."
        );
        return;
      }
      const res = await api.get(`/complaintByPanchayath/${panchayathId}`);
      const list = res.data?.data || [];
      setComplaints(list);
      setStatusInputs((prev) => {
        const next = { ...prev };
        list.forEach((c) => {
          if (!next[c._id]) next[c._id] = c.complaintStatus || "Submitted";
        });
        return next;
      });
    } catch {
      setError("We couldn't load the complaint queue. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const updateComplaint = async (item) => {
    const status = statusInputs[item._id] || item.complaintStatus;
    const reply = replyInputs[item._id];
    const photo = replyPhotos[item._id];

    if (status === item.complaintStatus && !reply?.trim() && !photo) {
      toast.info("Nothing to update", "Change the status or add an official response first.");
      return;
    }

    setSavingId(item._id);
    try {
      if (status && status !== item.complaintStatus) {
        await api.put(`/complaint/${item._id}/status`, { status });
      }
      if (reply?.trim() || photo) {
        const formData = new FormData();
        formData.append("authorityId", sessionStorage.getItem("authorityId"));
        formData.append("text", reply?.trim() || "Status updated by the ward authority.");
        if (photo) formData.append("photo", photo);
        await api.post(`/complaint/${item._id}/reply`, formData);
      }

      toast.success("Case updated", "The citizen will see your update immediately.");
      setReplyInputs((prev) => ({ ...prev, [item._id]: "" }));
      setReplyPhotos((prev) => ({ ...prev, [item._id]: null }));
      if (fileRefs.current[item._id]) fileRefs.current[item._id].value = "";
      setOpenEditor((prev) => ({ ...prev, [item._id]: false }));
      await loadComplaints();
    } catch {
      toast.error("Update failed", "Please check your connection and try again.");
    } finally {
      setSavingId(null);
    }
  };

  const statuses = useMemo(() => {
    const unique = Array.from(
      new Set(complaints.map((c) => c.complaintStatus || "Submitted"))
    );
    return ["All", "Open", ...unique.filter((s) => s !== "Open")];
  }, [complaints]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const status = c.complaintStatus || "Submitted";
      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Open"
            ? ["Submitted", "Verified", "In Progress"].includes(status)
            : status === filter;
      const matchesQuery =
        !q ||
        c.complaintTitle?.toLowerCase().includes(q) ||
        c.complaintContent?.toLowerCase().includes(q) ||
        c.userId?.userName?.toLowerCase().includes(q) ||
        c.wardId?.wardName?.toLowerCase().includes(q) ||
        c.departmentId?.departmentName?.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [complaints, filter, query]);

  const openCount = complaints.filter((c) =>
    ["Submitted", "Verified", "In Progress"].includes(c.complaintStatus)
  ).length;

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Complaint queue"
        title="Resolve what your ward reported."
        description="Review complaints raised in your panchayath, publish official responses, and move each case through to resolution."
        actions={
          <button
            type="button"
            className="cc-btn cc-btn--secondary"
            onClick={loadComplaints}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spin : ""} /> Refresh queue
          </button>
        }
        meta={
          <>
            <span className="cc-badge cc-badge--brand">{complaints.length} total</span>
            <span className="cc-badge cc-badge--amber">{openCount} open</span>
          </>
        }
      />

      {error && (
        <div className="cc-note cc-note--amber" style={{ marginBottom: 18 }} role="alert">
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className="cc-search">
          <FiSearch />
          <input
            type="search"
            placeholder="Search by title, citizen, ward, or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search complaints"
          />
        </div>
        <div className={styles.filters}>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`cc-chip ${filter === s ? "is-active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading the complaint queue" rows={3} />
      ) : visible.length === 0 ? (
        <div className="cc-card">
          <EmptyState
            icon={FiInbox}
            title={complaints.length === 0 ? "The queue is clear" : "No matching complaints"}
            description={
              complaints.length === 0
                ? "New citizen reports will appear here as soon as they are filed in your panchayath."
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
        <div className={styles.list}>
          {visible.map((item) => {
            const content = item.complaintContent || "";
            const isLong = content.length > PREVIEW_LENGTH;
            const isExpanded = Boolean(expanded[item._id]);
            const editorOpen = Boolean(openEditor[item._id]);
            const status = statusInputs[item._id] || item.complaintStatus || "Submitted";
            const saving = savingId === item._id;

            return (
              <article key={item._id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.headMain}>
                    <div className={styles.titleRow}>
                      <h3>{item.complaintTitle}</h3>
                      <StatusPill status={item.complaintStatus || "Submitted"} />
                    </div>
                    <div className={styles.meta}>
                      <span>
                        <FiMapPin />
                        {item.wardId?.wardName || "Ward"}
                        {item.wardId?.wardNumber ? ` · ${item.wardId.wardNumber}` : ""}
                      </span>
                      <span className={styles.metaTag}>
                        {item.departmentId?.departmentName || "General"}
                      </span>
                      <span className={styles.metaPlain}>
                        {item.userId?.userName || "Anonymous citizen"}
                      </span>
                      <span className={styles.supportPill}>
                        <FiThumbsUp /> {item.supportCount || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`cc-btn cc-btn--sm ${
                      editorOpen ? "cc-btn--soft" : "cc-btn--primary"
                    }`}
                    onClick={() =>
                      setOpenEditor((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
                    }
                  >
                    <FiMessageSquare /> {editorOpen ? "Close editor" : "Respond"}
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.content}>
                    {isLong && !isExpanded ? `${content.slice(0, PREVIEW_LENGTH)}…` : content}
                  </p>
                  {isLong && (
                    <button
                      type="button"
                      className={styles.readMore}
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [item._id]: !prev[item._id] }))
                      }
                    >
                      {isExpanded ? "Show less" : "Read full report"}
                      <FiChevronDown className={isExpanded ? styles.chevronUp : ""} />
                    </button>
                  )}

                  {item.complaintPhotos?.length > 0 && (
                    <div className={styles.thumbs}>
                      {item.complaintPhotos.map((img, i) => (
                        <button
                          key={`${item._id}-img-${i}`}
                          type="button"
                          className={styles.thumb}
                          onClick={() =>
                            setPreviewImage({ src: fileUrl(img), caption: item.complaintTitle })
                          }
                        >
                          <img src={fileUrl(img)} alt={`Evidence ${i + 1}`} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {editorOpen && (
                  <div className={styles.editor}>
                    <div className={styles.editorRow}>
                      <div className="cc-field">
                        <label className="cc-label" htmlFor={`status-${item._id}`}>
                          Update status
                        </label>
                        <select
                          id={`status-${item._id}`}
                          className="cc-select"
                          value={status}
                          onChange={(e) =>
                            setStatusInputs((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="cc-field">
                        <label className="cc-label">
                          Attach evidence <span className={styles.optional}>(optional)</span>
                        </label>
                        <input
                          ref={(node) => {
                            fileRefs.current[item._id] = node;
                          }}
                          id={`photo-${item._id}`}
                          type="file"
                          accept="image/*"
                          className="cc-sr-only"
                          onChange={(e) =>
                            setReplyPhotos((prev) => ({
                              ...prev,
                              [item._id]: e.target.files?.[0] || null,
                            }))
                          }
                        />
                        <label htmlFor={`photo-${item._id}`} className={styles.attach}>
                          <FiPaperclip />
                          {replyPhotos[item._id] ? replyPhotos[item._id].name : "Choose a photo"}
                        </label>
                      </div>
                    </div>

                    <div className="cc-field">
                      <label className="cc-label" htmlFor={`reply-${item._id}`}>
                        Official response
                      </label>
                      <textarea
                        id={`reply-${item._id}`}
                        className="cc-textarea"
                        rows={3}
                        placeholder="Tell the citizen what has been done, what happens next, and any timeline."
                        value={replyInputs[item._id] || ""}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                      />
                    </div>

                    <div className={styles.editorFoot}>
                      <div className={styles.editorHint}>
                        <FiClock />
                        <span>Updates are visible to the citizen immediately.</span>
                      </div>
                      <div className={styles.editorActions}>
                        <button
                          type="button"
                          className="cc-btn cc-btn--ghost cc-btn--sm"
                          onClick={() =>
                            setOpenEditor((prev) => ({ ...prev, [item._id]: false }))
                          }
                        >
                          <FiX /> Cancel
                        </button>
                        <button
                          type="button"
                          className="cc-btn cc-btn--primary cc-btn--sm"
                          onClick={() => updateComplaint(item)}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className={styles.spinner} aria-hidden="true" /> Saving…
                            </>
                          ) : (
                            <>
                              <FiSend /> Publish update
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Lightbox
        src={previewImage?.src}
        caption={previewImage?.caption}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ViewComplaint;
