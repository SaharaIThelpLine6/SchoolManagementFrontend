import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Button from '../../components/Button/Button';

import {
  useGetTimeShiftingsQuery,
  useCreateTimeSettingMutation,
  useDeleteTimeSettingMutation,
  useGetTimeSettingsQuery
} from '../../features/attendance/attendanceSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import { useGetClassListQuery } from '../../features/class/classQuerySlice';
import { useGetUserTypesQuery } from '../../features/userType/userTypeSlice';
import { useGetResidentialQuery } from '../../features/settings/settingsQuerySlice';

const TimeSettingEntry = () => {
  const methods = useForm();
  const translate = useTranslate();

  const [editID, setEditID] = useState(null);
  const { handleSubmit, reset, setValue, watch } = methods;

  // State for time settings data
  const [timeSettingsState, setTimeSettingsState] = useState([]);

  const [ShiftID, UserTypeID, SessionID, ClassID, ResidentialID] = watch(["ShiftID", "UserTypeID", "SessionID", "ClassID", "ResidentialID"])

  // <----  UserType, Session, Class Query  ---> 
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const { data: userType = [] } = useGetUserTypesQuery();
  const { data: residentialData = [] } = useGetResidentialQuery();
  const { data: shiftLists = [] } = useGetTimeShiftingsQuery();

  const {
    data: timeSettingsData,
    isLoading: timeSettingsLoading,
    error,
  } = useGetTimeSettingsQuery(
    {
      UserTypeID,
      SessionID,
      ClassID,
      ResidentialID,
      ShiftID,
    },
    {
      skip:
        !UserTypeID ||
        !SessionID ||
        !ClassID ||
        !ShiftID ||
        (Number(UserTypeID) === 1 && !ResidentialID),
    }
  );

  // Update state when API data changes
  useEffect(() => {
    if (timeSettingsData?.dataList) {
      setTimeSettingsState(timeSettingsData.dataList);
    }
  }, [timeSettingsData]);

  console.log(timeSettingsData, "timeSettingsData - API Response");
  console.log(timeSettingsState, "timeSettingsState - Local State");

  // <----  Time Setting POST and DELETE Mutation  ---> 
  const [createTimeSetting, { isLoading: isCreating }] = useCreateTimeSettingMutation();
  // const [deleteTimeSetting, { isLoading: isDeleting }] = useDeleteTimeSettingMutation();

  const onSubmit = async () => {
    try {
      const payload = {
        settings: timeSettingsState.map((item) => ({
          UserID: item.UserID,
          ShiftID: item.ShiftID,
          SwitchID: item.SwitchID,
        })),
      };

      console.log(payload, "payload");

      const response = await createTimeSetting(payload).unwrap();

      toast.success(
        response?.message || translate("Time setting created successfully")
      );

      hideModal();
      reset();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.error ||
        err?.data?.message ||
        translate("Something went wrong")
      );
    }
  };

  const handleDelete = async (item) => {
    try {
      // Confirm before delete
      // if (!window.confirm(translate('Are you sure you want to delete this time setting?'))) {
      //   return;
      // }

      // Call API to delete
      // await deleteTimeSetting({
      //   UserID: item.UserID,
      //   ShiftID: item.ShiftID,
      //   SwitchID: item.SwitchID,
      //   CheckTypeID: item.CheckTypeID
      // }).unwrap();

      // Remove from state
      setTimeSettingsState(prev =>
        prev.filter(stateItem =>
          !(stateItem.UserID === item.UserID &&
            stateItem.ShiftID === item.ShiftID &&
            stateItem.SwitchID === item.SwitchID &&
            stateItem.CheckTypeID === item.CheckTypeID)
        )
      );

      toast.success(translate('Time setting deleted successfully'));
    } catch (error) {
      console.error(error);
      toast.error(
        error?.data?.error ||
        error?.data?.message ||
        translate('Something went wrong')
      );
    }
  };

  const handleReset = () => {
    reset();
    setEditID(null);
  };

  // Format time for display
  const formatDisplayTime = (timeString) => {
    if (!timeString) return '--:--';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="bg-white rounded-lg border p-5">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <DefaultSelect
              label={translate("User Type")}
              options={userType}
              valueField="ID"
              nameField="TypeName"
              registerKey="UserTypeID"
              placeholder={translate("Select User Type")}
            />
            <DefaultSelect
              label={translate("Session")}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Class")}
              options={classData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            <DefaultSelect
              label={translate("Residential")}
              options={residentialData ?? []}
              valueField="RDID"
              nameField="ResidentialName"
              registerKey="ResidentialID"
            />
            <DefaultSelect
              label={translate("শিফট নাম")}
              options={shiftLists?.data ?? []}
              valueField="ID"
              nameField="ShiftNameBangla"
              registerKey="ShiftID"
            />
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button
              type="submit"
              loading={isCreating}
              disabled={isCreating}
            >
              {editID ? translate('Update') : translate('Save')}
            </Button>

            <Button
              type="button"
              className="bg-gray-400 hover:bg-gray-500"
              onClick={handleReset}
            >
              {translate('Reset')}
            </Button>
          </div>
        </form>

        {/* ==================== Time Settings Table ==================== */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">
            <h3 className="text-lg font-semibold text-slate-700">
              {translate('Time Settings List')}
            </h3>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {timeSettingsState?.length || 0} {translate('Items')}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('অ্যাকশন')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('ইউজার কোড')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('ইউজার নাম')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('বাবার নাম')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শিফট নাম')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('টাইপ')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শুরুর সময়')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('লেট টাইম')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শেষ সময়')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {timeSettingsState?.length > 0 ? (
                  timeSettingsState.map((item, index) => (
                    <tr
                      key={`${item.UserID}-${item.ShiftID}-${item.SwitchID}-${item.CheckTypeID}`}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            // disabled={isDeleting}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={translate('Delete')}
                          >
                            <SvgIcon name="FaTrash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {item.UserCode}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.UserName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.FatherName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.ShiftNameBangla}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {item.TypeNameBangla}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDisplayTime(item.StartTime)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDisplayTime(item.StartLate)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDisplayTime(item.EndTime)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-slate-400"
                    >
                      {timeSettingsLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {translate('Loading...')}
                        </div>
                      ) : (
                        translate('No time settings found')
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default TimeSettingEntry;
// import { useEffect, useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { toast } from 'react-toastify';

// import Button from '../../components/Button/Button';
// import DefaultInput from '../../components/Forms/DefaultInput';

// import {
//   useCreateTimeShiftingMutation,
//   useGetTimeShiftingsQuery,
//   useUpdateTimeShiftingMutation,
//   useGetTimeShiftingByIdQuery,
//   useDeleteTimeShiftingMutation,
//   useGetTimeCheckTypesQuery,
//   useCreateTimeSwitchMutation,
//   useUpdateTimeSwitchMutation,
//   useDeleteTimeSwitchMutation,
//   useGetTimeSwitchesQuery,
//   useCreateTimeSettingMutation,
//   useDeleteTimeSettingMutation,
//   useGetTimeSettingsQuery
// } from '../../features/attendance/attendanceSlice';

// import { hideModal } from '../../utils/ModalControlar';
// import useTranslate from '../../utils/Translate';
// import SvgIcon from '../../components/icons/SvgIcon';
// import TimePicker from '../../components/Forms/DatePicker/TimePicker';
// import DefaultSelect from '../../components/Forms/DefaultSelect';
// import { attendanceFormatTime, formatTime } from '../../helper/formatTime';
// import { convertToTimeLocal } from '../../helper/formatTimeSlots';
// import { useGetSessionsQuery } from '../../features/session/sessionSlice';
// import { useGetClassListQuery } from '../../features/class/classQuerySlice';
// import { useGetUserTypesQuery } from '../../features/userType/userTypeSlice';
// import { useGetResidentialQuery } from '../../features/settings/settingsQuerySlice';

// const TimeSettingEntry = () => {
//   const methods = useForm();
//   const translate = useTranslate();

//   const [editID, setEditID] = useState(null);
//   const { handleSubmit, reset, setValue, watch } = methods;

//   const [ShiftID, UserTypeID, SessionID, ClassID, ResidentialID] = watch(["ShiftID", "UserTypeID", "SessionID", "ClassID", "ResidentialID"])

//   // <----  UserType, Session, Class Query  --->

//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: classData } = useGetClassListQuery();
//   const { data: userType = [] } = useGetUserTypesQuery();

//   const { data: residentialData = [] } = useGetResidentialQuery();
//   const { data: shiftLists = [] } = useGetTimeShiftingsQuery();

//   const {
//     data: timeSettingsData,
//     isLoading: timeSettingsLoading,
//     error,
//   } = useGetTimeSettingsQuery(
//     {
//       UserTypeID,
//       SessionID,
//       ClassID,
//       ResidentialID,
//       ShiftID,
//     },
//     {
//       skip:
//         !UserTypeID ||
//         !SessionID ||
//         !ClassID ||
//         !ShiftID ||
//         (Number(UserTypeID) === 1 && !ResidentialID),
//     }
//   );



//   console.log(timeSettingsData, "timeSettingsData")


//   // <----  Time Setting POST and DELETE Mutation  --->
//   const [createTimeSetting, { isLoading: isCreating }] =
//     useCreateTimeSettingMutation();












//   const onSubmit = async (data) => {
//     try {

//       await createTimeSetting(data).unwrap();
//       console.log(data, "data")
//       toast.success(translate('Switch created successfully'));

//       hideModal();
//       reset();
//     } catch (err) {
//       console.error(err);

//       toast.error(
//         err?.data?.error ||
//         err?.data?.message ||
//         translate('Something went wrong')
//       );
//     }
//   };

//   const handleDelete = async (ID) => {
//     try {

//       toast.success(translate('Switch deleted successfully'));
//     } catch (error) {
//       console.error(error);

//       toast.error(
//         error?.data?.error ||
//         error?.data?.message ||
//         translate('Something went wrong')
//       );
//     }
//   };
//   const handleReset = () => {
//     reset();
//     setEditID(null);
//   }

//   return (
//     <div className="bg-white rounded-lg border p-5">
//       <FormProvider {...methods}>
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//         >
//           <div
//             className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
//           >
//             <DefaultSelect
//               label={translate("User Type")}
//               options={userType}
//               valueField="ID"
//               nameField="TypeName"
//               registerKey="UserTypeID"
//               placeholder={translate("Select User Type")}
//             />
//             <DefaultSelect
//               label={translate("Session")}
//               options={sessionData ?? []}
//               valueField="SessionID"
//               nameField="SessionName"
//               registerKey="SessionID"
//             />
//             <DefaultSelect
//               label={translate("Class")}
//               options={classData ?? []}
//               valueField="ClassID"
//               nameField="ClassName"
//               registerKey="ClassID"
//             />
//             <DefaultSelect
//               label={translate("Residential")}
//               options={residentialData ?? []}
//               valueField="RDID"
//               nameField="ResidentialName"
//               registerKey="ResidentialID"
//             />
//             <DefaultSelect
//               label={translate("শিফট  নাম")}
//               options={shiftLists?.data ?? []}
//               valueField="ID"
//               nameField="ShiftNameBangla"
//               registerKey="ShiftID"
//             />
//           </div>

//           <div className="flex justify-end gap-3 mt-3">
//             <Button
//               type="submit"
//               loading={isCreating}
//               disabled={isCreating}
//             >
//               {editID ? translate('Update') : translate('Save')}
//             </Button>

//             <Button
//               type="button"
//               className="bg-gray-400  hover:bg-gray-500"
//               onClick={handleReset}
//             >
//               {translate('Reset')}
//             </Button>
//           </div>
//         </form>
//         {/* ==================== Shift List ==================== */}
//         <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">
//             <h3 className="text-lg font-semibold text-slate-700">
//               {translate('Shift List')}
//             </h3>

//             <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
//               {timeSettingsData?.dataList?.length || 0} {translate('Items')}
//             </span>
//           </div>

//           <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
//             <table className="min-w-full divide-y divide-slate-200">
//               <thead className="sticky top-0 z-10 bg-slate-100">
//                 <tr>
//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     অ্যাকশন
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     {translate('শিফট নাম')}
//                   </th>

//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     {translate('শিডিউল')}
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     {translate('ইউজার কোড')}
//                   </th>

//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     {translate('ইউজার নাম')}
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                     {translate('বাবার নাম')}
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100 bg-white">
//                 {timeSettingsData?.dataList?.length > 0 ? (
//                   timeSettingsData?.dataList.map((item, index) => (
//                     <tr
//                       key={index}
//                       className="transition hover:bg-slate-50"
//                     >
//                       <td className="px-4 py-3">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(item.UserID)}
//                             className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
//                           >
//                             <SvgIcon name="FaTrash" className="h-4 w-4 text-blue-100" />
//                           </button>
//                         </div>
//                       </td>

//                       <td className="px-4 py-3 text-slate-600">
//                         {item.ShiftNameBangla}
//                       </td>
//                       <td className="px-4 py-3 font-medium text-slate-700">
//                         {attendanceFormatTime(item.TypeNameBangla)}
//                       </td>

//                       <td className="px-4 py-3 text-slate-600">
//                         {attendanceFormatTime(item.UserCode)}
//                       </td>
//                       <td className="px-4 py-3 text-slate-600">
//                         {attendanceFormatTime(item.UserName)}
//                       </td>
//                       <td className="px-4 py-3 text-slate-600">
//                         {attendanceFormatTime(item.FatherName)}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="py-10 text-center text-slate-400"
//                     >
//                       {translate('No shift found')}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </FormProvider>
//     </div>
//   );
// };

// export default TimeSettingEntry;