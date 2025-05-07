import dotenv from "dotenv";
import { AuthOptions } from "../types/auth.types";

// Load environment variables
dotenv.config();

const config: {
  port: number;
  apiPrefix: string;
  auth: AuthOptions;
  mongoUri: string;
  environment: string;
} = {
  // Server port
  port: Number(process.env.PORT) || 3000,

  // API prefix for all routes
  apiPrefix: process.env.API_PREFIX || "/api/v1",

  // Current environment
  environment: process.env.NODE_ENV || "development",

  // MongoDB connection string
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/auth-template",

  // Authentication configuration
  auth: {
    // JWT configuration
    jwtSecret:
      process.env.JWT_SECRET ||
      "default-jwt-secret-key-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshSecret:
      process.env.REFRESH_SECRET ||
      "default-refresh-secret-key-change-in-production",
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "7d",

    // OAuth providers configuration
    enableGithub: process.env.ENABLE_GITHUB === "true",
    enableGoogle: process.env.ENABLE_GOOGLE === "true",
    enableFacebook: process.env.ENABLE_FACEBOOK === "true",

    // GitHub OAuth configuration
    githubOptions:
      process.env.GITHUB_CLIENT_ID && {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL:
          process.env.GITHUB_CALLBACK_URL ||
          "http://localhost:3000/api/v1/auth/github/callback",
      },

    // Google OAuth configuration
    googleOptions:
      process.env.GOOGLE_CLIENT_ID && {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/api/v1/auth/google/callback",
      },

    // Facebook OAuth configuration
    facebookOptions:
      process.env.FACEBOOK_CLIENT_ID && {
        clientID: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          "http://localhost:3000/api/v1/auth/facebook/callback",
      },

    // Email configuration for password reset
    emailOptions:
      process.env.EMAIL_HOST && {
        from: process.env.EMAIL_FROM || "noreply@example.com",
        host: process.env.EMAIL_HOST || "",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER || "",
          pass: process.env.EMAIL_PASS || "",
        },
      },
  },
};

export default config;
