import React from "react";
import { Route, Routes } from "react-router";
import Dashboard from "../Authority/Pages/Dashboard/Dashboard";
import ViewComplaint from "../Authority/Pages/ViewComplaints/ViewComplaint";
import InlineNotFound from "../ui/InlineNotFound";

const AuthorityRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/view-complaints" element={<ViewComplaint />} />
    <Route path="*" element={<InlineNotFound home="/authority/" />} />
  </Routes>
);

export default AuthorityRoutes;
