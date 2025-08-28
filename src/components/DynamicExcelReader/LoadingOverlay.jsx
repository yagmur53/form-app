import React from "react";

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <span className="loading-text">İşlem devam ediyor...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
