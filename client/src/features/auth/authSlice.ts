import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Define user type
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Define auth state type
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false, // We'll check this via a getCurrentUser call
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        // User data is in response but authentication is handled by cookies
        return response.data.user;
      }

      return thunkAPI.rejectWithValue("Login failed");
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await authService.register({ name, email, password });

      if (response.success && response.data) {
        // User data is in response but authentication is handled by cookies
        return response.data.user;
      }

      return thunkAPI.rejectWithValue("Registration failed");
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data) {
        return response.data.user;
      }

      return thunkAPI.rejectWithValue("Failed to get user data");
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const response = await authService.forgotPassword(email);
      return (
        response.message ||
        "If the email exists, a password reset link will be sent"
      );
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, newPassword }: { token: string; newPassword: string },
    thunkAPI
  ) => {
    try {
      const response = await authService.resetPassword({ token, newPassword });
      return response.message || "Password has been reset successfully";
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await authService.logout();
    return null;
  } catch (error: any) {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

// Create the auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload as string;
        state.user = null;
      })

      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(
        getCurrentUser.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = false; // Don't show error, just consider not authenticated
        state.isAuthenticated = false;
        state.message = "";
        state.user = null;
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload as string;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload as string;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
