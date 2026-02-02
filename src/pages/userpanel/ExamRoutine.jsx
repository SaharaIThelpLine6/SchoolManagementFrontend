import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
    useGetExamListUserPanelQuery,
    useGetExamRoutineViewQuery,
    useGetExamRulesUserPanelQuery,
    useGetSessionUserPanelQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const ExamRoutine = () => {
  const methods = useForm();
  const translate = useTranslate();

  const { handleSubmit, reset, watch, getValues, control, setValue } = methods;

  const sessionId = useWatch({ control, name: 'SessionID' });
  const examId = useWatch({ control, name: 'ExamID' });

  const { data: examRoutineData = [] } = useGetExamRoutineViewQuery(
    { sessionId, examId },
    { skip: !sessionId }
  );

  const { data: examListData = [] } = useGetExamListUserPanelQuery();
  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  const { data = [] } = useGetExamRulesUserPanelQuery();
  // console.log(data, 'data');

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  // console.log(examRoutineData, 'examRoutineData');

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {translate('Exam Routine')}
          </h1>
          {/* <p className="text-gray-600 mt-1">Fill in the student details below</p> */}
        </div>
        <div className="flex gap-3 mb-6">
          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            defaultSelect={false}
            unicode
          />
          <DefaultSelect
            label={translate('Exam')}
            nameField="ExamName"
            registerKey="ExamID"
            valueField="ExamID"
            options={examListData}
            defaultSelect={false}
            unicode
          />
        </div>
        <div className="overflow-x-auto">
          {examRoutineData.length > 0 ? (
            <>
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-sm font-semibold text-gray-700">
                    <th className="px-3 py-2 border rounded-l-lg text-center">
                      ক্রমিক
                    </th>
                    <th className="px-3 py-2 bg-[#BCDAF3] text-center">
                      বিষয়
                    </th>
                    <th className="px-3 py-2 bg-[#e3e1d3] text-center ">
                      তারিখ
                    </th>
                    <th className="px-3 py-2 bg-[#C6E5D0] text-center">বার</th>
                    <th className="px-3 py-2 bg-[#8D94CA] rounded-r-lg text-center">
                      সময়
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {examRoutineData?.map((item, index) => (
                    <tr
                      key={index}
                      className="text-sm font-medium text-gray-800"
                    >
                      <td className="px-1 py-1  rounded-l-lg text-center border">
                        {index + 1}
                      </td>
                      <td className="px-1 py-1 bg-[#BCDAF3] text-center">
                        {item.SubjectName}
                      </td>
                      <td className="px-1 py-1 bg-[#e6e0b6] text-center">
                        {bnBijoy2Unicode(item.ExamDate)}
                      </td>
                      <td className="px-1 py-1 bg-[#C6E5D0] text-center">
                        {item.ExamDay}
                      </td>
                      <td className="px-1 py-1 bg-[#8D94CA] rounded-r-lg text-center">
                        {item.StartTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No exam routine found.</p>
            </div>
          )}
        </div>

        {/* 📌 Mobile Only Exam Instructions */}
        <div className="block md:hidden mt-4 mb-20">
          <div className="bg-[#E9F1FF] border border-[#BFD4FF] rounded-2xl p-4 shadow-sm">
            {/* Title */}
            <h2 className="text-center text-[16px] font-bold text-sky-700 mb-3">
              পরীক্ষার নিয়মাবলি
            </h2>

            <ul className="space-y-3 text-[14px] leading-relaxed text-gray-800">
              {data.length > 0 ? (
                data.map((rule) => (
                  <li key={rule.ERID} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                    <span>{rule.ExamRule}</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500">
                  কোনো পরীক্ষার নিয়ম পাওয়া যায়নি
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default ExamRoutine;
