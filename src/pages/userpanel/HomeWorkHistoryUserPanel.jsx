import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useGetHomeWorkStudyTracksHistoryUserPanelQuery,
  useGetSessionUserPanelQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const HomeWorkHistoryUserPanel = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { setValue, watch } = methods;

  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  const activeSession = sessionData?.find((item) => item.SessionAction === 1);

  const [SessionID, DateValue] = watch(['SessionID', 'DateValue']);

  // Convert to ISO string if DateValue is a Date object
  const dateString =
    DateValue instanceof Date ? DateValue.toISOString() : DateValue;
  const dateOnly = dateString ? dateString.split('T')[0] : null;

  const { data: homeWorkStudyTrackData = [] } =
    useGetHomeWorkStudyTracksHistoryUserPanelQuery(
      { SessionID, DateValue: dateOnly },
      { skip: !SessionID }
    );

  const homeWorkData = Array.isArray(homeWorkStudyTrackData)
    ? homeWorkStudyTrackData
    : homeWorkStudyTrackData?.data || [];

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  return (
    <FormProvider {...methods}>
      <div className="p-6 bg-gray-100 min-h-screen mb-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Homework History
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-6">
          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            defaultSelect={false}
            unicode
          />

          <DatePickerOne
            dateCalender={`${translate('Date')}`}
            placeholder={translate('Select Date')}
            registerKey={'DateValue'}
            require={'Date Require'}
          />
        </div>

        {/* Homework Cards */}
        {homeWorkData.length === 0 ? (
          <p className="text-gray-500">No homework found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homeWorkData.map((hw) => (
              <div
                key={hw.HSTID}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {hw.Subject?.SubjectName || 'Unknown Subject'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(hw.CreateAt).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Class: </span>
                  {hw.SubClass?.SubClass || 'Unknown Class'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Session: </span>
                  {hw.Session?.SessionName || 'Unknown Session'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Teacher: </span>
                  {hw.User?.UserName || 'Unknown'}
                </p>

                {/* Homework / ClassWork */}
                <div className="mt-3">
                  <h3 className="font-semibold text-gray-700 mb-1">Homework</h3>
                  {hw.HomeWork?.HomeWork ? (
                    <p className="text-gray-600">{hw.HomeWork.HomeWork}</p>
                  ) : (
                    <p className="text-gray-500 italic">No homework assigned</p>
                  )}

                  {hw.HomeWork?.ClassWork && (
                    <>
                      <h3 className="font-semibold text-gray-700 mt-2 mb-1">
                        Classwork
                      </h3>
                      <p className="text-gray-600">{hw.HomeWork.ClassWork}</p>
                    </>
                  )}
                </div>

                {/* Contact Info */}
                {/* <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Contact</h3>
                  {hw.User?.Mobile1 && (
                    <p className="text-gray-600">📱 {hw.User.Mobile1}</p>
                  )}
                  {hw.User?.Mobile2 && (
                    <p className="text-gray-600">📱 {hw.User.Mobile2}</p>
                  )}
                  {hw.User?.Email && (
                    <p className="text-gray-600">✉️ {hw.User.Email}</p>
                  )}
                </div> */}

                {/* Homework ID */}
                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    Homework ID: {hw.HSTID}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default HomeWorkHistoryUserPanel;
