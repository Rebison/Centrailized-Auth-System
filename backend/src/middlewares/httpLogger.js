import formatHTTPLoggerResponse from "../utils/formatHttpLogger.js";
import logger from "../utils/logger.js";

const httpLogger = (req, res, next) => {
  req.startTime = Date.now();

  res.on("finish", () => {
    try {
      const logData = formatHTTPLoggerResponse(req, res, res.locals.body);

      if (res.statusCode >= 500) {
        logger.error("HTTP Error Response", logData);
      } else if (res.statusCode >= 400) {
        logger.warn("HTTP Client Error", logData);
      } else {
        logger.info("HTTP Request", logData);
      }
    } catch (err) {
      try {
        console.error("Logging failed", err);
      } catch (_) {}
    }
  });

  next();
};

export default httpLogger;