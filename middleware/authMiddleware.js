// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Coach from "../models/Coach.js";

/**
 * Verifies JWT from Authorization header, loads the full user/coach record,
 * checks identity completion (for users), and attaches the profile to req.user.
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

  const token = authHeader.slice(7).trim(); // remove "Bearer " prefix
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }

  // Determine model based on role in token: treat 'admin' same as 'coach'
  const Model = decoded.role === "coach" || decoded.role === "admin" ? Coach : User;

  try {
    const profile = await Model.findById(decoded.id);
    if (!profile) {
      return res.status(401).json({ error: "User not found" });
    }

    // For regular users, enforce identity check
    if (decoded.role === "user" && !profile.identity_completed) {
      return res.status(401).json({
        error:
          "Please complete your registration via our Discord server before accessing this resource.",
      });
    }

    // Attach full profile and role to req.user
    req.user = profile;
    req.user.role = decoded.role;
    next();
  } catch (dbErr) {
    console.error("Auth middleware DB error:", dbErr);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware factory to enforce user roles
 * @param {string|string[]} expectedRoles - role or array of roles allowed
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
