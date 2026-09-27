// import React, { useState } from "react";
// import indicatorService from "../services/indicatorService";

// const IndicatorPanel = () => {
//     const [loadingHistorical, setLoadingHistorical] = useState(false);
//     const [loadingIndicators, setLoadingIndicators] = useState(false);
//     const [message, setMessage] = useState("");

//     const handleFetchHistorical = async () => {
//         try {
//             setLoadingHistorical(true);
//             setMessage("");

//             const response = await indicatorService.fetchHistoricalData();

//             setMessage(response);
//         } catch (error) {
//             setMessage(
//                 error?.response?.data ||
//                 error?.message ||
//                 "Failed to fetch historical data."
//             );
//         } finally {
//             setLoadingHistorical(false);
//         }
//     };

//     const handleRecalculate = async () => {
//         try {
//             setLoadingIndicators(true);
//             setMessage("");

//             const response = await indicatorService.recalculateIndicators();

//             setMessage(response);
//         } catch (error) {
//             setMessage(
//                 error?.response?.data ||
//                 error?.message ||
//                 "Failed to recalculate indicators."
//             );
//         } finally {
//             setLoadingIndicators(false);
//         }
//     };

//     return (
//         <div className="card shadow-sm mb-3">
//             <div className="card-header">
//                 <h5 className="mb-0">Technical Indicators</h5>
//             </div>

//             <div className="card-body">

//                 <div className="d-flex gap-2 flex-wrap">

//                     <button
//                         className="btn btn-primary"
//                         onClick={handleFetchHistorical}
//                         disabled={loadingHistorical}
//                     >
//                         {loadingHistorical
//                             ? "Fetching..."
//                             : "Fetch Historical Data"}
//                     </button>

//                     <button
//                         className="btn btn-success"
//                         onClick={handleRecalculate}
//                         disabled={loadingIndicators}
//                     >
//                         {loadingIndicators
//                             ? "Calculating..."
//                             : "Recalculate Indicators"}
//                     </button>

//                 </div>

//                 {message && (
//                     <div className="alert alert-info mt-3 mb-0">
//                         {message}
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// };

// export default IndicatorPanel;


import React, { useState } from "react";
import indicatorService from "../services/indicatorService";
import "./IndicatorPanel.css"; // Responsive stylesheet import

const IndicatorPanel = () => {
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetchHistorical = async () => {
    try {
      setLoadingHistorical(true);
      setMessage("");

      const response = await indicatorService.fetchHistoricalData();

      setMessage(response);
    } catch (error) {
      setMessage(
        error?.response?.data ||
          error?.message ||
          "Failed to fetch historical data."
      );
    } finally {
      setLoadingHistorical(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setLoadingIndicators(true);
      setMessage("");

      const response = await indicatorService.recalculateIndicators();

      setMessage(response);
    } catch (error) {
      setMessage(
        error?.response?.data ||
          error?.message ||
          "Failed to recalculate indicators."
      );
    } finally {
      setLoadingIndicators(false);
    }
  };

  return (
    <div className="indicator-panel-card">
      <div className="panel-header">
        <h3 className="panel-title">Technical Indicators</h3>
      </div>

      <div className="panel-body">
        <div className="panel-actions">
          <button
            className="btn btn-primary"
            onClick={handleFetchHistorical}
            disabled={loadingHistorical}
          >
            {loadingHistorical ? "Fetching..." : "Fetch Historical Data"}
          </button>

          <button
            className="btn btn-success"
            onClick={handleRecalculate}
            disabled={loadingIndicators}
          >
            {loadingIndicators ? "Calculating..." : "Recalculate Indicators"}
          </button>
        </div>

        {message && (
          <div className="panel-alert">
            <span className="alert-icon">ℹ️</span>
            <span className="alert-text">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicatorPanel;