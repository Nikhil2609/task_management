import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export interface AuthState {
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface GoogleAuthResponse {
  token: string;
}

interface UserState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: UserState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? "Login failed.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (
    {
      first_name,
      last_name,
      email,
      password,
    }: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.signup(
        first_name,
        last_name,
        email,
        password
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Registration failed."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message ?? "Logout failed.");
    }
  }
);

export const firebaseSocialLogin = createAsyncThunk(
  "auth/social-firebase-login",
  async (
    { token, screenName }: { token: string; screenName: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.firebaseLogin(token, screenName);
      return response.data.user;
    } catch (error) {
      console.error("Google login failed", error);
      return rejectWithValue(error);
    }
  }
);

export const googleAuth = createAsyncThunk(
  "auth/google",
  async ({ accessToken }: { accessToken: string }, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(accessToken);
      return response;
    } catch (err) {
      console.error("Google Auth Error", err);
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //Social Firebase Login
      .addCase(firebaseSocialLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(firebaseSocialLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.success = "Login successful.";
      })
      .addCase(firebaseSocialLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.success = null;
        state.error = (action.payload as string) || "Error while login.";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.token = null;
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { data, message, status } = action.payload;
        if (status === 200) {
          state.token = data.token;
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
          state.success = message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.token = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.success = null;
        state.error = (action.payload as string) || "Error while login.";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { data, message, status } = action.payload;
        if (status === 200) {
          state.token = data.token;
          state.loading = false;
          state.isAuthenticated = false;
          state.error = null;
          state.success = message;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.token = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.success = null;
        state.error = (action.payload as string) || "Error while registration.";
      })

      // Google Login
      .addCase(googleAuth.pending, (state) => {
        state.token = null;
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        const { data, message, status } = action.payload;
        if (status === 200) {
          state.token = data.token;
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
          state.success = message;
        }
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.token = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.success = null;
        state.error = (action.payload as string) || "Error while login.";
      })

      // Log out
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.success = "Logout successful.";
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.success = null;
        state.error = "Error while logging out.";
      });
  },
});

export const { clearAuthState } = authSlice.actions;

export default authSlice.reducer;
