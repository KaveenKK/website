// middleware/adminMiddleware.js
export default function adminMiddleware(req, res, next) {
    // assume authMiddleware has already set req.user
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  }
  