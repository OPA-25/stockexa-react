import React, { useState } from "react";

export default function DashboardLegend({ beginnerMode, onToggleBeginnerMode }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "12px 16px", marginBottom: "14px", background: "#f9fafb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <strong style={{ fontSize: "14px" }}>📖 How to read this dashboard {expanded ? "▲" : "▼"}</strong>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={beginnerMode} onChange={onToggleBeginnerMode} />
          Beginner Mode (plain-English hints)
        </label>
      </div>

      {expanded && (
        <div style={{ marginTop: "10px", fontSize: "13px", lineHeight: "1.6", color: "#374151" }}>
          <p style={{ margin: "4px 0" }}>
            <strong>Verdict</strong> = what the indicators lean toward (even a weak hint). <strong>Action</strong> = the actual recommendation — only fires when the signal is strong enough. If they match (e.g. Sell/Sell), it's a real trade idea. If Action says <em>Hold</em> while Verdict leans Buy/Sell, it means "watch this, don't act yet."
          </p>
          <p style={{ margin: "4px 0" }}>
            <span style={{ color: "#1a7f37", fontWeight: 600 }}>Green</span> = bullish / positive.{" "}
            <span style={{ color: "#d1242f", fontWeight: 600 }}>Red</span> = bearish / negative.{" "}
            <span style={{ color: "#9a6700", fontWeight: 600 }}>Yellow/Orange</span> = neutral or uncertain.
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>ML Probability</strong> = a machine learning model's guess at direction. <strong>News Sentiment</strong> = how recent headlines read (positive/negative). These are separate opinions from Verdict/Action — they can disagree, and that's normal since they use different data.
          </p>
          <p style={{ margin: "4px 0", color: "#6b7280" }}>
            Hover the <strong>ⓘ</strong> icon next to any column name for a quick explanation.
          </p>
        </div>
      )}
    </div>
  );
}