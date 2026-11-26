import React from "react";
import UserRoutes from "../../../Routes/UserRoutes";
import AppShell from "../../../ui/AppShell";

export default function UserHome() {
  return (
    <AppShell role="user">
      <UserRoutes />
    </AppShell>
  );
}
