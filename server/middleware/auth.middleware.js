import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * Middleware to verify JWT token and attach user to request object
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Read token from cookies (if available)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    // 2. Or read token from Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Not authorized, login required.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB and omit password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(404, "Session invalid, user not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Session expired, please login again."));
    }
    next(new ApiError(401, "Not authorized, invalid token."));
  }
};
