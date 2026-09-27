const BASE_URL = "http://localhost:9090/api/options";

export async function refreshOptionMaster() {
  const res = await fetch(`${BASE_URL}/refresh-master`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh option master list");
  return res.json();
}

export async function recalculateOptions() {
  const res = await fetch(`${BASE_URL}/recalculate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to recalculate option analysis");
  return res.text();
}