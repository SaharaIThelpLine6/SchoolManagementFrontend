
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { fetchResultFieldData } from '../features/studentResultPublicView/studentResultPublicViewSlice';
import bnBijoy2Unicode from '../utils/conveter';
import { motion } from "motion/react"
const PublicLayout = () => {
    const { schoolData } = useSelector((state) => state.studentResultPublicView)

    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }
    const { schoolid } = useParams();
    const dispatch = useDispatch()
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchResultFieldData(schoolid))

    }, [dispatch, navigate])

    return (
        <div className=' lg:flex min-h-screen font-SolaimanLipi'>

            {/*  Menu bar start */}
            <button
                className="lg:hidden fixed pt-5 left-4 z-50 bg-transparent text-white p-2 rounded-md hidden_in_print"
                onClick={toggleSidebar}
            >
                {isOpen ? '✖' : '☰'}

            </button>

            {/* Close Button */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden_in_print"
                    onClick={toggleSidebar}
                ></div>
            )}
            {isOpen && (
                <button
                    className="fixed top-3 right-4 z-9999 bg-slate-500 text-white p-1 rounded-sm hidden_in_print"
                    onClick={toggleSidebar}
                >
                    ✖
                </button>
            )}

            {/*  Menu bar end */}


            {/*For mobile display start*/}
            <div className='fixed lg:hidden pr-4 w-full h-14 text-left py-[6px] bg-[#307847] hidden_in_print'>
                <div className='float-end'>
                    <img src="/logo.jpeg" alt={schoolData?.InstitutionName} className="w-[66px] h-[45px]" />
                </div>
            </div>
            {/*For mobile display end*/}

            <header className={`lg:flex w-[410px] max-w-[85%] font-SolaimanLipi hidden_in_print ${isOpen ? "flex absolute z-50" : "hidden"}`}>
                <nav>
                    <div className='relative shadow-[0_2px_10px_rgba(0,0,0,.3)] text-center pt-[38px] pb-[32px] px-16 bg-[#307847]'>
                        <div className='place-items-center'>
                            <img src="/logo.jpeg" alt={schoolData?.InstitutionName} className="w-[100px] h-[68px]" />
                        </div>
                        <div className='pt-[18px]'>
                            <h1 className='text-[#fff] font-[500] text-[26px]'>{bnBijoy2Unicode(schoolData?.InstitutionName)}</h1>
                        </div>
                    </div>
                    <ul className='pt-[10px] bg-white h-screen text-[16px] font-[400] border border-slate-200 text-[#307847] items-center'>
                        <li>

                            <a href={`/${schoolid}`} className='py-3 pl-6 cursor-pointer hover:bg-[#D6E4DA] border border-slate-200 border-r-0 flex items-center gap-[4px]'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>
                                ব্যক্তিগত ফলাফল
                            </a>
                        </li>
                        <li>
                            <a href={`/${schoolid}/classes`} className='py-3 pl-6 cursor-pointer hover:bg-[#D6E4DA] border border-slate-200 border-y-0 border-r-0 flex items-center gap-[4px]'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>
                                ক্লাশ/মারহালা ভিত্তিক ফলাফল
                            </a>
                        </li>
                        {/* <li className='py-3 pl-6 cursor-pointer hover:bg-[#D6E4DA] border border-slate-200 border-r-0 flex items-center gap-[4px]'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l6 6l-6 6" /></svg>
                            <Link to="/1234/AdmissionRegistration">ভর্তি রেজিস্ট্রেশন</Link>
                        </li> */}
                    </ul>
                </nav>
            </header>
            <main className=' mx-auto w-full overflow-hidden'>
                <motion.div initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.2 },
                    }}
                    className="w-full"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default PublicLayout;