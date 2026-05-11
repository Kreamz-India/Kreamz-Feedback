#!/usr/bin/env node
// ============================================================
// KREAMZ — Excel → stores.json parser
// Usage: node src/utils/parseExcel.js [path/to/stores.xlsx]
// Output: backend/data/stores.json
// ============================================================

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const XLSX    = require("xlsx");

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "../../data");
const EXCEL_ARG = process.argv[2];
const EXCEL_PATH = EXCEL_ARG || join(DATA_DIR, "stores.xlsx");
const OUT_PATH  = join(DATA_DIR, "stores.json");

if (!existsSync(EXCEL_PATH)) {
  console.error(`❌ Excel file not found: ${EXCEL_PATH}`);
  console.error("   Place your Excel file at: backend/data/stores.xlsx");
  process.exit(1);
}

function slugify(name, location) {
  return `${location}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

const wb   = XLSX.readFile(EXCEL_PATH);
const ws   = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

const seenIds = {};
const stores  = rows
  .filter(r => r["Store Name"] && String(r["Store Name"]).trim())
  .map(r => {
    const name    = String(r["Store Name"]).trim();
    const city    = r["Store Location"] ? String(r["Store Location"]).trim() : "Kolkata";
    const address = r["Store Address"]
      ? String(r["Store Address"]).trim()
      : `${name}, ${city}`;

    let id = slugify(name, city);
    if (seenIds[id] !== undefined) {
      seenIds[id]++;
      id = `${id}-${seenIds[id]}`;
    } else {
      seenIds[id] = 0;
    }

    return { id, name, city, address };
  });

writeFileSync(OUT_PATH, JSON.stringify(stores, null, 2));
console.log(`✅ Parsed ${stores.length} stores → ${OUT_PATH}`);
