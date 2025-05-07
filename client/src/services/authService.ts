import api from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
  };
}

const BASE_URL = "http://localhost:3000/api/v1";

const authService = {
  // Login user using cookies
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Register a new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Get current user information
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Request password reset email
  async forgotPassword(email: string): Promise<AuthResponse> {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  // Logout user (clear cookies server-side)
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  // Get OAuth authentication URLs
  getOAuthUrl(provider: "google" | "github" | "facebook"): string {
    return `${BASE_URL}/auth/${provider}`;
  },

  // Handle OAuth callback (useful if callback returns data)
  async handleOAuthCallback(
    provider: string,
    code: string
  ): Promise<AuthResponse> {
    const response = await api.get(`/auth/${provider}/callback?code=${code}`);
    return response.data;
  },

  // Check if the current URL is an OAuth callback URL
  isOAuthCallback(): { isCallback: boolean; provider?: string; code?: string } {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      return { isCallback: false };
    }

    // Check URL patterns for different OAuth providers
    if (url.pathname.includes("/github/callback")) {
      return { isCallback: true, provider: "github", code };
    } else if (url.pathname.includes("/google/callback")) {
      return { isCallback: true, provider: "google", code };
    } else if (url.pathname.includes("/facebook/callback")) {
      return { isCallback: true, provider: "facebook", code };
    }

    return { isCallback: false };
  },
};

export default authService;
