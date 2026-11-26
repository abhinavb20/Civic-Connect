import {
  FiBarChart2,
  FiEdit3,
  FiFileText,
  FiGrid,
  FiHash,
  FiHome,
  FiInbox,
  FiKey,
  FiLayers,
  FiLock,
  FiMapPin,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

export const PORTALS = {
  user: {
    key: "user",
    label: "Citizen portal",
    short: "Citizen",
    home: "/user/",
    action: { label: "File a report", to: "/user/complaint" },
    profileLinks: [
      { label: "My profile", to: "/user/myprofile" },
      { label: "Security settings", to: "/user/changepassword" },
    ],
    groups: [
      {
        label: "Workspace",
        items: [
          { to: "/user/", label: "Overview", icon: FiGrid, end: true },
          { to: "/user/complaint", label: "File a report", icon: FiEdit3 },
          { to: "/user/allcomplaints", label: "Community hub", icon: FiUsers },
        ],
      },
      {
        label: "Account",
        items: [
          { to: "/user/myprofile", label: "My profile", icon: FiUser },
          { to: "/user/changepassword", label: "Security", icon: FiLock },
        ],
      },
    ],
  },
  authority: {
    key: "authority",
    label: "Authority portal",
    short: "Authority",
    home: "/authority/",
    action: { label: "Complaint queue", to: "/authority/view-complaints" },
    profileLinks: [
      { label: "Operations overview", to: "/authority/" },
      { label: "Complaint queue", to: "/authority/view-complaints" },
    ],
    groups: [
      {
        label: "Operations",
        items: [
          { to: "/authority/", label: "Overview", icon: FiGrid, end: true },
          { to: "/authority/view-complaints", label: "Complaint queue", icon: FiInbox },
        ],
      },
    ],
  },
  admin: {
    key: "admin",
    label: "Admin console",
    short: "Admin",
    home: "/admin",
    action: { label: "Reports", to: "/admin/report" },
    profileLinks: [
      { label: "Command center", to: "/admin" },
      { label: "Reports & exports", to: "/admin/report" },
    ],
    groups: [
      {
        label: "Overview",
        items: [
          { to: "/admin", label: "Command center", icon: FiGrid, end: true },
          { to: "/admin/report", label: "Reports & exports", icon: FiBarChart2 },
        ],
      },
      {
        label: "Location hierarchy",
        items: [
          { to: "/admin/district", label: "Districts", icon: FiMapPin },
          { to: "/admin/panchayath", label: "Panchayaths", icon: FiHome },
          { to: "/admin/ward", label: "Wards", icon: FiHash },
        ],
      },
      {
        label: "Services",
        items: [
          { to: "/admin/department", label: "Departments", icon: FiLayers },
          { to: "/admin/authorityregistration", label: "Authorities", icon: FiShield },
          { to: "/admin/ViewComplaint", label: "Complaints", icon: FiFileText },
          { to: "/admin/Userlist", label: "Citizens", icon: FiUsers },
        ],
      },
      {
        label: "System",
        items: [
          { to: "/admin/adminregistration", label: "Administrators", icon: FiKey },
        ],
      },
    ],
  },
};

/** Find the active navigation item (longest matching path wins). */
export const findActiveItem = (portal, pathname) => {
  const items = portal.groups.flatMap((g) => g.items);
  const matches = items
    .filter((item) => {
      const base = item.to.replace(/\/$/, "");
      return pathname === item.to || pathname === base || pathname.startsWith(`${base}/`);
    })
    .sort((a, b) => b.to.length - a.to.length);
  return matches[0] || items[0];
};
