import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Common request validation handler using express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Standardize validation error output format
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(400, "Invalid input data provided.", formattedErrors));
  }
  next();
};
