import express from "express";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import morgan from "morgan";
import responseMiddleware from "./src/middlewares/response.js";
import requestId from "./src/middlewares/requestId.js";
import httpLogger from "./src/middlewares/httpLogger.js";
import AppError from "./src/utils/AppError.js";

const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL = process.env.FRONTEND_URL;
const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const PORT = process.env.PORT || 3000;

const ALLOWED_BROWSER_ORIGINS = [
  FRONTEND_URL,
  ADMIN_DASHBOARD_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

const app = express();

app.use(responseMiddleware);

app.use(requestId());

app.use(httpLogger);

app.use(
    helmet({
        frameguard: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "frame-ancestors": ALLOWED_BROWSER_ORIGINS,
            },
        },
    })
);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (ALLOWED_BROWSER_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            console.error("❌ Blocked by CORS:", origin);
            callback(new Error("CORS not allowed"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Request-ID",
        "x-version",
        "x-csrf-token",
    ],
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.all("*", (req, res, next) => {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});
app.use(errorHandler);

export default app;