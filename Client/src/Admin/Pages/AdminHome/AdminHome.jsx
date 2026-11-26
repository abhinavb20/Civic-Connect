import React from 'react';
import AdminRoutes from '../../../Routes/AdminRoutes';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import style from './AdminHome.module.css';

const AdminHome = () => {
  return (
    <div className={style.layout}>
      <aside className={style.sidebarArea}>
        <Sidebar />
      </aside>

      <main className={style.mainArea}>
        <header className={style.navbarArea}>
          <Navbar />
        </header>

        <section className={style.contentArea}>
          <AdminRoutes />
        </section>
      </main>
    </div>
  );
};

export default AdminHome;