import React, { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";
import {
    useGetInstitutionInfoQuery,
    useGetAllStudentDataExportTemplatesQuery,
    useCreateStudentDataExportTemplateMutation,
    useDeleteStudentDataExportTemplateMutation,
    useDeleteAllStudentDataExportTemplatesMutation,
} from "../../../features/settings/settingsQuerySlice";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { useGetLabelNameListsQuery } from "../../../features/result/resultSilce";




export default function DataExportModel({ dataExport }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const userData = dataExport?.data;
    const methods = useForm();
    const { handleSubmit, control, reset } = methods;
    const translate = useTranslate();
    const { data } = useGetLabelNameListsQuery();


    // ✅ allColumns
    const allColumns = [
        { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
        { id: 'ID', label: `${data?.[0]?.StudentIDLabel ? data?.[0]?.StudentIDLabel : "ID"}`, field: 'StudentCode' },
        { id: 'Name', label: 'Name', field: 'StudentName' },
        { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
        { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
        { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
        { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
        { id: 'E-mail', label: 'E-mail', field: 'Email' },
        { id: 'Session', label: 'Session', field: 'SessionName' },
        { id: 'Class', label: `${data?.[0]?.ClassNameLabel ? data?.[0]?.ClassNameLabel : "Class"}`, field: 'ClassName' },
        { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
        { id: 'Admission Serial', label: `${data?.[0]?.AdmissionIDLabel ? data?.[0]?.AdmissionIDLabel : "ID"}`, field: 'AdmissionSerial' },
        { id: 'Gender', label: 'Gender', field: 'GenderID' },
        { id: 'Residence', label: 'Residence', field: 'ResidentialName' },
        { id: 'New/Old', label: 'New/Old', field: 'NewOldId' },
        { id: 'Date Of Birth', label: 'Date of Birth', field: 'DateOfBirth' },
        { id: 'NID/Birth Registration', label: 'NID/Birth Registration', field: 'NIDNO' },
        { id: 'Blood Group', label: 'Blood Group', field: 'BloodGroup' },
        { id: 'permanentDivision', label: 'Permanent Division', field: 'PermanentDivisionName' },
        { id: 'permanentDistrict', label: 'Permanent District', field: 'PermanentDistrictName' },
        { id: 'permanentPoliceStation', label: 'Permanent Police Station', field: 'PoliceStationName' },
        { id: 'permanentPostOffice', label: 'Permanent Post Office', field: 'permanentPost' },
        { id: 'permanentVillage', label: 'Permanent Village', field: 'permanentVill' },
        { id: 'transientDivision', label: 'Transient Division', field: 'TransientDivisionName' },
        { id: 'transientDistrict', label: 'Transient District', field: 'TransientDistrictName' },
        { id: 'transientPoliceStation', label: 'Transient Police Station', field: 'TransientPoliceStationName' },
        { id: 'transientPostOffice', label: 'Transient Post Office', field: 'TransientPost' },
        { id: 'transientVillage', label: 'Transient Village', field: 'TransientVill' },
        { id: 'Financial Status', label: 'Financial Status', field: 'FinancialStatus' },
        { id: 'User Active', label: 'User Active', field: 'UserActiveName' },
    ];

    const [selectedColumns, setSelectedColumns] = useState([]);

    const {
        data: templatesData,
        isLoading: isLoadingTemplates,
        isError: isErrorTemplates,
        error: templatesError,
        refetch: refetchTemplates,
    } = useGetAllStudentDataExportTemplatesQuery();


    const [createTemplate, { isLoading: isCreating }] =
        useCreateStudentDataExportTemplateMutation();

    const [deleteTemplate, { isLoading: isDeleting }] =
        useDeleteStudentDataExportTemplateMutation();

    const [deleteAllTemplates, { isLoading: isDeletingAll }] =
        useDeleteAllStudentDataExportTemplatesMutation();

    const reports = templatesData?.data || [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: "column",
    });

    /* ============================================================
       ✅ Checkbox handlers
    ============================================================ */
    const handleColumnToggle = (colId) => {
        setSelectedColumns((prev) =>
            prev.includes(colId)
                ? prev.filter((id) => id !== colId)
                : [...prev, colId]
        );
    };

    const handleSelectAll = () => {
        if (selectedColumns.length === allColumns.length) {
            setSelectedColumns([]);
            toast.info(translate("All columns deselected"));
        } else {
            setSelectedColumns(allColumns.map((col) => col.id));
            toast.success(translate("All columns selected"));
        }
    };

    /* ============================================================
       ✅ Delete single — FieldKey দিয়ে
    ============================================================ */
    const handleRemoveReport = async (fieldKey) => {
        console.log("🗑️ handleRemoveReport — fieldKey:", fieldKey);

        if (!fieldKey) {
            toast.error(translate("Invalid template"));
            return;
        }

        // ✅ SweetAlert2 Confirm
        const result = await Swal.fire({
            title: translate('Are you sure?'),
            text: translate("This report will be permanently deleted."),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: translate('Yes, remove'),
            cancelButtonText: translate('Cancel'),
            reverseButtons: true,
            heightAuto: false,           // 👈 modal এর সাথে conflict এড়াতে
            target: document.body,       // 👈 modal এর বাইরে render
            didOpen: () => {
                document.body.style.overflow = 'hidden';
            },
            willClose: () => {
                document.body.style.overflow = '';
            },
        });

        if (!result.isConfirmed) return;

        // ✅ এখন delete করুন
        try {
            const res = await deleteTemplate(fieldKey).unwrap();
            console.log("✅ Deleted:", res);
            toast.success(translate("Report removed"));
        } catch (err) {
            console.error("❌ Delete error:", err);
            toast.error(err?.data?.error || translate("Failed to delete report"));
        }
    };

    /* ============================================================
       ✅ Clear all
    ============================================================ */

    const handleClearAllReports = async (e) => {
        e?.stopPropagation(); // 👈 এইটা add করুন

        if (reports.length === 0) {
            toast.info(translate("No reports to clear"));
            return;
        }

        const result = await Swal.fire({
            title: translate('Are you sure?'),
            text: translate("All reports will be permanently deleted."),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: translate('Yes, clear all'),
            cancelButtonText: translate('Cancel'),
            reverseButtons: true,
            // 👇 এই line important — SweetAlert2 কে সবচেয়ে উপরে render করবে
            didOpen: () => {
                document.body.style.overflow = 'hidden';
            },
            willClose: () => {
                document.body.style.overflow = '';
            },
        });

        if (!result.isConfirmed) return;

        try {
            const res = await deleteAllTemplates().unwrap();
            toast.success(`${translate("All reports cleared")} — ${res.deletedCount || 0}`);
        } catch (err) {
            toast.error(err?.data?.error || translate("Failed to clear all"));
        }
    };

    /* ============================================================
       ✅ Submit
    ============================================================ */
    const onSubmit = async (data) => {
        if (selectedColumns.length === 0) {
            toast.error(translate("Please select at least one column"));
            return;
        }

        if (!data.ReportName?.trim()) {
            toast.error(translate("Please enter a report name"));
            return;
        }

        const customColumnIds = (data.column || [])
            .filter((c) => c.text)
            .map((c) => `custom_${c.text}`);

        const payload = {
            ReportName: data.ReportName.trim(),
            selectedColumns: [...selectedColumns, ...customColumnIds],
        };

        console.log("📤 Payload:", payload);

        try {
            const res = await createTemplate(payload).unwrap();
            toast.success(
                `${translate("Report saved")} — ${res?.data?.FieldValue?.ReportName || ""}`
            );
            reset({ ReportName: "", column: [] });
            setSelectedColumns([]);
        } catch (err) {
            console.error("Save error:", err);
            toast.error(err?.data?.error || translate("Failed to save report"));
        }
    };

    /* ============================================================
       ✅ Helpers
    ============================================================ */
    const buildColumns = (report) => {
        const selected = report?.selectedColumns || [];
        return selected
            .map((id) => {
                if (typeof id === "string" && id.startsWith("custom_")) {
                    const label = id.replace(/^custom_/, "");
                    return { id, name: label, label, field: label, size: null, type: "text", isCustom: true };
                }
                const base = allColumns.find((c) => c.id === id);
                if (!base) return null;
                return {
                    id: base.id, name: base.field, label: base.label, field: base.field,
                    size: null, type: base.type || "text", isCustom: false,
                };
            })
            .filter(Boolean);
    };

    const buildRows = (columns) => {
        if (!userData) return [];
        return userData.map((item) => {
            const row = {};
            columns.forEach((col) => {
                if (col.isCustom) row[col.id] = "";
                else row[col.id] = item[col.field] ?? "";
            });
            return row;
        });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* ============================================================
                    ✅ FORM SECTION
                ============================================================ */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            {translate("Data Export Configuration")}
                        </h3>
                    </div>

                    <div className="p-5 space-y-4">
                        <DefaultInput
                            label="Report Name"
                            registerKey="ReportName"
                            require
                            showError
                        />

                        {/* ✅ Select Columns */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                    <label className="font-bold text-gray-800 text-sm">
                                        {translate("Select Columns")}
                                    </label>
                                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                        {selectedColumns.length} / {allColumns.length}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${selectedColumns.length === allColumns.length
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-blue-50 text-blue-600 border-blue-200"
                                        }`}
                                >
                                    {selectedColumns.length === allColumns.length
                                        ? translate("Deselect All")
                                        : translate("Select All")}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 shadow-sm max-h-[420px] overflow-y-auto">
                                {allColumns.map((col) => {
                                    const isChecked = selectedColumns.includes(col.id);
                                    return (
                                        <label
                                            key={col.id}
                                            className={`group flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg border ${isChecked
                                                ? "bg-blue-50 border-blue-400 ring-1 ring-blue-200"
                                                : "bg-white border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={col.id}
                                                checked={isChecked}
                                                onChange={() => handleColumnToggle(col.id)}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                            <span className={`text-sm truncate ${isChecked ? "text-blue-800 font-semibold" : "text-gray-700"
                                                }`}>
                                                {translate(col.label)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ✅ Add New Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                                <label className="font-bold text-gray-800 text-sm">
                                    {translate("Add New Column")}
                                </label>
                                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                                    {fields.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center p-2.5 rounded-lg border border-gray-200 bg-gray-50/60">
                                        <div className="flex w-full gap-2.5 items-end">
                                            <div className="flex-1">
                                                <DefaultInput
                                                    registerKey={`column.${index}.text`}
                                                    placeholder={`Point ${index + 1}`}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    remove(index);
                                                    toast.success(translate("Custom column removed"));
                                                }}
                                                className="mb-[2px] bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-lg flex items-center justify-center"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    append({ text: "" });
                                    toast.success(translate("New column added"));
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                            >
                                <span className="text-lg leading-none">+</span>
                                {translate("Add New")}
                            </button>
                        </div>

                        {/* ✅ Save Button */}
                        <div className="text-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-lg inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCreating ? translate("Saving...") : translate("Save")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    ✅ REPORTS SECTION
                ============================================================ */}
                <div className="space-y-5 mt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                            <label className="font-bold text-gray-800 text-base">
                                {translate("Generated Reports")}
                            </label>
                            <span className="ml-1 px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                                {reports.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => refetchTemplates()}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-200"
                            >
                                {translate("Refresh")}
                            </button>

                            {reports.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAllReports}

                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {/* Trash Icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                    {isDeletingAll ? translate("Clearing...") : translate("Clear All")}

                                </button>

                            )}
                        </div>
                    </div>

                    {isLoadingTemplates && reports.length === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            {translate("Loading reports...")}
                        </div>
                    )}

                    {isErrorTemplates && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                            {templatesError?.data?.error || translate("Failed to load reports")}
                        </div>
                    )}

                    {!isLoadingTemplates && !isErrorTemplates && reports.length === 0 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50/50">
                            <p className="text-gray-500 text-sm">
                                {translate("No reports yet. Generate one above.")}
                            </p>
                        </div>
                    )}

                    {reports.map((template, rIdx) => {
                        // ✅ FieldKey is the identifier
                        const templateKey = template.FieldKey;
                        const report = template.FieldValue || {};
                        const columns = buildColumns(report);
                        const rows = buildRows(columns);

                        return (
                            <div
                                key={templateKey}
                                className="overflow-hidden"
                            >
                                <div className=" bg-gray-50">
                                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                                        <div className="flex justify-end items-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveReport(templateKey)}
                                                disabled={isDeleting}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {/* Trash Icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>

                                            </button>
                                        </div>

                                        <div className="text-center mb-3">
                                            <h3 className="inline-block font-bold text-lg text-gray-900 border-b-2 border-gray-800 pb-1">
                                                {report.ReportName}
                                            </h3>
                                        </div>

                                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        {/* <th className="px-3 py-2 text-left font-bold text-gray-800 border-b border-gray-300 border-r w-10">ক্র</th> */}
                                                        {columns.map((col) => (
                                                            <th key={col.id} className="px-3 py-2 text-center font-bold text-gray-800 border-b border-r whitespace-nowrap">
                                                                {translate(col.label)}
                                                                {col.isCustom && (
                                                                    <span className="ml-1 text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-normal">
                                                                        custom
                                                                    </span>
                                                                )}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rows.map((row, rIndex) => (
                                                        <tr key={rIndex} className={rIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                            <td className="px-3 py-2 text-gray-600 border-b border-r">{rIndex + 1}</td>
                                                            {columns.map((col) => (
                                                                <td key={col.id} className="px-3 py-2 text-gray-800 border-b border-r whitespace-nowrap text-center">
                                                                    {col.type === "image" && row[col.id] ? (
                                                                        <img
                                                                            src={row[col.id]}
                                                                            alt="logo"
                                                                            className="w-9 h-9 rounded object-cover border mx-auto"
                                                                            onError={(e) => { e.target.onerror = null; e.target.src = "/avatar.png"; }}
                                                                        />
                                                                    ) : (
                                                                        row[col.id] || "-"
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-dashed text-center text-[10px] text-gray-400">
                                            {translate("Generated by")} — {institutionInfo?.InstitutionName || "System"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </form>
        </FormProvider>
    );
}