// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "No token provided or malformed authorization header" });
  }

  const token = authHeader.slice(7).trim(); // remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;    // e.g. { id: "...", role: "...", iat: ..., exp: ... }
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
