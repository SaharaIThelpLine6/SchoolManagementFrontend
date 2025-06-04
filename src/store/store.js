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
import { paymentSlice } from '../features/payment/paymentSlice';
import { userStudentSlice } from '../features/student/studentQuerySlice';
import { monthSlice } from '../features/month/monthSlice';
import { settingsSlice } from '../features/settings/settingsQuerySlice';
import { dashboardSlice } from '../features/dashboard/dashboardQuerySlice';
import { monthListSlice } from '../features/months/montListSlice';
import { userReportsSlice } from '../features/userReports/userReportsSlice';
import { sessionSlice } from '../features/session/sessionSlice';
import { classSlice } from '../features/class/classQuerySlice';
import { userTypeSlice } from '../features/userType/userTypeSlice';
import { smsSlice } from '../features/sms/smsSlice';
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
    [paymentSlice.reducerPath]: paymentSlice.reducer,
    [userStudentSlice.reducerPath]: userStudentSlice.reducer,
    [monthSlice.reducerPath]: monthSlice.reducer,
    [monthListSlice.reducerPath]: monthListSlice.reducer,
    [settingsSlice.reducerPath]: settingsSlice.reducer,
    [dashboardSlice.reducerPath]: dashboardSlice.reducer,
    [userReportsSlice.reducerPath]: userReportsSlice.reducer,
    [sessionSlice.reducerPath]: sessionSlice.reducer,
    [classSlice.reducerPath]: classSlice.reducer,
    [smsSlice.reducerPath]: smsSlice.reducer,
    [userTypeSlice.reducerPath]: userTypeSlice.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(feeCollectionSlice.middleware)
      .concat(userStudentSlice.middleware)
      .concat(onlineAdmissionSlice.middleware)
      .concat(teachersSlice.middleware)
      .concat(paymentSlice.middleware)
      .concat(monthSlice.middleware)
      .concat(monthListSlice.middleware)
      .concat(settingsSlice.middleware)
      .concat(dashboardSlice.middleware)
      .concat(userReportsSlice.middleware)
      .concat(classSlice.middleware)
      .concat(userTypeSlice.middleware)
      .concat(smsSlice.middleware)
      .concat(sessionSlice.middleware),
});

export default store;

