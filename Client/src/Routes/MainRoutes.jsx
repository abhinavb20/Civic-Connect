import React from "react";
import { Navigate, Route, Routes } from "react-router";
import GuestHome from "../Guest/Pages/GuestHome/GuestHome";
import AdminHome from "../Admin/Pages/AdminHome/AdminHome";
import UserHome from "../User/Pages/UserHome/UserHome";
import AuthorityHome from "../Authority/Pages/AuthorityHome/AuthorityHome";

const ROLE_KEYS = {
  admin: "adminId",
  user: "userId",
  authority: "authorityId",
};

/** Client-side route guard: keeps each portal behind its own session. */
const RequireRole = ({ role, children }) =>
  sessionStorage.getItem(ROLE_KEYS[role]) ? children : <Navigate to="/login" replace />;

const MainRoutes = () => {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <RequireRole role="admin">
            <AdminHome />
          </RequireRole>
        }
      />
      <Route
        path="user/*"
        element={
          <RequireRole role="user">
            <UserHome />
          </RequireRole>
        }
      />
      <Route
        path="authority/*"
        element={
          <RequireRole role="authority">
            <AuthorityHome />
          </RequireRole>
        }
      />
      <Route path="/*" element={<GuestHome />} />
    </Routes>
  );
};

export default MainRoutes;
