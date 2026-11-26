import React from "react";
import { Route, Routes } from "react-router";
import Login from "../Guest/Pages/Login/Login";
import UserRegistration from "../Guest/Pages/UserRegistration/UserRegistration";
import Dashboard from "../Guest/Pages/Dashboard/Dashboard";
import NotFound from "../ui/NotFound";

const GuestRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="userregistration" element={<UserRegistration />} />
      <Route path="" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default GuestRoutes;
