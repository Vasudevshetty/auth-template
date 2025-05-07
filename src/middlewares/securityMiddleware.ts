import { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import xssClean from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { logWarn } from '../utils/logger';

/**
 * Configure security middleware for the application
 */
export const setupSecurityMiddleware = (app: Application): void => {
  // Set security HTTP headers
  app.use(helmet());

  // Data sanitization against XSS attacks
  app.use(xssClean());

  // Set rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      logWarn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).json({
        success: false,
        message: options.message,
      });
    },
  });

  // Apply rate limiting to authentication routes
  app.use('/auth', limiter);

  // Set response headers for better security
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent browsers from MIME-sniffing a response away from the declared content-type
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Strict-Transport-Security enforces secure (HTTP over SSL/TLS) connections to the server
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    
    next();
  });
};