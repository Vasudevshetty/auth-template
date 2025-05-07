import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

import { AuthOptions, AuthProvider } from "../types/auth.types";
import { AuthService } from "../services/AuthService";
import { AuthStorageAdapter } from "../types/auth.types";

export class PassportConfig {
  private authService: AuthService;
  private options: AuthOptions;
  private storageAdapter: AuthStorageAdapter;

  constructor(
    authService: AuthService,
    storageAdapter: AuthStorageAdapter,
    options: AuthOptions
  ) {
    this.authService = authService;
    this.options = options;
    this.storageAdapter = storageAdapter;
  }

  /**
   * Initialize and configure all enabled authentication strategies
   */
  initialize(): void {
    // Configure JWT Strategy
    this.configureJwtStrategy();

    // Configure OAuth strategies if enabled
    if (this.options.enableGithub && this.options.githubOptions) {
      this.configureGithubStrategy();
    }

    if (this.options.enableGoogle && this.options.googleOptions) {
      this.configureGoogleStrategy();
    }

    if (this.options.enableFacebook && this.options.facebookOptions) {
      this.configureFacebookStrategy();
    }
  }

  /**
   * Configure JWT Strategy
   */
  private configureJwtStrategy(): void {
    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.options.jwtSecret,
    };

    passport.use(
      new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
          const user = await this.storageAdapter.findUserById(payload.userId);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      })
    );
  }

  /**
   * Configure GitHub OAuth Strategy
   */
  private configureGithubStrategy(): void {
    if (!this.options.githubOptions) return;

    passport.use(
      new GitHubStrategy(
        {
          clientID: this.options.githubOptions.clientID,
          clientSecret: this.options.githubOptions.clientSecret,
          callbackURL: this.options.githubOptions.callbackURL,
          scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const authResponse = await this.authService.handleOAuthUser(
              profile.emails[0].value,
              profile.displayName || profile.username,
              AuthProvider.GITHUB,
              profile.id
            );
            return done(null, authResponse);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  /**
   * Configure Google OAuth Strategy
   */
  private configureGoogleStrategy(): void {
    if (!this.options.googleOptions) return;

    passport.use(
      new GoogleStrategy(
        {
          clientID: this.options.googleOptions.clientID,
          clientSecret: this.options.googleOptions.clientSecret,
          callbackURL: this.options.googleOptions.callbackURL,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const authResponse = await this.authService.handleOAuthUser(
              profile.emails[0].value,
              profile.displayName,
              AuthProvider.GOOGLE,
              profile.id
            );
            return done(null, authResponse);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  /**
   * Configure Facebook OAuth Strategy
   */
  private configureFacebookStrategy(): void {
    if (!this.options.facebookOptions) return;

    passport.use(
      new FacebookStrategy(
        {
          clientID: this.options.facebookOptions.clientID,
          clientSecret: this.options.facebookOptions.clientSecret,
          callbackURL: this.options.facebookOptions.callbackURL,
          profileFields: ["id", "emails", "name"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const authResponse = await this.authService.handleOAuthUser(
              profile.emails[0].value,
              profile.displayName,
              AuthProvider.FACEBOOK,
              profile.id
            );
            return done(null, authResponse);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }
}
