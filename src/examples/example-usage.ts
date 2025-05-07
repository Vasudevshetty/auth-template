import express from "express";
import cors from "cors";
import passport from "passport";
import { setupPassport } from "../auth/passportConfig";
import { setupSecurityMiddleware } from "../middlewares/securityMiddleware";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { MongoDBStorageAdapter } from "../utils/MongoDBStorageAdapter";
import { EmailService } from "../services/EmailService";
import { setupSwagger } from "../utils/swagger";
import { logInfo, logError } from "../utils/logger";

/**
 * Comprehensive example showing how to use the authentication template with all features
 */

// Create Express application
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup security middleware (helmet, xss protection, etc.)
setupSecurityMiddleware(app);

// Configuration (would typically come from environment variables)
const config = {
  port: 3000,
  apiPrefix: "/api/v1",
  mongoUri: "mongodb://localhost:27017/auth-example",
  auth: {
    jwtSecret: "your-jwt-secret-key",
    jwtExpiresIn: "1h",
    refreshSecret: "your-refresh-secret-key",
    refreshExpiresIn: "7d",

    // OAuth providers
    enableGithub: true,
    githubOptions: {
      clientID: "your-github-client-id",
      clientSecret: "your-github-client-secret",
      callbackURL: "http://localhost:3000/api/v1/auth/github/callback",
    },

    enableGoogle: true,
    googleOptions: {
      clientID: "your-google-client-id",
      clientSecret: "your-google-client-secret",
      callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
    },

    enableFacebook: true,
    facebookOptions: {
      clientID: "your-facebook-client-id",
      clientSecret: "your-facebook-client-secret",
      callbackURL: "http://localhost:3000/api/v1/auth/facebook/callback",
    },

    // Email for password reset
    emailOptions: {
      from: "noreply@example.com",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "your-email-user",
        pass: "your-email-password",
      },
    },
  },
};

// Initialize MongoDB storage adapter
const storageAdapter = new MongoDBStorageAdapter(config.mongoUri);

// Initialize Email service for password reset
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
setupPassport(passport, authService);

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

// Start the server
app.listen(config.port, () => {
  logInfo(`Server running on port ${config.port}`);
  logInfo(
    `API Documentation available at http://localhost:${config.port}/api-docs`
  );
});

// Example API usage (for documentation purposes)
/*

 
// Register a new user
fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'Example User'
  })
})
.then(res => res.json())
.then(data => console.log('Registration response:', data));

// Login
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login response:', data);
  // Store tokens for future requests
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
});

// Get current user with accessToken
fetch('http://localhost:3000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(res => res.json())
.then(data => console.log('Current user:', data));

// Request password reset
fetch('http://localhost:3000/api/v1/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
})
.then(res => res.json())
.then(data => console.log('Password reset request:', data));

// Reset password with token (token comes from email)
fetch('http://localhost:3000/api/v1/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'token-from-email',
    newPassword: 'newSecurePassword123'
  })
})
.then(res => res.json())
.then(data => console.log('Password reset result:', data));

// OAuth login - redirect user to:
// GitHub: http://localhost:3000/api/v1/auth/github
// Google: http://localhost:3000/api/v1/auth/google
// Facebook: http://localhost:3000/api/v1/auth/facebook

*/
