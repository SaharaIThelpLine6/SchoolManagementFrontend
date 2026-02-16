import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import useTranslate from '../utils/Translate';
import { Buffer } from 'buffer';
import { useEffect } from 'react';
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


  const FIELD_LABELS = {
    StudentName: "নাম",
    FatherName: "পিতার নাম",
    MotherName: "মাতার নাম",
    ClassName: "শ্রেণি",
    Mobile1: "মোবাইল",
    SessionName: "সেশন",
    BloodGroup: "রক্তের গ্রুপ",
  };
  const handleClick = () =>{
    hideModal();
    // window.print()
    setTimeout(()=>{
      window.print()
    }, 300)
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
            <div className='w-[250px] border border-[#000] mb-[1px] relative print-id-card'>
              <img src="/student_id_card_top.jpeg" alt="card header" className='h-[110px]' />
              <div className="absolute top-[2px] w-full">
                <h2 className='text-center text-[20px] text-white font-bold'>{printableStudentDetails?.InstitutionName}</h2>
                <p className='text-[16px] text-center text-white'>{printableStudentDetails?.Address}</p>
              </div>
              <div className="middle_area px-2 -mt-[40px]">
                <div className="proile_image_shape text-center">
                  <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
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
            </div>
          ))
        }

      </div>
    </div>
  );
};

export default StudentIdCardGenerate;
