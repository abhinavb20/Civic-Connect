import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCamera,
  FiCheckCircle,
  FiChevronDown,
  FiFileText,
  FiLayers,
  FiMapPin,
  FiMenu,
  FiShield,
  FiThumbsUp,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Logo from "../../../ui/Logo";
import CountUp from "../../../ui/CountUp";
import Reveal from "../../../ui/Reveal";
import { api } from "../../../api";
import styles from "./Dashboard.module.css";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1500&q=80",
  community:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  meeting:
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  city: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
  civic:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  neighbourhood:
    "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
};

const FEATURES = [
  {
    icon: FiCamera,
    title: "Evidence-first reporting",
    desc: "Attach photos and precise details to every issue so field teams know exactly what they are walking into.",
  },
  {
    icon: FiActivity,
    title: "Real-time status tracking",
    desc: "Follow each report from submitted to resolved. No phone calls, no guesswork, no lost paperwork.",
  },
  {
    icon: FiThumbsUp,
    title: "Community endorsement",
    desc: "Neighbours can support the issues that matter most, surfacing shared priorities for local authorities.",
  },
  {
    icon: FiMapPin,
    title: "Ward-level routing",
    desc: "Every report is routed to the right panchayath, ward, and department automatically from the citizen's profile.",
  },
  {
    icon: FiCheckCircle,
    title: "Accountable resolutions",
    desc: "Authorities publish official responses and status updates, creating a transparent record of action.",
  },
  {
    icon: FiBarChart2,
    title: "Decision-ready reports",
    desc: "Administrators filter by district, panchayath, ward, department, and status, then export for review.",
  },
];

const STEPS = [
  {
    title: "Report the issue",
    desc: "Sign in, pick the responsible department, and add a photo with the exact details of the problem.",
  },
  {
    title: "Your ward takes over",
    desc: "The report is routed to your panchayath and ward authority, who review, verify, and update progress.",
  },
  {
    title: "Watch it get resolved",
    desc: "Receive official responses, follow the status, and see the outcome recorded in your complaint history.",
  },
];

const PORTALS = [
  {
    to: "/userregistration",
    label: "For residents",
    title: "Citizen portal",
    desc: "Register with your ward, file reports, support community issues, and follow every update.",
    image: IMAGES.community,
    cta: "Create citizen account",
  }
];

const FAQS = [
  {
    q: "Who can submit a complaint?",
    a: "Any registered citizen can submit a complaint. Registration links your account to a district, panchayath, and ward so your report reaches the right local authority automatically.",
  },
  {
    q: "How do I know my report was received?",
    a: "Every complaint appears in your dashboard with a live status. When an authority verifies or updates the case, the change is reflected in your complaint history along with any official reply.",
  },
  {
    q: "Can I add photos to a report?",
    a: "Yes. Reports support photo evidence so authorities can assess the issue before visiting the location. Multiple images can be attached to a single complaint.",
  },
  {
    q: "What do the complaint statuses mean?",
    a: "Submitted means the report has been filed. Verified means it has been reviewed. In Progress means work is underway. Resolved and Closed are final states, while Rejected means the report could not be actioned.",
  },
  {
    q: "How are authorities and administrators managed?",
    a: "Administrators maintain districts, panchayaths, wards, departments, and authority accounts from the admin console. This keeps routing accurate as local boundaries change.",
  },
];

const Dashboard = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    api
      .get("/admin/dashboard")
      .then((res) => {
        if (alive) setStats(res.data || {});
      })
      .catch(() => {
        if (alive) setStatsError(true);
      })
      .finally(() => {
        if (alive) setStatsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const resolutionRate =
    stats && stats.complaints > 0
      ? Math.round(((stats.resolved || 0) / stats.complaints) * 100)
      : 0;

  const navClass = `${styles.nav} ${scrolled || menuOpen ? styles.navSolid : ""}`;

  const navLinks = [
    { href: "#platform", label: "Platform" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#portals", label: "Portals" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className={styles.page} id="top">
      <header className={navClass}>
        <div className={`cc-container ${styles.navInner}`}>
          <Link to="/" className={styles.brandLink} aria-label="Civic Connect home">
            <Logo variant={scrolled || menuOpen ? "dark" : "light"} />
          </Link>

          <nav className={styles.navLinks} aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.signIn}>
              Sign in
            </Link>
            <Link to="/userregistration" className="cc-btn cc-btn--primary cc-btn--sm">
              Get started <FiArrowRight />
            </Link>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={styles.mobilePanel} id="mobile-navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className={styles.mobileActions}>
              <Link to="/login" className="cc-btn cc-btn--secondary cc-btn--block" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link
                to="/userregistration"
                className="cc-btn cc-btn--primary cc-btn--block"
                onClick={() => setMenuOpen(false)}
              >
                Create account <FiArrowRight />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroGridLines} aria-hidden="true" />

          <div className={`cc-container ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <span className={styles.heroBadge}>
                <span className={styles.liveDot} /> Civic reporting, reimagined
              </span>
              <h1 className={styles.heroTitle}>
                Your neighbourhood.
                <br />
                <span className={styles.heroAccent}>Accountable.</span>
              </h1>
              <p className={styles.heroText}>
                Report potholes, broken streetlights, drainage issues, and more with
                photo evidence. Civic Connect routes every complaint to the right ward
                authority and tracks it through to resolution.
              </p>
              <div className={styles.heroActions}>
                <Link to="/userregistration" className="cc-btn cc-btn--primary cc-btn--lg">
                  Report an issue <FiArrowRight />
                </Link>
                <Link to="/login" className={`cc-btn cc-btn--lg ${styles.heroGhost}`}>
                  Sign in to your portal
                </Link>
              </div>
              <ul className={styles.heroPoints}>
                <li>
                  <FiCamera /> Photo evidence
                </li>
                <li>
                  <FiActivity /> Live status
                </li>
                <li>
                  <FiMapPin /> Ward-routed
                </li>
              </ul>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroFrame}>
                <img
                  src={IMAGES.hero}
                  alt="Aerial view of a city at dusk"
                  fetchPriority="high"
                />
                <span className={styles.heroFrameOverlay} aria-hidden="true" />
                <span className={styles.frameBadge}>
                  <span className={styles.liveDot} /> Live civic network
                </span>
              </div>

              <div className={`${styles.floatCard} ${styles.floatRate}`}>
                <div className={styles.floatTop}>
                  <span className={styles.floatIcon}>
                    <FiCheckCircle />
                  </span>
                  <span className={styles.floatLabel}>Resolution rate</span>
                </div>
                <p className={styles.floatValue}>
                  {statsLoading ? (
                    <span className="cc-skeleton" style={{ width: 62, height: 30, display: "block" }} />
                  ) : statsError ? (
                    "—"
                  ) : (
                    <CountUp value={resolutionRate} suffix="%" />
                  )}
                </p>
                <div className={styles.floatBar} aria-hidden="true">
                  <span style={{ width: `${statsError ? 0 : resolutionRate}%` }} />
                </div>
                <span className={styles.floatHint}>Across all registered wards</span>
              </div>

              <div className={`${styles.floatCard} ${styles.floatActive}`}>
                <span className={styles.floatIconAmber}>
                  <FiActivity />
                </span>
                <div>
                  <span className={styles.floatLabel}>Active cases</span>
                  <p className={styles.floatSmall}>
                    {statsLoading ? (
                      <span className="cc-skeleton" style={{ width: 34, height: 18, display: "block" }} />
                    ) : statsError ? (
                      "—"
                    ) : (
                      <CountUp value={stats?.pending || 0} />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`cc-container ${styles.statsWrap}`}>
            <div className={styles.statsBand}>
              {[
                { label: "Registered citizens", key: "users", hint: "Verified residents" },
                { label: "Complaints filed", key: "complaints", hint: "Across all wards" },
                { label: "Cases resolved", key: "resolved", hint: "Officially closed" },
                { label: "Local authorities", key: "authorities", hint: "Active panchayaths" },
              ].map((item, i) => (
                <div key={item.key} className={styles.statCell}>
                  <span className={styles.statLabel}>{item.label}</span>
                  <span className={styles.statValue}>
                    {statsLoading ? (
                      <span className="cc-skeleton cc-skeleton--title" style={{ width: 54 }} />
                    ) : statsError ? (
                      "—"
                    ) : (
                      <CountUp value={Number(stats?.[item.key]) || 0} duration={1100 + i * 120} />
                    )}
                  </span>
                  <span className={styles.statHint}>{item.hint}</span>
                </div>
              ))}
            </div>
            <p className={styles.statsNote}>
              <span className={styles.liveDot} />
              {statsError
                ? "Live platform metrics are temporarily unavailable."
                : "Live figures from the Civic Connect platform."}
            </p>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section className={`${styles.section} ${styles.featuresSection}`} id="platform">
          <div className="cc-container">
            <Reveal className={styles.sectionHead}>
              <span className="cc-eyebrow">The platform</span>
              <h2>A clear line from complaint to fix.</h2>
              <p>
                Civic Connect replaces scattered phone calls and paper registers with one
                shared, accountable workflow for citizens and local government.
              </p>
            </Reveal>

            <div className={styles.featureGrid}>
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} delay={i * 60}>
                    <article className={styles.featureCard}>
                      <span className={styles.featureIcon}>
                        <Icon />
                      </span>
                      <h3>{feature.title}</h3>
                      <p>{feature.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className={styles.section} id="how-it-works">
          <div className={`cc-container ${styles.howGrid}`}>
            <Reveal className={styles.howVisual}>
              <div className={styles.howImage}>
                <img
                  src={IMAGES.neighbourhood}
                  alt="Residential neighbourhood street"
                  loading="lazy"
                />
                <span className={styles.howImageOverlay} aria-hidden="true" />
                <div className={styles.howChip}>
                  <span className={styles.howChipIcon}>
                    <FiLayers />
                  </span>
                  <div>
                    <strong>Routed automatically</strong>
                    <span>District → Panchayath → Ward</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal className={styles.howCopy} delay={80}>
              <span className="cc-eyebrow">How it works</span>
              <h2 className={styles.sectionTitle}>Three steps. One accountable record.</h2>
              <p className={styles.sectionText}>
                Every report carries its location, category, evidence, and history — so
                nothing gets lost between departments.
              </p>
              <ol className={styles.steps}>
                {STEPS.map((step, i) => (
                  <li key={step.title} className={styles.step}>
                    <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/userregistration" className={`cc-btn cc-btn--primary ${styles.howCta}`}>
                Start your first report <FiArrowRight />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Portals ---------------- */}
        <section className={`${styles.section} ${styles.portalsSection}`} id="portals">
          <div className="cc-container">
            <Reveal className={styles.sectionHead}>
              <span className="cc-eyebrow">Purpose-built portals</span>
              {/* <h2>One platform. Three clear roles.</h2> */}
              <p>
                Residents, local bodies, and administrators each get a focused workspace
                with the tools their role actually needs.
              </p>
            </Reveal>

            {/* <div className={styles.portalGrid}>
              {PORTALS.map((portal, i) => (
                <Reveal key={portal.title} delay={i * 90}>
                  <Link to={portal.to} className={styles.portalCard}>
                    <div className={styles.portalImage}>
                      <img src={portal.image} alt="" loading="lazy" />
                      <span className={styles.portalImageOverlay} aria-hidden="true" />
                      <span className={styles.portalTag}>{portal.label}</span>
                    </div>
                    <div className={styles.portalBody}>
                      <h3>{portal.title}</h3>
                      <p>{portal.desc}</p>
                      <span className={styles.portalCta}>
                        {portal.cta} <FiArrowRight />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div> */}
          </div>
        </section>

        {/* ---------------- Trust ---------------- */}
        <section className={styles.section}>
          <div className="cc-container">
            <Reveal className={styles.trustPanel}>
              <div className={styles.trustCopy}>
                <span className={styles.trustEyebrow}>
                  <FiShield /> Built for public trust
                </span>
                <h2>Evidence, locality, and transparency in one workflow.</h2>
                <p>
                  Civic Connect is designed around the realities of local governance:
                  hierarchical jurisdictions, multiple departments, and the need for a
                  defensible record of every action.
                </p>
                <Link to="/login" className={`cc-btn ${styles.trustBtn}`}>
                  Access your portal <FiArrowRight />
                </Link>
              </div>
              <ul className={styles.trustList}>
                {[
                  { icon: FiCamera, title: "Evidence attached", text: "Photos travel with the report." },
                  { icon: FiMapPin, title: "Locality-aware", text: "District, panchayath, ward routing." },
                  { icon: FiFileText, title: "Official responses", text: "Authorities publish outcomes." },
                  { icon: FiUsers, title: "Role-based access", text: "Right tools for the right role." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title}>
                      <span className={styles.trustIcon}>
                        <Icon />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className={styles.section} id="faq">
          <div className={`cc-container ${styles.faqGrid}`}>
            <Reveal>
              <span className="cc-eyebrow">Frequently asked</span>
              <h2 className={styles.sectionTitle}>Questions, answered.</h2>
              <div className={styles.faqList}>
                {FAQS.map((faq) => (
                  <details key={faq.q} className={styles.faqItem}>
                    <summary>
                      {faq.q}
                      <span className={styles.faqPlus} aria-hidden="true">
                        <FiChevronDown />
                      </span>
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>

            <Reveal className={styles.faqAside} delay={100}>
              <span className={styles.faqAsideIcon}>
                <FiShield />
              </span>
              <h3>Ready to raise your first issue?</h3>
              <p>
                Create a citizen account with your ward details and your reports will
                reach the right local body from day one.
              </p>
              <Link to="/userregistration" className="cc-btn cc-btn--primary cc-btn--block">
                Create an account <FiArrowRight />
              </Link>
              <span className={styles.faqAsideNote}>
                Already registered? <Link to="/login">Sign in</Link>
              </span>
            </Reveal>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className={styles.section}>
          <div className="cc-container">
            <Reveal className={styles.ctaBand}>
              <div className={styles.ctaRings} aria-hidden="true" />
              <div className={styles.ctaCopy}>
                <span className={styles.ctaEyebrow}>A better ward starts here</span>
                <h2>One report can change the street you live on.</h2>
                <p>
                  Join citizens, panchayaths, and administrators already using Civic
                  Connect to make local governance visible and responsive.
                </p>
              </div>
              <div className={styles.ctaActions}>
                <Link to="/userregistration" className="cc-btn cc-btn--lg cc-btn--primary">
                  Get started free <FiArrowRight />
                </Link>
                <Link to="/login" className={`cc-btn cc-btn--lg ${styles.ctaGhost}`}>
                  Sign in
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className={styles.footer}>
        <div className={`cc-container ${styles.footerGrid}`}>
          <div className={styles.footerBrand}>
            <Logo />
            <p>
              A civic issue reporting and resolution platform connecting residents with
              the local bodies responsible for their streets.
            </p>
            <span className={styles.footerBadge}>
              <span className={styles.liveDot} /> Civic infrastructure, digitised
            </span>
          </div>

          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <a href="#platform">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#portals">Portals</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className={styles.footerCol}>
            <h4>Portals</h4>
            <Link to="/userregistration">Citizen registration</Link>
            <Link to="/login">Citizen sign in</Link>
            <Link to="/login">Authority sign in</Link>
            <Link to="/login">Admin sign in</Link>
          </div>

          <div className={styles.footerCol}>
            <h4>Contact</h4>
            <a href="mailto:support@civicconnect.gov">support@civicconnect.gov</a>
            <span className={styles.footerMuted}>Kerala, India</span>
            <span className={styles.footerMuted}>Mon – Sat, 9:00 – 18:00 IST</span>
          </div>
        </div>

        <div className={`cc-container ${styles.footerBottom}`}>
          <span>© {new Date().getFullYear()} Civic Connect. All rights reserved.</span>
          <div className={styles.footerBottomLinks}>
            <a href="#platform">Transparency</a>
            <a href="#faq">Help centre</a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
