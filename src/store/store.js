import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import settingsReducer from '../features/settings/settingsSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    pagination: paginationReducer,
    settings: settingsReducer,
    userInfo: userInfoReducer
  },
});

export default store;

