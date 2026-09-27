import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 8, // Position slightly above header
        left: rect.left + window.scrollX + rect.width / 2, // Centered horizontally
      });
    }
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          cursor: "help",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <span
          style={{
            fontSize: "10px",
            color: "#6b7280",
            border: "1px solid #9ca3af",
            borderRadius: "50%",
            width: "14px",
            height: "14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            lineHeight: "1",
            userSelect: "none",
          }}
        >
          i
        </span>
      </span>

      {visible &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, -100%)",
              background: "#1f2937",
              color: "#ffffff",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 400,
              whiteSpace: "normal",
              width: "220px",
              zIndex: 99999,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
              lineHeight: "1.4",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {text}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "6px",
                borderStyle: "solid",
                borderColor: "#1f2937 transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}