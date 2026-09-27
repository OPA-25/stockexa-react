const BASE_URL = "http://localhost:9090/api/live-price";

export async function refreshLivePrices() {
  const res = await fetch(`${BASE_URL}/refresh`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh live prices");
  return res.text(); // backend returns a plain status string, not JSON
}