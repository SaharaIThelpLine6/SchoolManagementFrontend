import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useGetExamListUserPanelQuery,
  useGetExamRoutineViewQuery,
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
  const activeSession = sessionData?.find((item) => item.SessionAction === 1);

  console.log(examRoutineData, 'examRoutineData');

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
                        {item.ERID}
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
        <div className="md:hidden mt-4 mb-20">
          <div className="bg-[#E9F1FF] border border-[#BFD4FF] rounded-2xl p-4 shadow-sm">
            <ul className="space-y-3 text-[14px] leading-relaxed text-gray-800">
              <li className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                <span>
                  পরীক্ষার সময়সূচি: রুটিনে বর্ণিত সময় অনুযায়ী পরীক্ষা
                  অনুষ্ঠিত হবে।
                </span>
              </li>

              <li className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                <span>
                  সকল পরীক্ষার্থী পরীক্ষার হলে প্রবেশের সময় প্রবেশপত্র সাথে
                  রাখতে হবে। কোন শিক্ষার্থী পরীক্ষার হলে প্রবেশ করতে পারবে না
                  যদি সে প্রবেশপত্র অথবা প্রয়োজনীয় নথিপত্র সাথে না রাখে।
                </span>
              </li>

              <li className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                <span>
                  পরীক্ষার হলে মোবাইল ফোন, স্মার্ট ঘড়ি অথবা অন্য কোনো
                  ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণভাবে নিষিদ্ধ।
                </span>
              </li>

              <li className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                <span>
                  পরীক্ষার আগে যথাসময়ে পরীক্ষাকেন্দ্রে উপস্থিত থাকতে হবে।
                  দেরিতে উপস্থিত হলে পরীক্ষায় অংশগ্রহণের অনুমতি দেওয়া হবে না।
                </span>
              </li>

              <li className="flex gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0"></span>
                <span>
                  পরীক্ষার সময় কোনো প্রকার অসদুপায় অবলম্বন করলে পরীক্ষার্থীকে
                  পরীক্ষার হল থেকে বহিষ্কার করা হবে এবং প্রয়োজনীয় ব্যবস্থা
                  গ্রহণ করা হবে।
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default ExamRoutine;
