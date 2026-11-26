import React from "react";
import AuthorityRoutes from "../../../Routes/AuthorityRoutes";
import AppShell from "../../../ui/AppShell";

export default function AuthorityHome() {
  return (
    <AppShell role="authority">
      <AuthorityRoutes />
    </AppShell>
  );
}
