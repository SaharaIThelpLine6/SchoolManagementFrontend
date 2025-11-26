import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import useTranslate from '../utils/Translate';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import SvgIcon from '../components/icons/SvgIcon';
import { permissionsDataList } from '../Data/permissions';
import { fetchClassData } from '../features/class/classSlice';
import {
  useGetSubLedgerQuery,
  usePostStudentFeeSettingsMutation,
} from '../features/feeCollection/feeCollectionSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import FeeMatrix from '../view/accounting/FeeMatrix';
import FeeSettingTable from '../view/accounting/FeeSettingTable';

const FeeSetting = ({ pageTitle }) => {
  const translate = useTranslate();
  const methods = useForm();
  const dispatch = useDispatch();
  const { watch, handleSubmit, reset } = methods;
  // State initialization
  const initialStudentState = {
    residential: { new: false, old: false, newAmount: '', oldAmount: '' },
    nonResidential: { new: false, old: false, newAmount: '', oldAmount: '' },
    dayCare: { new: false, old: false, newAmount: '', oldAmount: '' },
  };

  const [studentData, setStudentData] = useState(initialStudentState);
  const [studentFemaleData, setStudentFemaleData] =
    useState(initialStudentState);
  const [amounts, setAmounts] = useState({ male: '', female: '' });

  const [SessionID, ClassID, SLID] = watch(['SessionID', 'ClassID', 'SLID']);
  const [filter, setFilter] = useState({
    sessionId: SessionID,
    classId: ClassID,
    SLID: SLID,
  });
  const [feeMatrixData, setFeeMatrixData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [editId, setEditId] = useState(null);

  const { data: sessionData } = useGetSessionsQuery();
  // const { data: subClassData } = useGetSubClassListQuery();
  const { classList, status: classStatus } = useSelector(
    (state) => state.class
  );
  const { data: subLedgerData } = useGetSubLedgerQuery(101);
  const [postStudentFeeSettings] = usePostStudentFeeSettingsMutation();

  console.log(editData, 'data');
  useEffect(() => {
    if (!classList.length) {
      dispatch(fetchClassData());
    }
  }, [dispatch]);
  useEffect(() => {
    if (editData) {
      // reset form fields
      reset({
        SessionID: editData.SessionID,
        ClassID: editData.Classid,
        SLID: editData.SLID,
      });

      // ✅ male state set
      setStudentData({
        residential: {
          new: true,
          old: true,
          newAmount: editData.MaleAbaNew || '',
          oldAmount: editData.MaleAbaOld || '',
        },
        nonResidential: {
          new: true,
          old: true,
          newAmount: editData.MaleOnaNew || '',
          oldAmount: editData.MaleOnaOld || '',
        },
        dayCare: {
          new: true,
          old: true,
          newAmount: editData.MaleDayNew || '',
          oldAmount: editData.MaleDayOld || '',
        },
      });

      // ✅ female state set
      setStudentFemaleData({
        residential: {
          new: true,
          old: true,
          newAmount: editData.FemaleAbaNew || '',
          oldAmount: editData.FemaleAbaOld || '',
        },
        nonResidential: {
          new: true,
          old: true,
          newAmount: editData.FemaleOnaNew || '',
          oldAmount: editData.FemaleOnaOld || '',
        },
        dayCare: {
          new: true,
          old: true,
          newAmount: editData.FemaleDayNew || '',
          oldAmount: editData.FemaleDayOld || '',
        },
      });

      setAmounts({
        male: editData.MaleAbaNew || '',
        female: editData.FemaleAbaNew || '',
      });
    }
  }, [editData, reset]);

  useEffect(() => {
    setFilter({
      sessionId: SessionID || null,
      classId: ClassID || null,
      SLID: SLID || null,
    });
  }, [SessionID, ClassID, SLID]);

  const onSubmit = async (data) => {
    console.log(data, 'data');
    const payload = {
      SessionID: filter.sessionId,
      SLID: filter.SLID, // <- এখানে 10105 হার্ডকোড করার দরকার নাই
      Classid: filter.classId,
      ...feeMatrixData,
    };

    const emptyFields = Object.entries(payload).filter(
      ([key, value]) => value === null || value === '' || value === undefined
    );
    // console.log(payload, "payload");

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'সব ফিল্ড পূরণ করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
      return;
    }

    try {
      if (editData) {
        await postStudentFeeSettings(payload).unwrap();

        Swal.fire({
          icon: 'success',
          title: 'সফলভাবে সংরক্ষণ হয়েছে!',
          text: 'ফি ম্যাট্রিক্স ডাটাবেসে যোগ হয়েছে।',
          confirmButtonText: 'ঠিক আছে',
        });

        // ✅ form reset with empty values
        reset({
          SessionID: '',
          ClassID: '',
          SLID: '',
        });

        // ✅ state গুলো initial এ ফিরিয়ে দেওয়া
        setEditId(null);
        setStudentData(initialStudentState);
        setStudentFemaleData(initialStudentState);
        setAmounts({ male: '', female: '' });
        setFeeMatrixData(null);
        setEditData(null);
      } else {
        await postStudentFeeSettings(payload).unwrap();

        Swal.fire({
          icon: 'success',
          title: 'সফলভাবে সংরক্ষণ হয়েছে!',
          text: 'ফি ম্যাট্রিক্স ডাটাবেসে যোগ হয়েছে।',
          confirmButtonText: 'ঠিক আছে',
        });

        // ✅ form reset with empty values
        // reset({
        //   SessionID: "",
        //   ClassID: "",
        //   SLID: "",
        // });

        // ✅ state গুলো initial এ ফিরিয়ে দেওয়া
        setStudentData(initialStudentState);
        setStudentFemaleData(initialStudentState);
        setAmounts({ male: '', female: '' });
        setFeeMatrixData(null);
        setEditData(null);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: error?.data?.message || 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  const handleReset = () => {
    reset({
      SessionID: '',
      ClassID: '',
      SLID: '',
    });
    setStudentData(initialStudentState);
    setStudentFemaleData(initialStudentState);
    setAmounts({ male: '', female: '' });
    setFeeMatrixData(null);
    setEditData(null);
  };
  const handleStudentFeeGroup = useCallback(() => {
    console.log('ewafrgurig');
    showModal('Student Fee Group', 'STUDENT_FEE_GROUP');
  }, []);
  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi hidden_in_print">
        {/* Top Section - Title and Filters */}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-5 flex-col">
              <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
                {translate(pageTitle)}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <DefaultSelect
                      options={sessionData || []}
                      require={'Session is required'}
                      nameField={'SessionName'}
                      valueField={'SessionID'}
                      registerKey={'SessionID'}
                      type={'number'}
                      label="Session"
                    />
                  </div>

                  <Button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white
                               hover:bg-[#0066cc] transition-colors duration-150"
                    // onClick={handleGeneralOpenModal}
                  >
                    <SvgIcon name="FaPlus" size={16} />
                  </Button>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <DefaultSelect
                      options={classList ?? []}
                      nameField={'ClassName'}
                      valueField={'ClassID'}
                      registerKey={'ClassID'}
                      type={'number'}
                      label={'Class'}
                      unicode={true}
                    />
                  </div>

                  <Button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white
                               hover:bg-[#0066cc] transition-colors duration-150"
                    // onClick={handleGeneralOpenModal}
                  >
                    <SvgIcon name="FaPlus" size={16} />
                  </Button>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <DefaultSelect
                      options={subLedgerData || []}
                      require={'Sub Ledger is required'}
                      nameField={'SlName'}
                      valueField={'SLID'}
                      registerKey={'SLID'}
                      label={'Sub Ledger (Fee Name)'}
                      unicode={true}
                    />
                  </div>

                  <Button
                    onClick={handleStudentFeeGroup}
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white
                               hover:bg-[#0066cc] transition-colors duration-150"
                  >
                    <SvgIcon name="FaPlus" size={16} />
                  </Button>
                </div>
              </div>
            </div>
            <FeeMatrix
              data={setFeeMatrixData}
              initialStudentState={initialStudentState}
              studentData={studentData}
              setStudentData={setStudentData}
              studentFemaleData={studentFemaleData}
              setStudentFemaleData={setStudentFemaleData}
              amounts={amounts}
              setAmounts={setAmounts}
            />
            <div className="flex justify-end items-center mr-10 gap-3">
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={handleReset}
              >
                Reset
              </Button>
              <ViewPermission
                permissionId={permissionsDataList.fee_setting}
                permissionType="insert"
              >
                <Button type="submit">Save</Button>
              </ViewPermission>
            </div>
          </form>
        </FormProvider>
        <FeeSettingTable
          filter={filter}
          setEditData={setEditData}
          setEditId={setEditId}
          editId={editId}
        />
      </div>
    </>
  );
};

export default FeeSetting;
