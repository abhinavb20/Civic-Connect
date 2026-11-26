import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import EmptyState from "./EmptyState";

const InlineNotFound = ({ home = "/" }) => (
  <div className="cc-card">
    <EmptyState
      title="This page isn't part of your workspace"
      description="The address may be outdated. Use the navigation to continue where you left off."
      action={
        <Link to={home} className="cc-btn cc-btn--primary">
          <FiArrowLeft /> Back to overview
        </Link>
      }
    />
  </div>
);

export default InlineNotFound;
