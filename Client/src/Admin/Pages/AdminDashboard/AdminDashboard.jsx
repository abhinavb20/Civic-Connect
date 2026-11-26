import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { FiUsers, FiShield, FiFileText, FiCheckCircle, FiClock, FiActivity } from "react-icons/fi";
import style from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goToReport = () => {
    navigate("report");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Slight delay for smooth transition
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className={style.loaderContainer}>
        <div className={style.spinner}></div>
        <p>Initializing Secure Protocols...</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <header className={style.header}>
          <div className={style.titleArea}>
            <span className={style.topBadge}>System Status: Operational</span>
            <h2 className={style.mainTitle}>Administrative <span>Command</span></h2>
            <p className={style.subText}>Real-time insight into citizen activity and case resolutions.</p>
          </div>
          <button className={style.refreshAction} onClick={goToReport}>
            <FiActivity /> <span>Synchronize Data</span>
          </button>
        </header>

        <main className={style.statsGrid}>
          {/* Total Citizens */}
          <div className={style.statCard}>
            <div className={style.iconBox}><FiUsers /></div>
            <div className={style.dataBox}>
              <label>Total Citizens</label>
              <h3>{(stats.users || 0).toLocaleString()}</h3>
            </div>
          </div>

          {/* Verified Authorities */}
          <div className={style.statCard}>
            <div className={style.iconBox}><FiShield /></div>
            <div className={style.dataBox}>
              <label>Verified Authorities</label>
              <h3>{(stats.authorities || 0).toLocaleString()}</h3>
            </div>
          </div>

          {/* Global Filings */}
          <div className={style.statCard}>
            <div className={style.iconBox}><FiFileText /></div>
            <div className={style.dataBox}>
              <label>Global Filings</label>
              <h3>{(stats.complaints || 0).toLocaleString()}</h3>
            </div>
          </div>

          {/* Resolved Cases */}
          <div className={style.statCard}>
            <div className={`${style.iconBox} ${style.successIcon}`}><FiCheckCircle /></div>
            <div className={style.dataBox}>
              <label>Resolved Cases</label>
              <h3>{(stats.resolved || 0).toLocaleString()}</h3>
            </div>
          </div>

          {/* Active Resolution Queue */}
          <div className={`${style.statCard} ${style.fullWidthCard}`}>
            <div className={`${style.iconBox} ${style.warningIcon}`}><FiClock /></div>
            <div className={style.dataBox}>
              <label>Active Resolution Queue</label>
              <h3>
                {stats.pending || 0} 
                <span className={style.statusTag}>Requires Immediate Action</span>
              </h3>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;