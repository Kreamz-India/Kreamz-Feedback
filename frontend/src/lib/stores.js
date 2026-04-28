// src/lib/stores.js
// 112 Kreamz India outlet locations
// Format: { id, name, city, area, zone }
// The QR code URL for each store = window.location.origin + "/?store=" + encodeURIComponent(id)

export const STORES = [
  // ── Hyderabad ──────────────────────────────────────────────────────────────
  { id: "HYD-001", name: "Jubilee Hills", city: "Hyderabad", area: "Jubilee Hills", zone: "West" },
  { id: "HYD-002", name: "Banjara Hills", city: "Hyderabad", area: "Banjara Hills", zone: "West" },
  { id: "HYD-003", name: "Gachibowli", city: "Hyderabad", area: "Gachibowli", zone: "West" },
  { id: "HYD-004", name: "HITEC City", city: "Hyderabad", area: "HITEC City", zone: "West" },
  { id: "HYD-005", name: "Kukatpally", city: "Hyderabad", area: "Kukatpally", zone: "North-West" },
  { id: "HYD-006", name: "Kondapur", city: "Hyderabad", area: "Kondapur", zone: "West" },
  { id: "HYD-007", name: "Madhapur", city: "Hyderabad", area: "Madhapur", zone: "West" },
  { id: "HYD-008", name: "Miyapur", city: "Hyderabad", area: "Miyapur", zone: "North-West" },
  { id: "HYD-009", name: "Ameerpet", city: "Hyderabad", area: "Ameerpet", zone: "Central" },
  { id: "HYD-010", name: "SR Nagar", city: "Hyderabad", area: "SR Nagar", zone: "Central" },
  { id: "HYD-011", name: "Koti", city: "Hyderabad", area: "Koti", zone: "Central" },
  { id: "HYD-012", name: "Himayatnagar", city: "Hyderabad", area: "Himayatnagar", zone: "Central" },
  { id: "HYD-013", name: "Secunderabad", city: "Hyderabad", area: "Secunderabad", zone: "North" },
  { id: "HYD-014", name: "Begumpet", city: "Hyderabad", area: "Begumpet", zone: "Central" },
  { id: "HYD-015", name: "Somajiguda", city: "Hyderabad", area: "Somajiguda", zone: "Central" },
  { id: "HYD-016", name: "Panjagutta", city: "Hyderabad", area: "Panjagutta", zone: "Central" },
  { id: "HYD-017", name: "Lakdikapul", city: "Hyderabad", area: "Lakdikapul", zone: "Central" },
  { id: "HYD-018", name: "Abids", city: "Hyderabad", area: "Abids", zone: "Central" },
  { id: "HYD-019", name: "Dilsukhnagar", city: "Hyderabad", area: "Dilsukhnagar", zone: "East" },
  { id: "HYD-020", name: "LB Nagar", city: "Hyderabad", area: "LB Nagar", zone: "East" },
  { id: "HYD-021", name: "Uppal", city: "Hyderabad", area: "Uppal", zone: "East" },
  { id: "HYD-022", name: "ECIL", city: "Hyderabad", area: "ECIL", zone: "North-East" },
  { id: "HYD-023", name: "Malkajgiri", city: "Hyderabad", area: "Malkajgiri", zone: "North-East" },
  { id: "HYD-024", name: "Kompally", city: "Hyderabad", area: "Kompally", zone: "North" },
  { id: "HYD-025", name: "Alwal", city: "Hyderabad", area: "Alwal", zone: "North" },
  { id: "HYD-026", name: "Medchal", city: "Hyderabad", area: "Medchal", zone: "North" },
  { id: "HYD-027", name: "Nizampet", city: "Hyderabad", area: "Nizampet", zone: "North-West" },
  { id: "HYD-028", name: "Bachupally", city: "Hyderabad", area: "Bachupally", zone: "North-West" },
  { id: "HYD-029", name: "Dundigal", city: "Hyderabad", area: "Dundigal", zone: "North" },
  { id: "HYD-030", name: "Qutubullapur", city: "Hyderabad", area: "Qutubullapur", zone: "North" },
  { id: "HYD-031", name: "Manikonda", city: "Hyderabad", area: "Manikonda", zone: "South-West" },
  { id: "HYD-032", name: "Narsingi", city: "Hyderabad", area: "Narsingi", zone: "South-West" },
  { id: "HYD-033", name: "Tolichowki", city: "Hyderabad", area: "Tolichowki", zone: "South-West" },
  { id: "HYD-034", name: "Mehdipatnam", city: "Hyderabad", area: "Mehdipatnam", zone: "South" },
  { id: "HYD-035", name: "Attapur", city: "Hyderabad", area: "Attapur", zone: "South" },
  { id: "HYD-036", name: "Rajendra Nagar", city: "Hyderabad", area: "Rajendra Nagar", zone: "South" },
  { id: "HYD-037", name: "Shamshabad", city: "Hyderabad", area: "Shamshabad", zone: "South" },
  { id: "HYD-038", name: "Vanasthalipuram", city: "Hyderabad", area: "Vanasthalipuram", zone: "South-East" },
  { id: "HYD-039", name: "Hayathnagar", city: "Hyderabad", area: "Hayathnagar", zone: "East" },
  { id: "HYD-040", name: "Boduppal", city: "Hyderabad", area: "Boduppal", zone: "East" },
  { id: "HYD-041", name: "Nagole", city: "Hyderabad", area: "Nagole", zone: "East" },
  { id: "HYD-042", name: "AS Rao Nagar", city: "Hyderabad", area: "AS Rao Nagar", zone: "North-East" },
  { id: "HYD-043", name: "Sainikpuri", city: "Hyderabad", area: "Sainikpuri", zone: "North-East" },
  { id: "HYD-044", name: "Yapral", city: "Hyderabad", area: "Yapral", zone: "North-East" },
  { id: "HYD-045", name: "Bowenpally", city: "Hyderabad", area: "Bowenpally", zone: "North" },
  { id: "HYD-046", name: "Trimulgherry", city: "Hyderabad", area: "Trimulgherry", zone: "North" },
  { id: "HYD-047", name: "Tarnaka", city: "Hyderabad", area: "Tarnaka", zone: "North-East" },
  { id: "HYD-048", name: "Moosapet", city: "Hyderabad", area: "Moosapet", zone: "North-West" },
  { id: "HYD-049", name: "Hafeezpet", city: "Hyderabad", area: "Hafeezpet", zone: "West" },
  { id: "HYD-050", name: "Nallagandla", city: "Hyderabad", area: "Nallagandla", zone: "West" },
  { id: "HYD-051", name: "Tellapur", city: "Hyderabad", area: "Tellapur", zone: "West" },
  { id: "HYD-052", name: "Chandanagar", city: "Hyderabad", area: "Chandanagar", zone: "West" },
  { id: "HYD-053", name: "Lingampally", city: "Hyderabad", area: "Lingampally", zone: "West" },
  { id: "HYD-054", name: "Patancheru", city: "Hyderabad", area: "Patancheru", zone: "North-West" },
  { id: "HYD-055", name: "Shamirpet", city: "Hyderabad", area: "Shamirpet", zone: "North" },
  { id: "HYD-056", name: "Ghatkesar", city: "Hyderabad", area: "Ghatkesar", zone: "East" },
  { id: "HYD-057", name: "Keesara", city: "Hyderabad", area: "Keesara", zone: "East" },
  { id: "HYD-058", name: "Ibrahimpatnam", city: "Hyderabad", area: "Ibrahimpatnam", zone: "East" },
  { id: "HYD-059", name: "Chevella", city: "Hyderabad", area: "Chevella", zone: "South-West" },
  { id: "HYD-060", name: "Shadnagar", city: "Hyderabad", area: "Shadnagar", zone: "South" },

  // ── Vijayawada ─────────────────────────────────────────────────────────────
  { id: "VJA-001", name: "Benz Circle", city: "Vijayawada", area: "Benz Circle", zone: "Central" },
  { id: "VJA-002", name: "MG Road", city: "Vijayawada", area: "MG Road", zone: "Central" },
  { id: "VJA-003", name: "Governorpet", city: "Vijayawada", area: "Governorpet", zone: "Central" },
  { id: "VJA-004", name: "Labbipet", city: "Vijayawada", area: "Labbipet", zone: "Central" },
  { id: "VJA-005", name: "One Town", city: "Vijayawada", area: "One Town", zone: "Central" },
  { id: "VJA-006", name: "Patamata", city: "Vijayawada", area: "Patamata", zone: "East" },
  { id: "VJA-007", name: "Vijayawada Railway Station", city: "Vijayawada", area: "Railway Station", zone: "Central" },
  { id: "VJA-008", name: "Kanuru", city: "Vijayawada", area: "Kanuru", zone: "East" },

  // ── Visakhapatnam ──────────────────────────────────────────────────────────
  { id: "VSK-001", name: "Dwaraka Nagar", city: "Visakhapatnam", area: "Dwaraka Nagar", zone: "Central" },
  { id: "VSK-002", name: "MVP Colony", city: "Visakhapatnam", area: "MVP Colony", zone: "North" },
  { id: "VSK-003", name: "Siripuram", city: "Visakhapatnam", area: "Siripuram", zone: "Central" },
  { id: "VSK-004", name: "Gajuwaka", city: "Visakhapatnam", area: "Gajuwaka", zone: "South" },
  { id: "VSK-005", name: "NAD Junction", city: "Visakhapatnam", area: "NAD Junction", zone: "North" },
  { id: "VSK-006", name: "Madhurawada", city: "Visakhapatnam", area: "Madhurawada", zone: "North" },

  // ── Tirupati ───────────────────────────────────────────────────────────────
  { id: "TPT-001", name: "Tirupati Main", city: "Tirupati", area: "Car Street", zone: "Central" },
  { id: "TPT-002", name: "Tirupati Balaji Nagar", city: "Tirupati", area: "Balaji Nagar", zone: "East" },
  { id: "TPT-003", name: "Tirupati Renigunta Road", city: "Tirupati", area: "Renigunta Rd", zone: "West" },
  { id: "TPT-004", name: "Tirupati Railway Station", city: "Tirupati", area: "Railway Station", zone: "Central" },

  // ── Guntur ─────────────────────────────────────────────────────────────────
  { id: "GNT-001", name: "Guntur Main", city: "Guntur", area: "Brodipet", zone: "Central" },
  { id: "GNT-002", name: "Guntur Arundelpet", city: "Guntur", area: "Arundelpet", zone: "Central" },
  { id: "GNT-003", name: "Guntur Naaz Center", city: "Guntur", area: "Naaz Center", zone: "Central" },

  // ── Warangal ───────────────────────────────────────────────────────────────
  { id: "WGL-001", name: "Warangal Hanmakonda", city: "Warangal", area: "Hanmakonda", zone: "Central" },
  { id: "WGL-002", name: "Warangal Hanamkonda Bazar", city: "Warangal", area: "Hanamkonda Bazar", zone: "East" },
  { id: "WGL-003", name: "Warangal Station Road", city: "Warangal", area: "Station Road", zone: "Central" },

  // ── Nellore ────────────────────────────────────────────────────────────────
  { id: "NLR-001", name: "Nellore Grand Bazaar", city: "Nellore", area: "Grand Bazaar", zone: "Central" },
  { id: "NLR-002", name: "Nellore Magunta Layout", city: "Nellore", area: "Magunta Layout", zone: "East" },

  // ── Karimnagar ─────────────────────────────────────────────────────────────
  { id: "KMR-001", name: "Karimnagar Main", city: "Karimnagar", area: "Mukarampura", zone: "Central" },
  { id: "KMR-002", name: "Karimnagar Bypass Road", city: "Karimnagar", area: "Bypass Road", zone: "West" },

  // ── Nizamabad ──────────────────────────────────────────────────────────────
  { id: "NZB-001", name: "Nizamabad Main", city: "Nizamabad", area: "Subhash Chowk", zone: "Central" },

  // ── Kurnool ────────────────────────────────────────────────────────────────
  { id: "KNL-001", name: "Kurnool Main", city: "Kurnool", area: "Bellary Road", zone: "Central" },
  { id: "KNL-002", name: "Kurnool Old Town", city: "Kurnool", area: "Old Town", zone: "East" },

  // ── Khammam ────────────────────────────────────────────────────────────────
  { id: "KHM-001", name: "Khammam Main", city: "Khammam", area: "Wyra Road", zone: "Central" },

  // ── Rajahmundry ────────────────────────────────────────────────────────────
  { id: "RJY-001", name: "Rajahmundry Main", city: "Rajahmundry", area: "Innespeta", zone: "Central" },
  { id: "RJY-002", name: "Rajahmundry Morampudi", city: "Rajahmundry", area: "Morampudi", zone: "East" },

  // ── Eluru ──────────────────────────────────────────────────────────────────
  { id: "ELR-001", name: "Eluru Main", city: "Eluru", area: "Main Road", zone: "Central" },

  // ── Kakinada ───────────────────────────────────────────────────────────────
  { id: "KKD-001", name: "Kakinada Main", city: "Kakinada", area: "Main Road", zone: "Central" },
  { id: "KKD-002", name: "Kakinada Jagannaickpur", city: "Kakinada", area: "Jagannaickpur", zone: "South" },

  // ── Ongole ─────────────────────────────────────────────────────────────────
  { id: "OGL-001", name: "Ongole Main", city: "Ongole", area: "Trunk Road", zone: "Central" },

  // ── Anantapur ──────────────────────────────────────────────────────────────
  { id: "ATP-001", name: "Anantapur Main", city: "Anantapur", area: "Subhash Road", zone: "Central" },

  // ── Srikakulam ─────────────────────────────────────────────────────────────
  { id: "SKL-001", name: "Srikakulam Main", city: "Srikakulam", area: "Main Road", zone: "Central" },

  // ── Adilabad ───────────────────────────────────────────────────────────────
  { id: "ADB-001", name: "Adilabad Main", city: "Adilabad", area: "Main Road", zone: "Central" },

  // ── Mahbubnagar ────────────────────────────────────────────────────────────
  { id: "MBN-001", name: "Mahbubnagar Main", city: "Mahbubnagar", area: "Station Road", zone: "Central" },

  // ── Medak ──────────────────────────────────────────────────────────────────
  { id: "MDK-001", name: "Medak Main", city: "Medak", area: "Main Road", zone: "Central" },

  // ── Bangalore (expansion) ──────────────────────────────────────────────────
  { id: "BLR-001", name: "Indiranagar", city: "Bangalore", area: "Indiranagar", zone: "East" },
  { id: "BLR-002", name: "Koramangala", city: "Bangalore", area: "Koramangala", zone: "South" },
  { id: "BLR-003", name: "Jayanagar", city: "Bangalore", area: "Jayanagar", zone: "South" },
  { id: "BLR-004", name: "Whitefield", city: "Bangalore", area: "Whitefield", zone: "East" },
  { id: "BLR-005", name: "Electronic City", city: "Bangalore", area: "Electronic City", zone: "South" },

  // ── Chennai (expansion) ────────────────────────────────────────────────────
  { id: "CHN-001", name: "Anna Nagar", city: "Chennai", area: "Anna Nagar", zone: "North-West" },
  { id: "CHN-002", name: "T Nagar", city: "Chennai", area: "T Nagar", zone: "Central" },
  { id: "CHN-003", name: "Adyar", city: "Chennai", area: "Adyar", zone: "South" },
  { id: "CHN-004", name: "Velachery", city: "Chennai", area: "Velachery", zone: "South" },
];

export const CITIES = [...new Set(STORES.map((s) => s.city))].sort();
export const ZONES = [...new Set(STORES.map((s) => s.zone))].sort();

export function getStoreById(id) {
  return STORES.find((s) => s.id === id);
}

export function getFeedbackUrl(storeId, baseUrl) {
  return `${baseUrl}/?store=${encodeURIComponent(storeId)}`;
}
