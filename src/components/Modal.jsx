import React, { useEffect } from "react";
import "./modal.css";
import CloseBtn from "../assets/close.png";

export default function Modal({ url, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={CloseBtn} onClick={onClose}></img>
        <iframe
          src={url}
          title="Gömülü İçerik"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
