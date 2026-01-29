import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import useTranslate from '../utils/Translate';
import { Buffer } from 'buffer';
const StudentIdCardGenerate = ({ pageTitle }) => {
  const location = useLocation();
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

  return (

    <div>
       <div className='hidden_in_print'>
          <a href="/students/student-id-card" className='btn py-[8px] px-[15px] bg-blue-600 text-white rounded-[4px]'>Go Back</a>
        </div>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg grid grid-cols-3 w-[800px] gap-x-[20px] gap-y-[10px] mx-auto">
       
        {
          printableStudentList && printableStudentList.length &&
          printableStudentList && printableStudentList.length && printableStudentList.map((printableStudentDetails) => (
            <div className='w-[250px] border border-[#000] mb-[1px]'>
              <img src="/student_id_card_top.jpeg" alt="card header" />

              <div className="middle_area px-2 -mt-[26px]">
                <div className="proile_image_shape text-center">
                  <div className="image overflow-hidden h-[100px] w-[100px] shadow-lg mx-auto rounded-[5px]">
                    <img className='w-full h-full object-cover' src={convert_to_buffer(printableStudentDetails)} alt="" />
                  </div>
                  <h3 className='text-center py-[2px] px-[30px] mt-[10px] bg-sky-600 inline-block rounded-[50px] mx-auto text-white text-[20px]'>পরিচয় পত্র</h3>
                </div>
                <div className='pt-4 pb-4'>
                  <h3 className='text-red pl-[20px] text-[20px]'>আইডি নং: {translate(printableStudentDetails.StudentCode)}</h3>
                  <p className=''>নাম: {printableStudentDetails.StudentName}</p>
                  <p className=''>পিতার নাম: {printableStudentDetails.FatherName}</p>
                  <p className=''>মাতার নাম: {printableStudentDetails.MotherName}</p>

                </div>
              </div>

              <img src="/student_id_card_bottom.jpeg" alt="card footer" />
            </div>
          ))
        }

      </div>
    </div>
  );
};

export default StudentIdCardGenerate;
