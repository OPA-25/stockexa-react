// const BASE_URL = "http://localhost:9090/api/dashboard";

// export async function fetchAllStocks() {
//   const res = await fetch(BASE_URL);
//   if (!res.ok) throw new Error("Failed to fetch stock dashboard");
//   return res.json();
// }

// export async function fetchStockByCode(nseCode) {
//   const res = await fetch(`${BASE_URL}/${nseCode}`);
//   if (!res.ok) throw new Error("Stock not found");
//   return res.json();
// }




const BASE_URL = "http://localhost:9090/api/dashboard";
const ML_BASE_URL = "http://localhost:9090/api/ml";

export async function fetchAllStocks() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch stock dashboard");
  return res.json();
}

export async function fetchStockByCode(nseCode) {
  const res = await fetch(`${BASE_URL}/${nseCode}`);
  if (!res.ok) throw new Error("Stock not found");
  return res.json();
}

export async function trainDailyMlModel() {
  const res = await fetch(`${ML_BASE_URL}/train`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to train daily ML model");
  }
  return res.text();
}