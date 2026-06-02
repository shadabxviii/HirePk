import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors } = err;

  // If error is not a custom ApiError instance, default it to a generic Server Error
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
    errors = [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
