// ── Frontend store utils ─────────────────────────────────────
// Stores are fetched from backend (GET /stores) in App.jsx
// These helpers work with that data locally.

export function getStoreName(store) {
  if (!store) return "Kreamz Store";
  return store.name || store.id || "Kreamz Store";
}

export function getAllStores(stores = []) {
  return stores;
}

export function getCities(stores = []) {
  const cities = [...new Set(stores.map(s => s.city).filter(Boolean))];
  return cities.sort();
}
