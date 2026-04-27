import React from 'react';
import { useNavigate } from 'react-router-dom';
import {  FiLogOut } from 'react-icons/fi'; // Optional icons
import style from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className={style.navbar}>
      <div className={style.left}>
        <h1 className={style.title}>Authority Dashboard</h1>
      </div>

      <div className={style.right}>
        

        {/* Action Icons */}
        <div className={style.iconGroup}>
          
          <button 
            className={style.logoutBtn} 
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;