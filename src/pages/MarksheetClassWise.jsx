const MarksheetClassWise = () => {
    return (
        <div >
            <div className="w-[1076px] h-[750px] mx-auto relative bg-white font-SolaimanLipi">
                <div className="pt-0 pb-1 px-2 bg-white">
                    {/*Heading part start*/}
                    <div className="flex justify-around">
                        {/*Total Student Table start*/}
                        <div className="text-[14px] pt-1">
                            <h1 className="bg-[#a8a6a6] text-white text-center text-[14px]">মোট পরীক্ষার্থী = ৩১</h1>
                            <table className="w-[140px]">
                                <tbody className=" border border-black w-full">
                                    <tr>
                                        <td className="text-start pl-2">মুমতায</td>
                                        <td className="w-12 text-end">=</td>
                                        <td className="px-3">১১</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জা.জি.মুরতাযে</td>
                                        <td className="w-12 text-end ">=</td>
                                        <td className="pl-3 ">১২</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জা.জিদ্দান</td>
                                        <td className="w-12 text-end ">=</td>
                                        <td className="pl-3">০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জায়্যেদ</td>
                                        <td className="w-12 text-end ">=</td>
                                        <td className="pl-3">০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">মাকবুল</td>
                                        <td className="w-12 text-end ">=</td>
                                        <td className="pl-3">২</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">রাসেব</td>
                                        <td className="w-12 text-end ">=</td>
                                        <td className="pl-3">১</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/*Total Student Table end*/}
                        {/*Heading Title Start*/}
                        <div className="mx-auto text-center">
                            <h2 className="text-[22px] font-medium">জামিয়াতুস সুন্নাহ লিলবানাত বসুরহাট (বসুরহাট মহিলা মাদরাসা)</h2>
                            <h3 className="">কোম্পানিগঞ্জ, নোয়াখালী</h3>
                            <h3 className="">২য় সাময়িক পরীক্ষা - ২০২৪ইং</h3>
                            <h3 className="font-semibold border-2 border-black rounded-md p-1 w-fit mx-auto">ফলাফল(নম্বরপত্র)</h3>
                            <h3 className="">শ্রেনী/জামাত : প্রথম শ্রেণী</h3>
                        </div>
                        {/*Heading Title End*/}
                        {/*Grade Determination Start*/}
                        <div className="text-[14px] pt-1">
                            <p className="bg-[#a8a6a6] text-white text-center text-[14px]">মোট বিষয় ৮ টি - পূর্ণমান ১০০* = ৮০০</p>
                            <table className="w-[220px]">
                                <tbody className="border border-black w-full">
                                    <tr>
                                        <td className="text-start pl-2">মুমতাজ</td>
                                        <td className="">:</td>
                                        <td className="pl-3">৮০ X</td>
                                        <td className="pr-1">৮ = ৪০০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">মুমতায</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3 ">৮০ X</td>
                                        <td className="pr-1 ">৮ = ৬৪০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জা.জি.মুরতাযে</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3 ">৬০ X</td>
                                        <td className="pr-1 ">৮ = ৪৮০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জা.জিদ্দান</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3">৫০ X</td>
                                        <td className="pr-1 ">৮ = ৪০০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">জায়্যেদ</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3">৪০ X</td>
                                        <td className="pr-1 ">৮ = ৩২০</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">মাকবুল</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3">৩৩ X</td>
                                        <td className="pr-1 ">৮ = ২৬৪</td>
                                    </tr>
                                    <tr>
                                        <td className="text-start pl-2">রাসেব</td>
                                        <td className=" ">:</td>
                                        <td className="pl-3">১ X</td>
                                        <td className="pr-1 ">৮ = ৮</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/*Grade Determination End*/}
                    </div>
                    {/*Heading part end*/}
                    {/*Marksheet Body Start*/}
                    <div className="pt-1">
                        <table className="w-full text-center text-[14px]">
                            <thead className="border border-black">
                                <tr>
                                    <td className="border border-black px-1">ক্র:</td>
                                    <td className="border border-black">আইডি নং</td>
                                    <td className="border border-black w-52">শিক্ষার্থীর নাম</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">কালিমা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">ইংরেজী</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">বাংলা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">গণিত </td>
                                    <td className="border border-black py-1 [writing-mode:vertical-rl]">মাসআলা ও দোয়া</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">হাদীস</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">আরবী লিখা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">আদব আখলাক</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">কালিমা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">ইংরেজী</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">বাংলা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">গণিত </td>
                                    <td className="border border-black py-1 [writing-mode:vertical-rl]">মাসআলা ও দোয়া</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">হাদীস</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">আরবী লিখা</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">আদব আখলাক</td>
                                    <td className="border border-black [writing-mode:vertical-rl]">আদব আখলাক</td>
                                    <td className="border border-black">মোট</td>
                                    <td className="border border-black">গড়</td>
                                    <td className="border border-black">বিভাগ</td>
                                    <td className="border border-black">স্থান</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">১</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১</td>
                                </tr>
                                <tr>
                                    <td className="border border-black">২</td>
                                    <td className="border border-black">৪১৭১৩</td>
                                    <td className="border border-black text-left pl-1">খাজিদা আক্তার সাজিয়া</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৮</td>
                                    <td className="border border-black">৯৭</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">৯২</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">১০০</td>
                                    <td className="border border-black">৯৩</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৯৫</td>
                                    <td className="border border-black">৭৬৭</td>
                                    <td className="border border-black">৯৫.৮৮</td>
                                    <td className="border border-black">মুমতায</td>
                                    <td className="border border-black">১৯</td>
                                </tr>

                            </tbody>

                            <tfoot>
                                <tr>
                                    <td className="text-start" colSpan={11} height={150}>
                                        {/* <div className="text-center">
                                            <p>.....................................</p>
                                            <p>মুহতামিম</p>
                                            <p>তারিখ : </p>
                                        </div> */}
                                        <div className="relative h-full">
                                            <div className="absolute text-center w-auto left-0 top-0 pt-5">
                                                <img src="https://images.pexels.com/photos/29204314/pexels-photo-29204314/free-photo-of-modern-city-architecture-against-blue-sky.jpeg?auto=compress&cs=tinysrgb&w=60&h=50&dpr=1" alt="" />
                                                <p>.....................................</p>
                                                <p>নাযেম</p>
                                                <p>তারিখ : </p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td> */}
                                    <td className="" height={150} colSpan={11}>
                                        <div className="relative h-full">
                                            <div className="absolute text-center w-auto right-0 top-0 pt-5">
                                                <img src="https://images.pexels.com/photos/29204314/pexels-photo-29204314/free-photo-of-modern-city-architecture-against-blue-sky.jpeg?auto=compress&cs=tinysrgb&w=60&h=50&dpr=1" alt="" />
                                                <p>.....................................</p>
                                                <p>নাযেম</p>
                                                <p>তারিখ : </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        {/* <table className="w-full">
                            
                        </table> */}
                    </div>
                    {/*Marksheet Body End*/}
                    {/*Signature part start*/}
                    {/* <div className="flex absolute bottom-0 w-full  justify-around text-[14px] pt-[60px]">


                    </div> */}
                    {/*Signature part end*/}
                </div>
            </div>
        </div>
    )
}

export default MarksheetClassWise;