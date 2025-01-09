import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import settings from '../features/settings/settingsSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    pagination: paginationReducer,
    settings: settings
  },
});

export default store;

