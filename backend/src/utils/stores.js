// ============================================================
// KREAMZ — STORE MASTER SYSTEM (EXCEL-DRIVEN via stores.json)
// Source of truth: backend/data/stores.json (parsed from Excel)
// Run: node src/utils/parseExcel.js to regenerate from Excel
// ============================================================

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = join(__dirname, "../../data");
const JSON_PATH  = join(DATA_DIR, "stores.json");

let _stores  = null;
let _storeMap = null;

function loadStores() {
  if (existsSync(JSON_PATH)) {
    try {
      const data = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ Loaded ${data.length} stores from stores.json (Excel-driven)`);
        return data;
      }
    } catch (err) {
      console.error("❌ Failed to parse stores.json:", err.message);
    }
  }
  console.warn("⚠️  stores.json not found. Run: node src/utils/parseExcel.js");
  return [{ id: "demo", name: "Demo Store", city: "Kolkata", address: "Demo Location" }];
}

function init() {
  if (!_stores) {
    _stores   = loadStores();
    _storeMap = Object.fromEntries(_stores.map(s => [s.id, s]));
  }
}

export function getAllStores() {
  init();
  return _stores;
}

export function getStore(storeId) {
  init();
  if (!storeId) return null;
  return _storeMap[storeId.toLowerCase().trim()] || null;
}

export function resolveStoreName(storeId) {
  const store = getStore(storeId);
  if (store) return store.name;
  if (!storeId) return "Unknown Store";
  return storeId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function reloadStores() {
  _stores   = null;
  _storeMap = null;
  init();
  return _stores;
}
