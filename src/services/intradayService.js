const BASE_URL = "http://localhost:9090/api/intraday";

export async function fetchIntradayData() {
  const res = await fetch(`${BASE_URL}/fetch`, { method: "POST" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to fetch intraday data");
  return text;
}

export async function trainIntradayModel() {
  const res = await fetch(`${BASE_URL}/train`, { method: "POST" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to train intraday model");
  return text;
}

export async function predictIntraday() {
  const res = await fetch(`${BASE_URL}/predict`, { method: "POST" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to predict intraday");
  return text;
}