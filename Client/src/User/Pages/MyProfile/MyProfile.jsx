import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiEdit3, FiLock, FiUser, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import style from "./MyProfile.module.css";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    if (!uid) return;

    axios
      .get(`http://localhost:5000/users`)
      .then((res) => {
        const users = res.data.users || [];
        const me = users.find(u => u._id === uid);
        setProfile(me);
      })
      .catch((err) => console.log(err));
  }, []);

  if (!profile) {
    return (
      <div className={style.loadingWrapper}>
        <div className={style.goldSpinner}></div>
        <p>Authenticating Citizen Profile...</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        <div className={style.header}>
          <span className={style.badge}>Credential Overview</span>
          <h2 className={style.title}>Citizen <span>Profile</span></h2>
          <p className={style.subtitle}>
            Verified residency and contact details within the Civic Connect ecosystem.
          </p>
        </div>

        <div className={style.profileCard}>
          <div className={style.sidebarSide}>
            <div className={style.photoContainer}>
              {profile.userPhoto ? (
                <img
                  src={`http://localhost:5000${profile.userPhoto}`}
                  alt="user"
                  className={style.profilePhoto}
                />
              ) : (
                <div className={style.noPhoto}><FiUser size={40} /></div>
              )}
            </div>
            <h3 className={style.userName}>{profile.userName}</h3>
            <span className={style.userTypeTag}>Verified Citizen</span>
            
            <div className={style.quickActions}>
              <Link to="/user/editprofile" className={style.actionLink}>
                <FiEdit3 /> Edit Details
              </Link>
              <Link to="/user/changepassword" className={`${style.actionLink} ${style.outline}`}>
                <FiLock /> Security
              </Link>
            </div>
          </div>

          <div className={style.infoSide}>
            <h4 className={style.sectionLabel}>Personal & Contact</h4>
            <div className={style.infoGrid}>
              <div className={style.infoItem}>
                <FiMail className={style.icon} />
                <div>
                  <label>Electronic Mail</label>
                  <p>{profile.userEmail}</p>
                </div>
              </div>
              <div className={style.infoItem}>
                <FiPhone className={style.icon} />
                <div>
                  <label>Direct Contact</label>
                  <p>{profile.userContact}</p>
                </div>
              </div>
            </div>

            <h4 className={style.sectionLabel}>Jurisdiction Details</h4>
            <div className={style.infoGrid}>
              <div className={style.infoItem}>
                <FiMapPin className={style.icon} />
                <div>
                  <label>District / Region</label>
                  <p>{profile.wardId?.panchayathId?.districtId?.districtName || "N/A"}</p>
                </div>
              </div>
              <div className={style.infoItem}>
                <FiMapPin className={style.icon} />
                <div>
                  <label>Local Body (Panchayath)</label>
                  <p>{profile.wardId?.panchayathId?.panchayathName || "N/A"}</p>
                </div>
              </div>
              <div className={style.infoItem}>
                <FiMapPin className={style.icon} />
                <div>
                  <label>Assigned Ward</label>
                  <p>{profile.wardId?.wardName} (No. {profile.wardId?.wardNumber})</p>
                </div>
              </div>
              <div className={style.infoItem}>
                <FiMapPin className={style.icon} />
                <div>
                  <label>Residential Address</label>
                  <p className={style.addressText}>{profile.userAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;