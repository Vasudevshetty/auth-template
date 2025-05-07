import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { PassportConfig } from "./auth/passportConfig";
import { setupSecurityMiddleware } from "./middlewares/securityMiddleware";
import { AuthController } from "./controllers/AuthController";
import { AuthService } from "./services/AuthService";
import { MongoDBStorageAdapter } from "./utils/MongoDBStorageAdapter";
import { EmailService } from "./services/EmailService";
import { setupSwagger } from "./utils/swagger";
import config from "./config/config";
import { logInfo, logError } from "./utils/logger";
import fs from "fs";
import path from "path";

// Create Express application
const app = express();

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup security middleware (helmet, xss protection, etc.)
setupSecurityMiddleware(app);

// Initialize MongoDB storage adapter
const storageAdapter = new MongoDBStorageAdapter(config.mongoUri);

// Initialize Email service if email configuration is provided
let emailService: EmailService | undefined;
if (config.auth.emailOptions) {
  try {
    emailService = new EmailService(config.auth.emailOptions);
  } catch (error) {
    logError("Failed to initialize email service", error);
  }
}

// Initialize Auth service
const authService = new AuthService(
  storageAdapter,
  config.auth.jwtSecret,
  config.auth.jwtExpiresIn,
  config.auth.refreshSecret,
  config.auth.refreshExpiresIn,
  emailService
);

// Setup Passport for OAuth authentication
app.use(passport.initialize());
// Initialize Passport config
const passportConfig = new PassportConfig(authService, storageAdapter, config.auth);
passportConfig.initialize();

// Initialize Auth controller
const authController = new AuthController(authService);

// Setup routes
app.use(`${config.apiPrefix}/auth`, authController.getRouter());

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get(`${config.apiPrefix}/health`, (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Start the server
app.listen(config.port, () => {
  logInfo(`Server running on port ${config.port} in ${config.environment} mode`);
  logInfo(
    `API Documentation available at http://localhost:${config.port}/api-docs`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logError("Unhandled Promise Rejection", err);
  // Don't crash the server in production
  if (config.environment === "development") {
    process.exit(1);
  }
});

export default app;
