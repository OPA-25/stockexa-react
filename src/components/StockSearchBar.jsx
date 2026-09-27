// import React, { useState, useEffect, useRef } from "react";
// import { searchInstruments } from "../services/instrumentService";
// import { addToWatchlist } from "../services/watchlistService";

// export default function StockSearchBar({ onStockAdded }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const debounceRef = useRef(null);

//   useEffect(() => {
//     if (debounceRef.current) clearTimeout(debounceRef.current);

//     if (query.trim().length < 2) {
//       setResults([]);
//       return;
//     }

//     debounceRef.current = setTimeout(async () => {
//       setLoading(true);
//       try {
//         const data = await searchInstruments(query);
//         setResults(data);
//         setShowDropdown(true);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }, 300); // wait 300ms after typing stops before hitting the API

//     return () => clearTimeout(debounceRef.current);
//   }, [query]);

//   const handleAdd = async (stock) => {
//     try {
//       await addToWatchlist(stock.token, stock.tradingSymbol, stock.name);
//       setQuery("");
//       setResults([]);
//       setShowDropdown(false);
//       if (onStockAdded) onStockAdded();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div style={{ position: "relative", maxWidth: "400px", marginBottom: "16px" }}>
//       <input
//         type="text"
//         placeholder="Search stocks (e.g. RELIANCE, TCS)"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         onFocus={() => results.length > 0 && setShowDropdown(true)}
//         style={{ width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px" }}
//       />

//       {loading && <div style={{ position: "absolute", right: "10px", top: "10px", fontSize: "12px", color: "#999" }}>...</div>}

//       {showDropdown && results.length > 0 && (
//         <div style={{
//           position: "absolute", top: "100%", left: 0, right: 0,
//           background: "#fff", border: "1px solid #ddd", borderRadius: "6px",
//           maxHeight: "300px", overflowY: "auto", zIndex: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
//         }}>
//           {results.map((stock) => (
//             <div
//               key={stock.token}
//               onClick={() => handleAdd(stock)}
//               style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
//               onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
//               onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
//             >
//               <strong>{stock.tradingSymbol}</strong>
//               <span style={{ color: "#666", marginLeft: "8px", fontSize: "13px" }}>{stock.name}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {showDropdown && query.trim().length >= 2 && !loading && results.length === 0 && (
//         <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ddd", padding: "10px", borderRadius: "6px" }}>
//           No matching stocks found.
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { searchInstruments } from "../services/instrumentService";
import { addToWatchlist } from "../services/watchlistService";
import "./StockSearchBar.css"; // Modern stylesheet import

export default function StockSearchBar({ onStockAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchInstruments(query);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // wait 300ms after typing stops before hitting the API

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleAdd = async (stock) => {
    try {
      await addToWatchlist(stock.token, stock.tradingSymbol, stock.name);
      setQuery("");
      setResults([]);
      setShowDropdown(false);
      if (onStockAdded) onStockAdded();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search stocks (e.g. RELIANCE, TCS)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {loading && <div className="search-spinner"></div>}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((stock) => (
            <div
              key={stock.token}
              className="search-result-item"
              onClick={() => handleAdd(stock)}
            >
              <div className="stock-info">
                <span className="stock-symbol">{stock.tradingSymbol}</span>
                <span className="stock-name">{stock.name}</span>
              </div>
              <span className="add-badge">+ Add</span>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="search-dropdown empty-result">
          No matching stocks found.
        </div>
      )}
    </div>
  );
}