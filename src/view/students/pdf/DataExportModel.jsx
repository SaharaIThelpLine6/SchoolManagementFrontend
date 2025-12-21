import React from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";
import html2pdf from "html2pdf.js";

export default function DataExportModel({userData}) {
    const methods = useForm();
    const { handleSubmit, control } = methods;
    const translate = useTranslate();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "whyUsList",
    });

    const onSubmit = async (data) => {
        if (!userData || userData.length === 0) return;

        const { ReportName, whyUsList } = data;

        const baseColumns = Object.keys(userData[0]);
        const extraColumns = whyUsList?.map(i => i.text).filter(Boolean);
        const columns = [...baseColumns, ...extraColumns];

        const rows = userData.map(item => [
            ...baseColumns.map(col => item[col] ?? ""),
            ...extraColumns.map(() => "")
        ]);

        const container = document.createElement("div");
        container.innerHTML = `
            <div class=" ">
                <h2 class="text-center pb-4 font-bold text-[40px] font-SolaimanLipi">${ReportName}</h2>
                <table border="1" width="100%" cellpadding="8">
                    <thead>
                        <tr>
                            ${columns.map(c => `<th class="border border-black text-black align-middle pb-4 font-SolaimanLipi">${c}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r =>
                            `<tr>${r.map(c => `<td class="text-center border border-black bg-white align-middle text-black pb-4 font-SolaimanLipi">${c}</td>`).join("")}</tr>`
                        ).join("")}
                    </tbody>
                </table>
            </div>
        `;

        document.body.appendChild(container);

        await html2pdf().from(container).set({
            margin: 10,
            filename: `${ReportName || "ডেটা-এক্সপোর্ট"}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { orientation: "landscape" },
        }).save();

        document.body.removeChild(container);
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DefaultInput
                    label="Report Name"
                    registerKey="ReportName"
                    require
                    showError
                />

                <label>নতুন কলাম যুক্ত করুন</label>

                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center mb-2"> 
                    <DefaultInput registerKey={`whyUsList.${index}.text`} placeholder={`Point ${index + 1}`} /> 

                    {fields.length > 0 && (
                        <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-2 rounded" > ✕ </button>
                    )} 
                    </div>)
                )}

                <div className="gap-4 flex items-center">
                    <button type="button" onClick={() => append({ text: "" })} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded" > Add </button>
                </div>

                <div className="text-end pt-6 pb-3">
                    <button type="submit" className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush"> {translate("Save")} </button>
                </div>
            </form>
        </FormProvider>
    );
}
