

//====final===============




// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { fetchAllStocks } from "../services/dashboardService";
// import { refreshLivePrices } from "../services/livePriceService";
// import indicatorService from "../services/indicatorService";
// import { refreshOptionMaster, recalculateOptions } from "../services/optionService";
// import { refreshNewsSentiment, getHeadlinesForStock } from "../services/newsService";
// import { fetchIntradayData, trainIntradayModel, predictIntraday } from "../services/intradayService";
// import Tooltip from "./Tooltip";
// import DashboardLegend from "./DashboardLegend";
// import "./StockDashboard.css";

// function verdictColor(verdict) {
//   if (!verdict) return "verdict-neutral";
//   const v = verdict.toLowerCase();
//   if (v.includes("buy")) return "verdict-buy";
//   if (v.includes("sell")) return "verdict-sell";
//   return "verdict-neutral";
// }

// function getNewsSentimentColor(label) {
//   if (!label) return "#9a6700";
//   const lower = label.toLowerCase();
//   if (lower.includes("bullish") || lower.includes("positive")) return "#1a7f37";
//   if (lower.includes("bearish") || lower.includes("negative")) return "#d1242f";
//   return "#9a6700";
// }

// /**
//  * Dynamic Suggestion Engine
//  * Evaluates live market conditions, RSI levels, price position in day range,
//  * ML probabilities, and technical alignment.
//  */
// export function getDynamicSuggestion(stock) {
//   if (!stock) return { label: "-", badgeClass: "badge-neutral", desc: "" };

//   const {
//     overallVerdict,
//     action,
//     rsi14,
//     mlProbabilityUp,
//     combinedProbabilityUp,
//     newsSentimentLabel,
//     cmp,
//     dayHigh,
//     dayLow,
//     optionTradeSuggestion
//   } = stock;

//   const high = parseFloat(dayHigh);
//   const low = parseFloat(dayLow);
//   const current = parseFloat(cmp);
//   const dayRange = high - low;
//   const rangePosition = (!isNaN(dayRange) && dayRange > 0 && !isNaN(current)) 
//     ? (current - low) / dayRange 
//     : 0.5;

//   const mlProb = typeof mlProbabilityUp === "number" ? mlProbabilityUp : parseFloat(mlProbabilityUp) || 50;
//   const combinedProb = typeof combinedProbabilityUp === "number" ? combinedProbabilityUp : parseFloat(combinedProbabilityUp) || 50;
//   const rsi = typeof rsi14 === "number" ? rsi14 : parseFloat(rsi14) || 50;

//   const isRsiOverbought = rsi >= 70;
//   const isRsiOversold = rsi <= 30;

//   if (optionTradeSuggestion && optionTradeSuggestion !== "-" && !optionTradeSuggestion.toLowerCase().includes("avoid")) {
//     return {
//       label: optionTradeSuggestion,
//       badgeClass: optionTradeSuggestion.toLowerCase().includes("buy") ? "badge-buy-strong" : "badge-sell-strong",
//       desc: "Option trade setup active."
//     };
//   }

//   if (action === "Buy" && overallVerdict === "Buy" && !isRsiOverbought) {
//     if (combinedProb >= 52 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bullish"))) {
//       return {
//         label: "🔥 Strong Buy Setup",
//         badgeClass: "badge-buy-strong",
//         desc: "High probability alignment across technicals and sentiment."
//       };
//     }
//   }

//   if (action === "Sell" && overallVerdict === "Sell" && !isRsiOversold) {
//     if (combinedProb <= 48 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bearish"))) {
//       return {
//         label: "🔻 Strong Short / Exit",
//         badgeClass: "badge-sell-strong",
//         desc: "Bearish breakdown supported by negative sentiment & trend."
//       };
//     }
//   }

//   if ((overallVerdict === "Buy" || action === "Buy") && rangePosition >= 0.65 && !isRsiOverbought) {
//     return {
//       label: "📈 Bullish Momentum",
//       badgeClass: "badge-buy-moderate",
//       desc: "Trading near high of the day with active buying pressure."
//     };
//   }

//   if ((overallVerdict === "Sell" || action === "Sell") && rangePosition <= 0.35 && !isRsiOversold) {
//     return {
//       label: "📉 Downside Drift",
//       badgeClass: "badge-sell-moderate",
//       desc: "Trading near low of the day under continuous selling pressure."
//     };
//   }

//   if (isRsiOverbought) {
//     return {
//       label: "⚠️ Overbought (RSI > 70)",
//       badgeClass: "badge-warning",
//       desc: "RSI is elevated. Avoid fresh long entry; trail stop loss."
//     };
//   }

//   if (isRsiOversold) {
//     return {
//       label: "🎯 Dip Buy Reversal",
//       badgeClass: "badge-reversal",
//       desc: "Oversold RSI indicates potential bounce setup."
//     };
//   }

//   if (action === "Hold" && overallVerdict && overallVerdict !== "Hold") {
//     return {
//       label: `👀 Watch for ${overallVerdict} Breakout`,
//       badgeClass: "badge-watch",
//       desc: "Trend established. Waiting for volume/probability confirmation."
//     };
//   }

//   if (combinedProb >= 53.5) {
//     return {
//       label: "⚡ Positive ML Edge",
//       badgeClass: "badge-buy-moderate",
//       desc: "Combined statistical probability leans favorable (>53.5%)."
//     };
//   }

//   return {
//     label: "⏸️ Rangebound",
//     badgeClass: "badge-neutral",
//     desc: "Price consolidating within intraday range."
//   };
// }

// export default function StockDashboard() {
//   const [stocks, setStocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastRefreshMsg, setLastRefreshMsg] = useState(null);
//   const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

//   const [beginnerMode, setBeginnerMode] = useState(false);

//   const [indicatorMessage, setIndicatorMessage] = useState("");
//   const [loadingHistorical, setLoadingHistorical] = useState(false);
//   const [loadingIndicators, setLoadingIndicators] = useState(false);

//   const [optionMessage, setOptionMessage] = useState("");
//   const [loadingOptionMaster, setLoadingOptionMaster] = useState(false);
//   const [loadingOptionRecalc, setLoadingOptionRecalc] = useState(false);

//   const [newsMessage, setNewsMessage] = useState("");
//   const [loadingNews, setLoadingNews] = useState(false);
//   const [expandedHeadlines, setExpandedHeadlines] = useState({});

//   const [intradayMessage, setIntradayMessage] = useState("");
//   const [loadingIntraday, setLoadingIntraday] = useState(false);

//   const intervalRef = useRef(null);

//   const loadStocks = useCallback(() => {
//     fetchAllStocks()
//       .then((data) => {
//         setStocks(data);
//         setLastUpdatedAt(new Date().toLocaleTimeString());
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   const triggerRefresh = useCallback(async () => {
//     try {
//       const msg = await refreshLivePrices();
//       setLastRefreshMsg(msg);
//     } catch (err) {
//       setLastRefreshMsg(`Error: ${err.message}`);
//     } finally {
//       loadStocks();
//     }
//   }, [loadStocks]);

//   const fetchHistorical = async () => {
//     try {
//       setLoadingHistorical(true);
//       setIndicatorMessage("");
//       const msg = await indicatorService.fetchHistoricalData();
//       setIndicatorMessage(msg);
//     } catch (err) {
//       setIndicatorMessage(err?.response?.data || err.message || "Failed to fetch historical data.");
//     } finally {
//       setLoadingHistorical(false);
//     }
//   };

//   const recalculateIndicators = async () => {
//     try {
//       setLoadingIndicators(true);
//       setIndicatorMessage("");
//       const msg = await indicatorService.recalculateIndicators();
//       setIndicatorMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setIndicatorMessage(err?.response?.data || err.message || "Failed to recalculate indicators.");
//     } finally {
//       setLoadingIndicators(false);
//     }
//   };

//   const handleRefreshOptionMaster = async () => {
//     try {
//       setLoadingOptionMaster(true);
//       setOptionMessage("");
//       const result = await refreshOptionMaster();
//       setOptionMessage(`Loaded ${result.optionsLoaded} option contracts.`);
//     } catch (err) {
//       setOptionMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingOptionMaster(false);
//     }
//   };

//   const handleRecalculateOptions = async () => {
//     try {
//       setLoadingOptionRecalc(true);
//       setOptionMessage("");
//       const msg = await recalculateOptions();
//       setOptionMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setOptionMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingOptionRecalc(false);
//     }
//   };

//   const handleRefreshNews = async () => {
//     try {
//       setLoadingNews(true);
//       setNewsMessage("");
//       const msg = await refreshNewsSentiment();
//       setNewsMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setNewsMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingNews(false);
//     }
//   };

//   const toggleHeadlines = async (tradingSymbol) => {
//     if (expandedHeadlines[tradingSymbol]) {
//       setExpandedHeadlines((prev) => {
//         const copy = { ...prev };
//         delete copy[tradingSymbol];
//         return copy;
//       });
//       return;
//     }
//     try {
//       const headlines = await getHeadlinesForStock(tradingSymbol);
//       setExpandedHeadlines((prev) => ({ ...prev, [tradingSymbol]: headlines }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRunIntradayPrediction = async () => {
//     try {
//       setLoadingIntraday(true);
//       setIntradayMessage("");
//       const fetchMsg = await fetchIntradayData();
//       const trainMsg = await trainIntradayModel();
//       const predictMsg = await predictIntraday();
//       setIntradayMessage(`${fetchMsg} | ${trainMsg} | ${predictMsg}`);
//       loadStocks();
//     } catch (err) {
//       setIntradayMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingIntraday(false);
//     }
//   };

//   useEffect(() => {
//     loadStocks();
//     triggerRefresh();
//     intervalRef.current = setInterval(triggerRefresh, 8000);
//     return () => clearInterval(intervalRef.current);
//   }, [loadStocks, triggerRefresh]);

//   if (loading) {
//     return (
//       <div className="dashboard-status-container">
//         <div className="spinner"></div>
//         <p className="loading-text">Loading dashboard...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-status-container">
//         <p className="error-text">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="toolbar-container">
//         <div className="button-group">
//           <button className="btn btn-primary" onClick={triggerRefresh}>
//             Refresh Now
//           </button>
//           <button className="btn btn-secondary" onClick={fetchHistorical} disabled={loadingHistorical}>
//             {loadingHistorical ? "Fetching..." : "Fetch Historical Data"}
//           </button>
//           <button className="btn btn-secondary" onClick={recalculateIndicators} disabled={loadingIndicators}>
//             {loadingIndicators ? "Calculating..." : "Recalculate Indicators"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRefreshOptionMaster} disabled={loadingOptionMaster}>
//             {loadingOptionMaster ? "Loading..." : "Load Option Contracts"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRecalculateOptions} disabled={loadingOptionRecalc}>
//             {loadingOptionRecalc ? "Analyzing..." : "Recalculate Options"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRefreshNews} disabled={loadingNews}>
//             {loadingNews ? "Fetching News..." : "Refresh News Sentiment"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRunIntradayPrediction} disabled={loadingIntraday}>
//             {loadingIntraday ? "Predicting..." : "Run Intraday (5-min) Prediction"}
//           </button>
//         </div>

//         <div className="status-meta">
//           {lastUpdatedAt && <span className="meta-item">Last updated: {lastUpdatedAt}</span>}
//           {lastRefreshMsg && (
//             <span className={`meta-item ${lastRefreshMsg.startsWith("Error") ? "msg-error" : "msg-info"}`}>
//               {lastRefreshMsg}
//             </span>
//           )}
//         </div>
//       </div>

//       <DashboardLegend
//         beginnerMode={beginnerMode}
//         onToggleBeginnerMode={() => setBeginnerMode(!beginnerMode)}
//       />

//       {indicatorMessage && (
//         <div className="alert alert-indicator">
//           <span className="alert-icon">📊</span>
//           <span>{indicatorMessage}</span>
//         </div>
//       )}

//       {optionMessage && (
//         <div className="alert alert-option">
//           <span className="alert-icon">⚡</span>
//           <span>{optionMessage}</span>
//         </div>
//       )}

//       {newsMessage && (
//         <div className="alert alert-news">
//           <span className="alert-icon">📰</span>
//           <span>{newsMessage}</span>
//         </div>
//       )}

//       {intradayMessage && (
//         <div className="alert alert-news">
//           <span className="alert-icon">⏱️</span>
//           <span>{intradayMessage}</span>
//         </div>
//       )}

//       <div className="table-responsive">
//         <table className="dashboard-table">
//           <thead>
//             <tr>
//               <th className="sticky-col sticky-col-1">
//                 <Tooltip text="NSE stock exchange symbol code for the security.">NSE Code</Tooltip>
//               </th>
//               <th className="sticky-col sticky-col-2">
//                 <Tooltip text="Full legal name of the listed company.">Company</Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Current Market Price — live price from Angel One, frozen at last close when market is shut.">
//                   CMP
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="How much the price has moved today vs yesterday's close.">
//                   Day Change %
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Highest price reached by this stock during today's trading session.">
//                   Day High
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Lowest price reached by this stock during today's trading session.">
//                   Day Low
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Total quantity of shares traded today on NSE.">
//                   Volume
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Momentum indicator (0-100). Above 70 = overbought (may fall). Below 30 = oversold (may bounce).">
//                   RSI14
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Bullish = price above its 50-day average (uptrend). Bearish = below (downtrend).">
//                   Trend
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The raw signal — what the indicators lean toward, even weakly. Not a trade instruction by itself.">
//                   Verdict
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The actual recommendation — only fires when the signal is strong enough to trust. If this says Hold, don't trade even if Verdict leans Buy/Sell.">
//                   Action
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Intraday = exit same day (volatile). Delivery = can hold for several days (calmer trend).">
//                   Trade Type
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Whether this stock has Futures & Options contracts available on NSE.">
//                   F&O
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Call = betting price goes up. Put = betting price goes down.">
//                   Option
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The strike price selected for the suggested option contract.">
//                   Strike
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Last traded price of the suggested option contract option premium.">
//                   Premium
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Dynamic trade suggestion based on live price action, RSI, ML probabilities, and news alignment.">
//                   Suggestion
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="A machine learning model's estimate of the % chance the stock closes higher. 50% = coin flip.">
//                   ML Probability
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Based on recent news headlines about this stock — click the label to read them.">
//                   News Sentiment
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Blends the ML model's guess with news sentiment into one number.">
//                   Combined Prob.
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="A separate, faster model's guess at price in the next 5 minutes — refreshes every 5 min during market hours. More experimental than the other predictions.">
//                   5-Min Prediction
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Simulated live P&L per share based on the current active 5-minute intraday prediction position.">
//                   Live 5m P&L
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="History of the last 5 completed 5-minute simulated trades and their P&L per share.">
//                   Recent 5m Trades
//                 </Tooltip>
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {stocks.length === 0 && (
//               <tr>
//                 <td colSpan={23} className="empty-table-cell">
//                   No data yet — add stocks to your watchlist above.
//                 </td>
//               </tr>
//             )}

//             {stocks.map((s) => {
//               const suggestion = getDynamicSuggestion(s);

//               // Helper parser for trades list
//               let recentTradesList = [];
//               const rawTrades = s.last5PnlTrades || s.intradayLast5PnlTrades || s.recent5mTradesJson;
//               if (Array.isArray(rawTrades)) {
//                 recentTradesList = rawTrades;
//               } else if (typeof rawTrades === "string") {
//                 try {
//                   recentTradesList = JSON.parse(rawTrades);
//                 } catch (e) {
//                   recentTradesList = [];
//                 }
//               }

//               const currentPnl = s.simulatedPnl ?? s.intradaySimulatedPnl ?? s.live5mPnL;

//               return (
//                 <React.Fragment key={s.nseCode}>
//                   <tr className="stock-row">
//                     <td className="font-semibold text-code sticky-col sticky-col-1">{s.nseCode}</td>
//                     <td className="font-medium sticky-col sticky-col-2">{s.companyName}</td>
//                     <td className="font-semibold">₹{s.cmp}</td>
//                     <td>
//                       {s.dayChangePct != null ? (
//                         <span className={`badge ${s.dayChangePct >= 0 ? "badge-positive" : "badge-negative"}`}>
//                           {s.dayChangePct}%
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>{s.dayHigh ?? "-"}</td>
//                     <td>{s.dayLow ?? "-"}</td>
//                     <td>{s.volumeToday ?? "-"}</td>
//                     <td>{s.rsi14 ?? "-"}</td>
//                     <td>{s.trendSignal ?? "-"}</td>
//                     <td>
//                       <span className={`verdict-pill ${verdictColor(s.overallVerdict)}`}>
//                         {s.overallVerdict ?? "-"}
//                       </span>
//                       {beginnerMode && s.overallVerdict && s.overallVerdict !== "Hold" && (
//                         <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
//                           {s.action === s.overallVerdict ? (
//                             s.overallVerdict === "Buy"
//                               ? "✅ Strong signal — safe to consider"
//                               : "✅ Strong signal — consider exiting/shorting"
//                           ) : (
//                             "⏳ Weak signal — just watch, don't trade"
//                           )}
//                         </div>
//                       )}
//                     </td>
//                     <td>{s.action ?? "-"}</td>
//                     <td>{s.tradeType ?? "-"}</td>
//                     <td>{s.fnoAvailable ?? "-"}</td>
//                     <td>{s.optionType ?? "-"}</td>
//                     <td>{s.optionAtmStrike ?? "-"}</td>
//                     <td>{s.optionPremiumLtp ?? "-"}</td>
//                     <td>
//                       <span
//                         className={`suggestion-pill ${suggestion.badgeClass}`}
//                         title={suggestion.desc}
//                       >
//                         {suggestion.label}
//                       </span>
//                     </td>
//                     <td>
//                       {s.mlProbabilityUp != null ? (
//                         <span
//                           className="badge"
//                           style={{
//                             fontWeight: 600,
//                             color: s.mlProbabilityUp >= 50 ? "#1a7f37" : "#d1242f",
//                           }}
//                         >
//                           {s.mlProbabilityUp}% up
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.newsSentimentLabel ? (
//                         <span
//                           className="badge"
//                           style={{
//                             fontWeight: 600,
//                             color: getNewsSentimentColor(s.newsSentimentLabel),
//                             cursor: "pointer",
//                             textDecoration: "underline",
//                           }}
//                           onClick={() => toggleHeadlines(s.nseCode)}
//                           title="Click to view headlines"
//                         >
//                           {s.newsSentimentLabel}
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.combinedProbabilityUp != null ? (
//                         <span style={{ fontWeight: 600, color: s.combinedProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
//                           {s.combinedProbabilityUp}% up
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.intradayPredictedPrice != null ? (
//                         <span style={{ fontWeight: 600, color: s.intradayProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
//                           ₹{s.intradayPredictedPrice} ({s.intradayProbabilityUp}% up)
//                         </span>
//                       ) : (
//                         <span
//                           className="badge badge-neutral"
//                           style={{ color: "#6e7781", cursor: "help" }}
//                           title="No 5-min prediction available. Click 'Run Intraday (5-min) Prediction' to retry."
//                         >
//                           N/A
//                         </span>
//                       )}
//                     </td>
//                     {/* Live Simulated 5m P&L */}
//                     <td
//                       style={{
//                         color: (currentPnl ?? 0) >= 0 ? "#10B981" : "#EF4444",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {currentPnl != null
//                         ? (currentPnl >= 0
//                             ? `+₹${currentPnl}`
//                             : `-₹${Math.abs(currentPnl)}`)
//                         : "-"}
//                     </td>
//                     {/* Last 5 Trade Records */}
//                     <td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
//                       {recentTradesList && recentTradesList.length > 0 ? (
//                         <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
//                           {recentTradesList.map((trade, idx) => {
//                             const pnlVal = typeof trade === "object" && trade !== null 
//                               ? trade.pnlPerShare 
//                               : parseFloat(trade);

//                             if (isNaN(pnlVal)) return null;

//                             const isPositive = pnlVal >= 0;
//                             const buyPrice = trade?.buyPrice ? `Buy: ₹${trade.buyPrice}` : "";
//                             const exitPrice = trade?.exitPrice ? ` Exit: ₹${trade.exitPrice}` : "";
//                             const time = trade?.timestamp ? ` @ ${trade.timestamp}` : "";

//                             return (
//                               <span
//                                 key={idx}
//                                 title={buyPrice ? `${buyPrice}${exitPrice}${time}` : `Trade ${idx + 1}: ${pnlVal}`}
//                                 style={{
//                                   display: "inline-block",
//                                   padding: "2px 6px",
//                                   borderRadius: "4px",
//                                   fontSize: "11px",
//                                   fontWeight: "600",
//                                   lineHeight: "1.2",
//                                   backgroundColor: isPositive ? "#D1FAE5" : "#FEE2E2",
//                                   color: isPositive ? "#065F46" : "#991B1B",
//                                   border: `1px solid ${isPositive ? "#A7F3D0" : "#FECACA"}`
//                                 }}
//                               >
//                                 {isPositive ? `+${pnlVal}` : pnlVal}
//                               </span>
//                             );
//                           })}
//                         </div>
//                       ) : (
//                         <span style={{ color: "#9CA3AF", fontSize: "12px" }}>Awaiting next bar</span>
//                       )}
//                     </td>
//                   </tr>

//                   {s.reasoningNotes && (
//                     <tr className="details-row">
//                       <td className="sticky-col sticky-col-1"></td>
//                       <td className="sticky-col sticky-col-2"></td>

//                       <td colSpan={21}>
//                         <div className="details-content">
//                           <span className="detail-item">
//                             <strong>Why:</strong> {s.reasoningNotes}
//                           </span>

//                           {s.overallVerdict && s.overallVerdict !== "Hold" && (
//                             <>
//                               {s.intradayEntryZone && s.intradayEntryZone !== "-" && (
//                                 <span className="detail-item">
//                                   <strong>Buy Range:</strong> {s.intradayEntryZone}
//                                 </span>
//                               )}
//                               {s.suggestedQuantity && (
//                                 <span className="detail-item">
//                                   <strong>Quantity:</strong> {s.suggestedQuantity} shares (1% Risk Sizing)
//                                 </span>
//                               )}
//                               {s.tradeType === "Intraday" && s.intradayTarget && (
//                                 <span className="detail-item">
//                                   <strong>Intraday Target:</strong> ₹{s.intradayTarget} | <strong>SL:</strong> ₹{s.intradayStopLoss}
//                                 </span>
//                               )}
//                               {s.tradeType === "Delivery" && s.swingTarget && (
//                                 <span className="detail-item">
//                                   <strong>Delivery Target:</strong> ₹{s.swingTarget} | <strong>SL:</strong> ₹{s.swingStopLoss}
//                                 </span>
//                               )}
//                             </>
//                           )}

//                           {s.suggestedHoldingPeriod && (
//                             <span className="detail-item">
//                               <strong>Holding Period:</strong> {s.suggestedHoldingPeriod}
//                             </span>
//                           )}

//                           {s.fnoAvailable === "Yes" && s.optionPremiumLtp && (
//                             <span className="detail-item">
//                               <strong>Option Target:</strong> ₹{s.suggestedPremiumTarget} |{" "}
//                               <strong>Option SL:</strong> ₹{s.suggestedPremiumStopLoss} |{" "}
//                               <strong>Lot Size:</strong> {s.optionLotSize} |{" "}
//                               <strong>Investment:</strong> ₹{s.optionInvestment}
//                             </span>
//                           )}
//                           {s.mlProbabilityUp != null && (
//                             <span className="detail-item">
//                               <strong>ML Confidence:</strong> {s.mlConfidence}%
//                             </span>
//                           )}
//                           {s.mlRangeLow != null && s.mlRangeHigh != null && (
//                             <span className="detail-item">
//                               <strong>ML Expected Range ({s.tradeType === "Intraday" ? "Intraday 80% Band" : "Delivery 80% Band"}):</strong> ₹{s.mlRangeLow} – ₹{s.mlRangeHigh}
//                               {s.mlPredictedPrice != null && (
//                                 <> (target ₹{s.mlPredictedPrice}, {s.mlPredictedReturnPct}% move)</>
//                               )}
//                             </span>
//                           )}
//                           {s.intradayPredictedPrice != null && (
//                             <span className="detail-item">
//                               <strong>5-Min Predicted Price:</strong> ₹{s.intradayPredictedPrice} |{" "}
//                               <strong>Range:</strong> ₹{s.intradayRangeLow} – ₹{s.intradayRangeHigh} |{" "}
//                               <strong>Move:</strong> {s.intradayPredictedReturnPct}% |{" "}
//                               <strong>Updated:</strong> {s.intradayPredictionUpdatedAt}
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )}

//                   {expandedHeadlines[s.nseCode] && (
//                     <tr className="details-row">
//                       <td className="sticky-col sticky-col-1"></td>
//                       <td className="sticky-col sticky-col-2"></td>

//                       <td colSpan={21}>
//                         <div className="details-content" style={{ flexDirection: "column", alignItems: "flex-start" }}>
//                           <strong>Recent headlines:</strong>
//                           {expandedHeadlines[s.nseCode].length === 0 && <span>No recent headlines found.</span>}
//                           {expandedHeadlines[s.nseCode].map((h, idx) => (
//                             <a
//                               key={h.id || idx}
//                               href={h.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{
//                                 display: "block",
//                                 marginTop: "4px",
//                                 color: getNewsSentimentColor(h.sentimentLabel),
//                               }}
//                             >
//                               [{h.sentimentLabel || "Neutral"}] {h.headline} — <em>{h.sourceName || h.source || "News"}</em>
//                             </a>
//                           ))}
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





// ================ new ml logics ==============

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { fetchAllStocks } from "../services/dashboardService";
// import { refreshLivePrices } from "../services/livePriceService";
// import indicatorService from "../services/indicatorService";
// import { refreshOptionMaster, recalculateOptions } from "../services/optionService";
// import { refreshNewsSentiment, getHeadlinesForStock } from "../services/newsService";
// import { fetchIntradayData, trainIntradayModel, predictIntraday } from "../services/intradayService";
// import Tooltip from "./Tooltip";
// import DashboardLegend from "./DashboardLegend";
// import "./StockDashboard.css";

// function verdictColor(verdict) {
//   if (!verdict) return "verdict-neutral";
//   const v = verdict.toLowerCase();
//   if (v.includes("buy")) return "verdict-buy";
//   if (v.includes("sell")) return "verdict-sell";
//   return "verdict-neutral";
// }

// function getNewsSentimentColor(label) {
//   if (!label) return "#9a6700";
//   const lower = label.toLowerCase();
//   if (lower.includes("bullish") || lower.includes("positive")) return "#1a7f37";
//   if (lower.includes("bearish") || lower.includes("negative")) return "#d1242f";
//   return "#9a6700";
// }

// // Maps the new "Strong Buy"..."Strong Sell" signal strings to existing badge CSS classes
// function signalBadgeClass(signal) {
//   if (!signal) return "badge-neutral";
//   const s = signal.toLowerCase();
//   if (s === "strong buy") return "badge-buy-strong";
//   if (s === "buy" || s === "weak buy") return "badge-buy-moderate";
//   if (s === "strong sell") return "badge-sell-strong";
//   if (s === "sell" || s === "weak sell") return "badge-sell-moderate";
//   return "badge-neutral";
// }

// function riskLevelColor(risk) {
//   if (!risk) return "#6e7781";
//   const r = risk.toLowerCase();
//   if (r === "low") return "#1a7f37";
//   if (r === "medium") return "#9a6700";
//   if (r === "high") return "#d1242f";
//   return "#6e7781";
// }

// /**
//  * Dynamic Suggestion Engine
//  * Evaluates live market conditions, RSI levels, price position in day range,
//  * ML probabilities, and technical alignment.
//  */
// export function getDynamicSuggestion(stock) {
//   if (!stock) return { label: "-", badgeClass: "badge-neutral", desc: "" };

//   const {
//     overallVerdict,
//     action,
//     rsi14,
//     mlProbabilityUp,
//     combinedProbabilityUp,
//     newsSentimentLabel,
//     cmp,
//     dayHigh,
//     dayLow,
//     optionTradeSuggestion
//   } = stock;

//   const high = parseFloat(dayHigh);
//   const low = parseFloat(dayLow);
//   const current = parseFloat(cmp);
//   const dayRange = high - low;
//   const rangePosition = (!isNaN(dayRange) && dayRange > 0 && !isNaN(current)) 
//     ? (current - low) / dayRange 
//     : 0.5;

//   const mlProb = typeof mlProbabilityUp === "number" ? mlProbabilityUp : parseFloat(mlProbabilityUp) || 50;
//   const combinedProb = typeof combinedProbabilityUp === "number" ? combinedProbabilityUp : parseFloat(combinedProbabilityUp) || 50;
//   const rsi = typeof rsi14 === "number" ? rsi14 : parseFloat(rsi14) || 50;

//   const isRsiOverbought = rsi >= 70;
//   const isRsiOversold = rsi <= 30;

//   if (optionTradeSuggestion && optionTradeSuggestion !== "-" && !optionTradeSuggestion.toLowerCase().includes("avoid")) {
//     return {
//       label: optionTradeSuggestion,
//       badgeClass: optionTradeSuggestion.toLowerCase().includes("buy") ? "badge-buy-strong" : "badge-sell-strong",
//       desc: "Option trade setup active."
//     };
//   }

//   if (action === "Buy" && overallVerdict === "Buy" && !isRsiOverbought) {
//     if (combinedProb >= 52 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bullish"))) {
//       return {
//         label: "🔥 Strong Buy Setup",
//         badgeClass: "badge-buy-strong",
//         desc: "High probability alignment across technicals and sentiment."
//       };
//     }
//   }

//   if (action === "Sell" && overallVerdict === "Sell" && !isRsiOversold) {
//     if (combinedProb <= 48 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bearish"))) {
//       return {
//         label: "🔻 Strong Short / Exit",
//         badgeClass: "badge-sell-strong",
//         desc: "Bearish breakdown supported by negative sentiment & trend."
//       };
//     }
//   }

//   if ((overallVerdict === "Buy" || action === "Buy") && rangePosition >= 0.65 && !isRsiOverbought) {
//     return {
//       label: "📈 Bullish Momentum",
//       badgeClass: "badge-buy-moderate",
//       desc: "Trading near high of the day with active buying pressure."
//     };
//   }

//   if ((overallVerdict === "Sell" || action === "Sell") && rangePosition <= 0.35 && !isRsiOversold) {
//     return {
//       label: "📉 Downside Drift",
//       badgeClass: "badge-sell-moderate",
//       desc: "Trading near low of the day under continuous selling pressure."
//     };
//   }

//   if (isRsiOverbought) {
//     return {
//       label: "⚠️ Overbought (RSI > 70)",
//       badgeClass: "badge-warning",
//       desc: "RSI is elevated. Avoid fresh long entry; trail stop loss."
//     };
//   }

//   if (isRsiOversold) {
//     return {
//       label: "🎯 Dip Buy Reversal",
//       badgeClass: "badge-reversal",
//       desc: "Oversold RSI indicates potential bounce setup."
//     };
//   }

//   if (action === "Hold" && overallVerdict && overallVerdict !== "Hold") {
//     return {
//       label: `👀 Watch for ${overallVerdict} Breakout`,
//       badgeClass: "badge-watch",
//       desc: "Trend established. Waiting for volume/probability confirmation."
//     };
//   }

//   if (combinedProb >= 53.5) {
//     return {
//       label: "⚡ Positive ML Edge",
//       badgeClass: "badge-buy-moderate",
//       desc: "Combined statistical probability leans favorable (>53.5%)."
//     };
//   }

//   return {
//     label: "⏸️ Rangebound",
//     badgeClass: "badge-neutral",
//     desc: "Price consolidating within intraday range."
//   };
// }

// export default function StockDashboard() {
//   const [stocks, setStocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastRefreshMsg, setLastRefreshMsg] = useState(null);
//   const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

//   const [beginnerMode, setBeginnerMode] = useState(false);

//   const [indicatorMessage, setIndicatorMessage] = useState("");
//   const [loadingHistorical, setLoadingHistorical] = useState(false);
//   const [loadingIndicators, setLoadingIndicators] = useState(false);

//   const [optionMessage, setOptionMessage] = useState("");
//   const [loadingOptionMaster, setLoadingOptionMaster] = useState(false);
//   const [loadingOptionRecalc, setLoadingOptionRecalc] = useState(false);

//   const [newsMessage, setNewsMessage] = useState("");
//   const [loadingNews, setLoadingNews] = useState(false);
//   const [expandedHeadlines, setExpandedHeadlines] = useState({});

//   const [intradayMessage, setIntradayMessage] = useState("");
//   const [loadingIntraday, setLoadingIntraday] = useState(false);

//   const intervalRef = useRef(null);

//   const loadStocks = useCallback(() => {
//     fetchAllStocks()
//       .then((data) => {
//         setStocks(data);
//         setLastUpdatedAt(new Date().toLocaleTimeString());
//       })
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   const triggerRefresh = useCallback(async () => {
//     try {
//       const msg = await refreshLivePrices();
//       setLastRefreshMsg(msg);
//     } catch (err) {
//       setLastRefreshMsg(`Error: ${err.message}`);
//     } finally {
//       loadStocks();
//     }
//   }, [loadStocks]);

//   const fetchHistorical = async () => {
//     try {
//       setLoadingHistorical(true);
//       setIndicatorMessage("");
//       const msg = await indicatorService.fetchHistoricalData();
//       setIndicatorMessage(msg);
//     } catch (err) {
//       setIndicatorMessage(err?.response?.data || err.message || "Failed to fetch historical data.");
//     } finally {
//       setLoadingHistorical(false);
//     }
//   };

//   const recalculateIndicators = async () => {
//     try {
//       setLoadingIndicators(true);
//       setIndicatorMessage("");
//       const msg = await indicatorService.recalculateIndicators();
//       setIndicatorMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setIndicatorMessage(err?.response?.data || err.message || "Failed to recalculate indicators.");
//     } finally {
//       setLoadingIndicators(false);
//     }
//   };

//   const handleRefreshOptionMaster = async () => {
//     try {
//       setLoadingOptionMaster(true);
//       setOptionMessage("");
//       const result = await refreshOptionMaster();
//       setOptionMessage(`Loaded ${result.optionsLoaded} option contracts.`);
//     } catch (err) {
//       setOptionMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingOptionMaster(false);
//     }
//   };

//   const handleRecalculateOptions = async () => {
//     try {
//       setLoadingOptionRecalc(true);
//       setOptionMessage("");
//       const msg = await recalculateOptions();
//       setOptionMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setOptionMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingOptionRecalc(false);
//     }
//   };

//   const handleRefreshNews = async () => {
//     try {
//       setLoadingNews(true);
//       setNewsMessage("");
//       const msg = await refreshNewsSentiment();
//       setNewsMessage(msg);
//       loadStocks();
//     } catch (err) {
//       setNewsMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingNews(false);
//     }
//   };

//   const toggleHeadlines = async (tradingSymbol) => {
//     if (expandedHeadlines[tradingSymbol]) {
//       setExpandedHeadlines((prev) => {
//         const copy = { ...prev };
//         delete copy[tradingSymbol];
//         return copy;
//       });
//       return;
//     }
//     try {
//       const headlines = await getHeadlinesForStock(tradingSymbol);
//       setExpandedHeadlines((prev) => ({ ...prev, [tradingSymbol]: headlines }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRunIntradayPrediction = async () => {
//     try {
//       setLoadingIntraday(true);
//       setIntradayMessage("");
//       const fetchMsg = await fetchIntradayData();
//       const trainMsg = await trainIntradayModel();
//       const predictMsg = await predictIntraday();
//       setIntradayMessage(`${fetchMsg} | ${trainMsg} | ${predictMsg}`);
//       loadStocks();
//     } catch (err) {
//       setIntradayMessage(`Error: ${err.message}`);
//     } finally {
//       setLoadingIntraday(false);
//     }
//   };

//   useEffect(() => {
//     loadStocks();
//     triggerRefresh();
//     intervalRef.current = setInterval(triggerRefresh, 8000);
//     return () => clearInterval(intervalRef.current);
//   }, [loadStocks, triggerRefresh]);

//   if (loading) {
//     return (
//       <div className="dashboard-status-container">
//         <div className="spinner"></div>
//         <p className="loading-text">Loading dashboard...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-status-container">
//         <p className="error-text">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="toolbar-container">
//         <div className="button-group">
//           <button className="btn btn-primary" onClick={triggerRefresh}>
//             Refresh Now
//           </button>
//           <button className="btn btn-secondary" onClick={fetchHistorical} disabled={loadingHistorical}>
//             {loadingHistorical ? "Fetching..." : "Fetch Historical Data"}
//           </button>
//           <button className="btn btn-secondary" onClick={recalculateIndicators} disabled={loadingIndicators}>
//             {loadingIndicators ? "Calculating..." : "Recalculate Indicators"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRefreshOptionMaster} disabled={loadingOptionMaster}>
//             {loadingOptionMaster ? "Loading..." : "Load Option Contracts"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRecalculateOptions} disabled={loadingOptionRecalc}>
//             {loadingOptionRecalc ? "Analyzing..." : "Recalculate Options"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRefreshNews} disabled={loadingNews}>
//             {loadingNews ? "Fetching News..." : "Refresh News Sentiment"}
//           </button>
//           <button className="btn btn-secondary" onClick={handleRunIntradayPrediction} disabled={loadingIntraday}>
//             {loadingIntraday ? "Predicting..." : "Run Intraday (5-min) Prediction"}
//           </button>
//         </div>

//         <div className="status-meta">
//           {lastUpdatedAt && <span className="meta-item">Last updated: {lastUpdatedAt}</span>}
//           {lastRefreshMsg && (
//             <span className={`meta-item ${lastRefreshMsg.startsWith("Error") ? "msg-error" : "msg-info"}`}>
//               {lastRefreshMsg}
//             </span>
//           )}
//         </div>
//       </div>

//       <DashboardLegend
//         beginnerMode={beginnerMode}
//         onToggleBeginnerMode={() => setBeginnerMode(!beginnerMode)}
//       />

//       {indicatorMessage && (
//         <div className="alert alert-indicator">
//           <span className="alert-icon">📊</span>
//           <span>{indicatorMessage}</span>
//         </div>
//       )}

//       {optionMessage && (
//         <div className="alert alert-option">
//           <span className="alert-icon">⚡</span>
//           <span>{optionMessage}</span>
//         </div>
//       )}

//       {newsMessage && (
//         <div className="alert alert-news">
//           <span className="alert-icon">📰</span>
//           <span>{newsMessage}</span>
//         </div>
//       )}

//       {intradayMessage && (
//         <div className="alert alert-news">
//           <span className="alert-icon">⏱️</span>
//           <span>{intradayMessage}</span>
//         </div>
//       )}

//       <div className="table-responsive">
//         <table className="dashboard-table">
//           <thead>
//             <tr>
//               <th className="sticky-col sticky-col-1">
//                 <Tooltip text="NSE stock exchange symbol code for the security.">NSE Code</Tooltip>
//               </th>
//               <th className="sticky-col sticky-col-2">
//                 <Tooltip text="Full legal name of the listed company.">Company</Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Current Market Price — live price from Angel One, frozen at last close when market is shut.">
//                   CMP
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="How much the price has moved today vs yesterday's close.">
//                   Day Change %
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Highest price reached by this stock during today's trading session.">
//                   Day High
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Lowest price reached by this stock during today's trading session.">
//                   Day Low
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Total quantity of shares traded today on NSE.">
//                   Volume
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Momentum indicator (0-100). Above 70 = overbought (may fall). Below 30 = oversold (may bounce).">
//                   RSI14
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Bullish = price above its 50-day average (uptrend). Bearish = below (downtrend).">
//                   Trend
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The raw signal — what the indicators lean toward, even weakly. Not a trade instruction by itself.">
//                   Verdict
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The actual recommendation — only fires when the signal is strong enough to trust. If this says Hold, don't trade even if Verdict leans Buy/Sell.">
//                   Action
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Intraday = exit same day (volatile). Delivery = can hold for several days (calmer trend).">
//                   Trade Type
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Whether this stock has Futures & Options contracts available on NSE.">
//                   F&O
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Call = betting price goes up. Put = betting price goes down.">
//                   Option
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="The strike price selected for the suggested option contract.">
//                   Strike
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Last traded price of the suggested option contract option premium.">
//                   Premium
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Dynamic trade suggestion based on live price action, RSI, ML probabilities, and news alignment.">
//                   Suggestion
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="A machine learning model's estimate of the % chance the stock closes higher. 50% = coin flip.">
//                   ML Probability
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Weighted ensemble signal (Strong Buy → Strong Sell) combining probability, trend, momentum, and RSI. Hover for strength.">
//                   ML Signal
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Based on recent news headlines about this stock — click the label to read them.">
//                   News Sentiment
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Blends the ML model's guess with news sentiment into one number.">
//                   Combined Prob.
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="A separate, faster model's guess at price in the next 5 minutes — refreshes every 5 min during market hours. More experimental than the other predictions.">
//                   5-Min Prediction
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Weighted ensemble signal for the 5-minute intraday model. Hover for strength.">
//                   Intraday Signal
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="Simulated live P&L per share based on the current active 5-minute intraday prediction position.">
//                   Live 5m P&L
//                 </Tooltip>
//               </th>
//               <th>
//                 <Tooltip text="History of the last 5 completed 5-minute simulated trades and their P&L per share.">
//                   Recent 5m Trades
//                 </Tooltip>
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {stocks.length === 0 && (
//               <tr>
//                 <td colSpan={25} className="empty-table-cell">
//                   No data yet — add stocks to your watchlist above.
//                 </td>
//               </tr>
//             )}

//             {stocks.map((s) => {
//               const suggestion = getDynamicSuggestion(s);

//               // Helper parser for trades list
//               let recentTradesList = [];
//               const rawTrades = s.last5PnlTrades || s.intradayLast5PnlTrades || s.recent5mTradesJson;
//               if (Array.isArray(rawTrades)) {
//                 recentTradesList = rawTrades;
//               } else if (typeof rawTrades === "string") {
//                 try {
//                   recentTradesList = JSON.parse(rawTrades);
//                 } catch (e) {
//                   recentTradesList = [];
//                 }
//               }

//               const currentPnl = s.simulatedPnl ?? s.intradaySimulatedPnl ?? s.live5mPnL;

//               return (
//                 <React.Fragment key={s.nseCode}>
//                   <tr className="stock-row">
//                     <td className="font-semibold text-code sticky-col sticky-col-1">{s.nseCode}</td>
//                     <td className="font-medium sticky-col sticky-col-2">{s.companyName}</td>
//                     <td className="font-semibold">₹{s.cmp}</td>
//                     <td>
//                       {s.dayChangePct != null ? (
//                         <span className={`badge ${s.dayChangePct >= 0 ? "badge-positive" : "badge-negative"}`}>
//                           {s.dayChangePct}%
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>{s.dayHigh ?? "-"}</td>
//                     <td>{s.dayLow ?? "-"}</td>
//                     <td>{s.volumeToday ?? "-"}</td>
//                     <td>{s.rsi14 ?? "-"}</td>
//                     <td>{s.trendSignal ?? "-"}</td>
//                     <td>
//                       <span className={`verdict-pill ${verdictColor(s.overallVerdict)}`}>
//                         {s.overallVerdict ?? "-"}
//                       </span>
//                       {beginnerMode && s.overallVerdict && s.overallVerdict !== "Hold" && (
//                         <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
//                           {s.action === s.overallVerdict ? (
//                             s.overallVerdict === "Buy"
//                               ? "✅ Strong signal — safe to consider"
//                               : "✅ Strong signal — consider exiting/shorting"
//                           ) : (
//                             "⏳ Weak signal — just watch, don't trade"
//                           )}
//                         </div>
//                       )}
//                     </td>
//                     <td>{s.action ?? "-"}</td>
//                     <td>{s.tradeType ?? "-"}</td>
//                     <td>{s.fnoAvailable ?? "-"}</td>
//                     <td>{s.optionType ?? "-"}</td>
//                     <td>{s.optionAtmStrike ?? "-"}</td>
//                     <td>{s.optionPremiumLtp ?? "-"}</td>
//                     <td>
//                       <span
//                         className={`suggestion-pill ${suggestion.badgeClass}`}
//                         title={suggestion.desc}
//                       >
//                         {suggestion.label}
//                       </span>
//                     </td>
//                     <td>
//                       {s.mlProbabilityUp != null ? (
//                         <span
//                           className="badge"
//                           style={{
//                             fontWeight: 600,
//                             color: s.mlProbabilityUp >= 50 ? "#1a7f37" : "#d1242f",
//                           }}
//                         >
//                           {s.mlProbabilityUp}% up
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.mlSignal ? (
//                         <span
//                           className={`suggestion-pill ${signalBadgeClass(s.mlSignal)}`}
//                           title={`Confidence: ${s.mlConfidence ?? "-"}% | Model agreement: ${s.mlModelAgreement ?? "-"}% | Risk: ${s.mlRiskLevel ?? "-"} | Quality: ${s.mlPredictionQuality ?? "-"}`}
//                         >
//                           {s.mlSignal} ({s.mlSignalStrength != null ? `${s.mlSignalStrength}%` : "-"})
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.newsSentimentLabel ? (
//                         <span
//                           className="badge"
//                           style={{
//                             fontWeight: 600,
//                             color: getNewsSentimentColor(s.newsSentimentLabel),
//                             cursor: "pointer",
//                             textDecoration: "underline",
//                           }}
//                           onClick={() => toggleHeadlines(s.nseCode)}
//                           title="Click to view headlines"
//                         >
//                           {s.newsSentimentLabel}
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.combinedProbabilityUp != null ? (
//                         <span style={{ fontWeight: 600, color: s.combinedProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
//                           {s.combinedProbabilityUp}% up
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     <td>
//                       {s.intradayPredictedPrice != null ? (
//                         <span style={{ fontWeight: 600, color: s.intradayProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
//                           ₹{s.intradayPredictedPrice} ({s.intradayProbabilityUp}% up)
//                         </span>
//                       ) : (
//                         <span
//                           className="badge badge-neutral"
//                           style={{ color: "#6e7781", cursor: "help" }}
//                           title="No 5-min prediction available. Click 'Run Intraday (5-min) Prediction' to retry."
//                         >
//                           N/A
//                         </span>
//                       )}
//                     </td>
//                     <td>
//                       {s.intradaySignal ? (
//                         <span
//                           className={`suggestion-pill ${signalBadgeClass(s.intradaySignal)}`}
//                           title={`Confidence: ${s.intradayConfidence ?? "-"}% | Model agreement: ${s.intradayModelAgreement ?? "-"}% | Risk: ${s.intradayRiskLevel ?? "-"} | Quality: ${s.intradayPredictionQuality ?? "-"}`}
//                         >
//                           {s.intradaySignal} ({s.intradaySignalStrength != null ? `${s.intradaySignalStrength}%` : "-"})
//                         </span>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                     {/* Live Simulated 5m P&L */}
//                     <td
//                       style={{
//                         color: (currentPnl ?? 0) >= 0 ? "#10B981" : "#EF4444",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {currentPnl != null
//                         ? (currentPnl >= 0
//                             ? `+₹${currentPnl}`
//                             : `-₹${Math.abs(currentPnl)}`)
//                         : "-"}
//                     </td>
//                     {/* Last 5 Trade Records */}
//                     <td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
//                       {recentTradesList && recentTradesList.length > 0 ? (
//                         <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
//                           {recentTradesList.map((trade, idx) => {
//                             const pnlVal = typeof trade === "object" && trade !== null 
//                               ? trade.pnlPerShare 
//                               : parseFloat(trade);

//                             if (isNaN(pnlVal)) return null;

//                             const isPositive = pnlVal >= 0;
//                             const buyPrice = trade?.buyPrice ? `Buy: ₹${trade.buyPrice}` : "";
//                             const exitPrice = trade?.exitPrice ? ` Exit: ₹${trade.exitPrice}` : "";
//                             const time = trade?.timestamp ? ` @ ${trade.timestamp}` : "";

//                             return (
//                               <span
//                                 key={idx}
//                                 title={buyPrice ? `${buyPrice}${exitPrice}${time}` : `Trade ${idx + 1}: ${pnlVal}`}
//                                 style={{
//                                   display: "inline-block",
//                                   padding: "2px 6px",
//                                   borderRadius: "4px",
//                                   fontSize: "11px",
//                                   fontWeight: "600",
//                                   lineHeight: "1.2",
//                                   backgroundColor: isPositive ? "#D1FAE5" : "#FEE2E2",
//                                   color: isPositive ? "#065F46" : "#991B1B",
//                                   border: `1px solid ${isPositive ? "#A7F3D0" : "#FECACA"}`
//                                 }}
//                               >
//                                 {isPositive ? `+${pnlVal}` : pnlVal}
//                               </span>
//                             );
//                           })}
//                         </div>
//                       ) : (
//                         <span style={{ color: "#9CA3AF", fontSize: "12px" }}>Awaiting next bar</span>
//                       )}
//                     </td>
//                   </tr>

//                   {s.reasoningNotes && (
//                     <tr className="details-row">
//                       <td className="sticky-col sticky-col-1"></td>
//                       <td className="sticky-col sticky-col-2"></td>

//                       <td colSpan={23}>
//                         <div className="details-content">
//                           <span className="detail-item">
//                             <strong>Why:</strong> {s.reasoningNotes}
//                           </span>

//                           {s.overallVerdict && s.overallVerdict !== "Hold" && (
//                             <>
//                               {s.intradayEntryZone && s.intradayEntryZone !== "-" && (
//                                 <span className="detail-item">
//                                   <strong>Buy Range:</strong> {s.intradayEntryZone}
//                                 </span>
//                               )}
//                               {s.suggestedQuantity && (
//                                 <span className="detail-item">
//                                   <strong>Quantity:</strong> {s.suggestedQuantity} shares (1% Risk Sizing)
//                                 </span>
//                               )}
//                               {s.tradeType === "Intraday" && s.intradayTarget && (
//                                 <span className="detail-item">
//                                   <strong>Intraday Target:</strong> ₹{s.intradayTarget} | <strong>SL:</strong> ₹{s.intradayStopLoss}
//                                 </span>
//                               )}
//                               {s.tradeType === "Delivery" && s.swingTarget && (
//                                 <span className="detail-item">
//                                   <strong>Delivery Target:</strong> ₹{s.swingTarget} | <strong>SL:</strong> ₹{s.swingStopLoss}
//                                 </span>
//                               )}
//                             </>
//                           )}

//                           {s.suggestedHoldingPeriod && (
//                             <span className="detail-item">
//                               <strong>Holding Period:</strong> {s.suggestedHoldingPeriod}
//                             </span>
//                           )}

//                           {s.fnoAvailable === "Yes" && s.optionPremiumLtp && (
//                             <span className="detail-item">
//                               <strong>Option Target:</strong> ₹{s.suggestedPremiumTarget} |{" "}
//                               <strong>Option SL:</strong> ₹{s.suggestedPremiumStopLoss} |{" "}
//                               <strong>Lot Size:</strong> {s.optionLotSize} |{" "}
//                               <strong>Investment:</strong> ₹{s.optionInvestment}
//                             </span>
//                           )}
//                           {s.mlProbabilityUp != null && (
//                             <span className="detail-item">
//                               <strong>ML Confidence:</strong> {s.mlConfidence}%
//                               {s.mlProbabilityDown != null && <> | <strong>Prob. Down:</strong> {s.mlProbabilityDown}%</>}
//                               {s.mlModelAgreement != null && <> | <strong>Model Agreement:</strong> {s.mlModelAgreement}%</>}
//                               {s.mlRiskLevel && (
//                                 <> | <strong>Risk:</strong>{" "}
//                                   <span style={{ color: riskLevelColor(s.mlRiskLevel), fontWeight: 600 }}>{s.mlRiskLevel}</span>
//                                 </>
//                               )}
//                               {s.mlPredictionQuality && <> | <strong>Quality:</strong> {s.mlPredictionQuality}</>}
//                               {s.mlExpectedError != null && <> | <strong>Expected Error:</strong> ±₹{s.mlExpectedError}</>}
//                               {s.mlBuyStrength != null && s.mlSellStrength != null && (
//                                 <> | <strong>Buy/Sell Strength:</strong> {s.mlBuyStrength}% / {s.mlSellStrength}%</>
//                               )}
//                             </span>
//                           )}
//                           {s.mlRangeLow != null && s.mlRangeHigh != null && (
//                             <span className="detail-item">
//                               <strong>ML Expected Range ({s.tradeType === "Intraday" ? "Intraday 80% Band" : "Delivery 80% Band"}):</strong> ₹{s.mlRangeLow} – ₹{s.mlRangeHigh}
//                               {s.mlPredictedPrice != null && (
//                                 <> (target ₹{s.mlPredictedPrice}, {s.mlPredictedReturnPct}% move)</>
//                               )}
//                             </span>
//                           )}
//                           {s.newsWeight != null && (
//                             <span className="detail-item">
//                               <strong>News Weight in Combined Prob.:</strong> {Math.round(s.newsWeight * 100)}%
//                             </span>
//                           )}
//                           {s.intradayPredictedPrice != null && (
//                             <span className="detail-item">
//                               <strong>5-Min Predicted Price:</strong> ₹{s.intradayPredictedPrice} |{" "}
//                               <strong>Range:</strong> ₹{s.intradayRangeLow} – ₹{s.intradayRangeHigh} |{" "}
//                               <strong>Move:</strong> {s.intradayPredictedReturnPct}% |{" "}
//                               <strong>Updated:</strong> {s.intradayPredictionUpdatedAt}
//                             </span>
//                           )}
//                           {s.intradaySignal && (
//                             <span className="detail-item">
//                               <strong>Intraday Confidence:</strong> {s.intradayConfidence}%
//                               {s.intradayModelAgreement != null && <> | <strong>Model Agreement:</strong> {s.intradayModelAgreement}%</>}
//                               {s.intradayRiskLevel && (
//                                 <> | <strong>Risk:</strong>{" "}
//                                   <span style={{ color: riskLevelColor(s.intradayRiskLevel), fontWeight: 600 }}>{s.intradayRiskLevel}</span>
//                                 </>
//                               )}
//                               {s.intradayExpectedError != null && <> | <strong>Expected Error:</strong> ±₹{s.intradayExpectedError}</>}
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )}

//                   {expandedHeadlines[s.nseCode] && (
//                     <tr className="details-row">
//                       <td className="sticky-col sticky-col-1"></td>
//                       <td className="sticky-col sticky-col-2"></td>

//                       <td colSpan={23}>
//                         <div className="details-content" style={{ flexDirection: "column", alignItems: "flex-start" }}>
//                           <strong>Recent headlines:</strong>
//                           {expandedHeadlines[s.nseCode].length === 0 && <span>No recent headlines found.</span>}
//                           {expandedHeadlines[s.nseCode].map((h, idx) => (
//                             <a
//                               key={h.id || idx}
//                               href={h.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{
//                                 display: "block",
//                                 marginTop: "4px",
//                                 color: getNewsSentimentColor(h.sentimentLabel),
//                               }}
//                             >
//                               [{h.sentimentLabel || "Neutral"}] {h.headline} — <em>{h.sourceName || h.source || "News"}</em>
//                             </a>
//                           ))}
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchAllStocks, trainDailyMlModel } from "../services/dashboardService";
import { refreshLivePrices } from "../services/livePriceService";
import indicatorService from "../services/indicatorService";
import { refreshOptionMaster, recalculateOptions } from "../services/optionService";
import { refreshNewsSentiment, getHeadlinesForStock } from "../services/newsService";
import { fetchIntradayData, trainIntradayModel, predictIntraday } from "../services/intradayService";
import Tooltip from "./Tooltip";
import DashboardLegend from "./DashboardLegend";
import "./StockDashboard.css";

function verdictColor(verdict) {
  if (!verdict) return "verdict-neutral";
  const v = verdict.toLowerCase();
  if (v.includes("buy")) return "verdict-buy";
  if (v.includes("sell")) return "verdict-sell";
  return "verdict-neutral";
}

function getNewsSentimentColor(label) {
  if (!label) return "#9a6700";
  const lower = label.toLowerCase();
  if (lower.includes("bullish") || lower.includes("positive")) return "#1a7f37";
  if (lower.includes("bearish") || lower.includes("negative")) return "#d1242f";
  return "#9a6700";
}

// Maps the new "Strong Buy"..."Strong Sell" signal strings to existing badge CSS classes
function signalBadgeClass(signal) {
  if (!signal) return "badge-neutral";
  const s = signal.toLowerCase();
  if (s === "strong buy") return "badge-buy-strong";
  if (s === "buy" || s === "weak buy") return "badge-buy-moderate";
  if (s === "strong sell") return "badge-sell-strong";
  if (s === "sell" || s === "weak sell") return "badge-sell-moderate";
  return "badge-neutral";
}

function riskLevelColor(risk) {
  if (!risk) return "#6e7781";
  const r = risk.toLowerCase();
  if (r === "low") return "#1a7f37";
  if (r === "medium") return "#9a6700";
  if (r === "high") return "#d1242f";
  return "#6e7781";
}

/**
 * Dynamic Suggestion Engine
 * Evaluates live market conditions, RSI levels, price position in day range,
 * ML probabilities, and technical alignment.
 */
export function getDynamicSuggestion(stock) {
  if (!stock) return { label: "-", badgeClass: "badge-neutral", desc: "" };

  const {
    overallVerdict,
    action,
    rsi14,
    mlProbabilityUp,
    combinedProbabilityUp,
    newsSentimentLabel,
    cmp,
    dayHigh,
    dayLow,
    optionTradeSuggestion
  } = stock;

  const high = parseFloat(dayHigh);
  const low = parseFloat(dayLow);
  const current = parseFloat(cmp);
  const dayRange = high - low;
  const rangePosition = (!isNaN(dayRange) && dayRange > 0 && !isNaN(current)) 
    ? (current - low) / dayRange 
    : 0.5;

  const mlProb = typeof mlProbabilityUp === "number" ? mlProbabilityUp : parseFloat(mlProbabilityUp) || 50;
  const combinedProb = typeof combinedProbabilityUp === "number" ? combinedProbabilityUp : parseFloat(combinedProbabilityUp) || 50;
  const rsi = typeof rsi14 === "number" ? rsi14 : parseFloat(rsi14) || 50;

  const isRsiOverbought = rsi >= 70;
  const isRsiOversold = rsi <= 30;

  if (optionTradeSuggestion && optionTradeSuggestion !== "-" && !optionTradeSuggestion.toLowerCase().includes("avoid")) {
    return {
      label: optionTradeSuggestion,
      badgeClass: optionTradeSuggestion.toLowerCase().includes("buy") ? "badge-buy-strong" : "badge-sell-strong",
      desc: "Option trade setup active."
    };
  }

  if (action === "Buy" && overallVerdict === "Buy" && !isRsiOverbought) {
    if (combinedProb >= 52 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bullish"))) {
      return {
        label: "🔥 Strong Buy Setup",
        badgeClass: "badge-buy-strong",
        desc: "High probability alignment across technicals and sentiment."
      };
    }
  }

  if (action === "Sell" && overallVerdict === "Sell" && !isRsiOversold) {
    if (combinedProb <= 48 || (newsSentimentLabel && newsSentimentLabel.toLowerCase().includes("bearish"))) {
      return {
        label: "🔻 Strong Short / Exit",
        badgeClass: "badge-sell-strong",
        desc: "Bearish breakdown supported by negative sentiment & trend."
      };
    }
  }

  if ((overallVerdict === "Buy" || action === "Buy") && rangePosition >= 0.65 && !isRsiOverbought) {
    return {
      label: "📈 Bullish Momentum",
      badgeClass: "badge-buy-moderate",
      desc: "Trading near high of the day with active buying pressure."
    };
  }

  if ((overallVerdict === "Sell" || action === "Sell") && rangePosition <= 0.35 && !isRsiOversold) {
    return {
      label: "📉 Downside Drift",
      badgeClass: "badge-sell-moderate",
      desc: "Trading near low of the day under continuous selling pressure."
    };
  }

  if (isRsiOverbought) {
    return {
      label: "⚠️ Overbought (RSI > 70)",
      badgeClass: "badge-warning",
      desc: "RSI is elevated. Avoid fresh long entry; trail stop loss."
    };
  }

  if (isRsiOversold) {
    return {
      label: "🎯 Dip Buy Reversal",
      badgeClass: "badge-reversal",
      desc: "Oversold RSI indicates potential bounce setup."
    };
  }

  if (action === "Hold" && overallVerdict && overallVerdict !== "Hold") {
    return {
      label: `👀 Watch for ${overallVerdict} Breakout`,
      badgeClass: "badge-watch",
      desc: "Trend established. Waiting for volume/probability confirmation."
    };
  }

  if (combinedProb >= 53.5) {
    return {
      label: "⚡ Positive ML Edge",
      badgeClass: "badge-buy-moderate",
      desc: "Combined statistical probability leans favorable (>53.5%)."
    };
  }

  return {
    label: "⏸️ Rangebound",
    badgeClass: "badge-neutral",
    desc: "Price consolidating within intraday range."
  };
}

export default function StockDashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshMsg, setLastRefreshMsg] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [beginnerMode, setBeginnerMode] = useState(false);

  const [indicatorMessage, setIndicatorMessage] = useState("");
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);

  const [optionMessage, setOptionMessage] = useState("");
  const [loadingOptionMaster, setLoadingOptionMaster] = useState(false);
  const [loadingOptionRecalc, setLoadingOptionRecalc] = useState(false);

  const [newsMessage, setNewsMessage] = useState("");
  const [loadingNews, setLoadingNews] = useState(false);
  const [expandedHeadlines, setExpandedHeadlines] = useState({});

  const [intradayMessage, setIntradayMessage] = useState("");
  const [loadingIntraday, setLoadingIntraday] = useState(false);

  const [dailyMlMessage, setDailyMlMessage] = useState("");
  const [loadingDailyMl, setLoadingDailyMl] = useState(false);

  const intervalRef = useRef(null);

  const loadStocks = useCallback(() => {
    fetchAllStocks()
      .then((data) => {
        setStocks(data);
        setLastUpdatedAt(new Date().toLocaleTimeString());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const triggerRefresh = useCallback(async () => {
    try {
      const msg = await refreshLivePrices();
      setLastRefreshMsg(msg);
    } catch (err) {
      setLastRefreshMsg(`Error: ${err.message}`);
    } finally {
      loadStocks();
    }
  }, [loadStocks]);

  const fetchHistorical = async () => {
    try {
      setLoadingHistorical(true);
      setIndicatorMessage("");
      const msg = await indicatorService.fetchHistoricalData();
      setIndicatorMessage(msg);
    } catch (err) {
      setIndicatorMessage(err?.response?.data || err.message || "Failed to fetch historical data.");
    } finally {
      setLoadingHistorical(false);
    }
  };

  const recalculateIndicators = async () => {
    try {
      setLoadingIndicators(true);
      setIndicatorMessage("");
      const msg = await indicatorService.recalculateIndicators();
      setIndicatorMessage(msg);
      loadStocks();
    } catch (err) {
      setIndicatorMessage(err?.response?.data || err.message || "Failed to recalculate indicators.");
    } finally {
      setLoadingIndicators(false);
    }
  };

  const handleRefreshOptionMaster = async () => {
    try {
      setLoadingOptionMaster(true);
      setOptionMessage("");
      const result = await refreshOptionMaster();
      setOptionMessage(`Loaded ${result.optionsLoaded} option contracts.`);
    } catch (err) {
      setOptionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingOptionMaster(false);
    }
  };

  const handleRecalculateOptions = async () => {
    try {
      setLoadingOptionRecalc(true);
      setOptionMessage("");
      const msg = await recalculateOptions();
      setOptionMessage(msg);
      loadStocks();
    } catch (err) {
      setOptionMessage(`Error: ${err.message}`);
    } finally {
      setLoadingOptionRecalc(false);
    }
  };

  const handleRefreshNews = async () => {
    try {
      setLoadingNews(true);
      setNewsMessage("");
      const msg = await refreshNewsSentiment();
      setNewsMessage(msg);
      loadStocks();
    } catch (err) {
      setNewsMessage(`Error: ${err.message}`);
    } finally {
      setLoadingNews(false);
    }
  };

  const toggleHeadlines = async (tradingSymbol) => {
    if (expandedHeadlines[tradingSymbol]) {
      setExpandedHeadlines((prev) => {
        const copy = { ...prev };
        delete copy[tradingSymbol];
        return copy;
      });
      return;
    }
    try {
      const headlines = await getHeadlinesForStock(tradingSymbol);
      setExpandedHeadlines((prev) => ({ ...prev, [tradingSymbol]: headlines }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunIntradayPrediction = async () => {
    try {
      setLoadingIntraday(true);
      setIntradayMessage("");
      const fetchMsg = await fetchIntradayData();
      const trainMsg = await trainIntradayModel();
      const predictMsg = await predictIntraday();
      setIntradayMessage(`${fetchMsg} | ${trainMsg} | ${predictMsg}`);
      loadStocks();
    } catch (err) {
      setIntradayMessage(`Error: ${err.message}`);
    } finally {
      setLoadingIntraday(false);
    }
  };

  const handleTrainDailyMl = async () => {
    try {
      setLoadingDailyMl(true);
      setDailyMlMessage("");
      const msg = await trainDailyMlModel();
      setDailyMlMessage(msg || "Daily ML model retrained successfully!");
      loadStocks();
    } catch (err) {
      setDailyMlMessage(`Error: ${err.message}`);
    } finally {
      setLoadingDailyMl(false);
    }
  };

  useEffect(() => {
    loadStocks();
    triggerRefresh();
    intervalRef.current = setInterval(triggerRefresh, 8000);
    return () => clearInterval(intervalRef.current);
  }, [loadStocks, triggerRefresh]);

  if (loading) {
    return (
      <div className="dashboard-status-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-status-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="toolbar-container">
        <div className="button-group">
          <button className="btn btn-primary" onClick={triggerRefresh}>
            Refresh Now
          </button>
          <button className="btn btn-secondary" onClick={fetchHistorical} disabled={loadingHistorical}>
            {loadingHistorical ? "Fetching..." : "Fetch Historical Data"}
          </button>
          <button className="btn btn-secondary" onClick={recalculateIndicators} disabled={loadingIndicators}>
            {loadingIndicators ? "Calculating..." : "Recalculate Indicators"}
          </button>
          <button className="btn btn-secondary" onClick={handleRefreshOptionMaster} disabled={loadingOptionMaster}>
            {loadingOptionMaster ? "Loading..." : "Load Option Contracts"}
          </button>
          <button className="btn btn-secondary" onClick={handleRecalculateOptions} disabled={loadingOptionRecalc}>
            {loadingOptionRecalc ? "Analyzing..." : "Recalculate Options"}
          </button>
          <button className="btn btn-secondary" onClick={handleRefreshNews} disabled={loadingNews}>
            {loadingNews ? "Fetching News..." : "Refresh News Sentiment"}
          </button>
          <button className="btn btn-secondary" onClick={handleRunIntradayPrediction} disabled={loadingIntraday}>
            {loadingIntraday ? "Predicting..." : "Run Intraday (5-min) Prediction"}
          </button>
          <button className="btn btn-secondary" onClick={handleTrainDailyMl} disabled={loadingDailyMl}>
            {loadingDailyMl ? "Training ML..." : "Train Daily ML Model"}
          </button>
        </div>

        <div className="status-meta">
          {lastUpdatedAt && <span className="meta-item">Last updated: {lastUpdatedAt}</span>}
          {lastRefreshMsg && (
            <span className={`meta-item ${lastRefreshMsg.startsWith("Error") ? "msg-error" : "msg-info"}`}>
              {lastRefreshMsg}
            </span>
          )}
        </div>
      </div>

      <DashboardLegend
        beginnerMode={beginnerMode}
        onToggleBeginnerMode={() => setBeginnerMode(!beginnerMode)}
      />

      {indicatorMessage && (
        <div className="alert alert-indicator">
          <span className="alert-icon">📊</span>
          <span>{indicatorMessage}</span>
        </div>
      )}

      {dailyMlMessage && (
        <div className="alert alert-indicator">
          <span className="alert-icon">🤖</span>
          <span>{dailyMlMessage}</span>
        </div>
      )}

      {optionMessage && (
        <div className="alert alert-option">
          <span className="alert-icon">⚡</span>
          <span>{optionMessage}</span>
        </div>
      )}

      {newsMessage && (
        <div className="alert alert-news">
          <span className="alert-icon">📰</span>
          <span>{newsMessage}</span>
        </div>
      )}

      {intradayMessage && (
        <div className="alert alert-news">
          <span className="alert-icon">⏱️</span>
          <span>{intradayMessage}</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th className="sticky-col sticky-col-1">
                <Tooltip text="NSE stock exchange symbol code for the security.">NSE Code</Tooltip>
              </th>
              <th className="sticky-col sticky-col-2">
                <Tooltip text="Full legal name of the listed company.">Company</Tooltip>
              </th>
              <th>
                <Tooltip text="Current Market Price — live price from Angel One, frozen at last close when market is shut.">
                  CMP
                </Tooltip>
              </th>
              <th>
                <Tooltip text="How much the price has moved today vs yesterday's close.">
                  Day Change %
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Highest price reached by this stock during today's trading session.">
                  Day High
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Lowest price reached by this stock during today's trading session.">
                  Day Low
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Total quantity of shares traded today on NSE.">
                  Volume
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Momentum indicator (0-100). Above 70 = overbought (may fall). Below 30 = oversold (may bounce).">
                  RSI14
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Bullish = price above its 50-day average (uptrend). Bearish = below (downtrend).">
                  Trend
                </Tooltip>
              </th>
              <th>
                <Tooltip text="The raw signal — what the indicators lean toward, even weakly. Not a trade instruction by itself.">
                  Verdict
                </Tooltip>
              </th>
              <th>
                <Tooltip text="The actual recommendation — only fires when the signal is strong enough to trust. If this says Hold, don't trade even if Verdict leans Buy/Sell.">
                  Action
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Intraday = exit same day (volatile). Delivery = can hold for several days (calmer trend).">
                  Trade Type
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Whether this stock has Futures & Options contracts available on NSE.">
                  F&O
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Call = betting price goes up. Put = betting price goes down.">
                  Option
                </Tooltip>
              </th>
              <th>
                <Tooltip text="The strike price selected for the suggested option contract.">
                  Strike
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Last traded price of the suggested option contract option premium.">
                  Premium
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Dynamic trade suggestion based on live price action, RSI, ML probabilities, and news alignment.">
                  Suggestion
                </Tooltip>
              </th>
              <th>
                <Tooltip text="A machine learning model's estimate of the % chance the stock closes higher. 50% = coin flip.">
                  ML Probability
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Weighted ensemble signal (Strong Buy → Strong Sell) combining probability, trend, momentum, and RSI. Hover for strength.">
                  ML Signal
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Based on recent news headlines about this stock — click the label to read them.">
                  News Sentiment
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Blends the ML model's guess with news sentiment into one number.">
                  Combined Prob.
                </Tooltip>
              </th>
              <th>
                <Tooltip text="A separate, faster model's guess at price in the next 5 minutes — refreshes every 5 min during market hours. More experimental than the other predictions.">
                  5-Min Prediction
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Weighted ensemble signal for the 5-minute intraday model. Hover for strength.">
                  Intraday Signal
                </Tooltip>
              </th>
              <th>
                <Tooltip text="Simulated live P&L per share based on the current active 5-minute intraday prediction position.">
                  Live 5m P&L
                </Tooltip>
              </th>
              <th>
                <Tooltip text="History of the last 5 completed 5-minute simulated trades and their P&L per share.">
                  Recent 5m Trades
                </Tooltip>
              </th>
            </tr>
          </thead>

          <tbody>
            {stocks.length === 0 && (
              <tr>
                <td colSpan={25} className="empty-table-cell">
                  No data yet — add stocks to your watchlist above.
                </td>
              </tr>
            )}

            {stocks.map((s) => {
              const suggestion = getDynamicSuggestion(s);

              // Helper parser for trades list
              let recentTradesList = [];
              const rawTrades = s.last5PnlTrades || s.intradayLast5PnlTrades || s.recent5mTradesJson;
              if (Array.isArray(rawTrades)) {
                recentTradesList = rawTrades;
              } else if (typeof rawTrades === "string") {
                try {
                  recentTradesList = JSON.parse(rawTrades);
                } catch (e) {
                  recentTradesList = [];
                }
              }

              const currentPnl = s.simulatedPnl ?? s.intradaySimulatedPnl ?? s.live5mPnL;

              return (
                <React.Fragment key={s.nseCode}>
                  <tr className="stock-row">
                    <td className="font-semibold text-code sticky-col sticky-col-1">{s.nseCode}</td>
                    <td className="font-medium sticky-col sticky-col-2">{s.companyName}</td>
                    <td className="font-semibold">₹{s.cmp}</td>
                    <td>
                      {s.dayChangePct != null ? (
                        <span className={`badge ${s.dayChangePct >= 0 ? "badge-positive" : "badge-negative"}`}>
                          {s.dayChangePct}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{s.dayHigh ?? "-"}</td>
                    <td>{s.dayLow ?? "-"}</td>
                    <td>{s.volumeToday ?? "-"}</td>
                    <td>{s.rsi14 ?? "-"}</td>
                    <td>{s.trendSignal ?? "-"}</td>
                    <td>
                      <span className={`verdict-pill ${verdictColor(s.overallVerdict)}`}>
                        {s.overallVerdict ?? "-"}
                      </span>
                      {beginnerMode && s.overallVerdict && s.overallVerdict !== "Hold" && (
                        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                          {s.action === s.overallVerdict ? (
                            s.overallVerdict === "Buy"
                              ? "✅ Strong signal — safe to consider"
                              : "✅ Strong signal — consider exiting/shorting"
                          ) : (
                            "⏳ Weak signal — just watch, don't trade"
                          )}
                        </div>
                      )}
                    </td>
                    <td>{s.action ?? "-"}</td>
                    <td>{s.tradeType ?? "-"}</td>
                    <td>{s.fnoAvailable ?? "-"}</td>
                    <td>{s.optionType ?? "-"}</td>
                    <td>{s.optionAtmStrike ?? "-"}</td>
                    <td>{s.optionPremiumLtp ?? "-"}</td>
                    <td>
                      <span
                        className={`suggestion-pill ${suggestion.badgeClass}`}
                        title={suggestion.desc}
                      >
                        {suggestion.label}
                      </span>
                    </td>
                    <td>
                      {s.mlProbabilityUp != null ? (
                        <span
                          className="badge"
                          style={{
                            fontWeight: 600,
                            color: s.mlProbabilityUp >= 50 ? "#1a7f37" : "#d1242f",
                          }}
                        >
                          {s.mlProbabilityUp}% up
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {s.mlSignal ? (
                        <span
                          className={`suggestion-pill ${signalBadgeClass(s.mlSignal)}`}
                          title={`Confidence: ${s.mlConfidence ?? "-"}% | Model agreement: ${s.mlModelAgreement ?? "-"}% | Risk: ${s.mlRiskLevel ?? "-"} | Quality: ${s.mlPredictionQuality ?? "-"}`}
                        >
                          {s.mlSignal} ({s.mlSignalStrength != null ? `${s.mlSignalStrength}%` : "-"})
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {s.newsSentimentLabel ? (
                        <span
                          className="badge"
                          style={{
                            fontWeight: 600,
                            color: getNewsSentimentColor(s.newsSentimentLabel),
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => toggleHeadlines(s.nseCode)}
                          title="Click to view headlines"
                        >
                          {s.newsSentimentLabel}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {s.combinedProbabilityUp != null ? (
                        <span style={{ fontWeight: 600, color: s.combinedProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
                          {s.combinedProbabilityUp}% up
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {s.intradayPredictedPrice != null ? (
                        <span style={{ fontWeight: 600, color: s.intradayProbabilityUp >= 50 ? "#1a7f37" : "#d1242f" }}>
                          ₹{s.intradayPredictedPrice} ({s.intradayProbabilityUp}% up)
                        </span>
                      ) : (
                        <span
                          className="badge badge-neutral"
                          style={{ color: "#6e7781", cursor: "help" }}
                          title="No 5-min prediction available. Click 'Run Intraday (5-min) Prediction' to retry."
                        >
                          N/A
                        </span>
                      )}
                    </td>
                    <td>
                      {s.intradaySignal ? (
                        <span
                          className={`suggestion-pill ${signalBadgeClass(s.intradaySignal)}`}
                          title={`Confidence: ${s.intradayConfidence ?? "-"}% | Model agreement: ${s.intradayModelAgreement ?? "-"}% | Risk: ${s.intradayRiskLevel ?? "-"} | Quality: ${s.intradayPredictionQuality ?? "-"}`}
                        >
                          {s.intradaySignal} ({s.intradaySignalStrength != null ? `${s.intradaySignalStrength}%` : "-"})
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* Live Simulated 5m P&L */}
                    <td
                      style={{
                        color: (currentPnl ?? 0) >= 0 ? "#10B981" : "#EF4444",
                        fontWeight: "bold",
                      }}
                    >
                      {currentPnl != null
                        ? (currentPnl >= 0
                            ? `+₹${currentPnl}`
                            : `-₹${Math.abs(currentPnl)}`)
                        : "-"}
                    </td>
                    {/* Last 5 Trade Records */}
                    <td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
                      {recentTradesList && recentTradesList.length > 0 ? (
                        <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                          {recentTradesList.map((trade, idx) => {
                            const pnlVal = typeof trade === "object" && trade !== null 
                              ? trade.pnlPerShare 
                              : parseFloat(trade);

                            if (isNaN(pnlVal)) return null;

                            const isPositive = pnlVal >= 0;
                            const buyPrice = trade?.buyPrice ? `Buy: ₹${trade.buyPrice}` : "";
                            const exitPrice = trade?.exitPrice ? ` Exit: ₹${trade.exitPrice}` : "";
                            const time = trade?.timestamp ? ` @ ${trade.timestamp}` : "";

                            return (
                              <span
                                key={idx}
                                title={buyPrice ? `${buyPrice}${exitPrice}${time}` : `Trade ${idx + 1}: ${pnlVal}`}
                                style={{
                                  display: "inline-block",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  lineHeight: "1.2",
                                  backgroundColor: isPositive ? "#D1FAE5" : "#FEE2E2",
                                  color: isPositive ? "#065F46" : "#991B1B",
                                  border: `1px solid ${isPositive ? "#A7F3D0" : "#FECACA"}`
                                }}
                              >
                                {isPositive ? `+${pnlVal}` : pnlVal}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ color: "#9CA3AF", fontSize: "12px" }}>Awaiting next bar</span>
                      )}
                    </td>
                  </tr>

                  {s.reasoningNotes && (
                    <tr className="details-row">
                      <td className="sticky-col sticky-col-1"></td>
                      <td className="sticky-col sticky-col-2"></td>

                      <td colSpan={23}>
                        <div className="details-content">
                          <span className="detail-item">
                            <strong>Why:</strong> {s.reasoningNotes}
                          </span>

                          {s.overallVerdict && s.overallVerdict !== "Hold" && (
                            <>
                              {s.intradayEntryZone && s.intradayEntryZone !== "-" && (
                                <span className="detail-item">
                                  <strong>Buy Range:</strong> {s.intradayEntryZone}
                                </span>
                              )}
                              {s.suggestedQuantity && (
                                <span className="detail-item">
                                  <strong>Quantity:</strong> {s.suggestedQuantity} shares (1% Risk Sizing)
                                </span>
                              )}
                              {s.tradeType === "Intraday" && s.intradayTarget && (
                                <span className="detail-item">
                                  <strong>Intraday Target:</strong> ₹{s.intradayTarget} | <strong>SL:</strong> ₹{s.intradayStopLoss}
                                </span>
                              )}
                              {s.tradeType === "Delivery" && s.swingTarget && (
                                <span className="detail-item">
                                  <strong>Delivery Target:</strong> ₹{s.swingTarget} | <strong>SL:</strong> ₹{s.swingStopLoss}
                                </span>
                              )}
                            </>
                          )}

                          {s.suggestedHoldingPeriod && (
                            <span className="detail-item">
                              <strong>Holding Period:</strong> {s.suggestedHoldingPeriod}
                            </span>
                          )}

                          {s.fnoAvailable === "Yes" && s.optionPremiumLtp && (
                            <span className="detail-item">
                              <strong>Option Target:</strong> ₹{s.suggestedPremiumTarget} |{" "}
                              <strong>Option SL:</strong> ₹{s.suggestedPremiumStopLoss} |{" "}
                              <strong>Lot Size:</strong> {s.optionLotSize} |{" "}
                              <strong>Investment:</strong> ₹{s.optionInvestment}
                            </span>
                          )}
                          {s.mlProbabilityUp != null && (
                            <span className="detail-item">
                              <strong>ML Confidence:</strong> {s.mlConfidence}%
                              {s.mlProbabilityDown != null && <> | <strong>Prob. Down:</strong> {s.mlProbabilityDown}%</>}
                              {s.mlModelAgreement != null && <> | <strong>Model Agreement:</strong> {s.mlModelAgreement}%</>}
                              {s.mlRiskLevel && (
                                <> | <strong>Risk:</strong>{" "}
                                  <span style={{ color: riskLevelColor(s.mlRiskLevel), fontWeight: 600 }}>{s.mlRiskLevel}</span>
                                </>
                              )}
                              {s.mlPredictionQuality && <> | <strong>Quality:</strong> {s.mlPredictionQuality}</>}
                              {s.mlExpectedError != null && <> | <strong>Expected Error:</strong> ±₹{s.mlExpectedError}</>}
                              {s.mlBuyStrength != null && s.mlSellStrength != null && (
                                <> | <strong>Buy/Sell Strength:</strong> {s.mlBuyStrength}% / {s.mlSellStrength}%</>
                              )}
                            </span>
                          )}
                          {s.mlRangeLow != null && s.mlRangeHigh != null && (
                            <span className="detail-item">
                              <strong>ML Expected Range ({s.tradeType === "Intraday" ? "Intraday 80% Band" : "Delivery 80% Band"}):</strong> ₹{s.mlRangeLow} – ₹{s.mlRangeHigh}
                              {s.mlPredictedPrice != null && (
                                <> (target ₹{s.mlPredictedPrice}, {s.mlPredictedReturnPct}% move)</>
                              )}
                            </span>
                          )}
                          {s.newsWeight != null && (
                            <span className="detail-item">
                              <strong>News Weight in Combined Prob.:</strong> {Math.round(s.newsWeight * 100)}%
                            </span>
                          )}
                          {s.intradayPredictedPrice != null && (
                            <span className="detail-item">
                              <strong>5-Min Predicted Price:</strong> ₹{s.intradayPredictedPrice} |{" "}
                              <strong>Range:</strong> ₹{s.intradayRangeLow} – ₹{s.intradayRangeHigh} |{" "}
                              <strong>Move:</strong> {s.intradayPredictedReturnPct}% |{" "}
                              <strong>Updated:</strong> {s.intradayPredictionUpdatedAt}
                            </span>
                          )}
                          {s.intradaySignal && (
                            <span className="detail-item">
                              <strong>Intraday Confidence:</strong> {s.intradayConfidence}%
                              {s.intradayModelAgreement != null && <> | <strong>Model Agreement:</strong> {s.intradayModelAgreement}%</>}
                              {s.intradayRiskLevel && (
                                <> | <strong>Risk:</strong>{" "}
                                  <span style={{ color: riskLevelColor(s.intradayRiskLevel), fontWeight: 600 }}>{s.intradayRiskLevel}</span>
                                </>
                              )}
                              {s.intradayExpectedError != null && <> | <strong>Expected Error:</strong> ±₹{s.intradayExpectedError}</>}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {expandedHeadlines[s.nseCode] && (
                    <tr className="details-row">
                      <td className="sticky-col sticky-col-1"></td>
                      <td className="sticky-col sticky-col-2"></td>

                      <td colSpan={23}>
                        <div className="details-content" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                          <strong>Recent headlines:</strong>
                          {expandedHeadlines[s.nseCode].length === 0 && <span>No recent headlines found.</span>}
                          {expandedHeadlines[s.nseCode].map((h, idx) => (
                            <a
                              key={h.id || idx}
                              href={h.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "block",
                                marginTop: "4px",
                                color: getNewsSentimentColor(h.sentimentLabel),
                              }}
                            >
                              [{h.sentimentLabel || "Neutral"}] {h.headline} — <em>{h.sourceName || h.source || "News"}</em>
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}