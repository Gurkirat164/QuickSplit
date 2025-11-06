import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { dummyUser } from '../../data/dummyData';

// Temporary flag - set to false when API is ready
const USE_DUMMY_DATA = true;

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simple validation for demo
            if (credentials.email && credentials.password) {
              resolve({
                user: dummyUser,
                token: 'dummy_token_' + Date.now(),
              });
            } else {
              reject('Invalid credentials');
            }
          }, 500);
        });
      }
      
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (userData.email && userData.password && userData.name) {
              const newUser = {
                _id: `user_${Date.now()}`,
                name: userData.name,
                email: userData.email,
                username: userData.email.split('@')[0],
              };
              resolve({
                user: newUser,
                token: 'dummy_token_' + Date.now(),
              });
            } else {
              reject('Registration failed - missing required fields');
            }
          }, 500);
        });
      }
      
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Use dummy data if flag is enabled
      if (USE_DUMMY_DATA) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(dummyUser);
          }, 300);
        });
      }
      
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: USE_DUMMY_DATA ? dummyUser : null,
    token: localStorage.getItem('token'),
    isAuthenticated: USE_DUMMY_DATA ? true : false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
