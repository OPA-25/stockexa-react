// import React, { useState, useEffect, useCallback } from "react";
// import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";
// import { refreshInstrumentMaster } from "../services/instrumentService";
// import StockSearchBar from "./StockSearchBar";

// export default function WatchlistPanel() {
//   const [watchlist, setWatchlist] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [refreshMessage, setRefreshMessage] = useState(null);

//   const loadWatchlist = useCallback(() => {
//     getWatchlist()
//       .then(setWatchlist)
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     loadWatchlist();
//   }, [loadWatchlist]);

//   const handleRemove = async (token) => {
//     try {
//       await removeFromWatchlist(token);
//       loadWatchlist();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleRefreshInstruments = async () => {
//     setRefreshing(true);
//     setRefreshMessage(null);
//     try {
//       const result = await refreshInstrumentMaster();
//       setRefreshMessage(`Loaded ${result.instrumentsLoaded} stocks. You can search now.`);
//     } catch (err) {
//       setRefreshMessage(`Error: ${err.message}`);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   return (
//     <div style={{ marginBottom: "24px" }}>
//       <h3>My Watchlist</h3>

//       <div style={{ marginBottom: "12px" }}>
//         <button onClick={handleRefreshInstruments} disabled={refreshing}>
//           {refreshing ? "Loading stock list..." : "Load / Refresh Stock List"}
//         </button>
//         {refreshMessage && (
//           <span style={{ marginLeft: "10px", fontSize: "13px", color: refreshMessage.startsWith("Error") ? "#d1242f" : "#1a7f37" }}>
//             {refreshMessage}
//           </span>
//         )}
//       </div>

//       <StockSearchBar onStockAdded={loadWatchlist} />

//       {loading && <p>Loading watchlist...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && watchlist.length === 0 && (
//         <p style={{ color: "#999" }}>No stocks added yet — search above to add some.</p>
//       )}

//       {watchlist.length > 0 && (
//         <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "500px" }}>
//           <thead>
//             <tr>
//               <th style={{ textAlign: "left", padding: "6px" }}>Symbol</th>
//               <th style={{ textAlign: "left", padding: "6px" }}>Name</th>
//               <th style={{ padding: "6px" }}></th>
//             </tr>
//           </thead>
//           <tbody>
//             {watchlist.map((item) => (
//               <tr key={item.token}>
//                 <td style={{ padding: "6px" }}>{item.tradingSymbol}</td>
//                 <td style={{ padding: "6px" }}>{item.name}</td>
//                 <td style={{ padding: "6px" }}>
//                   <button onClick={() => handleRemove(item.token)} style={{ color: "#d1242f", cursor: "pointer" }}>
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }




import React, { useState, useEffect, useCallback } from "react";
import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";
import { refreshInstrumentMaster } from "../services/instrumentService";
import StockSearchBar from "./StockSearchBar";
import "./WatchlistPanel.css"; // Modern stylesheet import

export default function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);

  const loadWatchlist = useCallback(() => {
    getWatchlist()
      .then(setWatchlist)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleRemove = async (token) => {
    try {
      await removeFromWatchlist(token);
      loadWatchlist();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefreshInstruments = async () => {
    setRefreshing(true);
    setRefreshMessage(null);
    try {
      const result = await refreshInstrumentMaster();
      setRefreshMessage(`Loaded ${result.instrumentsLoaded} stocks. You can search now.`);
    } catch (err) {
      setRefreshMessage(`Error: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="watchlist-card">
      <h3 className="watchlist-title">My Watchlist</h3>

      <div className="watchlist-refresh-wrapper">
        <button 
          className="btn-refresh-stocks" 
          onClick={handleRefreshInstruments} 
          disabled={refreshing}
        >
          {refreshing ? "Loading stock list..." : "Load / Refresh Stock List"}
        </button>

        {refreshMessage && (
          <span 
            className={`refresh-status-msg ${
              refreshMessage.startsWith("Error") ? "msg-error" : "msg-success"
            }`}
          >
            {refreshMessage}
          </span>
        )}
      </div>

      <StockSearchBar onStockAdded={loadWatchlist} />

      {loading && <p className="watchlist-loading-text">Loading watchlist...</p>}
      {error && <p className="watchlist-error-text">{error}</p>}

      {!loading && watchlist.length === 0 && (
        <p className="watchlist-empty-text">
          No stocks added yet — search above to add some.
        </p>
      )}

      {watchlist.length > 0 && (
        <div className="watchlist-table-wrapper">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th className="th-left">Symbol</th>
                <th className="th-left">Name</th>
                <th className="th-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => (
                <tr key={item.token} className="watchlist-row">
                  <td className="symbol-cell">{item.tradingSymbol}</td>
                  <td className="name-cell">{item.name}</td>
                  <td className="action-cell">
                    <button 
                      className="btn-remove-stock" 
                      onClick={() => handleRemove(item.token)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}