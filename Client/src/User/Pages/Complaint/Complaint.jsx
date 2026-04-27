import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSend, FiPlus, FiImage, FiClock, FiCheckCircle } from "react-icons/fi";
import style from "./Complaint.module.css";

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [votes, setVotes] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [replies, setReplies] = useState({});

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  const [previewImage, setPreviewImage] = useState(null); // NEW

  const userId = sessionStorage.getItem("userId");

  const loadData = async () => {
    try {
      const depRes = await axios.get("http://localhost:5000/department");
      setDepartments(depRes.data.departmentData || []);

      if (userId) {
        const compRes = await axios.get(
          `http://localhost:5000/complaintByUser/${userId}`
        );
        const list = compRes.data.data || [];
        setComplaints(list);

        const voteRes = await axios.get("http://localhost:5000/complaints/all-votes");
        const voteMap = {};
        (voteRes.data.data || []).forEach((v) => {
          voteMap[v._id] = v.totalVotes;
        });
        setVotes(voteMap);

        const userVoteMap = {};
        const replyMap = {};

        await Promise.all(
          list.map(async (c) => {
            const [voteCheck, replyCheck] = await Promise.all([
              axios.get(
                `http://localhost:5000/complaint/${c._id}/support/check/${userId}`
              ),
              axios.get(`http://localhost:5000/complaint/${c._id}/replies`),
            ]);

            userVoteMap[c._id] = voteCheck.data.supported;
            replyMap[c._id] = replyCheck.data.replies || [];
          })
        );

        setUserVotes(userVoteMap);
        setReplies(replyMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "A title is required";
    if (!content.trim()) newErrors.content = "Please provide details";
    if (!departmentId) newErrors.department = "Select a department";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    fd.append("userId", userId);
    fd.append("departmentId", departmentId);
    fd.append("title", title);
    fd.append("content", content);

    photos.forEach((file) => {
      fd.append("photos", file);
    });

    try {
      await axios.post("http://localhost:5000/complaint", fd);
      alert("Submission successful.");

      setTitle("");
      setContent("");
      setDepartmentId("");
      setPhotos([]);
      setErrors({});

      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    }
  };

  const handleSupport = async (id) => {
    try {
      await axios.post(`http://localhost:5000/complaint/${id}/support`, { userId });

      setVotes((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));

      setUserVotes((prev) => ({
        ...prev,
        [id]: true,
      }));
    } catch (err) {
      console.error(err);

      if (err.response?.status === 400) {
        alert("You already supported this issue.");
      }
    }
  };

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Concierge Desk</span>
          <h2 className={style.title}>
            Report <span>Local Concerns</span>
          </h2>
          <p className={style.subtitle}>
            File high-priority reports directly to the relevant municipal departments.
          </p>
        </header>

        <section className={style.formCard}>
          <div className={style.formHeader}>
            <FiPlus className={style.formIcon} />
            <h3>New Filing</h3>
          </div>

          <div className={style.formGrid}>
            <div className={style.field}>
              <label>Issue Title</label>
              <input
                type="text"
                placeholder="Brief summary..."
                className={errors.title ? style.inputError : style.input}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
              />
              {errors.title && <span className={style.error}>{errors.title}</span>}
            </div>

            <div className={style.field}>
              <label>Department</label>
              <select
                className={errors.department ? style.inputError : style.input}
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setErrors((prev) => ({ ...prev, department: "" }));
                }}
              >
                <option value="">Select Category</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className={style.error}>{errors.department}</span>
              )}
            </div>

            <div className={`${style.field} ${style.fullWidth}`}>
              <label>Detailed Description</label>
              <textarea
                rows="4"
                placeholder="Provide specific details and landmarks..."
                className={errors.content ? style.inputError : style.textarea}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors((prev) => ({ ...prev, content: "" }));
                }}
              />
              {errors.content && (
                <span className={style.error}>{errors.content}</span>
              )}
            </div>

            <div className={style.field}>
              <label className={style.fileLabel}>
                <FiImage />{" "}
                {photos.length > 0 ? `${photos.length} Selected` : "Upload Evidence"}
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => setPhotos([...e.target.files])}
                />
              </label>
            </div>

            <div className={style.formActions}>
              <button className={style.primaryBtn} onClick={handleSubmit}>
                <FiSend /> Submit Petition
              </button>
            </div>
          </div>
        </section>

        <section className={style.tableCard}>
          <h3 className={style.sectionTitle}>Your History</h3>
          <div className={style.tableWrapper}>
            <table className={style.table}>
              <thead>
                <tr>
                  <th>Filing Details</th>
                  <th>Official Response</th>
                  <th>Status</th>
                  <th>Support</th>
                </tr>
              </thead>

              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className={style.tableIssue}>
                          <strong>{item.complaintTitle}</strong>
                          <span>{item.departmentId?.departmentName}</span>

                          {item.complaintContent && (
                            <p className={style.contentSnippet}>
                              {item.complaintContent}
                            </p>
                          )}

                          {/* CLICKABLE IMAGES */}
                          {item.complaintPhotos &&
                            item.complaintPhotos.length > 0 &&
                            item.complaintPhotos.map((img, i) => (
                              <img
                                key={i}
                                src={`http://localhost:5000${img}`}
                                alt={`complaint-${i}`}
                                className={style.thumb}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setPreviewImage(`http://localhost:5000${img}`)
                                }
                              />
                            ))}
                        </div>
                      </td>

                      <td>
                        <div className={style.responses}>
                          {replies[item._id]?.length > 0 ? (
                            replies[item._id].map((r, i) => (
                              <div key={i} className={style.replyItem}>
                                <p>{r.replyText}</p>
                                {r.replyPhoto && (
                                  <img
                                    src={`http://localhost:5000${r.replyPhoto}`}
                                    alt={`reply-${i}`}
                                    className={style.thumb}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setPreviewImage(`http://localhost:5000${r.replyPhoto}`)
                                    }
                                  />
                                )}
                              </div>
                            ))
                          ) : (
                            <span className={style.placeholderText}>Pending...</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`${style.statusBadge} ${
                            style[item.complaintStatus?.toLowerCase()]
                          }`}
                        >
                          {item.complaintStatus || "Submitted"}
                        </span>
                      </td>

                      <td>
                        <button
                          className={userVotes[item._id] ? style.voted : style.voteBtn}
                          onClick={() => handleSupport(item._id)}
                          disabled={userVotes[item._id]}
                        >
                          {userVotes[item._id] ? <FiCheckCircle /> : <FiClock />}{" "}
                          {votes[item._id] || 0}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={style.emptyState}>
                      No complaints filed yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            style={{
              width: "95%",
              height: "95%",
              objectFit: "contain"
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Complaint;