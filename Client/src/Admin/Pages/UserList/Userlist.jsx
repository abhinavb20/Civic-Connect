import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "./Userlist.module.css";

const Userlist = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/users");
      const sorted = (res.data.users || []).sort((a, b) =>
        (a.userName || "").localeCompare(b.userName || "")
      );
      setUsers(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className={style.page}>
        <div className={style.wrapper}>
          <div className={style.loadingCard}>Synchronizing Citizen Data...</div>
        </div>
      </div>
    );
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/users/${id}`);

      // remove user from UI instantly
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Community Intelligence</span>
          <h2 className={style.title}>Citizen Registry</h2>
          <p className={style.subtitle}>
            A comprehensive directory of residents registered within the Civic Connect ecosystem.
          </p>
        </div>

        <div className={style.summaryCard}>
          <div className={style.summaryItem}>
            <h4>Verified Residents</h4>
            <span>{users.length}</span>
          </div>
        </div>

        <div className={style.tableCard}>
          <div className={style.tableHeader}>
            <h3 className={style.sectionTitle}>Identity Records</h3>
            <span className={style.countBadge}>{users.length} Total Users</span>
          </div>

          <div className={style.tableWrapper}>
            <table className={style.userTable}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th style={{ width: "100px" }}>Profile</th>
                  <th>Legal Name</th>
                  <th>Communication</th>
                  <th>District&Panchayath</th>
                  <th>Ward Details</th>
                  <th>Residential Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((item, index) => (
                    <tr key={item._id}>
                      <td>{(index + 1).toString().padStart(2, '0')}</td>
                      <td>
                        {item.userPhoto ? (
                          <img
                            src={`http://localhost:5000${item.userPhoto}`}
                            alt={item.userName}
                            className={style.userPhoto}
                          />
                        ) : (
                          <div className={style.noPhoto}>No Photo</div>
                        )}
                      </td>
                      <td className={style.userName}>{item.userName}</td>
                      <td>
                        <div className={style.contactBox}>
                          <div className={style.emailText}>{item.userEmail}</div>
                          <div className={style.phoneText}>{item.userContact}</div>
                        </div>
                      </td>
                      <td>
                        <div className={style.jurisdictionSub}>{item.wardId?.panchayathId?.districtId?.districtName || "—"}</div>
                        <div className={style.jurisdictionMain}>{item.wardId?.panchayathId?.panchayathName || "—"}</div>
                      </td>
                      <td>
                        <div className={style.wardName}>{item.wardId?.wardName || "—"}</div>
                        <div className={style.wardSector}>Sector {item.wardId?.wardNumber || "-"}</div>
                      </td>
                      <td className={style.address}>{item.userAddress}</td>
                      <td>
                        <button
                          className={style.deleteBtn}
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className={style.emptyState}>
                      The citizen directory is currently empty.
                    </td>
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

export default Userlist;