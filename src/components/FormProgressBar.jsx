// FormProgressBar.jsx
import React, { useEffect, useState } from "react";
import "./styles/formProgressBar.css";

const FormProgressBar = ({ fieldIds, kalkinmaSecim }) => {
  const [progress, setProgress] = useState(0);

  const calculateProgress = () => {
    let filled = 0;

    fieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.value && el.value !== "Seçiniz") {
        filled++;
      }
    });

    if (kalkinmaSecim.length > 0) filled++;

    return Math.round((filled / (fieldIds.length + 1)) * 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(calculateProgress());
    }, 500);

    return () => clearInterval(interval);
  }, [kalkinmaSecim]);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      <span className="progress-text">{progress}% tamamlandı</span>
    </div>
  );
};

export default FormProgressBar;
