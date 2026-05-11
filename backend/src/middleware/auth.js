// ── Admin auth middleware ─────────────────────────────────────
export function adminAuth(req, res, next) {
  const key = process.env.ADMIN_KEY;
  // If no ADMIN_KEY set, allow (dev mode)
  if (!key) return next();

  const header = req.headers["authorization"];
  const token  = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (token !== key) {
    return res.status(401).json({ error: "Unauthorized. Provide: Authorization: Bearer <ADMIN_KEY>" });
  }
  next();
}
