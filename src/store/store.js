import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import paginationReducer from '../features/pagination/paginationSlice';
import settingsReducer from '../features/settings/settingsSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
import classReducer from '../features/class/classSlice';
import languageReducer from '../features/language/languageSlice';
import studentResultPublicViewReducer from '../features/studentResultPublicView/studentResultPublicViewSlice';
import requestHandelerReducer from '../features/requestHandeler/requestHandelerSlice';
import studentReducer from '../features/student/studentSlice';
import modalReducer from '../features/modal/modalSlice';
import sidebarReducer from '../features/sidebar/sideBarSlice';
import { feeCollectionSlice } from '../features/feeCollection/feeCollectionSlice';
import { onlineAdmissionSlice } from '../features/onlineAdmission/onlineAdmissionSlice';
import { teachersSlice } from '../features/teachers/teachersSlice';
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
    student: studentReducer,
    modal: modalReducer,
    sideBar: sidebarReducer,
    [feeCollectionSlice.reducerPath]: feeCollectionSlice.reducer,
    [onlineAdmissionSlice.reducerPath]: onlineAdmissionSlice.reducer,
    [teachersSlice.reducerPath]: teachersSlice.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(feeCollectionSlice.middleware)
      .concat(onlineAdmissionSlice.middleware)
      .concat(teachersSlice.middleware),
});

export default store;

