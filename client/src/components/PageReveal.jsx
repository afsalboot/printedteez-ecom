import React from "react";
import { useLocation } from "react-router";

const PageReveal = ({ children, className = "" }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`animate-page-reveal ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default PageReveal;
