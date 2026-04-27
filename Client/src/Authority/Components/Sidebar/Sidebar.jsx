import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText } from 'react-icons/fi';
import style from './Sidebar.module.css';

const Sidebar = () => {
  const menu = [
    { path: '/authority/', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/authority/view-complaints', label: 'View Complaints', icon: <FiFileText /> }
  ];

  return (
    <div className={style.sidebar}>
      {/* Brand Section */}
      <div className={style.brand}>
        <div className={style.logoWrapper}>
          <div className={style.logoSquare}>🛡️</div>
          <h2 className={style.brandName}>CivicConnect</h2>
        </div>
      </div>

      {/* Profile Card (The "George" section from image) */}
      <div className={style.profileCard}>
        <div className={style.profileHeader}>
          <div className={style.avatar}>👤</div>
          
        </div>
       
        <h3 className={style.welcomeText}>Welcome back, Authority</h3>
      </div>

      {/* Navigation Menu */}
      <nav className={style.menu}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
            end={item.path === '/authority/'}
          >
            <span className={style.icon}>{item.icon}</span>
            <span className={style.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

     
    </div>
  );
};

export default Sidebar;