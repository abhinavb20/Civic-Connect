import React from 'react';
import { NavLink } from 'react-router-dom';
import style from './Sidebar.module.css';

const Sidebar = () => {
  const menu = [
    { path: '/user/', label: 'Dashboard', icon: '🏛️' },
    { path: '/user/complaint', label: 'My Complaints', icon: '✍️' },
    { path: '/user/myprofile', label: 'My Profile', icon: '🛡️' },
    { path: '/user/allcomplaints', label: 'Community Hub', icon: '🌍' },
  ];

  return (
    <div className={style.sidebar}>
      <div className={style.brand}>
        <div className={style.logoContainer}>
           <div className={style.logoIcon}>CC</div>
        </div>
        <h2 className={style.brandName}>Civic<span>Connect</span></h2>
        <span className={style.panelBadge}>Citizen Elite</span>
      </div>

      <nav className={style.menu}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/user/'} // Ensures Dashboard isn't always active
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
          >
            <span className={style.icon}>{item.icon}</span>
            <span className={style.label}>{item.label}</span>
            <div className={style.activeIndicator}></div>
          </NavLink>
        ))}
      </nav>

      <div className={style.footer}>
        <div className={style.statusIndicator}>
          <span className={style.dot}></span>
          Secure Session
        </div>
      </div>
    </div>
  );
};

export default Sidebar;