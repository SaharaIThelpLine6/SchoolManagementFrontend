import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import settingsReducer from '../features/settings/settingsSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
import classReducer from '../features/class/classSlice';
import languageReducer from '../features/language/languageSlice';
import studentResultPublicViewReducer from '../features/studentResultPublicView/studentResultPublicViewSlice';
import requestHandelerReducer from '../features/requestHandeler/requestHandelerSlice';
import loadingReducer from '../features/loading/loadingSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    pagination: paginationReducer,
    settings: settingsReducer,
    userInfo: userInfoReducer,
    class: classReducer,
    language: languageReducer,
    studentResultPublicView: studentResultPublicViewReducer,
    requestHandeler: requestHandelerReducer,
    loading: loadingReducer,
  },
});

export default store;

