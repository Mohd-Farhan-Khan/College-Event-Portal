import { verifyToken } from "../config/jwt.js";
import User from "../models/userModel.js";

// Auth + role-based guard
const auth = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Not authorized, token missing" });
      }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  req.user = await User.findById(decoded.id).select("-passwordHash");
      if (!req.user) return res.status(401).json({ message: "User not found" });
      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient role" });
      }
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", error: err.message });
    }
  };
};

export default auth;
