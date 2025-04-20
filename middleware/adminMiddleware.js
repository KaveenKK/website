// middleware/adminMiddleware.js
export default function adminMiddleware(req, res, next) {
    // ✅ Your personal MongoDB _id (you can find it in Compass)
    const myAdminId = "6805021857ad2c95f230a900";
  
    if (!req.user || req.user.id !== myAdminId) {
      return res.status(403).json({ error: "Admin access only" });
    }
  
    next();
  }
  