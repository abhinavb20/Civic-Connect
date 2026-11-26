import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiInbox,
  FiMessageSquare,
  FiPlus,
  FiSend,
  FiThumbsUp,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import Lightbox from "../../../ui/Lightbox";
import PageHeader from "../../../ui/PageHeader";
import StatusPill from "../../../ui/StatusPill";
import { useToast } from "../../../ui/Toast";
import styles from "./Complaint.module.css";

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState("All");

  const fileRef = useRef(null);
  const toast = useToast();
  const userId = sessionStorage.getItem("userId");

  const photoPreviews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos]
  );

  useEffect(
    () => () => photoPreviews.forEach((p) => URL.revokeObjectURL(p.url)),
    [photoPreviews]
  );

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const depRes = await api.get("/department");
      setDepartments(depRes.data?.departmentData || []);

      if (userId) {
        const compRes = await api.get(`/complaintByUser/${userId}`);
        const list = compRes.data?.data || [];
        setComplaints(list);

        const [voteRes, ...checks] = await Promise.all([
          api.get("/complaints/all-votes"),
          ...list.map((c) =>
            Promise.all([
              api
                .get(`/complaint/${c._id}/support/check/${userId}`)
                .catch(() => ({ data: { supported: false } })),
              api.get(`/complaint/${c._id}/replies`).catch(() => ({ data: { replies: [] } })),
            ])
          ),
        ]);

        const voteMap = {};
        (voteRes.data?.data || []).forEach((v) => {
          voteMap[v._id] = v.totalVotes;
        });

        const userVoteMap = {};
        const replyMap = {};
        list.forEach((c, index) => {
          const [voteCheck, replyCheck] = checks[index] || [];
          userVoteMap[c._id] = Boolean(voteCheck?.data?.supported);
          replyMap[c._id] = replyCheck?.data?.replies || [];
        });

        setVotes(voteMap);
        setUserVotes(userVoteMap);
        setReplies(replyMap);
      }
    } catch {
      setError("We couldn't load your reports. Refresh the page to try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFiles = (fileList) => {
    if (!fileList?.length) return;
    const next = [...photos, ...Array.from(fileList)].slice(0, 5);
    setPhotos(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Give the issue a clear title";
    if (!content.trim()) nextErrors.content = "Describe the issue in detail";
    if (!departmentId) nextErrors.department = "Select the responsible department";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("departmentId", departmentId);
    fd.append("title", title.trim());
    fd.append("content", content.trim());
    photos.forEach((file) => fd.append("photos", file));

    try {
      await api.post("/complaint", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Report submitted", "Your ward authority has been notified.");
      setTitle("");
      setContent("");
      setDepartmentId("");
      setPhotos([]);
      setErrors({});
      await loadData();
    } catch {
      toast.error("Submission failed", "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupport = async (id) => {
    try {
      await api.post(`/complaint/${id}/support`, { userId });
      setVotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setUserVotes((prev) => ({ ...prev, [id]: true }));
      toast.success("Support recorded", "Your endorsement has been added.");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.info("Already supported", "You have already endorsed this report.");
        setUserVotes((prev) => ({ ...prev, [id]: true }));
      } else {
        toast.error("Couldn't endorse", "Please try again in a moment.");
      }
    }
  };

  const filters = useMemo(() => {
    const list = complaints.map((c) => c.complaintStatus || "Submitted");
    return ["All", ...Array.from(new Set(list))];
  }, [complaints]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? complaints
        : complaints.filter((c) => (c.complaintStatus || "Submitted") === filter),
    [complaints, filter]
  );

  return (
    <div className="cc-page">
      <PageHeader
        eyebrow="Report an issue"
        title="Tell us what needs fixing."
        description="File a report with photo evidence. We route it to the department responsible for your ward, then track it with you until it's resolved."
        actions={
          <Link to="/user/allcomplaints" className="cc-btn cc-btn--secondary">
            <FiThumbsUp /> Community hub
          </Link>
        }
      />

      <div className={styles.layout}>
        <form className={`cc-card ${styles.formCard}`} onSubmit={handleSubmit} noValidate>
          <div className="cc-card-head">
            <div>
              <h3>New report</h3>
              <p className={styles.headSub}>Fields marked with an asterisk are required.</p>
            </div>
            <span className={styles.draftBadge}>
              <FiFileText /> Draft
            </span>
          </div>

          <div className="cc-card-body">
            <div className={styles.formGrid}>
              <div className="cc-field">
                <label className="cc-label" htmlFor="complaint-title">
                  Issue title *
                </label>
                <input
                  id="complaint-title"
                  className={`cc-input ${errors.title ? "is-invalid" : ""}`}
                  placeholder="e.g. Broken streetlight near the bus stop"
                  value={title}
                  maxLength={90}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  aria-invalid={Boolean(errors.title)}
                />
                {errors.title ? (
                  <span className="cc-error">{errors.title}</span>
                ) : (
                  <span className="cc-hint">{title.length}/90 characters</span>
                )}
              </div>

              <div className="cc-field">
                <label className="cc-label" htmlFor="complaint-department">
                  Department *
                </label>
                <select
                  id="complaint-department"
                  className={`cc-select ${errors.department ? "is-invalid" : ""}`}
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setErrors((prev) => ({ ...prev, department: "" }));
                  }}
                  aria-invalid={Boolean(errors.department)}
                >
                  <option value="">Select the responsible department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
                {errors.department && <span className="cc-error">{errors.department}</span>}
              </div>

              <div className="cc-field cc-col-span-2">
                <label className="cc-label" htmlFor="complaint-content">
                  Detailed description *
                </label>
                <textarea
                  id="complaint-content"
                  className={`cc-textarea ${errors.content ? "is-invalid" : ""}`}
                  placeholder="Describe the problem, how long it has been there, and any landmarks that help locate it."
                  rows={5}
                  maxLength={1000}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setErrors((prev) => ({ ...prev, content: "" }));
                  }}
                  aria-invalid={Boolean(errors.content)}
                />
                {errors.content ? (
                  <span className="cc-error">{errors.content}</span>
                ) : (
                  <span className="cc-hint">
                    Specific details help field teams resolve issues faster.
                  </span>
                )}
              </div>

              <div className="cc-field cc-col-span-2">
                <label className="cc-label">
                  Photo evidence <span className={styles.optional}>Up to 5 images</span>
                </label>
                <input
                  ref={fileRef}
                  id="complaint-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="cc-sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {photos.length === 0 ? (
                  <label htmlFor="complaint-photos" className="cc-file">
                    <span className="cc-file-icon">
                      <FiImage />
                    </span>
                    <span>
                      <strong>Upload photos of the issue</strong>
                      <span>JPG or PNG. Clear, well-lit photos work best.</span>
                    </span>
                  </label>
                ) : (
                  <div className={styles.photoGrid}>
                    {photoPreviews.map((p, i) => (
                      <div key={p.url} className={styles.photoTile}>
                        <img src={p.url} alt={`Attachment ${i + 1}`} />
                        <button
                          type="button"
                          className={styles.removePhoto}
                          onClick={() => handleRemovePhoto(i)}
                          aria-label={`Remove photo ${i + 1}`}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <label htmlFor="complaint-photos" className={styles.addPhoto}>
                        <FiPlus />
                        <span>Add</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formFoot}>
            <div className={`cc-note ${styles.formNote}`}>
              <FiAlertCircle />
              <span>
                Reports are public to your ward authority and appear in the community hub.
              </span>
            </div>
            <button
              type="submit"
              className="cc-btn cc-btn--primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" /> Submitting…
                </>
              ) : (
                <>
                  <FiSend /> Submit report
                </>
              )}
            </button>
          </div>
        </form>

        <aside className={`cc-card cc-card--pad ${styles.tipsCard}`}>
          <span className={styles.tipsIcon}>
            <FiCheckCircle />
          </span>
          <h3>What makes a good report</h3>
          <ul className={styles.tips}>
            <li>
              <strong>Use a clear title.</strong> Say what is broken and where it is.
            </li>
            <li>
              <strong>Add photos.</strong> Evidence helps the authority verify quickly.
            </li>
            <li>
              <strong>Pick the right department.</strong> It routes your report correctly.
            </li>
            <li>
              <strong>Include landmarks.</strong> This helps field teams find the location.
            </li>
          </ul>
          <div className={styles.tipsFoot}>
            <FiClock />
            <span>Most reports are reviewed within a few working days.</span>
          </div>
        </aside>
      </div>

      <section className="cc-section">
        <div className="cc-section-head">
          <div>
            <h2 className="cc-h3">Your report history</h2>
            <p>Every report you have filed, with the latest official status.</p>
          </div>
          {filters.length > 1 && (
            <div className={styles.filters}>
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`cc-chip ${filter === f ? "is-active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  <span className="cc-chip-count">
                    {f === "All"
                      ? complaints.length
                      : complaints.filter((c) => (c.complaintStatus || "Submitted") === f).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="cc-note cc-note--rose" style={{ marginBottom: 16 }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {loading ? (
          <div className={styles.skeletonList}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={`cc-skeleton ${styles.skeletonRow}`} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="cc-card">
            <EmptyState
              icon={FiInbox}
              title={complaints.length === 0 ? "No reports yet" : "Nothing in this status"}
              description={
                complaints.length === 0
                  ? "Your submitted reports will appear here with their status and official responses."
                  : "Try selecting a different status to see more of your reports."
              }
            />
          </div>
        ) : (
          <div className={styles.reportList}>
            {visible.map((item) => {
              const itemReplies = replies[item._id] || [];
              const thumbs = item.complaintPhotos || [];
              return (
                <article key={item._id} className={`cc-card ${styles.reportCard}`}>
                  <div className={styles.reportHead}>
                    <div className={styles.reportTitleWrap}>
                      <div className={styles.reportTitleRow}>
                        <h3>{item.complaintTitle}</h3>
                        <StatusPill status={item.complaintStatus || "Submitted"} />
                      </div>
                      <div className={styles.reportMeta}>
                        <span>{item.departmentId?.departmentName || "General"}</span>
                        <span className={styles.metaDot} />
                        <span>{item.wardId?.wardName || "Your ward"}</span>
                        {item.createdAt && (
                          <>
                            <span className={styles.metaDot} />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`cc-btn cc-btn--sm ${
                        userVotes[item._id] ? "cc-btn--soft" : "cc-btn--secondary"
                      }`}
                      onClick={() => handleSupport(item._id)}
                      disabled={userVotes[item._id]}
                    >
                      {userVotes[item._id] ? <FiCheckCircle /> : <FiThumbsUp />}
                      {votes[item._id] || 0}
                    </button>
                  </div>

                  <p className={styles.reportContent}>{item.complaintContent}</p>

                  {thumbs.length > 0 && (
                    <div className={styles.reportThumbs}>
                      {thumbs.map((img, i) => (
                        <button
                          key={`${item._id}-${i}`}
                          type="button"
                          className={styles.thumbBtn}
                          onClick={() =>
                            setPreviewImage({
                              src: fileUrl(img),
                              caption: item.complaintTitle,
                            })
                          }
                        >
                          <img src={fileUrl(img)} alt={`Evidence ${i + 1}`} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={styles.replyBlock}>
                    <span className={styles.replyLabel}>
                      <FiMessageSquare /> Official response
                    </span>
                    {itemReplies.length === 0 ? (
                      <p className={styles.replyPending}>
                        Awaiting a response from your ward authority.
                      </p>
                    ) : (
                      <ul className={styles.replies}>
                        {itemReplies.map((r, i) => (
                          <li key={r._id || i}>
                            <div className={styles.replyTop}>
                              <strong>
                                {r.authorityId?.authorityName || "Ward authority"}
                              </strong>
                              {r.createdAt && (
                                <span>
                                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                            <p>{r.replyText}</p>
                            {r.replyPhoto && (
                              <button
                                type="button"
                                className={styles.thumbBtn}
                                onClick={() =>
                                  setPreviewImage({
                                    src: fileUrl(r.replyPhoto),
                                    caption: "Official response evidence",
                                  })
                                }
                              >
                                <img
                                  src={fileUrl(r.replyPhoto)}
                                  alt="Official response evidence"
                                  className={styles.replyImg}
                                  loading="lazy"
                                />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Lightbox
        src={previewImage?.src}
        caption={previewImage?.caption}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default Complaint;
