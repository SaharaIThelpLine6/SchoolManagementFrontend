import React from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";

export default function DataExportModel({userData}) {
    const methods = useForm();
    const { handleSubmit, control } = methods;
    const translate = useTranslate();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "column",
    });

    const onSubmit = async (data) => {
        if (!userData || userData.length === 0) return;

        const { ReportName, column } = data;

        const baseColumns = Object.keys(userData[0]);
        // const extraColumns = column?.map(i => i.text).filter(Boolean);
        const extraColumns = column
        ?.filter(c => c.text)
        ?.map(c => ({
            name: c.text,
            size: c.size || null
        }));

        // const columns = [...baseColumns, ...extraColumns];
        const columns = [
            ...baseColumns.map(c => ({ name: c, size: null })),
            ...extraColumns
        ];

        const rows = userData.map(item => [
            ...baseColumns.map(col => item[col] ?? ""),
            ...extraColumns.map(() => "")
        ]);

        const container = document.createElement("div");
           container.id = "print-container";
        container.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; padding-top: 0; margin-top: 0px;  }
                    #print-container * { visibility: visible;}
                    #root{
                        display: none;
                    }
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
                        display: table-header-group; /* repeat header on each page */
                    }

                    tfoot {
                        display: table-footer-group;
                    }
                    #print-container {
                        position: absolute;   /* 🔴 CRITICAL FIX */
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
            <div class=" ">
                <h2 class="text-center pb-4 font-bold text-[40px] font-SolaimanLipi">${ReportName}</h2>
                <table border="1" width="100%" cellpadding="8" class="border border-black">
                    <thead>
                        <tr>
                            ${columns.map(c => `
                                <th style="${c.size ? `width:${c.size}px;` : ""}"
                                    class="border-r border-b border-black text-black align-middle pb-4 font-SolaimanLipi">
                                    ${c.name}
                                </th>
                                `).join("")
                            }
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr style="page-break-inside: avoid;">
                                ${r.map((cell, colIndex) => {
                                const col = columns[colIndex];

                                if (col.name === "logo" && cell) {
                                    return `
                                    <td style="${col.size ? `width:${col.size}px;` : ""}"
                                        class="text-center border-r border-b border-black">
                                        <img src="${cell}" alt="logo" style="max-height:60px; margin:auto;" />
                                    </td>
                                    `;
                                }

                                return `
                                    <td style="${col.size ? `width:${col.size}px;` : ""}"
                                        class="text-center border-r border-b border-black">
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
        window.print();
        window.onafterprint = () => {
            document.body.removeChild(container);
            window.onafterprint = null;
        };
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
                            <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white px-[8px] py-[8px] rounded" > ✕ </button>
                        )} 
                    </div>

                  
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
