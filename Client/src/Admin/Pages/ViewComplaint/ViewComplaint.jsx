import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "./ViewComplaint.module.css";

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/admin/complaints");
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/complaint/${id}/status`, {
        status: newStatus,
      });

      // update UI instantly
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, complaintStatus: newStatus } : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  if (loading) {
    return (
      <div className={style.page}>
        <div className={style.wrapper}>
          <div className={style.loadingCard}>SYNCHRONIZING RECORDS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <span className={style.badge}>Administrative Console</span>
          <h2 className={style.title}>Citizen Insights</h2>
          <p className={style.subtitle}>
            A granular oversight of community issues. This portal provides read-only transparency into the resolution workflow managed by local authorities.
          </p>
        </header>

        <section className={style.summaryCard}>
          <div className={style.summaryItem}>
            <h4>Global Submissions</h4>
            <span>{complaints.length}</span>
          </div>
          <div className={style.summaryItem}>
            <h4>Active Resolution Rate</h4>
            <span>{Math.round((complaints.filter(c => c.complaintStatus === 'Resolved').length / complaints.length) * 100 || 0)}%</span>
          </div>
        </section>

        <div className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Complaint Registry</h3>
            <div className={style.countBadge}>{complaints.length} Total Entries</div>
          </div>

          <div className={style.tableWrapper}>
            <table className={style.complaintTable}>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>ID</th>
                  <th>Originator</th>
                  <th>Jurisdiction</th>
                  <th>Category</th>
                  <th>Incident Details</th>
                  <th>Evidence</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((item, index) => (
                    <tr key={item._id}>
                      <td>{(index + 1).toString().padStart(2, '0')}</td>
                      <td className={style.userName}>
                        {item.userId?.userName || "Anonymous"}
                      </td>
                      <td className={style.locationInfo}>
                        <strong>{item.panchayathId?.panchayathName}</strong>
                        <small>{item.wardId?.wardName} (Ward {item.wardId?.wardNumber})</small>
                      </td>
                      <td>{item.departmentId?.departmentName || "General"}</td>
                      <td>
                        <span className={style.complaintTitle}>{item.complaintTitle}</span>
                        <p className={style.complaintContent}>{item.complaintContent}</p>
                      </td>
                      <td>
                        <div className={style.imageGallery}>
                          {item.complaintPhotos?.length > 0 ? (
                            item.complaintPhotos.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={`http://localhost:5000${img}`}
                                className={style.complaintImg}
                                alt="Evidence"
                                onClick={() => window.open(`http://localhost:5000${img}`, "_blank")}
                              />
                            ))
                          ) : (
                            <span style={{ color: "#ccc", fontSize: "0.7rem" }}>NO MEDIA</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <select
                          className={style.statusDropdown}
                          value={item.complaintStatus || "Submitted"}
                          onChange={(e) => updateStatus(item._id, e.target.value)}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Verified">Verified</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={style.emptyState}>No data currently synchronized.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewComplaint;