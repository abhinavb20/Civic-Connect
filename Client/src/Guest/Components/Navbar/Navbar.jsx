import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import style from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={style.navbar}>
      <div className={style.navContainer}>
        <Link to="/" className={style.logo}>
          <span className={style.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L19 6.5V11C19 15 15.5 18.5 12 21C8.5 18.5 5 15 5 11V6.5L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="#ff7d3e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={style.logoText}>Civic<span>Connect</span></span>
        </Link>

        <div className={style.navLinks}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? `${style.navLink} ${style.active}` : style.navLink}
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/login" 
            className={({ isActive }) => isActive ? `${style.navLink} ${style.active}` : style.navLink}
          >
            Login
          </NavLink>
          
          <NavLink 
            to="/userregistration" 
            className={({ isActive }) => isActive ? `${style.navLink} ${style.active}` : style.navLink}
          >
            Registration
          </NavLink>
        </div>

        <div className={style.navActions}>
          {/* Action buttons can be placed here if needed later */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;