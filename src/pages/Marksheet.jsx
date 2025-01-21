const Marksheet = () => {
    return (
        <div className="">
            <div className=" w-[750px] h-[1076px] relative bg-white ">
                <div className="pt-4 pb-1 px-8 bg-white">
                    {/*Logo and Heading start*/}
                    <div className="flex">
                        <div className="pt-6">
                            <img src="/marksheetLogo.png" alt="Logo" className="w-18 h-18" />
                        </div>
                        <div className="mx-auto text-center">
                            <h2 className="text-[24px] font-medium">আল ইখলাস ক্বওমী মহিলা মাদরাসা</h2>
                            <h3 className="text-md">কে.ডি.মসজিদ সংলগ্ন, কোদালিয়া, টাঙ্গাইল পৌরসভা, টাঙ্গাইল</h3>
                            <h3 className="text-md">শিক্ষাবর্ষঃ ২০২৪-২৫ ইং</h3>
                            <h3 className="text-md">পরীক্ষাঃ ১ম সাময়িক পরীক্ষা ২০২৪-২০২৫ ইং</h3>
                        </div>
                    </div>
                    {/*Logo and Heading end*/}
                    {/*Students details and grade point start*/}
                    <div className="flex items-center justify-between">

                        <div className="pt-3">
                            <table>
                                <tbody className="">
                                    <tr>
                                        <td className="text-end font-semibold">পরীক্ষার্থীর নাম</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td className="text-start"> উম্মে কুলসুম </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">মারহালা/শ্রেণী</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> শিশু </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">আইডী</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> ৯ </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">পিতার নাম</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> সোহেল মিয়া </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">জন্ম তারিখ</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> ০১/০৯/২০০২ ইং </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-5">
                            <h1 className="bg-[#a8a6a6] text-white text-center text-[16px]">মোট বিষয় ৫ টি - পূর্ণমান ১০০* = ৫০০</h1>
                            <table className="w-[295px]">
                                <tbody className="border border-black w-full">
                                    <tr>
                                        <td className="text-start pl-2">মুমতাজ</td>
                                        <td className="w-12 text-end">:</td>
                                        <td className="pl-3">৮০ X</td>
                                        <td className="pr-2">৫ = ৪০০</td>
                                    </tr>                                        
                                    <tr>
                                    <td className="text-start pl-2">জা:জি:</td>
                                        <td className="w-12 text-end ">:</td>
                                        <td className="pl-3 ">৬৫ X</td>
                                        <td className="pr-2 ">৫ = ৩২৫</td>
                                    </tr>
                                    <tr>
                                    <td className="text-start pl-2">জায়্যিদ</td>
                                        <td className="w-12 text-end ">:</td>
                                        <td className="pl-3">৫০ X</td>
                                        <td className="pr-2 ">৫ = ২৫০</td>
                                    </tr>
                                    <tr>
                                    <td className="text-start pl-2">মাকবুল</td>
                                        <td className="w-12 text-end ">:</td>
                                        <td className="pl-3">৩৫ X</td>
                                        <td className="pr-2 ">৫ = ১৭৫</td>
                                    </tr>
                                    <tr>
                                    <td className="text-start pl-2">রাসিব</td>
                                        <td className="w-12 text-end ">:</td>
                                        <td className="pl-3">১ X</td>
                                        <td className="pr-2 ">৫ = ৫</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/*Students details and grade point end*/}
                    {/*Subject wise number and table start*/}
                    <div className="pt-2 w-full">
                        <table className="w-full border border-collapse">
                            <thead className="border border-black">
                                <tr className="border border-b-[2px] border-t-[2px] border-black">
                                    <th className="border border-black">ক্রমিক নং</th>
                                    <th className="border border-black w-72">বিষয়</th>
                                    <th className="border border-black">পূর্ণমান</th>
                                    <th className="border border-black">পাশ নম্বর</th>
                                    <th className="border border-black">সর্বোচ্চ প্রাপ্ত নম্বর</th>
                                    <th className="border border-black">প্রাপ্ত নম্বর</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                <tr className="border border-black">
                                    <td className="border border-black">০১</td>
                                    <td className="border border-black text-left">আরবী শিক্ষা</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৩৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৮</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*Subject wise number and table end*/}
                    {/*Total Mark Start*/}
                    <div className="w-full pt-8">
                        <table className="border w-full border-black">
                            <tr>
                                <td className="pl-2">প্রাপ্তি বিভাগ  :  স্থগিত</td>
                                <td>মেধা স্থান  :  ৫</td>
                                <td>গড়  :  ৮১.০০</td>
                                <td>মোট নম্বর  :  ৪০৮</td>
                            </tr>
                        </table>
                    </div>
                    {/*Total Mark End*/}
                    {/*Comment Part Start*/}
                    <div className=" pt-5 flex gap-2">
                        <div className="w-full h-[100px] border border-black">
                            <p className="text-[12px] pl-2 pt-1">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
                        </div>
                        <div className="w-full h-[100px] border border-black">
                            <p className="text-[12px] pl-2 pt-1">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
                        </div>
                    </div>
                    {/*Comment Part End*/}
                    {/*Signature part start*/}
                    <div className="flex absolute bottom-0 w-full left-0 justify-between text-[14px] pt-[60px]">
                        <div className="text-center">
                            <p>.....................................</p>
                            <p>মুহতামিম</p>
                            <p>তারিখ : </p>
                        </div>
                        <div className="text-center">
                            <p>.....................................</p>
                            <p>নাযেম</p>
                            <p>তারিখ : </p>
                        </div>
                    </div>
                    {/*Signature part end*/}
                </div>
            </div>
        </div>
    )
}

export default Marksheet;