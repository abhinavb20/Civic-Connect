import React from 'react';
import { NavLink } from 'react-router-dom';
import style from './Sidebar.module.css';

const Sidebar = () => {
  const menu = [
    { path: '/admin', label: 'Dashboard', icon: '📊', end: true }, // Added end: true
    { path: '/admin/district', label: 'District', icon: '📍' },
    { path: '/admin/panchayath', label: 'Panchayath', icon: '🏛️' },
    { path: '/admin/ward', label: 'Ward', icon: '📌' },
    { path: '/admin/department', label: 'Department', icon: '📦' },
    { path: '/admin/authorityregistration', label: 'Authorities', icon: '🛡️' },
    { path: '/admin/viewcomplaint', label: 'Complaints', icon: '📝' },
    { path: '/admin/userlist', label: 'User Base', icon: '👥' },
  ];

  return (
    <div className={style.sidebar}>
      <div className={style.brand}>
        <div className={style.logoWrapper}>
          <div className={style.logo}>CC</div>
        </div>
        <div className={style.brandText}>
          <h2>Civic<span>Connect</span></h2>
          <span>Admin Oversight</span>
        </div>
      </div>

      <div className={style.menu}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // Use the end prop if it's defined in the menu item
            end={item.end} 
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
          >
            <span className={style.icon}>{item.icon}</span>
            <span className={style.label}>{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      <div className={style.footer}>
        <div className={style.statusIndicator}></div>
        <span>System Operational</span>
      </div>
    </div>
  );
};

export default Sidebar;