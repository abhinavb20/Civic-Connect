import React from "react";
import AdminRoutes from "../../../Routes/AdminRoutes";
import AppShell from "../../../ui/AppShell";

const AdminHome = () => (
  <AppShell role="admin">
    <AdminRoutes />
  </AppShell>
);

export default AdminHome;
