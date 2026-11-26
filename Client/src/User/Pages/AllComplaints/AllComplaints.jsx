import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiThumbsUp } from 'react-icons/fi';
import styles from "./AllComplaints.module.css";

const AllComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [votes, setVotes] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null); // NEW

    const currentUserId = sessionStorage.getItem("userId");

    const fetchData = async () => {
        try {
            const compRes = await axios.get('http://localhost:5000/allcomplaints');
            const voteRes = await axios.get('http://localhost:5000/complaints/all-votes');

            const voteMap = {};
            voteRes.data.data.forEach(v => {
                voteMap[v._id] = v.totalVotes;
            });

            const userVoteMap = {};
            if (currentUserId) {
                await Promise.all(
                    compRes.data.data.map(async (c) => {
                        const check = await axios.get(
                            `http://localhost:5000/complaint/${c._id}/support/check/${currentUserId}`
                        );
                        userVoteMap[c._id] = check.data.supported;
                    })
                );
            }

            setComplaints(compRes.data.data);
            setVotes(voteMap);
            setUserVotes(userVoteMap);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUserId]);

    const handleSupport = async (id) => {
        if (!currentUserId) return alert("Please login");

        try {
            await axios.post(`http://localhost:5000/complaint/${id}/support`, {
                userId: currentUserId
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || "Error");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.goldSpinner}></div>
                <p>Curating Community Feed...</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <span className={styles.badge}>Live Petitions</span>
                <h2 className={styles.title}>Community <span>Hub</span></h2>
                <p className={styles.subtitle}>Join forces with fellow citizens to amplify local concerns.</p>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Originator</th>
                            <th>Incident Detail</th>
                            <th>Jurisdiction</th>
                            <th>Image</th> {/* NEW */}
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {complaints.map((item) => (
                            <tr key={item._id} className={styles.tr}>
                                <td className={styles.userCell}>
                                    <div className={styles.userName}>
                                        {item.userId?.userName || "Anonymous"}
                                    </div>
                                    <div className={styles.wardLabel}>
                                        Ward: {item.wardId?.wardName}
                                    </div>
                                </td>

                                <td className={styles.contentCell}>
                                    <div className={styles.complaintTitle}>
                                        {item.complaintTitle}
                                    </div>
                                    <div className={styles.complaintContent}>
                                        {item.complaintContent}
                                    </div>
                                    <span className={styles.deptTag}>
                                        {item.departmentId?.departmentName}
                                    </span>
                                </td>

                                <td className={styles.locationCell}>
                                    {item.wardId?.wardName}
                                </td>

                                {/* IMAGE COLUMN */}
                                <td>
                                    {item.complaintPhotos && item.complaintPhotos.length > 0 ? (
                                        item.complaintPhotos.map((img, i) => (
                                            <img
                                                key={i}
                                                src={`http://localhost:5000${img}`}
                                                alt="complaint"
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    marginRight: "5px"
                                                }}
                                                onClick={() =>
                                                    setPreviewImage(`http://localhost:5000${img}`)
                                                }
                                            />
                                        ))
                                    ) : (
                                        "No Image"
                                    )}
                                </td>

                                <td className={styles.actionCell}>
                                    <div className={styles.supportBox}>
                                        <button
                                            onClick={() => handleSupport(item._id)}
                                            disabled={userVotes[item._id]}
                                            className={`${styles.button} ${userVotes[item._id] ? styles.disabledBtn : styles.activeBtn
                                                }`}
                                        >
                                            {userVotes[item._id] ? (
                                                <><FiCheckCircle /> Supported</>
                                            ) : (
                                                <><FiThumbsUp /> Support</>
                                            )}
                                        </button>
                                        <div className={styles.voteCount}>
                                            <span className={styles.countNumber}>{votes[item._id] || 0}</span>
                                            <span className={styles.countLabel}>Endorsements</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* IMAGE PREVIEW MODAL */}
            {previewImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.85)",
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
                            objectFit: "contain",   // keeps full image visible
                            borderRadius: "10px"
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default AllComplaints;