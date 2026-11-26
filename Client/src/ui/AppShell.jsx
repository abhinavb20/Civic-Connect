import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiRefreshCw,
  FiShield,
  FiX,
} from "react-icons/fi";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { useToast } from "./Toast";
import { api, fileUrl } from "../api";
import { PORTALS, findActiveItem } from "../config/nav";
import styles from "./AppShell.module.css";

const ROLE_META = {
  user: { nameKey: "userName", idKey: "userId", fallback: "Citizen", badge: "Citizen" },
  authority: { nameKey: "authorityName", idKey: "authorityId", fallback: "Authority", badge: "Authority" },
  admin: { nameKey: "adminName", idKey: "adminId", fallback: "Administrator", badge: "Administrator" },
};

const AppShell = ({ role = "user", children }) => {
  const portal = PORTALS[role];
  const meta = ROLE_META[role];
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toast = useToast();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("cc_sidebar_collapsed") === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState({ loading: false, items: [], error: "" });

  const profileRef = useRef(null);
  const bellRef = useRef(null);

  const sessionName = sessionStorage.getItem(meta.nameKey) || meta.fallback;
  const sessionId = sessionStorage.getItem(meta.idKey);

  const activeItem = findActiveItem(portal, pathname);

  useEffect(() => {
    if (!sessionId || role === "admin") return;
    api
      .get(`/${role}/${sessionId}`)
      .then((res) => setProfile(res.data?.user || res.data || null))
      .catch(() => setProfile(null));
  }, [role, sessionId]);

  const loadNotifications = useCallback(async () => {
    if (!sessionId) return;
    setNotifications((n) => ({ ...n, loading: true, error: "" }));
    try {
      let items = [];

      if (role === "user") {
        const res = await api.get(`/complaintByUser/${sessionId}`);
        const list = res.data?.data || [];
        items = list
          .filter((c) => !["Resolved", "Closed", "Rejected"].includes(c.complaintStatus))
          .slice(0, 4)
          .map((c) => ({
            id: c._id,
            title: c.complaintTitle,
            description: `${c.complaintStatus} · ${c.departmentId?.departmentName || "General"}`,
            to: "/user/complaint",
            tone: "brand",
          }));
        if (!items.length) {
          const recent = list.filter((c) => c.complaintStatus === "Resolved").slice(0, 2);
          items = recent.map((c) => ({
            id: c._id,
            title: `${c.complaintTitle} resolved`,
            description: "An official update is available on your report.",
            to: "/user/complaint",
            tone: "green",
          }));
        }
      } else if (role === "authority") {
        const authRes = await api.get(`/authority/${sessionId}`);
        const panchayathId = authRes.data?.panchayathId?._id;
        if (panchayathId) {
          const res = await api.get(`/complaintByPanchayath/${panchayathId}`);
          items = (res.data?.data || [])
            .filter((c) => ["Submitted", "Verified", "In Progress"].includes(c.complaintStatus))
            .sort((a, b) => (b.supportCount || 0) - (a.supportCount || 0))
            .slice(0, 4)
            .map((c) => ({
              id: c._id,
              title: c.complaintTitle,
              description: `${c.wardId?.wardName || "Ward"} · ${c.supportCount || 0} endorsements`,
              to: "/authority/view-complaints",
              tone: c.complaintStatus === "In Progress" ? "amber" : "brand",
            }));
        }
      } else {
        const res = await api.get("/admin/dashboard");
        const stats = res.data || {};
        if (stats.pending > 0) {
          items.push({
            id: "pending",
            title: `${stats.pending} complaint${stats.pending === 1 ? "" : "s"} awaiting action`,
            description: "Review the active resolution queue across all jurisdictions.",
            to: "/admin/ViewComplaint",
            tone: "amber",
          });
        }
        if (stats.complaints > 0) {
          items.push({
            id: "resolved",
            title: `${stats.resolved || 0} of ${stats.complaints} cases resolved`,
            description: "Open reports for jurisdiction-level performance.",
            to: "/admin/report",
            tone: "green",
          });
        }
        if ((stats.authorities || 0) === 0) {
          items.push({
            id: "authorities",
            title: "No authorities registered yet",
            description: "Assign an authority to activate a panchayath workflow.",
            to: "/admin/authorityregistration",
            tone: "brand",
          });
        }
      }

      setNotifications({ loading: false, items, error: "" });
    } catch {
      setNotifications({
        loading: false,
        items: [],
        error: "Could not reach the civic service. Try again.",
      });
    }
  }, [role, sessionId]);

  const closeNav = () => {
    setMobileOpen(false);
    setMenu(null);
  };

  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileOpen]);

  useEffect(() => {
    const onDown = (e) => {
      if (profileRef.current?.contains(e.target)) return;
      if (bellRef.current?.contains(e.target)) return;
      setMenu(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      localStorage.setItem("cc_sidebar_collapsed", value ? "0" : "1");
      return !value;
    });
  };

  const openNotifications = () => {
    const next = menu === "bell" ? null : "bell";
    setMenu(next);
    if (next) loadNotifications();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Signed out", "Your session was closed securely.");
    navigate("/login");
  };

  const avatarSrc = profile?.userPhoto ? fileUrl(profile.userPhoto) : "";

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
          mobileOpen ? styles.mobileOpen : ""
        }`}
        aria-label={`${portal.short} navigation`}
      >
        <div className={styles.brandRow}>
          <Link
            to={portal.home}
            className={styles.brand}
            aria-label={`${portal.label} home`}
            onClick={closeNav}
          >
            <Logo variant="light" size="sm" />
          </Link>
          <button
            type="button"
            className={styles.closeMobile}
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        </div>
        <span className={styles.portalBadge}>
          <span className={styles.badgeDot} />
          {portal.label}
        </span>

        <nav className={styles.nav}>
          {portal.groups.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navActive : ""}`
                    }
                    onClick={closeNav}
                  >
                    <span className={styles.navIcon}>
                      <Icon />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <span className={styles.activeBar} aria-hidden="true" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.helpCard}>
            <span className={styles.helpIcon}>
              <FiHelpCircle />
            </span>
            <div>
              <strong>Need a hand?</strong>
              <p>Reach the civic support desk for help with your account.</p>
            </div>
            <a
              href="mailto:support@civicconnect.gov"
              className={styles.helpLink}
            >
              Contact support <FiExternalLink />
            </a>
          </div>
          <Link to="/" className={styles.siteLink} onClick={closeNav}>
            <FiExternalLink /> Back to website
          </Link>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            <span>{collapsed ? "" : "Collapse menu"}</span>
          </button>
        </div>
      </aside>

      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <FiMenu />
            </button>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <span className={styles.crumbPortal}>
                <FiShield /> {portal.short}
              </span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbCurrent}>{activeItem?.label || "Overview"}</span>
            </nav>
          </div>

          <div className={styles.topRight}>
            <Link
              to={portal.action.to}
              className={`cc-btn cc-btn--primary cc-btn--sm ${styles.quickAction}`}
              onClick={() => setMenu(null)}
            >
              {portal.action.label}
            </Link>

            <div className={styles.dropdownWrap} ref={bellRef}>
              <button
                type="button"
                className={`${styles.iconButton} ${menu === "bell" ? styles.iconActive : ""}`}
                onClick={openNotifications}
                aria-label="Open notifications"
                aria-expanded={menu === "bell"}
              >
                <FiBell />
                {notifications.items.length > 0 && <span className={styles.bellDot} />}
              </button>

              {menu === "bell" && (
                <div className={`${styles.dropdown} ${styles.bellDropdown}`}>
                  <div className={styles.dropdownHead}>
                    <div>
                      <p className={styles.dropdownTitle}>Notifications</p>
                      <p className={styles.dropdownSub}>Live updates from your workspace</p>
                    </div>
                    <button
                      type="button"
                      className={styles.refreshBtn}
                      onClick={loadNotifications}
                      aria-label="Refresh notifications"
                    >
                      <FiRefreshCw className={notifications.loading ? styles.spinning : ""} />
                    </button>
                  </div>

                  <div className={styles.notifyList}>
                    {notifications.loading && (
                      <div className={styles.notifySkeleton}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} className={styles.skeletonRow}>
                            <span className="cc-skeleton cc-skeleton--avatar" style={{ width: 32, height: 32 }} />
                            <div style={{ flex: 1 }}>
                              <span className="cc-skeleton cc-skeleton--text" style={{ width: "78%", display: "block" }} />
                              <span
                                className="cc-skeleton cc-skeleton--text"
                                style={{ width: "52%", display: "block", marginTop: 6 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!notifications.loading && notifications.error && (
                      <div className={styles.notifyEmpty}>
                        <p>{notifications.error}</p>
                        <button type="button" className="cc-btn cc-btn--secondary cc-btn--sm" onClick={loadNotifications}>
                          Try again
                        </button>
                      </div>
                    )}

                    {!notifications.loading && !notifications.error && notifications.items.length === 0 && (
                      <div className={styles.notifyEmpty}>
                        <span className={styles.emptyBell}><FiBell /></span>
                        <p>You&apos;re all caught up.</p>
                        <small>New civic updates will appear here.</small>
                      </div>
                    )}

                    {!notifications.loading &&
                      !notifications.error &&
                      notifications.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.to}
                          className={styles.notifyItem}
                          onClick={() => setMenu(null)}
                        >
                          <span className={`${styles.notifyIcon} ${styles[`tone-${item.tone}`] || ""}`}>
                            <FiClock />
                          </span>
                          <span className={styles.notifyText}>
                            <strong>{item.title}</strong>
                            <small>{item.description}</small>
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <span className={styles.topDivider} aria-hidden="true" />

            <div className={styles.dropdownWrap} ref={profileRef}>
              <button
                type="button"
                className={`${styles.profileButton} ${menu === "profile" ? styles.profileActive : ""}`}
                onClick={() => setMenu(menu === "profile" ? null : "profile")}
                aria-label="Open profile menu"
                aria-expanded={menu === "profile"}
              >
                <Avatar src={avatarSrc} name={sessionName} size="sm" />
                <span className={styles.profileText}>
                  <strong>{sessionName}</strong>
                  <small>{meta.badge}</small>
                </span>
                <FiChevronRight className={styles.profileChevron} />
              </button>

              {menu === "profile" && (
                <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
                  <div className={styles.profileHead}>
                    <Avatar src={avatarSrc} name={sessionName} />
                    <div>
                      <strong>{sessionName}</strong>
                      <small>{portal.label}</small>
                    </div>
                  </div>
                  <div className={styles.profileLinks}>
                    {portal.profileLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={styles.profileLink}
                        onClick={() => setMenu(null)}
                      >
                        {link.label}
                        <FiChevronRight />
                      </Link>
                    ))}
                  </div>
                  <button type="button" className={styles.logout} onClick={handleLogout}>
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.content} id="main-content">
          <div key={pathname} className="cc-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
