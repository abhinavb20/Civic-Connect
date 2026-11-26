import React from 'react';
import AuthorityRoutes from '../../../Routes/AuthorityRoutes';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import style from './AuthorityHome.module.css';

export default function AuthorityHome() {
  return (
    <div className={style.layout}>
      {/* Sidebar - Left Section */}
      <aside className={style.sidebarArea}>
        <Sidebar />
      </aside>

      {/* Main Container - Right Section */}
      <main className={style.mainArea}>
        {/* Top Navigation */}
        <header className={style.navbarArea}>
          <Navbar />
        </header>

        {/* Dashboard Content Panel */}
        <section className={style.contentArea}>
          <div className={style.scrollWrapper}>
             <AuthorityRoutes />
          </div>
        </section>
      </main>
    </div>
  );
}