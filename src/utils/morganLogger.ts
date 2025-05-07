import morgan from "morgan";
import morganBody from "morgan-body";
import { Express } from "express";
import { logInfo } from "./logger";

// Create a stream that writes to our Winston logger
const stream = {
  write: (message: string) => {
    // Remove newline character from morgan output
    const trimmedMessage = message.trim();
    logInfo(trimmedMessage);
  },
};

/**
 * Setup Morgan logger for HTTP request logging
 * @param app Express application
 */
export function setupMorganLogger(app: Express): void {
  // Standard Morgan logging for basic request information
  app.use(morgan("dev", { stream })); // For development

  // For production environment, use a more concise format
  if (process.env.NODE_ENV === "production") {
    app.use(
      morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
        { stream }
      )
    );
  }

  // Setup morgan-body to log request and response bodies
  morganBody(app, {
    noColors: process.env.NODE_ENV === "production",
    stream: stream,
    skip: (req, res) => {
      // Skip logging bodies for certain routes (like static files, if you have them)
      return req.url.includes("/api-docs") || req.url.includes("/public");
    },
    maxBodyLength: 1000, // Limit the size of logged request bodies
  });
}
