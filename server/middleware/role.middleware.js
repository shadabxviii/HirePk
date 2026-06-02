import ApiError from "../utils/ApiError.js";

/**
 * Middleware to restrict route access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'employer', 'admin', 'jobseeker')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }
    
    next();
  };
};
