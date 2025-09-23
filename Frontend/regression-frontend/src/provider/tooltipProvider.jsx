// TooltipProvider.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const Tooltip = ({ text, position }) => {
  if (!text) return null;
  const style = {
    position: "fixed",
    top: position.y + 10,
    left: position.x + 10,
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    pointerEvents: "none",
    zIndex: 9999,
    fontSize: "12px",
  };
  return <div style={style}>{text}</div>;
};

const TooltipProvider = ({ children }) => {
  const [tooltip, setTooltip] = useState({ text: "", position: { x: 0, y: 0 } });

  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (target) {
        setTooltip({ text: target.getAttribute("data-tooltip"), position: { x: e.clientX, y: e.clientY } });
      }
    };

    const handleMouseMove = (e) => {
      if (tooltip.text) {
        setTooltip((prev) => ({ ...prev, position: { x: e.clientX, y: e.clientY } }));
      }
    };

    const handleMouseOut = () => setTooltip({ text: "", position: { x: 0, y: 0 } });

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [tooltip.text]);

  return (
    <>
      {children}
      {ReactDOM.createPortal(<Tooltip text={tooltip.text} position={tooltip.position} />, document.body)}
    </>
  );
};

export default TooltipProvider;
