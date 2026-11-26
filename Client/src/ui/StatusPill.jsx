/* eslint-disable react-refresh/only-export-components */
import React from "react";

export const STATUS_TONES = {
  submitted: "brand",
  verified: "violet",
  "in progress": "amber",
  inprogress: "amber",
  resolved: "green",
  closed: "teal",
  rejected: "rose",
};

export const statusTone = (status = "") =>
  STATUS_TONES[String(status).toLowerCase()] || "brand";

const StatusPill = ({ status = "Submitted", className = "" }) => {
  const tone = statusTone(status);
  return (
    <span className={`cc-badge cc-badge--${tone} ${className}`.trim()}>
      <span className="cc-dot" aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusPill;
