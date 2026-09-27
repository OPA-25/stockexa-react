// const BASE_URL = "http://localhost:9090/api/news";

// export async function refreshNewsSentiment() {
//   const res = await fetch(`${BASE_URL}/refresh`, { method: "POST" });
//   const text = await res.text(); // read body regardless of status, so we see the real error
//   if (!res.ok) {
//     throw new Error(text || `Failed with status ${res.status}`);
//   }
//   return text;
// }

// export async function getHeadlinesForStock(tradingSymbol) {
//   const res = await fetch(`${BASE_URL}/${tradingSymbol}`);
//   if (!res.ok) throw new Error("Failed to fetch headlines");
//   return res.json();
// }


const BASE_URL = "http://localhost:9090/api/news";

export async function refreshNewsSentiment() {
  const res = await fetch(`${BASE_URL}/refresh`, { method: "POST" });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Failed with status ${res.status}`);
  }
  return text;
}

export async function getHeadlinesForStock(tradingSymbol) {
  const encodedSymbol = encodeURIComponent(tradingSymbol);
  const res = await fetch(`${BASE_URL}/${encodedSymbol}`);
  if (!res.ok) throw new Error("Failed to fetch headlines");
  return res.json();
}