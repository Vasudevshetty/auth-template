import { Request, Response, NextFunction, Router } from "express";
import passport from "passport";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../errors/AuthError";
import { authenticateJwt, authorizeRoles } from "../middlewares/authMiddleware";
import { logError } from "../utils/logger";

export class AuthController {
  private router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.router = Router();
    this.authService = authService;
    this.setupRoutes();
  }

  /**
   * Get the Express router with all routes configured
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Configure all routes
   */
  private setupRoutes(): void {
    // Registration endpoint
    this.router.post("/register", this.register.bind(this));

    // Login endpoint
    this.router.post("/login", this.login.bind(this));

    // Token refresh endpoint
    this.router.post("/refresh-token", this.refreshToken.bind(this));

    // Get current user endpoint
    this.router.get("/me", authenticateJwt(this.authService), this.getCurrentUser.bind(this));

    // Password reset request endpoint
    this.router.post("/forgot-password", this.forgotPassword.bind(this));

    // Password reset with token endpoint
    this.router.post("/reset-password", this.resetPassword.bind(this));

    /**
     * GitHub OAuth login
     */
    this.router.get(
      "/github",
      passport.authenticate("github", { session: false })
    );

    /**
     * GitHub OAuth callback
     */
    this.router.get(
      "/github/callback",
      (req: Request, res: Response, next: NextFunction): void => {
        passport.authenticate("github", { session: false }, (err, data) => {
          if (err) {
            return next(err);
          }

          res.status(200).json({
            success: true,
            message: "GitHub login successful",
            data,
          });
        })(req, res, next);
      }
    );

    /**
     * Google OAuth login
     */
    this.router.get(
      "/google",
      passport.authenticate("google", { session: false })
    );

    /**
     * Google OAuth callback
     */
    this.router.get(
      "/google/callback",
      (req: Request, res: Response, next: NextFunction): void => {
        passport.authenticate("google", { session: false }, (err, data) => {
          if (err) {
            return next(err);
          }

          res.status(200).json({
            success: true,
            message: "Google login successful",
            data,
          });
        })(req, res, next);
      }
    );

    /**
     * Facebook OAuth login
     */
    this.router.get(
      "/facebook",
      passport.authenticate("facebook", { session: false })
    );

    /**
     * Facebook OAuth callback
     */
    this.router.get(
      "/facebook/callback",
      (req: Request, res: Response, next: NextFunction): void => {
        passport.authenticate("facebook", { session: false }, (err, data) => {
          if (err) {
            return next(err);
          }

          res.status(200).json({
            success: true,
            message: "Facebook login successful",
            data,
          });
        })(req, res, next);
      }
    );
  }

  /**
   * Register a new user
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Validate request
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await this.authService.register(email, password, name);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Login a user
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Validate request
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // The user is attached to the request by the authenticateJwt middleware
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Request a password reset
   */
  private async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate request
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      // Get the base URL for reset link from request
      const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password`;

      await this.authService.requestPasswordReset(email, resetUrl);

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link will be sent",
      });
    } catch (error) {
      logError("Password reset request error", error);
      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link will be sent",
      });
    }
  }

  /**
   * Reset password with token
   */
  private async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // Validate request
      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, res: Response): void {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    } else {
      logError("Unhandled error in AuthController", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
