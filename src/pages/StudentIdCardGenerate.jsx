import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import useTranslate from '../utils/Translate';
import { Buffer } from 'buffer';
import React, { useEffect } from 'react';
import { hideModal } from '../utils/ModalControlar';
const StudentIdCardGenerate = ({ pageTitle, layoutId, fields = [] }) => {

  const { state } = useLocation();
  // const { layoutId, fields = [] } = state || {};
  const dispatch = useDispatch();
  const printableStudentList = useSelector(
    (state) => state.student.PrintableStudentList
  );
  const translate = useTranslate();
  function convert_to_buffer(studentResult) {
    if (studentResult?.Image?.data) {
      const buffer = Buffer.from(studentResult.Image.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      return imageSrc;
    }
  }

  useEffect(() => {
    console.log(layoutId);

  }, [layoutId])


  const FIELD_LABELS = {
    StudentName: "নাম",
    FatherName: "পিতার নাম",
    MotherName: "মাতার নাম",
    ClassName: "শ্রেণি",
    Mobile1: "মোবাইল",
    SessionName: "সেশন",
    BloodGroup: "রক্তের গ্রুপ",
  };
  const handleClick = () => {
    hideModal();
    // window.print()
    setTimeout(() => {
      window.print()
    }, 300)
  }
  function convert_logto_buffer(Logo) {
    if (Logo?.data) {
      const buffer = Buffer.from(Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      return imageSrc;
    }
  }
  return (

    <div>
      <div className='hidden_in_print flex justify-end'>
        {/* <Link to="/students/student-id-card" className='btn py-[8px] px-[15px] bg-blue-600 text-white rounded-[4px]'>Go Back</Link> */}
        <button onClick={handleClick} className='btn py-[8px] px-[15px] bg-blue-600 text-white rounded-[4px]'>Print</button>
      </div>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg grid grid-cols-3 w-[800px] gap-x-[20px] gap-y-[10px] mx-auto">

        {
          printableStudentList && printableStudentList.length &&
          printableStudentList && printableStudentList.length && printableStudentList.map((printableStudentDetails) => (
            <div className={`w-[240px] h-[360px] m-0 overflow-hidden border border-[#000] relative print-id-card ${layoutId == 2 ? 'rounded-[20px]' : null}`}>
              {
                layoutId == 1 ? (
                  <React.Fragment>
                    <img src="/student_id_card_top.jpeg" alt="card header" className='h-[110px]' />
                    <div className="absolute top-[2px] w-full">
                      <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                      <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                    </div>
                    <div className="middle_area px-2 -mt-[40px]">
                      <div className="proile_image_shape text-center">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>
                        <h3 className='text-center py-[2px] px-[30px] mt-[6px] bg-sky-600 inline-block rounded-[50px] mx-auto text-white text-[16px]'>পরিচয় পত্র</h3>
                      </div>
                      <div className='pt-1 pb-2 h-[160px]'>
                        <h3 className='text-red pl-[20px] text-[16px]'>আইডি নং: {translate(printableStudentDetails.StudentCode)}</h3>
                        {fields.map((fieldName) => {
                          if (!fieldName) return null;
                          return (
                            <p key={fieldName} className='text-[15px]'>
                              {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    <img src="/student_id_card_bottom.jpeg" alt="card footer" className='h-[15px] w-full' />
                  </React.Fragment>
                ) : layoutId == 2 ? (
                  <React.Fragment>
                    <img src={`/card2.png`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-red text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>



                    </div>

                  </React.Fragment>
                ) : layoutId == 3 ? (
                  <React.Fragment>
                    <img src={`/card3.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-sky-600 text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-0">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>


                    </div>

                  </React.Fragment>
                ) : layoutId == 4 ? (
                  <React.Fragment>
                    <img src={`/card4.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[70px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-0">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>



                    </div>

                  </React.Fragment>
                ) : layoutId == 5 ? (
                  <React.Fragment>
                    <img src={`/card5.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-0">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>



                    </div>

                  </React.Fragment>
                ) : layoutId == 6 ? (
                  <React.Fragment>
                    <img src={`/card6.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-0">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>



                    </div>

                  </React.Fragment>
                ) : layoutId == 7 ? (
                  <React.Fragment>
                    <img src={`/card7.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-0">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>



                    </div>

                  </React.Fragment>
                ) :  (
                  <React.Fragment>
                    <img src={`/card8.jpeg`} alt="card header" className='h-full w-full' />
                    <div className="absolute top-[2px] w-full">

                      <div className='h-[60px] pt-2'>
                        <h2 className={`text-center text-[${printableStudentDetails.schoolname_fontside}px] text-white font-bold`} style={{ color: printableStudentDetails.schoolname_color_field }}>{printableStudentDetails?.institute_name}</h2>
                        <p className={`text-[${printableStudentDetails.schooladdress_fontside}px] text-center text-white`} style={{ color: printableStudentDetails.schooladdress_color_field }}>{printableStudentDetails?.institute_address}</p>
                      </div>
                      <div className="middle_area px-2">
                        <div className="image overflow-hidden h-[80px] w-[80px] shadow-lg mx-auto rounded-[5px]">
                          <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                        </div>

                        <div className='pt-1 pb-2  text-left h-[160px]'>
                          <h3 className='text-[#3F83C4] text-[18px] font-bold text-center'>{printableStudentDetails.StudentName}</h3>
                          {fields.map((fieldName) => {
                            if (!fieldName) return null;
                            return (
                              <p key={fieldName} className='text-[15px]'>
                                {printableStudentDetails[`fieldkey_${fieldName}`]}: {printableStudentDetails[fieldName]}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="w-[100px] h-[30px] absolute bottom-0 right-[0px]">
                        <img className='object-cover h-full mx-auto' src={convert_logto_buffer(printableStudentDetails?.SignaturePrincipal)} alt="" />
                        <p className='text-[12px] text-center'> {printableStudentDetails.PrincipalName} স্বাক্ষর </p>
                      </div>



                    </div>

                  </React.Fragment>
                )

              }

            </div>
          ))
        }

      </div>
    </div>
  );
};

export default StudentIdCardGenerate;
