// import React, { useState, useEffect } from "react";
// import { loginToAngelOne, getAngelOneStatus } from "../services/angelOneService";

// function statusColor(status) {
//   if (status === "CONNECTED") return "#1a7f37";
//   if (status === "ERROR") return "#d1242f";
//   return "#9a6700"; // DISCONNECTED or unknown
// }

// export default function AngelOneStatus() {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchStatus = () => {
//     getAngelOneStatus()
//       .then(setSession)
//       .catch((err) => setError(err.message));
//   };

//   useEffect(() => {
//     fetchStatus();
//   }, []);

//   const handleLogin = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await loginToAngelOne();
//       setSession(result);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "16px" }}>
//       <span style={{ fontWeight: 600 }}>Broker:</span>
//       <span style={{ color: statusColor(session?.status), fontWeight: 600 }}>
//         {session?.status || "UNKNOWN"}
//       </span>

//       {session?.status === "ERROR" && session?.lastError && (
//         <span style={{ color: "#d1242f", fontSize: "13px" }}>
//           ({session.lastError})
//         </span>
//       )}

//       <button onClick={handleLogin} disabled={loading}>
//         {loading ? "Connecting..." : "Connect to Angel One"}
//       </button>

//       {error && <span style={{ color: "red" }}>{error}</span>}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { loginToAngelOne, getAngelOneStatus } from "../services/angelOneService";
import "./AngelOneStatus.css"; // Responsive stylesheet import

function statusColor(status) {
  if (status === "CONNECTED") return "status-connected";
  if (status === "ERROR") return "status-error";
  return "status-disconnected"; // DISCONNECTED or unknown
}

export default function AngelOneStatus() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = () => {
    getAngelOneStatus()
      .then(setSession)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginToAngelOne();
      setSession(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="broker-status-card">
      <div className="broker-info-group">
        <span className="broker-label">Broker:</span>
        <div className={`status-pill ${statusColor(session?.status)}`}>
          <span className="status-dot"></span>
          <span>{session?.status || "UNKNOWN"}</span>
        </div>

        {session?.status === "ERROR" && session?.lastError && (
          <span className="broker-error-sub">({session.lastError})</span>
        )}
      </div>

      <div className="broker-action-group">
        <button
          className="btn-broker-connect"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect to Angel One"}
        </button>

        {error && <span className="broker-error-text">{error}</span>}
      </div>
    </div>
  );
}