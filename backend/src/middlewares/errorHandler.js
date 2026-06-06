import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let error = err;

  if (!(error instanceof AppError)) {
    if (error.code === 11000) error = AppError.duplicateKey(error);
    else if (error.name === "JsonWebTokenError") error = AppError.invalidJwt();
    else if (error.name === "TokenExpiredError") error = AppError.expiredJwt();
    else if (error.name === "CastError") error = AppError.castError(error);
    else if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      error = AppError.badRequest(message);
    } else {
      error = AppError.internal();
    }
  }

  const statusCode = error.statusCode || 500;

  try {
    logger.error(error.message, {
      type: error.type,
      code: error.code,
      statusCode,
      isOperational: error.isOperational,
      requestId: req.requestId || null,
      method: req.method,
      url: req.originalUrl,
      ip: req?.ip,
      user: req.user?._id || null,
      stack: error.stack,
    });
  } catch (logErr) {
    console.error("Logging failed:", logErr);
  }

  const response = {
    success: false,
    error: {
      code: error.code,
      type: error.type,
      message: error.message
    },
    requestId: req.requestId || null,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
    response.details = error.details || null;
  }

  return res.status(statusCode).json(response);
};