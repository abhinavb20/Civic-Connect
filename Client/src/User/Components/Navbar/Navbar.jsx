import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi'; // Suggested icons
import style from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName") || "Citizen";
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className={style.navbar}>
      <div className={style.container}>
        <div className={style.left}>
          <span className={style.portalName}>
            Civic<span className={style.goldText}>Connect</span> 
            <small className={style.divider}>|</small> 
            <span className={style.userBadge}>Elite Portal</span>
          </span>
        </div>

        <div className={style.right}>
          <div className={style.userInfo}>
            <FiUser className={style.userIcon} />
            <span className={style.userName}>{userName}</span>
          </div>
          
          <button className={style.logoutBtn} onClick={handleLogout}>
            <FiLogOut className={style.logoutIcon} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;