// apps/api/middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || "rest_house_token";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;
const ADMIN_COOKIE_NAME =
  process.env.ADMIN_COOKIE_NAME || "rest_house_admin_token";

function extractToken(req) {
  // Admin cookie first (so admin UI can use its own cookie)
  if (req.cookies && req.cookies[ADMIN_COOKIE_NAME])
    return { token: req.cookies[ADMIN_COOKIE_NAME], admin: true };

  // Then user cookie
  if (req.cookies && req.cookies[COOKIE_NAME])
    return { token: req.cookies[COOKIE_NAME], admin: false };

  // Authorization header: assume user token unless admin cookie present
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith("Bearer "))
    return { token: auth.slice(7).trim(), admin: false };

  // Body fallback
  if (req.body && req.body.token)
    return { token: req.body.token, admin: false };

  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const extracted = extractToken(req);
    if (!extracted) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const secret = extracted.admin ? ADMIN_JWT_SECRET : JWT_SECRET;
    const payload = jwt.verify(extracted.token, secret);

    req.user = {
      id: payload.id,
      role: payload.role,
      employeeId: payload.employeeId ?? null,
      adminToken: !!extracted.admin,
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message || err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * requireRole(allowed)
 * - allowed may be 'admin' (shorthand for any admin-role), 'Super Admin', 'employee', or array.
 */
function requireRole(allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
    const userRole = req.user.role;
    const adminRoles = ["Super Admin", "Admin", "Manager"];

    // Support 'admin' shorthand => any admin role allowed
    if (allowedArr.includes("admin") && adminRoles.includes(userRole))
      return next();

    // direct match
    if (allowedArr.includes(userRole)) return next();

    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = { authMiddleware, requireRole, COOKIE_NAME };
