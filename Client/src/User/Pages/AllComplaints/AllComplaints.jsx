import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiInbox,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiThumbsUp,
} from "react-icons/fi";
import { api, fileUrl } from "../../../api";
import EmptyState from "../../../ui/EmptyState";
import Lightbox from "../../../ui/Lightbox";
import PageLoader from "../../../ui/PageLoader";
import StatusPill from "../../../ui/StatusPill";
import { useToast } from "../../../ui/Toast";
import styles from "./AllComplaints.module.css";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [previewImage, setPreviewImage] = useState(null);

  const toast = useToast();
  const currentUserId = sessionStorage.getItem("userId");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, voteRes] = await Promise.all([
        api.get("/allcomplaints"),
        api.get("/complaints/all-votes"),
      ]);

      const list = compRes.data?.data || [];
      const voteMap = {};
      (voteRes.data?.data || []).forEach((v) => {
        voteMap[v._id] = v.totalVotes;
      });

      let userVoteMap = {};
      if (currentUserId && list.length > 0) {
        const checks = await Promise.all(
          list.map((c) =>
            api
              .get(`/complaint/${c._id}/support/check/${currentUserId}`)
              .catch(() => ({ data: { supported: false } }))
          )
        );
        list.forEach((c, i) => {
          userVoteMap[c._id] = Boolean(checks[i]?.data?.supported);
        });
      }

      setComplaints(list);
      setVotes(voteMap);
      setUserVotes(userVoteMap);
    } catch {
      setError("The community feed couldn't be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSupport = async (id) => {
    if (!currentUserId) return;
    try {
      await api.post(`/complaint/${id}/support`, { userId: currentUserId });
      setVotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setUserVotes((prev) => ({ ...prev, [id]: true }));
      toast.success("Endorsement added", "This issue now ranks higher for the ward.");
    } catch (err) {
      if (err.response?.status === 400) {
        setUserVotes((prev) => ({ ...prev, [id]: true }));
        toast.info("Already endorsed", "You have already supported this issue.");
      } else {
        toast.error("Couldn't endorse", "Please try again in a moment.");
      }
    }
  };

  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(complaints.map((c) => c.complaintStatus || "Submitted")))],
    [complaints]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesStatus = status === "All" || (c.complaintStatus || "Submitted") === status;
      const matchesQuery =
        !q ||
        c.complaintTitle?.toLowerCase().includes(q) ||
        c.complaintContent?.toLowerCase().includes(q) ||
        c.departmentId?.departmentName?.toLowerCase().includes(q) ||
        c.wardId?.wardName?.toLowerCase().includes(q) ||
        c.userId?.userName?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [complaints, query, status]);

  const totalEndorsements = useMemo(
    () => Object.values(votes).reduce((sum, n) => sum + (Number(n) || 0), 0),
    [votes]
  );

  return (
    <div className="cc-page">
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="cc-eyebrow">Community hub</span>
          <h1 className={styles.title}>Issues your neighbours care about.</h1>
          <p className={styles.subtitle}>
            Support the reports that matter to your area. Endorsements help ward
            authorities see shared priorities across the community.
          </p>
        </div>
        <div className={styles.heroStats}>
          <div>
            <strong>{complaints.length}</strong>
            <span>Community reports</span>
          </div>
          <div>
            <strong>{totalEndorsements}</strong>
            <span>Endorsements</span>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className="cc-search">
          <FiSearch />
          <input
            type="search"
            placeholder="Search by issue, ward, or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search community reports"
          />
        </div>
        <div className={styles.filters}>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`cc-chip ${status === s ? "is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <Link to="/user/complaint" className="cc-btn cc-btn--primary cc-btn--sm">
          <FiPlus /> Report an issue
        </Link>
      </div>

      {error && (
        <div className="cc-note cc-note--rose" style={{ marginBottom: 18 }}>
          <FiAlertCircle /> {error}
          <button
            type="button"
            className="cc-btn cc-btn--secondary cc-btn--sm"
            style={{ marginLeft: "auto" }}
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <PageLoader label="Loading the community feed" rows={3} />
      ) : visible.length === 0 ? (
        <div className="cc-card">
          <EmptyState
            icon={FiInbox}
            title={complaints.length === 0 ? "The community feed is empty" : "No matching reports"}
            description={
              complaints.length === 0
                ? "Once citizens start filing reports, they will appear here for the community to support."
                : "Try a different search term or status filter."
            }
            action={
              complaints.length === 0 ? (
                <Link to="/user/complaint" className="cc-btn cc-btn--primary">
                  <FiPlus /> File the first report
                </Link>
              ) : (
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={() => {
                    setQuery("");
                    setStatus("All");
                  }}
                >
                  Clear filters
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((item) => {
            const supported = userVotes[item._id];
            const image = item.complaintPhotos?.[0];
            return (
              <article key={item._id} className={styles.card}>
                <div className={styles.media}>
                  {image ? (
                    <button
                      type="button"
                      className={styles.mediaBtn}
                      onClick={() =>
                        setPreviewImage({ src: fileUrl(image), caption: item.complaintTitle })
                      }
                    >
                      <img src={fileUrl(image)} alt={item.complaintTitle} loading="lazy" />
                    </button>
                  ) : (
                    <div className={styles.mediaEmpty}>
                      <FiImage />
                      <span>No photo evidence</span>
                    </div>
                  )}
                  <span className={styles.mediaStatus}>
                    <StatusPill status={item.complaintStatus || "Submitted"} />
                  </span>
                </div>

                <div className={styles.body}>
                  <h3 className={styles.cardTitle}>{item.complaintTitle}</h3>
                  <p className={styles.cardText}>{item.complaintContent}</p>

                  <div className={styles.metaRows}>
                    <span>
                      <FiMapPin /> {item.wardId?.wardName || "Ward not set"}
                    </span>
                    <span className={styles.metaTag}>
                      {item.departmentId?.departmentName || "General"}
                    </span>
                  </div>

                  <div className={styles.cardFoot}>
                    <span className={styles.author}>
                      {item.userId?.userName || "Anonymous citizen"}
                    </span>
                    <button
                      type="button"
                      className={`cc-btn cc-btn--sm ${
                        supported ? "cc-btn--soft" : "cc-btn--secondary"
                      }`}
                      onClick={() => handleSupport(item._id)}
                      disabled={supported}
                    >
                      {supported ? <FiCheckCircle /> : <FiThumbsUp />}
                      {votes[item._id] || 0}
                      <span className={styles.supportLabel}>
                        {supported ? "Supported" : "Support"}
                      </span>
                    </button>
                  </div>
                </div>
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

export default AllComplaints;
