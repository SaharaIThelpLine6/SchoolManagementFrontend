import axios from 'axios';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Keyword from '../components/Keywords/Keywords';
const API_URL = import.meta.env.VITE_SERVER_URL;
const Query = () => {
  const methods = useForm({
    defaultValues: {
      DB_HOST: '10.11.13.161',
      DB_USER: 'TestClass',
      DB_PASSWORD: 'TestClass',
      DB_NAME: 'QMMSoftV10',
      fields: [
        {
          TABLE_NAME: 'Academic_Class',
          UNIQUE_ID: 'ClassID',
          COLUMN_tags: 'ClassName',
        },
        {
          TABLE_NAME: 'Academic_ClassGroup',
          UNIQUE_ID: 'SubClassID',
          COLUMN_tags: 'SubClass',
        },
        {
          TABLE_NAME: 'Academic_Session',
          UNIQUE_ID: 'SessionID',
          COLUMN_tags: 'SessionName',
        },
        {
          TABLE_NAME: 'Academic_Subject',
          UNIQUE_ID: 'SubjectID',
          COLUMN_tags: 'SubjectName',
        },
        {
          TABLE_NAME: 'Acc_BankInfo',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'AccountNumber, Address',
        },
        {
          TABLE_NAME: 'Acc_BankTransaction',
          UNIQUE_ID: 'SL',
          COLUMN_tags: 'Particulars',
        },
        {
          TABLE_NAME: 'Acc_ChartOfaccount',
          UNIQUE_ID: 'CAID',
          COLUMN_tags: 'ChartOfAcName',
        },
        {
          TABLE_NAME: 'Acc_Fund',
          UNIQUE_ID: 'FundID',
          COLUMN_tags: 'FundName',
        },
        {
          TABLE_NAME: 'Acc_GeneralLedger',
          UNIQUE_ID: 'SL',
          COLUMN_tags: 'GlName',
        },
        {
          TABLE_NAME: 'Acc_MonthDueList',
          UNIQUE_ID: 'AdmissionID',
          COLUMN_tags: 'MonthRange, FeeName',
        },
        {
          TABLE_NAME: 'Acc_StudentFeeSetting',
          UNIQUE_ID: 'SFSID',
          COLUMN_tags: 'Comment',
        },
        {
          TABLE_NAME: 'Acc_StuFeeCollector',
          UNIQUE_ID: 'AdmissionID',
          COLUMN_tags: 'SlName',
        },
        {
          TABLE_NAME: 'Acc_SubsidiaryLedger',
          UNIQUE_ID: 'SL',
          COLUMN_tags: 'SlName',
        },
        {
          TABLE_NAME: 'Acc_TransactionDetails',
          UNIQUE_ID: 'SL',
          COLUMN_tags: 'Particulars',
        },
        {
          TABLE_NAME: 'Acc_TransactionOrder',
          UNIQUE_ID: 'SL',
          COLUMN_tags: 'TransactionBanglaDate, InWord',
        },
        {
          TABLE_NAME: 'BoardCenterAndFeeSetting',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'ClassName',
        },
        {
          TABLE_NAME: 'BoardExamCenter',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'BoardCenterName',
        },
        {
          TABLE_NAME: 'BoardExamName',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'ExamName',
        },
        {
          TABLE_NAME: 'BoardInfo',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'BoardName, Tital',
        },
        {
          TABLE_NAME: 'EditDelete_Record',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'FeeName, GLedger, ChartOfAccount, Comment',
        },
        {
          TABLE_NAME: 'Exam_Condition',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'GorDivision, IfNotEqul, AbsenceName',
        },
        {
          TABLE_NAME: 'Exam_ConditionAverage',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'Subject1, Subject2, Subject3, Subject4, Subject5, Subject6, Subject7, Subject8, Subject9, Subject10, Subject11, Subject12, Subject13, Division1, Division2, Division3, Division4, Division5, Division6',
        },
        {
          TABLE_NAME: 'Exam_Name',
          UNIQUE_ID: 'ExamID',
          COLUMN_tags: 'ExamName',
        },
        {
          TABLE_NAME: 'Exam_SubjectPassNumber',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'SubjectBan',
        },
        {
          TABLE_NAME: 'Exam_TalentCondition',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Division',
        },
        {
          TABLE_NAME: 'Institution_Information',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'InstitutionName, Address, ContactNumber, PrincipalName, NajemName, AccountantName, Village, PostOffice, PoliceStation, District, Elhaq',
        },
        {
          TABLE_NAME: 'LabelName',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'StudentIDLabel, ClassNameLabel, AdmissionIDLabel, SubClassNameLabel',
        },

        { TABLE_NAME: 'Monthtbl', UNIQUE_ID: 'ID', COLUMN_tags: 'MonthName' },
        {
          TABLE_NAME: 'MonthtblLand',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'Month1, Month2, Month3, Month4, Month5, Month6, Month7, Month8, Month9, Month10, Month11, Month12',
        },
        {
          TABLE_NAME: 'ReportSettings',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Value1, Value2, Value3',
        },
        {
          TABLE_NAME: 'Student_QuotaHistory',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'StudentName',
        },
        {
          TABLE_NAME: 'Student_Report_All',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Remark',
        },
        {
          TABLE_NAME: 'Student_ReportCet',
          UNIQUE_ID: 'ReportCetID',
          COLUMN_tags: 'ReportCetName',
        },
        {
          TABLE_NAME: 'Student_Rports',
          UNIQUE_ID: 'SRID',
          COLUMN_tags: 'Remark',
        },
        {
          TABLE_NAME: 'Student_TransferCertificate',
          UNIQUE_ID: 'CFID',
          COLUMN_tags: 'DivisionName',
        },
        {
          TABLE_NAME: 'Student_Vacation',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Comment',
        },
        {
          TABLE_NAME: 'Student_VacationType',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'VacationList',
        },
        {
          TABLE_NAME: 'Teacher_AllTransaction',
          UNIQUE_ID: 'TTID',
          COLUMN_tags: 'Particulars',
        },
        {
          TABLE_NAME: 'Teacher_Designation',
          UNIQUE_ID: 'DNID',
          COLUMN_tags: 'Designation',
        },
        {
          TABLE_NAME: 'Teacher_FinancialYear',
          UNIQUE_ID: 'FYID',
          COLUMN_tags: 'FinancialName',
        },
        {
          TABLE_NAME: 'Teacher_Info',
          UNIQUE_ID: 'TIID',
          COLUMN_tags:
            'Qualification, Experience, ExamBoardName, ResultDevision, PasstedDate',
        },
        {
          TABLE_NAME: 'Teacher_MonthName',
          UNIQUE_ID: 'MonthID',
          COLUMN_tags: 'MontheName',
        },
        {
          TABLE_NAME: 'Teacher_PayNameList',
          UNIQUE_ID: 'PRID',
          COLUMN_tags: 'RollName',
        },
        {
          TABLE_NAME: 'Teacher_PayRollAndLableName',
          UNIQUE_ID: 'PRLNID',
          COLUMN_tags: 'PayRollName',
        },
        {
          TABLE_NAME: 'User_Info',
          UNIQUE_ID: 'UserID',
          COLUMN_tags:
            'UserName, FatherName, MotherName, permanentVill, permanentPost, TransientVill, TransientPost',
        },
        {
          TABLE_NAME: 'Student_Result',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Division',
        },
        {
          TABLE_NAME: 'Acc_UserTransaction',
          UNIQUE_ID: 'UTID',
          COLUMN_tags: 'Particulars',
        },
        {
          TABLE_NAME: 'Acc_UserFeeOrderDetails',
          UNIQUE_ID: 'UFODID',
          COLUMN_tags: 'Particulars',
        },
        {
          TABLE_NAME: 'Donor_Renew',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'Comment',
        },
        {
          TABLE_NAME: 'Exam_RoutineLand',
          UNIQUE_ID: 'ERIDL',
          COLUMN_tags:
            'Day1, Day2, Day3, Day4, Day5, Day6, Day7, Day8, Day9, Day10, Day11, Day12, Day13, Day14, Time1, Time2, Time3, Time4, Time5, Time6, Time7, Time8, Time9, Time10, Time11, Time12, Time13, Time14',
        },
        {
          TABLE_NAME: 'Acc_UserDrCrType',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'UserPayment',
        },
        {
          TABLE_NAME: 'Acc_UserDrCrProduct',
          UNIQUE_ID: 'ID',
          COLUMN_tags: 'ProductName',
        },
        {
          TABLE_NAME: 'Exam_Condition',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'MeariDivision, MeariRasibDivision, MostMeariBanDivision',
        },
        {
          TABLE_NAME: 'ExamSubjectAndPassNumber',
          UNIQUE_ID: 'SL',
          COLUMN_tags:
            'Subject1, Subject2, Subject3, Subject4, Subject5, Subject6, Subject7, Subject8, Subject9, Subject10, Subject11, Subject12, Subject13, Subject14',
        },
      ],
    },
  });
  const token = useSelector((state) => state.auth.token);

  const { control, handleSubmit, register } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });
  const onSubmit = async (data) => {
    const id = toast.loading('Please wait...');

    let headersList = {
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let bodyContent = JSON.stringify({
      ...data,
    });

    let reqOptions = {
      url: `${API_URL}/api/users/unicode_converter`,
      method: 'POST',
      headers: headersList,
      data: bodyContent,
    };

    try {
      let response = await axios.request(reqOptions);
      console.log(response.data);
      if (response.data) {
        toast.update(id, {
          render: 'Unicode Converted Successfully',
          type: 'success',
          isLoading: false,
        });
      }
    } catch (err) {
      toast.update(id, {
        render: err.message,
        type: 'error',
        isLoading: false,
      });
      console.error(err);
    }
  };
  return (
    <div>
      <div className="border border-blue-400 p-3 mt-10 mx-auto px-[200px]">
        <h1 className="text-center text-3xl font-semibold mb-2">Query Table</h1>
        <div>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-4 gap-[30px] mt-[30px]"
            >
              <div className="grid grid-cols-1">
                <label htmlFor="DB_HOST" className="">
                  DB_HOST
                </label>
                <input
                  type="text"
                  name="DB_HOST"
                  id="DB_HOST"
                  {...register('DB_HOST', { required: 'DB_HOST Is require' })}
                  className="border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1">
                <label htmlFor="DB_USER">DB_USER</label>
                <input
                  type="text"
                  name="DB_USER"
                  id="DB_USER"
                  {...register('DB_USER', {
                    required: 'DB_USER is Required',
                  })}
                  className="border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="DB_PASSWORD">DB_PASSWORD</label>
                <input
                  type="text"
                  name="DB_PASSWORD"
                  id="DB_PASSWORD"
                  {...register('DB_PASSWORD', {
                    required: 'DB_PASSWORD is Required',
                  })}
                  className="border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="">DB_NAME</label>
                <input
                  type="text"
                  name="DB_NAME"
                  id="DB_NAME"
                  className="border border-slate-300"
                  {...register('DB_NAME', {
                    required: 'DB_NAME is Required',
                  })}
                />
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="">CONVERT TYPE</label>
                <select name="CONVERT_TYPE" id="CONVERT_TYPE" required>
                  <option value="">Select</option>
                  <option value="un">Unicode</option>
                  <option value="bn">bijoy</option>
                </select>
              </div>

              <div className="d-flex items-center gap-2">
                <button
                  type="submit"
                  className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  RUN COMMAND
                </button>
              </div>
              {/* <div className="flex gap-2 mt-[20px] items-center">
                            <div className="block">
                                <label htmlFor="">TABLE_NAME</label>
                                <input type="text" name="TABLE_NAME" id="TABLE_NAME" className="border border-slate-300 block" />
                            </div>
                            <div className="block">
                                <label htmlFor="">UNIQUE_ID</label>
                                <input type="text" name="" id="" className="border border-slate-300 block" />
                            </div>


                            <div className="block">
                                <label htmlFor="">COlUMN NAMES</label>
                                <Keyword title={"COLUMN NAMES"} field_prefix={"COLUMN"} />
                            </div>
                        </div> */}
              <div className="col-span-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 mt-[20px] items-end"
                  >
                    <div className="block">
                      <label htmlFor={`fields[${index}].TABLE_NAME`}>
                        TABLE_NAME
                      </label>
                      <input
                        type="text"
                        {...register(`fields[${index}].TABLE_NAME`)}
                        className="border border-slate-300 block"
                      />
                    </div>
                    <div className="block">
                      <label htmlFor={`fields[${index}].UNIQUE_ID`}>
                        UNIQUE_ID
                      </label>
                      <input
                        type="text"
                        {...register(`fields[${index}].UNIQUE_ID`)}
                        className="border border-slate-300 block"
                      />
                    </div>
                    <div className="block w-full">
                      <label htmlFor={`fields[${index}].UNIQUE_ID`}>
                        COLUMN Names
                      </label>
                      <Keyword
                        title="COLUMN NAMES"
                        field_prefix={`fields[${index}].COLUMN`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-white bg-red-500 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="d-flex items-center gap-2">
                <button
                  type="button"
                  className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={() =>
                    append({ TABLE_NAME: '', UNIQUE_ID: '', COLUMN_tags: '' })
                  }
                >
                  +
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default Query;
