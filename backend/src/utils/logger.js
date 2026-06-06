import pino from "pino";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const isProd = process.env.NODE_ENV === "production";

// -------------------------
// Transport configuration with rotation
// -------------------------
const transport = isProd
  ? pino.transport({
      targets: [
        // 🟢 Info + Warn logs
        {
          target: "pino-roll",
          level: "info",
          options: {
            file: path.join(logDir, "app.log"),
            frequency: "daily",      // rotate daily
            size: "50m",             // max file size
            limit: { count: 30 },    // keep 30 files
            compress: true,          // gzip old logs
          },
        },

        // 🔴 Error logs
        {
          target: "pino-roll",
          level: "error",
          options: {
            file: path.join(logDir, "error.log"),
            frequency: "daily",
            size: "50m",
            limit: { count: 60 },    // keep longer for errors
            compress: true,
          },
        },
      ],
    })
  : pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    });

// -------------------------
// Logger instance
// -------------------------
const logger = pino(
  {
    level: isProd ? "info" : "debug",

    timestamp: pino.stdTimeFunctions.isoTime,

    serializers: {
      err: pino.stdSerializers.err,
    },

    base: {
      env: process.env.NODE_ENV,
    },
  },
  transport
);

// -------------------------
// Helper: frontend error logging
// -------------------------
export const logFrontendError = (message, context = {}) => {
  logger.error({ context }, message);
};

export default logger;