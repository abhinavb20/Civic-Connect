import React from "react";
import { FiInbox } from "react-icons/fi";

const EmptyState = ({
  icon,
  title = "Nothing here yet",
  description,
  action,
  children,
}) => {
  const Icon = icon || FiInbox;
  return (
    <div className="cc-empty">
      <div className="cc-empty-art">
        <Icon />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
      {children}
    </div>
  );
};

export default EmptyState;
