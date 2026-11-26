import React, { useState } from "react";
import { initials } from "../api";

const Avatar = ({ src, name = "", size = "md", className = "", alt }) => {
  const [broken, setBroken] = useState(false);
  const sizeClass = size === "sm" ? "cc-avatar cc-avatar--sm" : size === "lg" ? "cc-avatar cc-avatar--lg" : "cc-avatar";

  if (src && !broken) {
    return (
      <span className={`${sizeClass} ${className}`.trim()}>
        <img
          src={src}
          alt={alt || name || "Profile"}
          className="cc-avatar-img"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${sizeClass} ${className}`.trim()} aria-label={name || "Profile"}>
      {initials(name)}
    </span>
  );
};

export default Avatar;
