import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  User,
  AuthProvider,
  AuthResponse,
  AuthStorageAdapter,
  TokenPayload,
} from "../types/auth.types";
import { AuthError, TokenError } from "../errors/AuthError";
import { EmailService } from "./EmailService";
import { logError, logInfo } from "../utils/logger";

export class AuthService {
  private storageAdapter: AuthStorageAdapter;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshSecret: string;
  private refreshExpiresIn: string;
  private emailService?: EmailService;

  constructor(
    storageAdapter: AuthStorageAdapter,
    jwtSecret: string,
    jwtExpiresIn: string,
    refreshSecret: string,
    refreshExpiresIn: string,
    emailService?: EmailService
  ) {
    this.storageAdapter = storageAdapter;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.refreshSecret = refreshSecret;
    this.refreshExpiresIn = refreshExpiresIn;
    this.emailService = emailService;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.storageAdapter.findUserByEmail(email);
    if (existingUser) {
      throw new AuthError("User already exists", 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.storageAdapter.createUser({
      email,
      password: hashedPassword,
      name,
      role: "user",
      provider: AuthProvider.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Return user data and tokens
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await this.storageAdapter.findUserByEmail(email);
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Check if user has password (might be OAuth user)
    if (!user.password) {
      throw new AuthError(
        "Account exists with different login method",
        401
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Return user data and tokens
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Create or login OAuth user
   */
  async handleOAuthUser(
    email: string,
    name: string,
    provider: AuthProvider,
    providerId: string
  ): Promise<AuthResponse> {
    // Check if user exists by provider and providerId
    let user = await this.storageAdapter.findUserByProviderId(provider, providerId);

    if (!user) {
      // Check if user exists by email
      const existingUser = await this.storageAdapter.findUserByEmail(email);

      if (existingUser) {
        // Update existing user with provider info
        user = await this.storageAdapter.updateUser(existingUser.id, {
          provider,
          providerId,
          updatedAt: new Date(),
        });

        if (!user) {
          throw new AuthError("Failed to update user", 500);
        }
      } else {
        // Create new user
        user = await this.storageAdapter.createUser({
          email,
          name,
          role: "user",
          provider,
          providerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Return user data and tokens
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Validate JWT token
   */
  validateToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new TokenError();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as {
        userId: string;
      };

      // Find user
      const user = await this.storageAdapter.findUserById(decoded.userId);
      if (!user) {
        throw new AuthError("User not found", 401);
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Return user data and tokens
      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      throw new AuthError("Invalid refresh token", 401);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, resetUrl: string): Promise<boolean> {
    // Find user
    const user = await this.storageAdapter.findUserByEmail(email);
    if (!user) {
      // We don't want to reveal that the email doesn't exist
      return true;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set reset token and expiry (1 hour)
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with reset token and expiry
    await this.storageAdapter.updateUser(user.id, {
      resetPasswordToken,
      resetPasswordExpires,
      updatedAt: new Date(),
    });

    // Send password reset email if email service is available
    if (this.emailService) {
      const resetLink = `${resetUrl}?token=${resetToken}`;
      const result = await this.emailService.sendPasswordResetEmail(
        user.email,
        resetLink
      );
      return result;
    }

    logInfo(`Password reset requested for ${email} - no email service configured`);
    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = this.storageAdapter.findUserByResetToken
      ? await this.storageAdapter.findUserByResetToken(resetPasswordToken)
      : await this.findUserByResetToken(resetPasswordToken);

    if (!user) {
      throw new AuthError("Invalid or expired token", 400);
    }

    // Check if token is expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new AuthError("Reset token has expired", 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and clear reset token
    await this.storageAdapter.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      updatedAt: new Date(),
    });

    // Send password changed confirmation email if email service is available
    if (this.emailService) {
      await this.emailService.sendPasswordChangedEmail(user.email);
    }

    return true;
  }

  /**
   * Fallback method to find user by reset token if not implemented in storage adapter
   */
  private async findUserByResetToken(token: string): Promise<User | null> {
    try {
      // Get all users and filter manually (inefficient, should be implemented in storage adapter)
      const allUsers = [];
      for (const user of allUsers) {
        if (user.resetPasswordToken === token) {
          return user;
        }
      }
      return null;
    } catch (error) {
      logError("Error finding user by reset token", error);
      return null;
    }
  }

  /**
   * Generate auth tokens for a user
   */
  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    // Create access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(
    user: User
  ): Omit<
    User,
    "password" | "resetPasswordToken" | "resetPasswordExpires"
  > {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitizedUser } =
      user;
    return sanitizedUser;
  }
}
