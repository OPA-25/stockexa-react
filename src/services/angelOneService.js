// const BASE_URL = "http://localhost:9090/api/angelone";

// export async function loginToAngelOne() {
//   const res = await fetch(`${BASE_URL}/login`, { method: "POST" });
//   if (!res.ok) throw new Error("Angel One login request failed");
//   return res.json();
// }

// export async function getAngelOneStatus() {
//   const res = await fetch(`${BASE_URL}/status`);
//   if (!res.ok) throw new Error("Failed to fetch Angel One status");
//   return res.json();
// }

const BASE_URL = "http://localhost:9090/api/angelone";

export async function loginToAngelOne() {
  const res = await fetch(`${BASE_URL}/login`, { method: "POST" });
  if (!res.ok) throw new Error("Angel One login request failed");
  return res.json();
}

export async function getAngelOneStatus() {
  const res = await fetch(`${BASE_URL}/status`);
  if (!res.ok) throw new Error("Failed to fetch Angel One status");
  return res.json();
}