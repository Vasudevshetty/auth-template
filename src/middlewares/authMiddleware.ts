import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors/AuthError";
import { AuthService } from "../services/AuthService";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJwt = (authService: AuthService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("No token provided");
      }

      const token = authHeader.split(" ")[1];

      // Validate token
      const payload = authService.validateToken(token);

      // Set user and token on request object
      req.user = payload;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to authorize by user role
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    next();
  };
};
