import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "./Dashboard.module.css";

const AuthorityDashboard = () => {
  const authorityName = sessionStorage.getItem("authorityName") || "Authority";
  const authorityId = sessionStorage.getItem("authorityId");

  const [stats, setStats] = useState({
    users: 0,
    totalComplaints: 0,
    resolved: 0,
    pending: 0
  });

  const loadStats = async () => {
    try {
      // Step 1: get authority details
      const authRes = await axios.get(`http://localhost:5000/authority/${authorityId}`);
      const panchayathId = authRes.data.panchayathId?._id;

      // Step 2: get stats
      const res = await axios.get(
        `http://localhost:5000/authority/dashboard/${panchayathId}`
      );

      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className={style.page}>
      <div className={style.wrapper}>

        {/* Header */}
        <header className={style.header}>
          <h2>Welcome, {authorityName}</h2>
          <p>Real-time insights for your panchayath operations</p>
        </header>

        {/* Stats Grid */}
        <div className={style.grid}>

          <div className={style.card}>
            <h3>{stats.users}</h3>
            <p>Total Citizens</p>
            <span>Registered users in your jurisdiction</span>
          </div>

          <div className={style.card}>
            <h3>{stats.totalComplaints}</h3>
            <p>Total Complaints</p>
            <span>All issues reported by citizens</span>
          </div>

          <div className={style.card}>
            <h3>{stats.pending}</h3>
            <p>Pending Issues</p>
            <span>Requires immediate attention</span>
          </div>

          <div className={style.card}>
            <h3>{stats.resolved}</h3>
            <p>Resolved Cases</p>
            <span>Successfully handled complaints</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthorityDashboard;