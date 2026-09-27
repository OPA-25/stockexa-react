const BASE_URL = "http://localhost:9090/api/instruments";

export async function searchInstruments(query) {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function refreshInstrumentMaster() {
  const res = await fetch(`${BASE_URL}/refresh`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh instrument list");
  return res.json();
}