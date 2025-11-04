import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setStudentFeeUpdateID } from '../features/student/studentSlice';
import CreateStudentFee from '../view/accounting/student-fee-collection/CreateStudentFee';
import TodayFeeCollection from '../view/accounting/student-fee-collection/TodayFeeCollection';
import UpdateStudentFee from '../view/accounting/student-fee-collection/UpdateStudentFee';

const StudentsFeeCollection = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const studentFeeUpdateID = useSelector(
    (state) => state.student.studentFeeUpdateID
  );

  // ✅ Reset fee update ID whenever the route/pathname changes
  useEffect(() => {
    dispatch(setStudentFeeUpdateID(null));
  }, [dispatch, location.pathname]);

  return (
    <div className="">
      <div className="space-y-5">
        <div className="print:hidden">
          {/* ✅ Conditional rendering based on studentFeeUpdateID */}
          {studentFeeUpdateID ? <UpdateStudentFee /> : <CreateStudentFee />}
        </div>

        {/* ✅ Always show today's fee collection section */}
        <TodayFeeCollection />
      </div>
    </div>
  );
};

export default StudentsFeeCollection;
