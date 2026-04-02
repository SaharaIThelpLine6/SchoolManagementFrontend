import { Buffer } from 'buffer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ResultLayout = ({active_url}) => {
    const { schoolid, seassonid, examid, classid, userid } = useParams();
    const { resultStatus, resultError, classResult, schoolData, resultStatistics, resultSubGroupInfo } = useSelector((state) => state.studentResultPublicView)

    const dispatch = useDispatch()
    const navigate = useNavigate();



    return (
        <div>
            <nav className="mx-auto bg-white pt-4 pr-4  border-[#D0DDD7] border-b shadow-xl relative  ${isActive('student_result') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-theme-color'}  w-100 sm:w-auto overflow-x-auto sm:overflow-x-auto" id="nav">
                <div className={`flex lg:justify-center gap-5  ${schoolData?.isClassResultShowable && schoolData?.isClassResultShowable.Action != 0 ? 'grid-cols-6' : 'grid-cols-5'} p-2 gap-2 relative`}>
                    <Link to={`/${schoolid}/student_result`} className="cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px]  text-theme-color py-3">
                        ব্যক্তিগত ফলাফল
                    </Link>
                    {
                        schoolData?.isClassResultShowable && schoolData?.isClassResultShowable.Action != 0 ? (
                            <Link to={`/${schoolid}/classes`} className='cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px]  text-theme-color py-3 '>
                                ক্লাশ/মারহালা ভিত্তিক ফলাফল
                            </Link>
                        ) : null
                    }
 
                    <Link to={`/${schoolid}/maritlist_request`} className="cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px]  text-theme-color py-3">
                        মেধা-তালিকা
                    </Link>

                    <Link to="https://wifaqresult.com" target="_blank" className="cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px]  text-theme-color py-3">
                        বেফাক ফলাফল
                    </Link>

                    <Link to="https://hems.alhaiatululya.org/exam-result" target="_blank" className="cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px]  text-theme-color py-3">
                        আল-হাইআ ফলাফল
                    </Link>
                    <Link to="https://www.tanjimulmadaris.com" target="_blank" className="cursor-pointer whitespace-nowrap  border-0 flex items-center gap-[4px] font-bold text-[16px] text-theme-color  py-3">
                        তানযীমুল মাদারিসিদ দ্বীনিয়া বাংলাদেশ
                    </Link>

                </div>
            </nav>
        </div>
    );
};

export default ResultLayout;
