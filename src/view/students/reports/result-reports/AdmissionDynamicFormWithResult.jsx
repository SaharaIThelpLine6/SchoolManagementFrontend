import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import 'quill/dist/quill.snow.css';
import DefaultImageUpload from "../../../../components/Forms/DefaultImageUpload";
import { FormProvider, useForm } from "react-hook-form";
import { useGetResultSettingsDetailsQuery } from "../../../../features/userReports/userReportsSlice";
import useTranslate from "../../../../utils/Translate";

const API_URL = import.meta.env.VITE_SERVER_URL;

const AdmissionDynamicFormWithResult = forwardRef(({ query }, ref) => {

    const translate = useTranslate();
    const { data: getResultSettingsDetails } = useGetResultSettingsDetailsQuery();
    var refdiv = useRef(null);
    var rte;

    var princepalTextRef = useRef(null);
    var princepalText;
    const [previewImg, setPreviewImg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const methods = useForm();

    const { getValues } = methods;

    useImperativeHandle(ref, () => ({
        getEditorContent: () => ({
            Description1: princepalText.getHTMLCode(),
            Description2: rte.getHTMLCode(),
            reportPadImage: getValues("report_pad"),
            templatePath: selectedTemplate,         
        })
    }))
    useEffect(() => {

        
        if (getResultSettingsDetails?.ReportPadImage) {
            setPreviewImg(`${API_URL}/public${getResultSettingsDetails.ReportPadImage}`);
            setPreviewUrl(`${API_URL}/public${getResultSettingsDetails.ReportPadImage}`);
        }
    }, [getResultSettingsDetails]);
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

    setTimeout(function () {
        // console.log("===============");
        // console.log(getResultSettingsDetails);

        rte = new window.RichTextEditor(refdiv.current);
        rte.setHTMLCode(getResultSettingsDetails?.Description2 ? getResultSettingsDetails.Description2 : defaultHTML2);

        princepalText = new window.RichTextEditor(princepalTextRef.current);
        princepalText.setHTMLCode(getResultSettingsDetails?.Description1 ? getResultSettingsDetails.Description1 : defaultHTML);
    }, 0)
    return (
        <div>
            <div className="pt-0 pb-1 px-0">

                <div className="body pt-3">
                    <p className='mb-5 text-sm font-semibold text-gray-700 mt-0'>{translate("Principal Quote")}</p>

                    {/* Add a Editor  */}
                    <div className="mt-4">
                        <div ref={princepalTextRef}></div>
                    </div>
                    
                    <FormProvider {...methods}>
                        <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>{translate("Madrasha Pad Image")} (A4 size)</p>
                        <div>
                            <DefaultImageUpload registerKey="report_pad" image={previewImg}
                                setPreviewUrl={setPreviewUrl}
                                previewUrl={previewUrl} />
                        </div>
                    </FormProvider>

                    <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>{translate("From pad template")} (Optional)</p>
                    <div className="flex gap-3">
                        {["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"].map((template, i) => (
                            
                            <div
                                key={i}
                                onClick={() => {
                                    setSelectedTemplate(template);
                                    methods.setValue("report_pad", null);
                                    setPreviewImg(`/admissionForm/${template}`);
                                    setPreviewUrl(template);
                                }}
                                className={`cursor-pointer border-2 rounded-lg p-1 ${selectedTemplate === template
                                        ? "border-blue-500"
                                        : "border-transparent"
                                    }`}
                            >
                                <img src={`/admissionForm/${template}`} className="h-[200px] rounded-lg" />
                                {selectedTemplate === template && (
                                    <p className="text-center text-xs text-blue-500 mt-1">✓ Selected</p>
                                )}
                            </div>
                        ))}
                    </div>


                    <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>{translate("Office Part text")}</p>
                    <div ref={refdiv}></div>

                </div>
            </div>
        </div>
    );
});

export default AdmissionDynamicFormWithResult;