import React from 'react';
import UserRoutes from '../../../Routes/UserRoutes';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import style from './UserHome.module.css'; // Ensure this matches your filename

export default function UserHome() {
  return (
    <div className={style.layout}>
      <aside className={style.sidebarArea}>
        <Sidebar />
      </aside>

      <main className={style.mainArea}>
        <header className={style.navbarArea}>
          <Navbar />
        </header>

        {/* This container MUST be black to kill the white frame */}
        <section className={style.contentArea}>
          <UserRoutes />
        </section>
      </main>
    </div>
  );
}