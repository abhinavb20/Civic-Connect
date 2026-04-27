import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiImage, FiArrowUpCircle, FiMessageSquare } from "react-icons/fi";
import style from "./ViewComplaint.module.css";

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [expandedComplaints, setExpandedComplaints] = useState({});
  const previewLength = 120;

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const authorityId = sessionStorage.getItem("authorityId");
      const authRes = await axios.get("http://localhost:5000/authority");
      const authority = authRes.data.authorityData.find(a => a._id === authorityId);

      if (authority?.panchayathId?._id) {
        const res = await axios.get(`http://localhost:5000/complaintByPanchayath/${authority.panchayathId._id}`);
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  const toggleComplaintContent = (complaintId) => {
    setExpandedComplaints((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  const updateStatusAndReply = async (complaintId) => {
    try {
      const reply = replyInputs[complaintId];
      const status = statusInputs[complaintId];

      if (status) await axios.put(`http://localhost:5000/complaint/${complaintId}/status`, { status });
      if (reply?.trim()) {
        const formData = new FormData();
        formData.append("authorityId", sessionStorage.getItem("authorityId"));
        formData.append("text", reply);
        await axios.post(`http://localhost:5000/complaint/${complaintId}/reply`, formData);
      }
      alert("System Ledger Updated");
      loadComplaints();
    } catch (err) { alert("Execution Failed"); }
  };

  if (loading) return (
    <div className={style.page}><div className={style.loadingCard}>Inbound Data Stream Decrypting...</div></div>
  );

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Administrative Console</span>
          <h2 className={style.title}>Citizen Insights</h2>
          <p className={style.userName}>Granular oversight of community issues and resolution workflows.</p>
        </div>

        <div className={style.tableWrapper}>
          <table className={style.complaintTable}>
            <thead>
              <tr>
                <th><FiArrowUpCircle style={{marginRight: '5px'}}/> Support</th>
                <th>Location</th>
                <th>Category</th>
                <th>Issue Details</th>
                <th>Evidence</th>
                <th>Resolution Status</th>
                <th style={{ width: '220px' }}><FiMessageSquare style={{marginRight: '5px'}}/> Manage</th>
                <th>Execute</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((item) => {
                  const complaintContent = item.complaintContent || "";
                  const isExpanded = !!expandedComplaints[item._id];
                  const shouldTruncate = complaintContent.length > previewLength;
                  const visibleContent = shouldTruncate && !isExpanded
                    ? `${complaintContent.slice(0, previewLength)}...`
                    : complaintContent;

                  return (
                    <tr key={item._id}>
                    <td>
                      <span className={style.upvoteCount}>{item.supportCount}</span>
                      <br />
                      <span className={style.userName}>{item.userId?.userName}</span>
                    </td>

                    <td>
                      <strong>{item.wardId?.wardName}</strong><br/>
                      <span className={style.userName}>Ward {item.wardId?.wardNumber}</span>
                    </td>

                    <td>
                      <span className={style.badge} style={{fontSize: '0.6rem'}}>{item.departmentId?.departmentName}</span>
                    </td>

                    <td>
                      <div className={style.complaintDetails}>
                        <strong style={{ display: 'block', color: '#fff' }}>{item.complaintTitle}</strong>
                        <span className={style.userName}>{visibleContent}</span>
                        {shouldTruncate && (
                          <button
                            type="button"
                            className={style.readMoreBtn}
                            onClick={() => toggleComplaintContent(item._id)}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className={style.thumbContainer}>
                        {item.complaintPhotos?.length > 0 ? (
                          item.complaintPhotos.slice(0, 2).map((img, i) => (
                            <img
                              key={i}
                              src={`http://localhost:5000${img}`}
                              className={style.thumbnail}
                              alt="Evidence"
                              onClick={() => window.open(`http://localhost:5000${img}`, "_blank")}
                            />
                          ))
                        ) : (
                          <span className={style.userName}><FiImage /> N/A</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span style={{ 
                        color: item.complaintStatus === 'Resolved' ? '#00e676' : 
                               item.complaintStatus === 'Rejected' ? '#ff5252' : '#4da3ff',
                        fontWeight: '700',
                        fontSize: '0.85rem'
                      }}>
                        {item.complaintStatus}
                      </span>
                    </td>

                    <td>
                      <select
                        className={style.statusSelect}
                        value={statusInputs[item._id] || item.complaintStatus}
                        onChange={(e) => setStatusInputs({ ...statusInputs, [item._id]: e.target.value })}
                      >
                        <option>Submitted</option>
                        <option>Verified</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Rejected</option>
                      </select>
                      <textarea
                        placeholder="Log official response..."
                        className={style.replyArea}
                        value={replyInputs[item._id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [item._id]: e.target.value })}
                      />
                    </td>

                    <td>
                      <button className={style.updateBtn} onClick={() => updateStatusAndReply(item._id)}>
                        Update
                      </button>
                    </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className={style.loadingCard}>No active records in registry.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewComplaint;
