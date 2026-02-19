import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { classSlice } from "../features/class/classQuerySlice";
import classReducer from "../features/class/classSlice";
import { dashboardSlice } from "../features/dashboard/dashboardQuerySlice";
import { examSlice } from "../features/exam/examQuerySlice";
import { feeCollectionSlice } from "../features/feeCollection/feeCollectionSlice";
import { helpQuerySlice } from "../features/help/helpQuerySlice";
import languageReducer from "../features/language/languageSlice";
import modalReducer from "../features/modal/modalSlice";
import { monthSlice } from "../features/month/monthSlice";
import { monthListSlice } from "../features/months/montListSlice";
import { onlineAdmissionSlice } from "../features/onlineAdmission/onlineAdmissionSlice";
import paginationReducer from "../features/pagination/paginationSlice";
import { paymentSlice } from "../features/payment/paymentSlice";
import { permissionSlice } from "../features/permission/permissionSlice";
import requestHandelerReducer from "../features/requestHandeler/requestHandelerSlice";
import { resultSilce } from "../features/result/resultSilce";
import { sessionSlice } from "../features/session/sessionSlice";
import { settingsSlice } from "../features/settings/settingsQuerySlice";
import settingsReducer from "../features/settings/settingsSlice";
import sidebarReducer from "../features/sidebar/sideBarSlice";
import smsReducersSlice from "../features/sms/smsReducersSlice";
import { smsSlice } from "../features/sms/smsSlice";
import { userStudentSlice } from "../features/student/studentQuerySlice";
import studentReducer from "../features/student/studentSlice";
import studentResultPublicViewReducer from "../features/studentResultPublicView/studentResultPublicViewSlice";
import { talimatQuerySlice } from "../features/talimat/talimatQuerySlice";
import { teachersSlice } from "../features/teachers/teachersSlice";
import { userInfoSlice } from "../features/userInfo/userInfoQuerySlice";
import userInfoReducer from "../features/userInfo/userInfoSlice";
import { panelNotificationQuerySlice } from "../features/userPanel/panelNotification/panelNotificationQuerySlice";
import sessionChangeReducer from "../features/userPanel/sessionChange/sessionChangeSlice";
import { studentPaymentSlice } from "../features/userPanel/studentPayment/studentPaymentSlice";
import { userPanelUserInfo } from "../features/userPanel/userInfo/userInfoQuerySlice";
import { userPanelVerifyUser } from "../features/userPanel/userLoginVerify/userloginVerifyQuerySlice";
import { userPanelRegistrationUser } from "../features/userPanel/userRegistration/userRegistrationQuerySlice";
import { userReportsSlice } from "../features/userReports/userReportsSlice";
import { userTypeSlice } from "../features/userType/userTypeSlice";
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
    smsSuccessError: smsReducersSlice,
    sessionChange: sessionChangeReducer,
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
    [permissionSlice.reducerPath]: permissionSlice.reducer,
    [userTypeSlice.reducerPath]: userTypeSlice.reducer,
    [resultSilce.reducerPath]: resultSilce.reducer,
    [examSlice.reducerPath]: examSlice.reducer,
    [userInfoSlice.reducerPath]: userInfoSlice.reducer,
    [userPanelRegistrationUser.reducerPath]: userPanelRegistrationUser.reducer,
    [userPanelVerifyUser.reducerPath]: userPanelVerifyUser.reducer,
    [userPanelUserInfo.reducerPath]: userPanelUserInfo.reducer,
    [studentPaymentSlice.reducerPath]: studentPaymentSlice.reducer,
    [panelNotificationQuerySlice.reducerPath]:
      panelNotificationQuerySlice.reducer,
    [talimatQuerySlice.reducerPath]: talimatQuerySlice.reducer,
    [helpQuerySlice.reducerPath]: helpQuerySlice.reducer,
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
      .concat(permissionSlice.middleware)
      .concat(sessionSlice.middleware)
      .concat(resultSilce.middleware)
      .concat(examSlice.middleware)
      .concat(userInfoSlice.middleware)
      .concat(userPanelRegistrationUser.middleware)
      .concat(userPanelUserInfo.middleware)
      .concat(studentPaymentSlice.middleware)
      .concat(userPanelVerifyUser.middleware)
      .concat(panelNotificationQuerySlice.middleware)
      .concat(talimatQuerySlice.middleware)
      .concat(helpQuerySlice.middleware),
});

export default store;
