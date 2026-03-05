import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetClassListQuery, useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useGetStudentBySearchQuery,
  usePostChnageStudentGroupMutation,
} from '../features/student/studentQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import { setPrintableStudentList } from '../features/student/studentSlice';
import { showModal } from '../utils/ModalControlar';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import StudentIdCardGenerate from './StudentIdCardGenerate';
import { ResizableBox } from "react-resizable";
import { Buffer } from 'buffer';
const PAGE_SIZE = 10;

const StudentIdCardPrint = ({ pageTitle }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [selectedLayout, setSelectedLayout] = useState(null);
  const methods = useForm({
    defaultValues: {
      [`schoolname_color_field_${selectedLayout}`]: "#ffffff",
      [`schooladdress_color_field_${selectedLayout}`]: "#ffffff"

    }
  });
  const { register, watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);


  const [checkboxState, setCheckboxState] = useState([]);

  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const SessionID = watch('SessionID');
  const ClassID = watch('ClassID');
  const SubClassID = watch('SubClassID');
  const ResidentialStatusId = watch('ResidentialStatusId');

  const SchoolNameSize = watch(`schoolname_fontside_${selectedLayout}`);
  const SchoolNameColor = watch(`schoolname_color_field_${selectedLayout}`) || "#ffffff";
  const SchoolAddressSize = watch(`schooladdress_fontside_${selectedLayout}`);
  const SchoolAddressColor = watch(`schooladdress_color_field_${selectedLayout}`) || "#ffffff";


  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const [postChnageStudentGroup, { isLoading, isSuccess, isError }] =
    usePostChnageStudentGroupMutation();

  const { data: searchStudentInfo = [], refetch } = useGetStudentBySearchQuery(
    { SubClassID, SessionID, ResidentialStatusId },
    {
      skip: !SubClassID || !SessionID || !ResidentialStatusId,
      refetchOnFocus: false,
    }
  );
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // useEffect(() => {
  //   console.log(checkboxState);

  // }, [checkboxState])

  const totalPages = Math.ceil(searchStudentInfo.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return searchStudentInfo.slice(start, start + PAGE_SIZE);
  }, [searchStudentInfo, currentPage]);


  const handleCheckboxChange = (id, isChecked) => {
    console.log(id);
    console.log(isChecked);

    setCheckboxState(prev => {
      if (isChecked) {

        return [...prev, id];
      } else {
        // Remove when unchecked
        return prev.filter(item => item !== id);
      }
    });
  };



  const handleSelectAll = (e) => {
    if (e.target.checked) {
      console.log(searchStudentInfo);

      setSelectedRows(searchStudentInfo);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (e, student) => {
    if (e.target.checked) {
      setSelectedRows(prev =>
        prev.some(row => row.AdmissionID === student.AdmissionID) ? prev : [...prev, student]
      );
    } else {
      setSelectedRows(prev =>
        prev.filter(
          row => row.AdmissionID !== student.AdmissionID
        )
      );
    }
  };
  function convert_logto_buffer(Logo) {
    if (Logo?.data) {
      const buffer = Buffer.from(Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      return imageSrc;
    }
  }

  const onSubmit = async (data) => {
    try {

      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'ফর্ম অসম্পূর্ণ',
          text: 'অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।',
        });
        return;
      }
      const updatedSelectedRows = selectedRows.map(row => {
        const newRow = { ...row };
        checkboxState.forEach(key => {
          const fieldKeyName = `fieldkey_${key}`;
          if (data[fieldKeyName]) {
            newRow[`fieldkey_${key}`] = data[fieldKeyName];
          }
        });
        newRow[`institute_name`] = data[`institute_name_${selectedLayout}`]
        newRow[`schoolname_color_field`] = SchoolNameColor
        newRow[`schoolname_fontside`] = SchoolNameSize


        newRow[`institute_address`] = data[`institute_address_${selectedLayout}`]
        newRow[`schooladdress_color_field`] = SchoolAddressColor
        newRow[`schooladdress_fontside`] = SchoolAddressSize
        newRow[`SignaturePrincipal`] = institutionInfo?.SignaturePrincipal
        newRow[`PrincipalName`] = institutionInfo?.PrincipalName
       


        return newRow;
      });
      console.log(updatedSelectedRows);
      
      dispatch(setPrintableStudentList(updatedSelectedRows));
      // showModal('', 'STUDENT_ID_CARD', checkboxState);
      setTimeout(() => {
        window.print()
      }, 300)


    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: error?.data?.error || 'ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।',
      });
      console.error('Error updating student group:', error);
    }
  };

  const handleLayoutSelect = (layoutId) => {
    setSelectedLayout(layoutId);
  };
  const layouts = [
    // { id: "1", image: "/student_id_image.png" },
    { id: "2", image: "/card2.png" },
    { id: "3", image: "/card3.jpeg" },
    { id: "4", image: "/card4.jpeg" },
    { id: "5", image: "/card5.jpeg" },
    { id: "6", image: "/card6.jpeg" },
    { id: "7", image: "/card7.jpeg" },
    { id: "8", image: "/card8.jpeg" },

  ];


  const englishToBanglaMap = {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  };
  const convertToBanglaDisplay = (value) => {
    if (!value) return '';

    return value
      .split('')
      .map((char) => englishToBanglaMap[char] || char)
      .join('');
  };
  const FIELD_LABELS = {
    StudentName: "নাম",
    FatherName: "পিতার নাম",
    MotherName: "মাতার নাম",
    ClassName: "শ্রেণি",
    Mobile1: "মোবাইল",
    SessionName: "সেশন",
    BloodGroup: "রক্তের গ্রুপ",
    ResidentialName: "অবস্থান",
    NIDNO: "NID",
    DateOfBirth: "জন্ম তারিখ",
    NewOldId: "আবস্থা",
    StudentCode: "দাখেলা",
  };
  const FIELD_Value_Demo = {
    StudentCode: "123",
    StudentName: "মো: আজাদ হাসান",
    FatherName: "মো: সোলায়মান হাসান",
    MotherName: "মোসা: ফাতেমা বেগম",
    ClassName: "প্রথম",
    Mobile1: "০১৮৭৬৮৬২৩৮৬",
    SessionName: "২০২৬",
    BloodGroup: "এ +",
    ResidentialName: "আবাসিক",
    NIDNO: "01234567898",
    DateOfBirth: "12/06/2021",
    NewOldId: "",
  };

  const customizeableFields =
  {
    StudentName: ["1"],
    FatherName: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    MotherName: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    ClassName: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    Mobile1: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    SessionName: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    BloodGroup: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    ResidentialName: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    NIDNO: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    DateOfBirth: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    NewOldId: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    StudentCode: ["2", "3", "4", "5", "6", "7", "8", "9", "10"]
  }


  useEffect(() => {
    const el = document.getElementById(`school-name-${selectedLayout}`);
    if (el) {
      el.style.height = "auto";
      el.style.height = `${(el.scrollHeight > 20 && el.scrollHeight < 60) ? el.scrollHeight - 20 : el.scrollHeight}px`;
    }
  }, [SchoolNameSize, SchoolNameColor]);


  useEffect(() => {
    const el = document.getElementById("school-address");
    if (el) {
      el.style.height = "auto";
      el.style.height = `${(el.scrollHeight > 20 && el.scrollHeight < 60) ? el.scrollHeight - 20 : el.scrollHeight}px`;
    }
  }, [SchoolAddressSize, SchoolAddressColor]);



  const textareaRef = useRef(null);

  const startResize = (e) => {
    const startY = e.clientY;
    const startHeight = textareaRef.current.offsetHeight;

    const onMouseMove = (e) => {
      textareaRef.current.style.height =
        startHeight + (e.clientY - startY) + "px";
    };

    const stopResize = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResize);
  };
  const isFieldAllowedForLayout = (fieldId, layoutId) => {
    return customizeableFields[fieldId]?.includes(String(layoutId));
  };

  return (
    <div>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5 hidden_in_print">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate('Id Card Print')}
          </h3>
        </div>
        <div className='flex gap-[50px] flex-nowrap lg:flex-wrap pt-[20px] w-full overflow-x-auto'>
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleLayoutSelect(layout.id)}
              style={{boxShadow: "rgb(0 0 0 / 37%) 0px 0px 14px -2px"}}
              className={`border rounded-[10px] hidden_in_print mx-2 ${selectedLayout === layout.id ? "border-blue-500" : ""
                }`}
            >

              <input
                type="hidden"
                {...register(`layout_identifier`)}
                value={layout.id}
              />

              {layout.id == 1 && (
                <div className='w-[250px] border border-[#000] mb-[1px] relative print-id-card'>
                  <img src="/student_id_card_top.jpeg" alt="card header" className='h-[110px]' />
                  <div className="absolute top-[2px] w-full">
                    <h2 className="group text-center text-[18px] text-white font-bold truncate">
                      <textarea
                        ref={textareaRef}
                        onMouseDown={startResize}
                        id={`school-name-${selectedLayout}`}
                        className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                        defaultValue={institutionInfo?.InstitutionName}
                        style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                        {...register(`institute_name_${layout.id}`)}
                      />

                      <div
                        className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                      >
                        <div>
                          <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                        </div>
                        <div>
                          <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                        </div>
                      </div>
                    </h2>
                    <p className='text-[16px] text-center text-white group relative'>
                      <textarea
                        id='school-address'
                        className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                        defaultValue={institutionInfo?.Address}
                        style={{ color: `${SchoolAddressColor}` }}
                        {...register(`institute_address_${layout.id}`)}
                      />

                      <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                      >
                        <div>
                          <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                        </div>
                        <div>
                          <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                        </div>
                      </div>
                    </p>
                  </div>
                  <div className="middle_area px-2 -mt-[40px]">
                    <div className="proile_image_shape text-center">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>
                      <h3 className='text-center py-[2px] px-[30px] mt-[6px] bg-sky-600 inline-block rounded-[50px] mx-auto text-white text-[16px]'>পরিচয় পত্র</h3>
                    </div>
                    <div className='pt-1 pb-2 text-left h-[160px]'>
                      <h3 className='text-red pl-[20px] text-[16px]'>আইডি নং: 123</h3>

                      {selectedLayout == 1 && checkboxState.map((fieldName) => {
                        if (!fieldName) return null;
                        return (
                          <p key={fieldName} className='text-[15px]'>
                            <input className='w-fit inline-block' style={{
                              width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                              minWidth: "0.1ch",
                            }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <img src="/student_id_card_bottom.jpeg" alt="card footer" className='h-[15px] w-full' />
                </div>
              )}
              

              {layout.id == 2 && (
                <div className='w-[250px] mb-[1px] rounded-[10px] relative print-id-card'>
                  <div className="rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                   
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-red text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 2 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-[100px] h-[60px] absolute -bottom-[40px] right-1/2 transform translate-x-1/2">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p className='text-white'> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
              {layout.id == 3 && (
                <div className='w-[250px] rounded-[10px] border border-[#000] mb-[1px] relative print-id-card'>
                  <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[100px]'>
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: SchoolAddressColor, fontSize: `${SchoolAddressSize}px`, lineHeight: `${SchoolAddressSize}px` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-sky-600 text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>

                        {selectedLayout == 3 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block bg-transparent' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
              {layout.id == 4 && (
                <div className='w-[250px] mb-[1px] relative print-id-card'>
                    <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                  
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 4 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    
                      <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
               {layout.id == 5 && (
                <div className='w-[250px] mb-[1px] relative print-id-card'>
                    <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                  
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#000000"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#000000"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 5 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    
                      <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
               {layout.id == 6 && (
                <div className='w-[250px] mb-[1px] relative print-id-card'>
                    <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                  
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#000000"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#000000"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 6 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    
                      <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
               {layout.id == 7 && (
                <div className='w-[250px] mb-[1px] relative print-id-card'>
                    <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                  
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 7 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    
                      <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
              {layout.id == 8 && (
                <div className='w-[250px] mb-[1px] relative print-id-card'>
                    <div className="overflow-hidden h-full w-full rounded-[10px]">
                    <img src={`${layout.image}`} alt="card header" className='h-full w-full' />
                  </div>
                  <div className="absolute top-[5px]  w-full px-[10px]">

                    <div className='h-[80px]'>
                  
                      <h2 className="group text-center text-[18px] text-white font-bold truncate">
                        <textarea
                          ref={textareaRef}
                          onMouseDown={startResize}
                          id={`school-name-${selectedLayout}`}
                          className={`
                          w-full
                          bg-transparent
                          text-center
                          outline-none
                          resize-y
                          cursor-ns-resize
                        `}
                          defaultValue={institutionInfo?.InstitutionName}
                          style={{ color: SchoolNameColor, fontSize: `${SchoolNameSize}px`, lineHeight: `${SchoolNameSize}px` }}
                          {...register(`institute_name_${layout.id}`)}
                        />

                        <div
                          className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={18} {...register(`schoolname_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schoolname_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </h2>
                      <p className='text-[16px] text-center text-white group relative'>
                        <textarea
                          id='school-address'
                          className={`w-full border-black inline-block bg-transparent text-center outline-none text-[${SchoolAddressSize}px] leading-[${SchoolAddressSize}px]]`}
                          defaultValue={institutionInfo?.Address}
                          style={{ color: `${SchoolAddressColor}` }}
                          {...register(`institute_address_${layout.id}`)}
                        />

                        <div className="absolute bg-white right-0 top-0 translate-x-full opacity-0 group-focus-within:translate-x-[100%] group-focus-within:opacity-100 transition-all duration-300 ease-out text-black shadow-xl border-2 border-purple-300 rounded-[4px]"
                        >
                          <div>
                            <input type="number" className="w-[60px]" defaultValue={16} {...register(`schooladdress_fontside_${layout.id}`)} />
                          </div>
                          <div>
                            <input type="color" className="w-[60px]" defaultValue={"#ffffff"} {...register(`schooladdress_color_field_${layout.id}`)} />
                          </div>
                        </div>
                      </p>
                    </div>

                    <div className="middle_area px-2">
                      <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                        <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                      </div>

                      <div className='pt-1 pb-2 text-left h-[160px]'>
                        <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>মো: আজাদ হাসান</h3>
                        {selectedLayout == 8 && checkboxState.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              <input className='w-fit inline-block' style={{
                                width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                                minWidth: "0.1ch",
                              }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    
                      <div className="w-[100px] h-[60px] absolute bottom-0 right-[15px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(institutionInfo?.SignaturePrincipal)} alt="" />

                        <p> প্রিন্সিপাল স্বাক্ষর </p>
                      </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        
        <FormProvider {...methods}>
          <form className="w-full space-y-4 hidden_in_print" onSubmit={handleSubmit(onSubmit)}>
            <p className='mt-4 font-bold text-[18px]'>{checkboxState.length == 0 ? "সর্বাধিক ৫টি এন্ট্রি নির্বাচন করুন" : checkboxState.length < 5 ? `আরও ${convertToBanglaDisplay(String(5 - checkboxState.length))}টি ফিল্ড নির্বাচন করতে পারবেন` : "সর্বোচ্চ এন্ট্রি নির্বাচন করা হয়েছে"}</p>
            <div className='flex flex-wrap gap-4 mt-[40px] mb-[40px]'>
              {[
                  { ID: "StudentCode", Name: "Student Code" },
                { ID: "StudentName", Name: "User Name" },
                { ID: "FatherName", Name: "Father Name" },
                { ID: "MotherName", Name: "Mother Name" },
                { ID: "ClassName", Name: "Class Name" },
                { ID: "Mobile1", Name: "Mobile" },
                { ID: "SessionName", Name: "Session" },
                { ID: "BloodGroup", Name: "Blood Group" },
                { ID: "ResidentialName", Name: "Residential Name" },
                { ID: "NIDNO", Name: "NID" },
                { ID: "DateOfBirth", Name: "Date Of Birth" },
                { ID: "NewOldId", Name: "Position" },
              
              ]
                // ⭐ FILTER BY LAYOUT
                .filter((i) => isFieldAllowedForLayout(i.ID, selectedLayout))
                .map((i) => (
                  <div key={i.ID} className='flex items-center gap-2'>
                    <input
                      type="checkbox"
                      {...register(i.ID)}
                      className='h-[20px] w-[20px]'
                      onChange={(e) => handleCheckboxChange(i.ID, e.target.checked)}
                      disabled={
                        checkboxState.length >= 5 && !checkboxState.includes(i.ID)
                      }
                    />
                    <label className='text-[20px]' htmlFor={i.ID}>
                      {translate(i.Name)}
                    </label>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-3">

              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
              <DefaultSelect
                label={translate('Sub Class')}
                options={subClassListData}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Sub Class')}
                options={[
                  {
                    ResidentialStatusId: 1,
                    value: "আবাসিক"
                  },
                  {
                    ResidentialStatusId: 2,
                    value: "অনাবাসিক"
                  },
                  {
                    ResidentialStatusId: 3,
                    value: "ডে-কেয়ার"
                  },
                  {
                    ResidentialStatusId: 4,
                    value: "উভয়"
                  }
                ]}
                valueField="ResidentialStatusId"
                nameField="value"
                registerKey="ResidentialStatusId"
                unicode={true}
              />

              <div className="pt-7 w-full">
                <ViewPermission
                  permissionId={permissionsDataList.student_group_setting}
                  permissionType="insert"
                >
                  <Button type="submit" className="w-full md:w-auto">
                    {translate('Preview')}
                  </Button>
                </ViewPermission>
              </div>



            </div>
          </form>
        </FormProvider>

        <div className="overflow-x-auto mt-5 hidden_in_print">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">
                  {/* <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedRows.length === paginatedData.length &&
                    paginatedData.length > 0
                  }
                /> */}
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      searchStudentInfo.length > 0 &&
                      selectedRows.length === searchStudentInfo.length
                    }
                  />
                </th>
                <th className="p-2 text-left">{translate('User ID')}</th>
                <th className="p-2 text-left">{translate('Student Name')}</th>
                <th className="p-2 text-left">{translate('Class')}</th>
                <th className="p-2 text-left">{translate('Sub Class')}</th>
                <th className="p-2 text-left">{translate('Residential')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((student) => (
                <tr key={student.AdmissionID} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      onChange={(e) => handleRowSelect(e, student)}
                      checked={selectedRows.some(
                        row => row.AdmissionID === student.AdmissionID
                      )}
                    />
                  </td>
                  <td className="p-2">{student.StudentCode}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.StudentName)}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.ClassName)}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.SubClass)}</td>
                  <td className="p-2">{student.ResidentialName}</td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    {translate('No data found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <div className=''>
        <StudentIdCardGenerate layoutId={selectedLayout} fields={checkboxState} />
      </div>
    </div>
  );
};

export default StudentIdCardPrint;
