import React from "react";
import style from "./Dashboard.module.css";
import { Link } from "react-router-dom";
import mapImage from "../../Components/assets/image1.png";
const Dashboard = () => {

  const features = [
    {
      icon: "📢",
      title: "Report Local Issues",
      desc: "Instant reporting for broken roads, streetlights, or water supply with GPS tagging and photo evidence.",
    },
    {
      icon: "🔍",
      title: "Real-time Tracking",
      desc: "Transparency at its best. Watch your complaint move from 'Received' to 'In-Progress' to 'Resolved'.",
    },
    {
      icon: "🤝",
      title: "Community Upvoting",
      desc: "Crowdsource priority. The more upvotes an issue gets, the higher it climbs on the authority's dashboard.",
    },
    {
      icon: "📊",
      title: "Data Insights",
      desc: "View ward-wise performance heatmaps and see how your local representatives are performing.",
    },
  ];

  return (
    <div className={style.page}>



      {/* Hero Section */}
      <section className={style.hero}>
        <div className={style.heroContent}>
          <span className={style.badge}>Introducing Civic Connect 2.0</span>
          <h1 className={style.title}>
            Transform Your Community <br /> With <span>Digital Governance</span>
          </h1>
          <p className={style.subtitle}>
            Streamline civic reporting, boost authority accountability, and enhance
            neighborhood satisfaction with our cutting-edge SaaS platform.
          </p>

          {/* <div className={style.actionGroup}>
            <Link to="/userregistration" className={style.primaryBtn}>
              Register as Citizen →
            </Link>
            <Link to="/login" className={style.secondaryBtn}>
              Login
            </Link>
          </div>
          <div>
            <br />
          </div> */}
          {/* <div className={style.socialProof}>
             <div className={style.avatarGroup}>
                <div className={style.avatar}></div>
                <div className={style.avatar}></div>
                <div className={style.avatar}></div>
             </div>
             <p>500+ Local Authorities already using our platform</p>
          </div> */}
        </div>

        {/* Visual Element mimicking the phone in image */}
        <div className={style.heroImageContainer}>
          <div className={style.mockup}>
            <div className={style.mockupContent}>
              <img src={mapImage} alt="Active Reports Map" />
            </div>            </div>
        </div>
      </section>

      {/* Stats Bar */}
      {/* <section className={style.statsBar}>
        {stats.map((stat, i) => (
          <div key={i} className={style.statItem}>
            <h4>{stat.value}</h4>
            <p>{stat.label}</p>
          </div>
        ))}
      </section> */}

      {/* Features Grid */}
      <section className={style.section}>
        <div className={style.sectionHeader}>
          <span className={style.smallBadge}>Why Civic Connect?</span>
          <h2>A transparent approach to local issues</h2>
        </div>

        <div className={style.cardGrid}>
          {features.map((item, index) => (
            <div className={style.featureCard} key={index}>
              <div className={style.iconBox}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
};

export default Dashboard;