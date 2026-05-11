import express from "express";
import { getAllStores, getStore } from "../utils/stores.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// ── GET /stores ──────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const { city } = req.query;
    let stores = getAllStores();
    if (city && city !== "all") {
      stores = stores.filter(s => s.city.toLowerCase() === city.toLowerCase());
    }
    res.json({ stores, total: stores.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stores" });
  }
});

// ── GET /stores/qr/all ───────────────────────────────────────
router.get("/qr/all", adminAuth, (req, res) => {
  try {
    const domain = process.env.FRONTEND_URL || "https://yourdomain.com";
    const stores = getAllStores().map(s => ({
      ...s,
      feedbackUrl: `${domain}?store=${s.id}`,
      qrUrl: `/stores/qr/${s.id}/image`,
    }));
    res.json({ stores, total: stores.length, domain });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR list" });
  }
});

// ── GET /stores/qr/download — ZIP of all QR PNGs ────────────
router.get("/qr/download", adminAuth, async (req, res) => {
  try {
    const { default: QRCode }  = await import("qrcode");
    const { default: archiver } = await import("archiver");
    const domain = process.env.FRONTEND_URL || "https://yourdomain.com";
    const stores = getAllStores();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=kreamz-qr-codes.zip");

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(res);

    for (const store of stores) {
      const url = `${domain}?store=${store.id}`;
      const png = await QRCode.toBuffer(url, {
        type: "png", width: 400, margin: 2,
        color: { dark: "#c2185b", light: "#FFFFFF" },
      });
      archive.append(png, { name: `${store.id}.png` });
    }

    await archive.finalize();
  } catch (err) {
    console.error("QR ZIP error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate QR ZIP" });
  }
});

// ── GET /stores/qr/:id/image — single QR PNG ─────────────────
router.get("/qr/:id/image", async (req, res) => {
  try {
    const store = getStore(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    const { default: QRCode } = await import("qrcode");
    const domain = process.env.FRONTEND_URL || "https://yourdomain.com";
    const url    = `${domain}?store=${store.id}`;

    const png = await QRCode.toBuffer(url, {
      type: "png", width: 400, margin: 2,
      color: { dark: "#c2185b", light: "#FFFFFF" },
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

// ── GET /stores/qr/:id — download single QR ─────────────────
router.get("/qr/:id", adminAuth, async (req, res) => {
  try {
    const store = getStore(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    const { default: QRCode } = await import("qrcode");
    const domain = process.env.FRONTEND_URL || "https://yourdomain.com";
    const url    = `${domain}?store=${store.id}`;

    const png = await QRCode.toBuffer(url, {
      type: "png", width: 400, margin: 2,
      color: { dark: "#c2185b", light: "#FFFFFF" },
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename=${store.id}.png`);
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

// ── GET /stores/:id ──────────────────────────────────────────
router.get("/:id", (req, res) => {
  const store = getStore(req.params.id);
  if (!store) return res.status(404).json({ error: "Store not found" });
  res.json(store);
});

export default router;
