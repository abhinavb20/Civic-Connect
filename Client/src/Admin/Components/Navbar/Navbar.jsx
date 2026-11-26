import React from 'react';
import { NavLink } from 'react-router-dom';
import style from './Navbar.module.css';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className={style.navbar}>
      <div className={style.left}>
        <div className={style.iconWrapper}>
          <HomeIcon className={style.homeIcon}/>
        </div>
        <NavLink to='/admin/adminhome' className={style.link}>
          Admin <span>System</span>
        </NavLink>
      </div>

      <div className={style.right}>
        <div className={style.adminBadge}>
          Secure Session
        </div>
        <button className={style.logoutBtn} onClick={handleLogout}>
          <LogoutIcon className={style.logoutIcon} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;