import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Read the token from localStorage (or sessionStorage)
const token = localStorage.getItem('token');

const initialState = {
  isAuthenticated: !!token,
  token: token || null,
  user: null,
};

export const verifyToken = createAsyncThunk('auth/verifyToken', async (token, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://10.11.13.183:3000/api/users/authenticate', { token }); 
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Token verification failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;

      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});



export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
