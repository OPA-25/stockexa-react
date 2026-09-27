import React from 'react';
import StockDashboard from './components/StockDashboard';
import AngelOneStatus from './components/AngelOneStatus';
import WatchlistPanel from './components/WatchlistPanel';

function App() {
  return (
    <div className="App">
      <StockDashboard />
      <WatchlistPanel />
      <AngelOneStatus />
    </div>
  );
}

export default App;