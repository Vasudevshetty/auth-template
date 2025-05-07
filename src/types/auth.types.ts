export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  role: string;
  provider?: AuthProvider;
  providerId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AuthProvider {
  LOCAL = "local",
  GITHUB = "github",
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  enableGithub?: boolean;
  enableGoogle?: boolean;
  enableFacebook?: boolean;
  githubOptions?: GithubOptions;
  googleOptions?: GoogleOptions;
  facebookOptions?: FacebookOptions;
  emailOptions?: {
    from: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface GithubOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface GoogleOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface FacebookOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface AuthResponse {
  user: Omit<User, "password" | "resetPasswordToken" | "resetPasswordExpires">;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export type AuthStorageAdapter = {
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByProviderId(
    provider: AuthProvider,
    providerId: string
  ): Promise<User | null>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | null>;
  findUserByResetToken?(token: string): Promise<User | null>;
};
