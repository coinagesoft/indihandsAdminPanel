"use client";
import React from "react";

const GlobalLoader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-spinner"></div>
    </div>
  );
};

export default GlobalLoader;