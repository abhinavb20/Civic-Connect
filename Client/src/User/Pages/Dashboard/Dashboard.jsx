import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiFileText, FiCheckCircle, FiClock } from "react-icons/fi"; // Optional: npm install react-icons
import style from "./Dashboard.module.css";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userId");
      if (!userId) return;

      const res = await axios.get(`http://localhost:5000/complaintByUser/${userId}`);
      const complaints = res.data.data || [];
      
      let resolvedCount = 0;
      let pendingCount = 0;
      
      complaints.forEach(c => {
        if (c.complaintStatus === "Resolved" || c.complaintStatus === "Rejected") {
          resolvedCount++;
        } else {
          pendingCount++;
        }
      });
      
      setStats({
        total: complaints.length,
        resolved: resolvedCount,
        pending: pendingCount
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className={style.page}>
        <div className={style.loaderContainer}>
          <div className={style.goldSpinner}></div>
          <p>Elevating your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Elite Citizen Portal</span>
          <h2 className={style.title}>Welcome to your <span>Overview</span></h2>
          <p className={style.subtitle}>
            A sophisticated summary of your civic contributions and active resolutions.
          </p>
        </div>

        <div className={style.statsGrid}>
          <div className={style.statCard}>
            <div className={style.iconBox}><FiFileText /></div>
            <div className={style.cardContent}>
              <h4>Total Filings</h4>
              <span className={style.statNumber}>{stats.total}</span>
            </div>
            <div className={style.cardDecoration}></div>
          </div>

          <div className={style.statCard}>
            <div className={style.iconBox}><FiCheckCircle /></div>
            <div className={style.cardContent}>
              <h4>Resolved cases</h4>
              <span className={style.statNumber}>{stats.resolved}</span>
            </div>
            <div className={style.cardDecoration}></div>
          </div>

          <div className={style.statCard}>
            <div className={style.iconBox}><FiClock /></div>
            <div className={style.cardContent}>
              <h4>Active Petitions</h4>
              <span className={style.statNumber}>{stats.pending}</span>
            </div>
            <div className={style.cardDecoration}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;