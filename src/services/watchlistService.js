const BASE_URL = "http://localhost:9090/api/watchlist";

export async function getWatchlist() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function addToWatchlist(token, tradingSymbol, name) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, tradingSymbol, name }),
  });
  if (!res.ok) throw new Error("Failed to add to watchlist");
  return res.json();
}

export async function removeFromWatchlist(token) {
  const res = await fetch(`${BASE_URL}/${token}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove from watchlist");
}