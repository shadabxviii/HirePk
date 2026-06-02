import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

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
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // Crucial to allow cookie transit
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// General Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
