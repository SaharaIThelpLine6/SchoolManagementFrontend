import React from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

export default function DataExportModel({ dataExport }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    console.log(institutionInfo, "institutionInfo")

    const userData = dataExport?.data;
    const methods = useForm();
    const { handleSubmit, control } = methods;
    const translate = useTranslate();

    console.log(dataExport, "dataExport")
    console.log(userData, "userData")

    const { fields, append, remove } = useFieldArray({
        control,
        name: "column",
    });

    const onSubmit = async (data) => {
        // ✅ SweetAlert Confirmation before generating report
        const result = await Swal.fire({
            title: translate("Are you sure?"),
            text: translate("You want to generate this report?"),
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: translate("Yes, generate it!"),
            cancelButtonText: translate("Cancel"),
            width: "400px",
        });

        if (!result.isConfirmed) return;

        console.log(userData);

        if (!userData || userData.length === 0) return;

        const { ReportName, column } = data;

        const baseColumns = Object.keys(userData[0]);
        const extraColumns = column
            ?.filter((c) => c.text)
            ?.map((c) => ({
                name: c.text,
                size: c.size || null,
            }));

        const columns = [
            ...baseColumns.map((c) => ({ name: c, size: null })),
            ...extraColumns,
        ];

        const rows = userData.map((item) => [
            ...baseColumns.map((col) => item[col] ?? ""),
            ...extraColumns.map(() => ""),
        ]);

        // ✅ সেশন ও ক্লাস নাম
        const sessionName = dataExport?.SessionName || "";
        const className = dataExport?.ClassName || "";

        const container = document.createElement("div");
        container.id = "print-container";
        container.innerHTML = `
        <style>
            @media print {
                body * { visibility: hidden; padding-top: 0; margin-top: 0px; }
                #print-container * { visibility: visible; }
                #root { display: none; }
                table {
                    page-break-inside: auto;
                    border-collapse: collapse;
                }
                tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto;
                }
                td, th {
                    page-break-inside: avoid !important;
                }
                thead {
                    display: table-header-group;
                }
                tfoot {
                    display: table-footer-group;
                }
                #print-container {
                    position: absolute;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
            }
        </style>

        <div style="padding: 20px 30px; font-family: 'SolaimanLipi', sans-serif; color: #000;">

            <!-- ✅ ইনস্টিটিউশন হেডার -->
            <div style="text-align: center; margin-bottom: 6px;">
                <h1 style="font-size: 26px; font-weight: bold; margin: 0; font-family: 'SolaimanLipi';">
                    ${institutionInfo?.InstitutionName || ""}
                </h1>
                <p style="font-size: 15px; margin: 4px 0 0 0; color: #333; font-family: 'SolaimanLipi';">
                    ${institutionInfo?.PoliceStation || ""}, ${institutionInfo?.District || ""}
                </p>
            </div>

            <!-- ✅ সেশন বক্স -->
            <div style="display: flex; justify-content: center; align-items: center; margin: 14px 0;">
                <div style="
                    border: 1.5px solid #000;
                    border-radius: 4px;
                    padding: 5px 28px;
                    font-size: 15px;
                    font-weight: bold;
                    font-family: 'SolaimanLipi';
                    background-color: #f9f9f9;
                ">
                    শিক্ষাবর্ষ : ${sessionName}
                </div>
            </div>

            <!-- ✅ ক্লাস ও প্রিন্ট তারিখ -->
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'SolaimanLipi';
            ">
                <p style="font-weight: bold; font-size: 15px; margin: 0;">
                    শ্রেণি/জামাতঃ ${className}
                </p>
                <p style="font-size: 13px; margin: 0; color: #444;">
                    প্রিন্ট: ${new Date().toLocaleDateString('bn-BD')}
                </p>
            </div>

            <!-- ✅ রিপোর্ট টাইটেল -->
            <h2 style="
                text-align: center;
                padding-bottom: 8px;
                margin: 0px 0 10px 0;
                font-weight: bold;
                font-size: 22px;
                font-family: 'SolaimanLipi';
            ">
                <span style="
                    border-bottom: 2px solid #000;
                    padding-bottom: 4px;
                    display: inline-block;
                ">
                    ${ReportName}
                </span>
            </h2>

            <!-- ✅ টেবিল -->
            <table border="1" width="100%" cellpadding="6" style="
                border-collapse: collapse;
                border: 1px solid #000;
                font-family: 'SolaimanLipiNormal', 'SolaimanLipi', sans-serif;
                font-size: 13px;
            ">
                <thead>
                    <tr style="background-color: #eaeaea;">
                        ${columns.map(c => `
                            <th style="
                                ${c.size ? `width:${c.size}px;` : ""}
                                border: 1px solid #000;
                                padding: 6px 4px;
                                text-align: center;
                                font-weight: bold;
                                font-family: 'SolaimanLipi';
                                font-size: 13px;
                            ">
                                ${c.name == 'logo' ? translate('Image') : translate(c.name)}
                            </th>
                        `).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr style="page-break-inside: avoid;">
                            ${r.map((cell, colIndex) => {
            const col = columns[colIndex];
            if (col.name == "logo") {
                return `
                                        <td style="
                                            ${col.size ? `width:${col.size}px;` : ""}
                                            border: 1px solid #000;
                                            padding: 4px;
                                            text-align: center;
                                        ">
                                            <img
                                                src="${cell || "avatar.png"}"
                                                alt="logo"
                                                style="max-height: 70px; margin: auto; width: 55px; object-fit: cover; border-radius: 4px;"
                                                onerror="this.onerror=null; this.src='/avatar.png';"
                                            />
                                        </td>
                                    `;
            }

            return `
                                    <td style="
                                        ${col.size ? `width:${col.size}px;` : ""}
                                        border: 1px solid #000;
                                        padding: 6px 5px;
                                        text-align: center;
                                        font-family: 'SolaimanLipiNormal', 'SolaimanLipi';
                                    ">
                                        ${cell}
                                    </td>
                                `;
        }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

        document.body.appendChild(container);

        setTimeout(() => {
            window.print();

            const printContainer = container;
            const cleanup = () => {
                if (printContainer.parentNode) {
                    document.body.removeChild(printContainer);
                }
                window.onafterprint = null;
                window.onfocus = null;
            };
            window.onafterprint = cleanup;
            let focusTimeout = null;
            window.onfocus = () => {
                if (focusTimeout) {
                    clearTimeout(focusTimeout);
                    focusTimeout = null;
                }
                focusTimeout = setTimeout(() => {
                    cleanup();
                    focusTimeout = null;
                }, 500);
            };
            setTimeout(() => {
                if (printContainer.parentNode) {
                    cleanup();
                }
            }, 1000);
        }, 1000);
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
                        <div className="flex w-full gap-[10px] items-end">
                            <DefaultInput registerKey={`column.${index}.text`} placeholder={`Point ${index + 1}`} />
                            <div className="w-[120px]">
                                <DefaultInput label={"Size in px"} type="number" registerKey={`column.${index}.size`} placeholder={`Point ${index + 1}`} />
                            </div>
                            {fields.length > 0 && (
                                <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-[8px] py-[8px] rounded"> ✕ </button>
                            )}
                        </div>
                    </div>
                ))}

                <div className="gap-4 flex items-center">
                    <button type="button" onClick={() => append({ text: "" })} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"> Add </button>
                </div>

                <div className="text-end pt-6 pb-3">
                    <button type="submit" className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush"> {translate("Save")} </button>
                </div>
            </form>
        </FormProvider>
    );
}
























// import React from "react";
// import { FormProvider, useFieldArray, useForm } from "react-hook-form";
// import useTranslate from "../../../utils/Translate";
// import DefaultInput from "../../../components/Forms/DefaultInput";
// import Swal from "sweetalert2";
// import "sweetalert2/dist/sweetalert2.min.css";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

// export default function DataExportModel({ dataExport }) {
//     const { data: institutionInfo } = useGetInstitutionInfoQuery();
//     console.log(institutionInfo, "institutionInfo")

//     const userData = dataExport?.data;
//     const methods = useForm();
//     const { handleSubmit, control } = methods;
//     const translate = useTranslate();

//     console.log(dataExport, "dataExport")
//     console.log(userData, "userData")

//     const { fields, append, remove } = useFieldArray({
//         control,
//         name: "column",
//     });

//     const onSubmit = async (data) => {
//         // ✅ SweetAlert Confirmation before generating report
//         const result = await Swal.fire({
//             title: translate("Are you sure?"),
//             text: translate("You want to generate this report?"),
//             icon: "question",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: translate("Yes, generate it!"),
//             cancelButtonText: translate("Cancel"),
//             width: "400px",
//         });

//         if (!result.isConfirmed) return;

//         console.log(userData);

//         if (!userData || userData.length === 0) return;

//         const { ReportName, column } = data;

//         const baseColumns = Object.keys(userData[0]);
//         const extraColumns = column
//             ?.filter((c) => c.text)
//             ?.map((c) => ({
//                 name: c.text,
//                 size: c.size || null,
//             }));

//         const columns = [
//             ...baseColumns.map((c) => ({ name: c, size: null })),
//             ...extraColumns,
//         ];

//         const rows = userData.map((item) => [
//             ...baseColumns.map((col) => item[col] ?? ""),
//             ...extraColumns.map(() => ""),
//         ]);

//         // ✅ সেশন ও ক্লাস নাম
//         const sessionName = dataExport?.SessionName || "";
//         const className = dataExport?.ClassName || "";

//         const container = document.createElement("div");
//         container.id = "print-container";
//         container.innerHTML = `
//         <style>
//             @media print {
//                 body * { visibility: hidden; padding-top: 0; margin-top: 0px; }
//                 #print-container * { visibility: visible; }
//                 #root { display: none; }
//                 table {
//                     page-break-inside: auto;
//                     border-collapse: collapse;
//                 }
//                 tr {
//                     page-break-inside: avoid !important;
//                     page-break-after: auto;
//                 }
//                 td, th {
//                     page-break-inside: avoid !important;
//                 }
//                 thead {
//                     display: table-header-group;
//                 }
//                 tfoot {
//                     display: table-footer-group;
//                 }
//                 #print-container {
//                     position: absolute;
//                     width: 100%;
//                     margin: 0;
//                     padding: 0;
//                 }
//             }
//         </style>

//         <div style="padding: 20px 30px; font-family: 'SolaimanLipi', sans-serif; color: #000;">

//             <!-- ✅ ইনস্টিটিউশন হেডার -->
//             <div style="text-align: center; margin-bottom: 6px;">
//                 <h1 style="font-size: 26px; font-weight: bold; margin: 0; font-family: 'SolaimanLipi';">
//                     ${institutionInfo?.InstitutionName || ""}
//                 </h1>
//                 <p style="font-size: 15px; margin: 4px 0 0 0; color: #333; font-family: 'SolaimanLipi';">
//                     ${institutionInfo?.PoliceStation || ""}, ${institutionInfo?.District || ""}
//                 </p>
//             </div>

//             <!-- ✅ সেশন বক্স -->
//             <div style="display: flex; justify-content: center; align-items: center; margin: 14px 0;">
//                 <div style="
//                     border: 1.5px solid #000;
//                     border-radius: 4px;
//                     padding: 5px 28px;
//                     font-size: 15px;
//                     font-weight: bold;
//                     font-family: 'SolaimanLipi';
//                     background-color: #f9f9f9;
//                 ">
//                     শিক্ষাবর্ষ : ${sessionName}
//                 </div>
//             </div>

//             <!-- ✅ ক্লাস ও প্রিন্ট তারিখ -->
//             <div style="
//                 display: flex;
//                 justify-content: space-between;
//                 align-items: center;
//                 font-family: 'SolaimanLipi';
//             ">
//                 <p style="font-weight: bold; font-size: 15px; margin: 0;">
//                     শ্রেণি/জামাতঃ ${className}
//                 </p>
//                 <p style="font-size: 13px; margin: 0; color: #444;">
//                     প্রিন্ট: ${new Date().toLocaleDateString('bn-BD')}
//                 </p>
//             </div>

//             <!-- ✅ রিপোর্ট টাইটেল -->
//             <h2 style="
//                 text-align: center;
//                 padding-bottom: 8px;
//                 margin: 0px 0 10px 0;
//                 font-weight: bold;
//                 font-size: 22px;
//                 font-family: 'SolaimanLipi';
//             ">
//                 <span style="
//                     border-bottom: 2px solid #000;
//                     padding-bottom: 4px;
//                     display: inline-block;
//                 ">
//                     ${ReportName}
//                 </span>
//             </h2>

//             <!-- ✅ টেবিল -->
//             <table border="1" width="100%" cellpadding="6" style="
//                 border-collapse: collapse;
//                 border: 1px solid #000;
//                 font-family: 'SolaimanLipiNormal', 'SolaimanLipi', sans-serif;
//                 font-size: 13px;
//             ">
//                 <thead>
//                     <tr style="background-color: #eaeaea;">
//                         ${columns.map(c => `
//                             <th style="
//                                 ${c.size ? `width:${c.size}px;` : ""}
//                                 border: 1px solid #000;
//                                 padding: 6px 4px;
//                                 text-align: center;
//                                 font-weight: bold;
//                                 font-family: 'SolaimanLipi';
//                                 font-size: 13px;
//                             ">
//                                 ${c.name == 'logo' ? translate('Image') : translate(c.name)}
//                             </th>
//                         `).join("")}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${rows.map(r => `
//                         <tr style="page-break-inside: avoid;">
//                             ${r.map((cell, colIndex) => {
//             const col = columns[colIndex];
//             if (col.name == "logo") {
//                 return `
//                                         <td style="
//                                             ${col.size ? `width:${col.size}px;` : ""}
//                                             border: 1px solid #000;
//                                             padding: 4px;
//                                             text-align: center;
//                                         ">
//                                             <img
//                                                 src="${cell || "avatar.png"}"
//                                                 alt="logo"
//                                                 style="max-height: 70px; margin: auto; width: 55px; object-fit: cover; border-radius: 4px;"
//                                                 onerror="this.onerror=null; this.src='/avatar.png';"
//                                             />
//                                         </td>
//                                     `;
//             }

//             return `
//                                     <td style="
//                                         ${col.size ? `width:${col.size}px;` : ""}
//                                         border: 1px solid #000;
//                                         padding: 6px 5px;
//                                         text-align: center;
//                                         font-family: 'SolaimanLipiNormal', 'SolaimanLipi';
//                                     ">
//                                         ${cell}
//                                     </td>
//                                 `;
//         }).join("")}
//                         </tr>
//                     `).join("")}
//                 </tbody>
//             </table>
//         </div>
//     `;

//         document.body.appendChild(container);

//         setTimeout(() => {
//             window.print();

//             const printContainer = container;
//             const cleanup = () => {
//                 if (printContainer.parentNode) {
//                     document.body.removeChild(printContainer);
//                 }
//                 window.onafterprint = null;
//                 window.onfocus = null;
//             };
//             window.onafterprint = cleanup;
//             let focusTimeout = null;
//             window.onfocus = () => {
//                 if (focusTimeout) {
//                     clearTimeout(focusTimeout);
//                     focusTimeout = null;
//                 }
//                 focusTimeout = setTimeout(() => {
//                     cleanup();
//                     focusTimeout = null;
//                 }, 500);
//             };
//             setTimeout(() => {
//                 if (printContainer.parentNode) {
//                     cleanup();
//                 }
//             }, 1000);
//         }, 1000);
//     };

//     return (
//         <FormProvider {...methods}>
//             <form onSubmit={handleSubmit(onSubmit)}>
//                 <DefaultInput
//                     label="Report Name"
//                     registerKey="ReportName"
//                     require
//                     showError
//                 />

//                 <label>নতুন কলাম যুক্ত করুন</label>

//                 {fields.map((field, index) => (
//                     <div key={field.id} className="flex gap-2 items-center mb-2">
//                         <div className="flex w-full gap-[10px] items-end">
//                             <DefaultInput registerKey={`column.${index}.text`} placeholder={`Point ${index + 1}`} />
//                             <div className="w-[120px]">
//                                 <DefaultInput label={"Size in px"} type="number" registerKey={`column.${index}.size`} placeholder={`Point ${index + 1}`} />
//                             </div>
//                             {fields.length > 0 && (
//                                 <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-[8px] py-[8px] rounded"> ✕ </button>
//                             )}
//                         </div>
//                     </div>
//                 ))}

//                 <div className="gap-4 flex items-center">
//                     <button type="button" onClick={() => append({ text: "" })} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"> Add </button>
//                 </div>

//                 <div className="text-end pt-6 pb-3">
//                     <button type="submit" className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush"> {translate("Save")} </button>
//                 </div>
//             </form>
//         </FormProvider>
//     );
// }
