import React from "react";
import { Route, Routes } from "react-router";
import MyProfile from "../User/Pages/MyProfile/MyProfile";
import Dashboard from "../User/Pages/Dashboard/Dashboard";
import Complaint from "../User/Pages/Complaint/Complaint";
import AllComplaints from "../User/Pages/AllComplaints/AllComplaints";
import EditProfile from "../User/Pages/EditProfile/EditProfile";
import ChangePassword from "../User/Pages/ChangePassword/Changepassword";
import InlineNotFound from "../ui/InlineNotFound";

const UserRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/myprofile" element={<MyProfile />} />
    <Route path="/complaint" element={<Complaint />} />
    <Route path="/allcomplaints" element={<AllComplaints />} />
    <Route path="/editprofile" element={<EditProfile />} />
    <Route path="/changepassword" element={<ChangePassword />} />
    <Route path="*" element={<InlineNotFound home="/user/" />} />
  </Routes>
);

export default UserRoutes;
