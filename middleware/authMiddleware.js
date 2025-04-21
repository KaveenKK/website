// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Verifies JWT from Authorization header and attaches decoded payload to req.user
 */
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'No token provided or malformed Authorization header' });
  }

  const token = authHeader.slice(7).trim(); // remove "Bearer " prefix
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g. { id: '...', role: 'user', iat: ..., exp: ... }
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware factory to enforce user roles
 * @param {string|string[]} expectedRoles - role or array of roles allowed
 */
export function roleCheck(expectedRoles) {
  const roles = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
