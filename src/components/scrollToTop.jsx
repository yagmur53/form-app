import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./scrollToTop.css";

export default function ScrollToTop({ scrollTargetRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTarget = () => {
    if (scrollTargetRef?.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    visible && (
      <button className="scroll-to-top" onClick={scrollToTarget}>
        <FaArrowUp />
      </button>
    )
  );
}
