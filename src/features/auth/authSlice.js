import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { verifyToken } from '../../utils/read/api';

// Read the token from localStorage (or sessionStorage)
const token = localStorage.getItem('token');

const initialState = {
  isAuthenticated: !!token,
  pageName: "Home",
  token: token || null,
  user: null,
  status: 'idle',
  error: null,
  quickBar: {
    visible: true,
    items: [],
  },
};

export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async (token, { rejectWithValue }) => {
    try {
      const user = await verifyToken(token);
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
    setPageName: (state, action)=>{
      state.pageName = action.payload
    },
    setQuickBarVisibility: (state, action) => {
      state.quickBar.visible = action.payload;
    },
    setQuickBarItems: (state, action) => {
      state.quickBar.items = Array.isArray(action.payload) ? action.payload : [];
    },
    setQuickBarConfig: (state, action) => {
      const { visible, items } = action.payload || {};

      if (typeof visible === 'boolean') {
        state.quickBar.visible = visible;
      }

      if (Array.isArray(items)) {
        state.quickBar.items = items;
      }
    },
    resetQuickBarConfig: (state) => {
      state.quickBar.visible = true;
      state.quickBar.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const {
  login,
  logout,
  setPageName,
  setQuickBarVisibility,
  setQuickBarItems,
  setQuickBarConfig,
  resetQuickBarConfig,
} = authSlice.actions;
export default authSlice.reducer;
