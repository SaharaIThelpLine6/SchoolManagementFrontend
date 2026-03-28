import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery, useGetResidentialQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Editor from "../../../../components/Editor";
import DefaultImageUpload from "../../../../components/Forms/DefaultImageUpload";
import { FormProvider, useForm } from "react-hook-form";

const Delta = Quill.import('delta');
const AdmissionDynamicFormWithResult = forwardRef(({ reportData, query }, ref) => {
    const [logo, setLogo] = useState(null);
    const { data: instutionInfo } = useGetInstitutionInfoQuery();
    const { data: sessionData } = useGetSessionsQuery();
    const { data: residentialData, error: residentialError, isLoading: residentialDataLoading } = useGetResidentialQuery();
    const quillRef = useRef();
    const quillRef2 = useRef();

    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);


    const [previewImg, setPreviewImg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const methods = useForm();

    const {watch, getValues} = methods;

    // Expose getContent method to parent
    useImperativeHandle(ref, () => ({
        getEditorContent: () => ({
            Description1: quillRef.current?.root?.innerHTML,
            Description2: quillRef2.current?.root?.innerHTML,  // ✅
            reportPadImage: getValues("report_pad")
        })
    }))

    useEffect(() => {
        console.log(query);

        if (instutionInfo?.Logo?.data) {
            const buffer = Buffer.from(instutionInfo.Logo.data);
            const base64String = buffer.toString("base64");
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc);
        }
    }, [instutionInfo]);


    const selectedSession = sessionData?.find(
        (item) => item.SessionID == query.session_id
    );
    const defaultHTML = `
  <p style="font-size: 18px">মুহতারাম,<br/>
    <span style="margin-left:30px">হযরত মুহতামিম সাহেব (দা. বা.)</span>
  </p>
  <p>আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ</p>
  <p>বিনীত নিবেদন এই যে, আমি রাহাতুল জান্নাত মহিলা মাদরাসা এর যাবতীয় কানুন ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য বিনীত আবেদন করছি।</p>
`;
    const defaultHTML2 = `
<div class="grid grid-cols-4">
    <p class="text-[18px] col-span-3">নিরীক্ষকের মন্তব্য ..........................................................................................................  </p>
    <p class="text-[18px]">স্বাক্ষর ও তাং :................................</p>
</div>
<h4 class="text-[18px] font-bold mt-2">* নাযিমে তালিমাতের মন্তব্য :</h4>
<p class="text-[16px] mt-[16px] leading-[28px]">আমি আবেদনকারীকে ................................................................. জামাতে ভর্তির উপযুক্ত মনে করছি/করছি না, তাকে ................................................................ জামাতে ভর্তি হওয়ার পরামর্শ দিচ্ছি।</p>
<div class="text-end mt-6">
    <p class="border-t-2 border-black border-dotted inline-block text-[16px] font-bold">নাযিমে তালীমাতের স্বাক্ষর/সীল</p>
</div>
<h4 class="text-[18px] font-bold mt-2">* মুহতামিমের মঞ্জুরী :</h4>
<p class="text-[16px] mt-[16px] leading-[28px]">
    আবেদনকারীকে ....................................................................... জামাতে ভর্তির আবেদন মঞ্জুর করা হল।
    ভর্তি ফি.......................টাকা, মাসিক খোরাকি.......................টাকা, বেতন.......................টাকা,
    আবাসিক চার্জ/অন্যান্য.......................টাকা নির্ধারণ করা হল।
</p>
<div class="text-end mt-6">
    <p class="border-t-2 border-black border-dotted inline-block text-[16px] font-bold">মুহতামিম সাহেবের স্বাক্ষর/সীল</p>
</div>

`;
    return (
        <div>
            {
                reportData?.result.length > 0 && reportData.result.slice(0, 1).map(maritData => (
                    <React.Fragment>
                        <div className="w-full relative px-[30px] py-[30px]">
                            <div className="pt-4 pb-1 px-0">
                                <div className="header text-center border-b-2 border-black">
                                    <h1 className='text-[24px]'>{instutionInfo?.InstitutionName}</h1>
                                    <p className='text-[14px] my-[4px]'>{instutionInfo?.Address}</p>
                                    <p className='text-[14px]'>{instutionInfo?.ContactNumber}</p>
                                </div>
                                <div className="body pt-3">

                                    <p className='text-[18px] mb-2 mt-4 leading-[32px]'>
                                        <Editor
                                            ref={quillRef}
                                            readOnly={readOnly}
                                            htmlDefaultValue={defaultHTML}
                                            onSelectionChange={setRange}
                                            onTextChange={setLastChange}
                                        />
                                        {/* মুহতারাম,<br />
                                        <p className="ml-[30px]">হযরত মুহতামিম সাহেব (দা. বা.)</p>
                                        আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ
                                        বিনীত নিবেদন এই যে, আমি রাহাতুল জান্নাত মহিলা মাদরাসা এর যাবতীয় কানুন ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য বিনীত আবেদন করছি। */}

                                    </p>
                                    <div className="flex gap-3 flex-nowrap font-bold">
                                        <div className="box border border-black w-full  md:w-[45%] px-4 py-2 ">
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">নাম: {maritData.UserName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">পিতার নাম: {maritData.FatherName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">মাতার নাম: {maritData.MotherName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">জন্ম তারিখ: {maritData.DateOfBirth}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">জন্ম নিবন্ধন নং: {maritData.NIDNO}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">অভিভাবকের মোবাইল : {maritData.Mobile1}</p>
                                        </div>
                                        <div className="box border border-black w-full md:w-[55%] px-4 py-2">
                                            <div className="header_text border-b-2 border-black text-center mb-2">
                                                <p className="text-[18px] mb-2">স্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                <div className='w-full grid grid-cols-2'>
                                                    <p className='text-[18px] mb-3 font-bold'>গ্রাম/মহল্লা: {maritData.permanentVill}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>ডাক: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>থানা: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>জেলা:  {maritData.permanentPost}</p>
                                                </div>
                                            </div>

                                            <div className="header_text border-b-2 border-black text-center mt-2">
                                                <p className="text-[18px]">অস্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                <div className='w-full grid grid-cols-2'>
                                                    <p className='text-[18px] mb-3 font-bold'>গ্রাম/মহল্লা: {maritData.permanentVill}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>ডাক: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>থানা: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>জেলা:  {maritData.permanentPost}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-y-[20px] justify-between mt-2">
                                        <p className='relative text-[18px]'>অভিভাবকের নাম: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>সম্পর্ক: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>স্বাক্ষর: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>

                                        <p className='relative text-[18px]'>তালিমী মুরব্বীর নাম: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>স্বাক্ষর: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>তারিখ: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>

                                    </div>
                                    <div className="text-center pt-[20px]">
                                        <h3 className='font-bold text-[20px] border-[3px] border-black inline-block px-4 py-2'>প্রথম সাময়িক পরীক্ষার ফলাফল</h3>
                                    </div>
                                    <div className="grid grid-cols-2 pt-4 gap-5">
                                        {/* First table */}

                                    </div>
                                    <div className="grid grid-cols-4 pt-4">
                                        <p className="text-[18px] font-bold">সর্বমোট প্রাপ্ত নম্বর : 569</p>
                                        <p className="text-[18px] font-bold">গড় নম্বর : 94.83</p>
                                        <p className="text-[18px] font-bold">বিভাগ : মুমতাজ</p>
                                        <p className="text-[18px] font-bold">মেধাস্থান : 0</p>
                                    </div>
                                    <div className="grid grid-cols-4 mt-[20px]">
                                        <p className="text-[18px] col-span-3">যে বিভাগে/জামাতে ভর্তি হবে ইচ্ছুক :............................................................ </p>
                                        <p className="text-[18px]">স্বাক্ষর :.............</p>
                                    </div>
                                    <p className="text-[18px] mt-4">দারুল ইকামা/শ্রেণী শিক্ষকের মতামত :</p>

                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black inline-block text-[16px]'>অভিভাবকের স্বাক্ষর</p>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-[20px] border-[2px] border-black font-bold inline-block py-2 px-2 rounded-[4px]">অফিসের অংশ</h3>
                                    </div>
                                    {/* Add a Editor  */}
                                    <div className="mt-4">
                                        <Editor
                                            ref={quillRef2}
                                            readOnly={readOnly}
                                            htmlDefaultValue={reportData?.formSettings?.Description2 ?? defaultHTML2}
                                            onSelectionChange={setRange}
                                            onTextChange={setLastChange}
                                        />
                                    </div>
                                    <FormProvider {...methods}>
                                        <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>Madrasha Pad Image (A4 size)</p>
                                        <DefaultImageUpload registerKey="report_pad" image={previewImg}
                                            setPreviewUrl={setPreviewUrl}
                                            previewUrl={previewUrl} />
                                    </FormProvider>

                                    {/* <div className="grid grid-cols-4">
                                        <p className="text-[18px] col-span-3">নিরীক্ষকের মন্তব্য ..........................................................................................................  </p>
                                        <p className="text-[18px]">স্বাক্ষর ও তাং :................................</p>
                                    </div>
                                    <h4 className="text-[18px] font-bold mt-2">* নাযিমে তালিমাতের মন্তব্য :</h4>
                                    <p className="text-[16px] mt-[16px] leading-[28px]">আমি আবেদনকারীকে ................................................................. জামাতে ভর্তির উপযুক্ত মনে করছি/করছি না, তাকে ................................................................ জামাতে ভর্তি হওয়ার পরামর্শ দিচ্ছি।</p>
                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black border-dotted inline-block text-[16px] font-bold'>নাযিমে তালীমাতের স্বাক্ষর/সীল</p>
                                    </div>
                                    <h4 className="text-[18px] font-bold mt-2">* মুহতামিমের মঞ্জুরী :</h4>
                                    <p className="text-[16px] mt-[16px] leading-[28px]">
                                        আবেদনকারীকে ....................................................................... জামাতে ভর্তির আবেদন মঞ্জুর করা হল।
                                        ভর্তি ফি.......................টাকা, মাসিক খোরাকি.......................টাকা, বেতন.......................টাকা,
                                        আবাসিক চার্জ/অন্যান্য.......................টাকা নির্ধারণ করা হল।
                                    </p>
                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black border-dotted inline-block text-[16px] font-bold'>মুহতামিম সাহেবের স্বাক্ষর/সীল</p>
                                    </div> */}

                                </div>
                            </div>
                        </div>



                    </React.Fragment>
                ))
            }
        </div>
    );
});

export default AdmissionDynamicFormWithResult;