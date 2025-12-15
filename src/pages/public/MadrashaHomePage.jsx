import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

const MadrashaHomePage = () => {
    const { schoolid } = useParams();
    const { schoolData } = useSelector((state) => state.studentResultPublicView);
    return (
        <div className="madrasha-home-page h-screen bg-[#f9f9f9] py-[50px] ">
            <div className="container mx-auto">
                <div className="flex items-center flex-wrap lg:flex-nowrap">
                    <div className="text_area text-center md:text-start w-full lg:w-[60%] pr-2">
                        <h1 className=' text-[28px] md:text-[40px] text-theme-color'>{schoolData?.InstitutionName}</h1>
                        <h2 className='text-[18px] md:text-[22px] mt-2 mb-4'>
                            {schoolData?.InstitutionName}, {schoolData?.Address} একটি সুপরিচিত দ্বীনি শিক্ষা প্রতিষ্ঠান। এই মাদরাসায় কুরআন ও সুন্নাহর আলোকে ছাত্র/ছাত্রীদের ধর্মীয় ও নৈতিক শিক্ষা প্রদান করা হয়। এখানে কুরআন তিলাওয়াত, হিফজ, ফিকহ, আকাইদ, আরবি ভাষা ও সাধারণ শিক্ষার সমন্বিত পাঠদান করা হয়।

                            মাদরাসার লক্ষ্য হলো ইসলামি আদর্শে আদর্শ মানুষ গড়ে তোলা এবং শিক্ষার্থীদের চরিত্র গঠন ও নৈতিক উন্নয়ন সাধন করা। অভিজ্ঞ ও যোগ্য শিক্ষক-শিক্ষিকাদের মাধ্যমে পাঠদান পরিচালিত হয়। শিক্ষার্থীদের জন্য একটি সুন্দর, নিরাপদ ও শৃঙ্খলাপূর্ণ শিক্ষার পরিবেশ নিশ্চিত করা হয়।
                            
                        </h2>
                        <Link to={`/${schoolid}/student_result`} className='py-4 px-4 bg-[#4154f1] text-white rounded-[5px] font-Poppins mt-4 inline-block shadow-xl'>Explore Our Result Section</Link>
                    </div>
                    <div className="image_section pt-[50px] md:pt-0">
                        <img src="/madrasha1.jpg" alt="madrasha image" className='up_down_animation rounded-[5px]' />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MadrashaHomePage;