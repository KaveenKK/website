// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Coach from "../models/Coach.js";

/**
 * Verifies JWT, loads profile (for user/coach) or grants access for admin,
 * checks identity completion (for users), attaches req.user.
 */
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res
      .status(401)
      .json({ error: "No token provided or malformed Authorization header" });
  }

  const token = authHeader.slice(7).trim();
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }

  // Directly allow admin without DB lookup
  if (decoded.role === "admin") {
    req.user = { id: decoded.id, role: "admin" };
    return next();
  }

  // Determine model for user or coach
  const Model = decoded.role === "coach" ? Coach : User;

  try {
    const profile = await Model.findById(decoded.id);
    if (!profile) {
      return res.status(401).json({ error: "User not found" });
    }

    // For regular users, enforce identity completion
    // (Relaxed: allow login even if not completed, but attach flag)
    // if (decoded.role === "user" && !profile.identity_completed) {
    //   return res.status(401).json({
    //     error:
    //       "Please complete your registration via our Discord server before accessing this resource.",
    //   });
    // }

    req.user = profile;
    req.user.role = decoded.role;
    req.user.identity_completed = profile.identity_completed; // always attach
    next();
  } catch (dbErr) {
    console.error("Auth middleware DB error:", dbErr);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware factory to enforce user roles
 */
export function roleCheck(expectedRoles) {
  const roles = Array.isArray(expectedRoles)
    ? expectedRoles
    : [expectedRoles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}
