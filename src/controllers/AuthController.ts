import {
  Request,
  Response,
  NextFunction,
  Router,
  CookieOptions,
} from "express";
import passport from "passport";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../errors/AuthError";
import { authenticateJwt, authorizeRoles } from "../middlewares/authMiddleware";
import { logError } from "../utils/logger";

export class AuthController {
  private router: Router;
  private authService: AuthService;
  private cookieOptions: CookieOptions;

  constructor(authService: AuthService) {
    this.router = Router();
    this.authService = authService;

    // Setup secure cookie options
    this.cookieOptions = {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

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

    // Logout endpoint
    this.router.post("/logout", this.logout.bind(this));

    // Get current user endpoint
    this.router.get(
      "/me",
      authenticateJwt(this.authService),
      this.getCurrentUser.bind(this)
    );

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

          if (data && data.tokens) {
            const { accessToken, refreshToken } = data.tokens;
            this.setAuthCookies(res, accessToken, refreshToken);
          }

          res.status(200).json({
            success: true,
            message: "GitHub login successful",
            data: { user: data.user },
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

          if (data && data.tokens) {
            const { accessToken, refreshToken } = data.tokens;
            this.setAuthCookies(res, accessToken, refreshToken);
          }

          res.status(200).json({
            success: true,
            message: "Google login successful",
            data: { user: data.user },
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

          if (data && data.tokens) {
            const { accessToken, refreshToken } = data.tokens;
            this.setAuthCookies(res, accessToken, refreshToken);
          }

          res.status(200).json({
            success: true,
            message: "Facebook login successful",
            data: { user: data.user },
          });
        })(req, res, next);
      }
    );
  }

  /**
   * Helper method to set auth cookies
   */
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie("accessToken", accessToken, this.cookieOptions);
    res.cookie("refreshToken", refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    });
  }

  /**
   * Helper method to clear auth cookies
   */
  private clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
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

      // Set auth cookies
      this.setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      res.status(201).json({
        success: true,
        data: { user: result.user },
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

      // Set auth cookies
      this.setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      res.status(200).json({
        success: true,
        data: { user: result.user },
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
      // Get token from cookie or body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      // Validate request
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      // Set new auth cookies
      this.setAuthCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      res.status(200).json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Logout a user
   */
  private logout(req: Request, res: Response): void {
    try {
      // Clear auth cookies
      this.clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
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
