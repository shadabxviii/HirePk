import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

// Config imports
import connectDB from "./config/db.js";
import configurePassport from "./config/passport.js";

// Middleware imports
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";


// Setup path helpers for static folder serving in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Passport Strategy
configurePassport();

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allows fetching local uploads from separate frontend domain
  })
);

// CORS Policy Configuration
const allowedOrigins = [
  "https://hirepk.vercel.app",
  "https://hire-pk.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].map(url => url && url.replace(/\/$/, "")).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? origin.replace(/\/$/, "") : null;
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};

app.use(cors(corsOptions));
// Yeh line preflight requests (jo network tab mein 204 aa rahi thin) unko handle karegi
app.options("*", cors(corsOptions));

// General Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." }
});
app.use("/api", apiLimiter);

// Initialize Passport
app.use(passport.initialize());

// Static folder serving for uploaded local resumes/logo pitches
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Base Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Base Test API Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "HirePK API is running smoothly.",
    version: "1.0.0",
    docs: "/docs"
  });
});

// Centralized error handling (Must be defined last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server successfully started in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
