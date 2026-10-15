import React, { useState, useEffect, useRef } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";
import {
    useGetInstitutionInfoQuery,
    useGetAllStudentDataExportTemplatesQuery,
    useCreateStudentDataExportTemplateMutation,
    useUpdateStudentDataExportTemplateMutation,
    useDeleteStudentDataExportTemplateMutation,
    useDeleteAllStudentDataExportTemplatesMutation,
    useGetStudentDataExportTemplateByKeyQuery,
} from "../../../features/settings/settingsQuerySlice";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { useGetLabelNameListsQuery } from "../../../features/result/resultSilce";

/* ============================================================
   ✅ LIMITS
============================================================ */
const MAX_TOTAL_COLUMNS = 10;
const MIN_COL_SIZE = 5;
const MAX_COL_SIZE = 40;
const DEFAULT_COL_SIZE = 12;

const CUSTOM_SIZE_SEP = "::";
const parseCustomColumn = (colId) => {
    const raw = String(colId).replace(/^custom_/, "");
    const idx = raw.lastIndexOf(CUSTOM_SIZE_SEP);
    if (idx === -1) return { label: raw, size: null };
    const label = raw.slice(0, idx);
    const size = parseFloat(raw.slice(idx + CUSTOM_SIZE_SEP.length));
    return { label, size: Number.isFinite(size) && size > 0 ? size : null };
};

export default function DataExportModel({ dataExport }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const userData = dataExport?.data;
    const methods = useForm();
    const { handleSubmit, control, reset, register, setValue, getValues } = methods;
    const translate = useTranslate();
    const { data } = useGetLabelNameListsQuery();

    /* ============================================================
       ✅ EDIT STATE
    ============================================================ */
    const [editingTemplateKey, setEditingTemplateKey] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    /* ============================================================
       ✅ Populate Guard — একই key এ বারবার populate হবে না
    ============================================================ */
    const populatedKeyRef = useRef(null);

    /* ============================================================
       ✅ GET SINGLE — only when editing
    ============================================================ */
    const {
        data: singleTemplateData,
        isLoading: isLoadingSingleTemplate,
        isFetching: isFetchingSingleTemplate,
        isError: isErrorSingleTemplate,
        error: singleTemplateError,
    } = useGetStudentDataExportTemplateByKeyQuery(editingTemplateKey, {
        skip: !editingTemplateKey,
    });

    /* ============================================================
       ✅ allColumns
    ============================================================ */
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

    const [updateTemplate, { isLoading: isUpdating }] =
        useUpdateStudentDataExportTemplateMutation();

    const [deleteTemplate, { isLoading: isDeleting }] =
        useDeleteStudentDataExportTemplateMutation();

    const [deleteAllTemplates, { isLoading: isDeletingAll }] =
        useDeleteAllStudentDataExportTemplatesMutation();

    const reports = templatesData?.data || [];

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "column",
    });

    /* ============================================================
       ✅ Column limits
    ============================================================ */
    const totalColumns = selectedColumns.length + fields.length;
    const limitReached = totalColumns >= MAX_TOTAL_COLUMNS;
    const remainingColumns = Math.max(MAX_TOTAL_COLUMNS - totalColumns, 0);

    /* ============================================================
       ✅ Populate form from template
    ============================================================ */
    const populateFormFromTemplate = (template) => {
        const report = template?.FieldValue || template || {};
        const selected = Array.isArray(report?.selectedColumns) ? report.selectedColumns : [];

        // ✅ ReportName
        setValue("ReportName", report?.ReportName || "", { shouldValidate: false });

        const customCols = [];
        const predefinedCols = [];

        selected.forEach((id) => {
            if (typeof id === "string" && id.startsWith("custom_")) {
                const { label, size } = parseCustomColumn(id);
                customCols.push({
                    text: label,                          // ✅ raw label (custom_ ছাড়া)
                    size: size ?? DEFAULT_COL_SIZE,
                });
            } else {
                predefinedCols.push(id);
            }
        });

        setSelectedColumns(predefinedCols);

        // ✅ replace দিয়ে column fields reset
        replace(customCols);

        // ✅ প্রতিটি custom column এর text ও size manually set (safety)
        setTimeout(() => {
            customCols.forEach((c, idx) => {
                setValue(`column.${idx}.text`, c.text, { shouldValidate: false });
                setValue(`column.${idx}.size`, c.size, { shouldValidate: false });
            });
        }, 0);
    };

    /* ============================================================
       ✅ useEffect — Edit mode এ form auto-populate
    ============================================================ */
    useEffect(() => {
        if (!isEditMode || !editingTemplateKey) return;
        if (isLoadingSingleTemplate || isFetchingSingleTemplate) return;

        if (isErrorSingleTemplate) {
            toast.error(singleTemplateError?.data?.error || translate("Failed to load template"));
            setEditingTemplateKey(null);
            setIsEditMode(false);
            populatedKeyRef.current = null;
            return;
        }

        // ✅ একই key তে দ্বিতীয়বার populate হবে না
        if (populatedKeyRef.current === editingTemplateKey) return;

        const template = singleTemplateData?.data;
        let source = template;

        if (!source) {
            source = reports.find((r) => r.FieldKey === editingTemplateKey);
        }

        if (source) {
            populateFormFromTemplate(source);
            populatedKeyRef.current = editingTemplateKey;
        }
    }, [
        isEditMode,
        editingTemplateKey,
        singleTemplateData,
        isLoadingSingleTemplate,
        isFetchingSingleTemplate,
        isErrorSingleTemplate,
    ]);

    /* ============================================================
       ✅ Checkbox handlers
    ============================================================ */
    const handleColumnToggle = (colId) => {
        const isChecked = selectedColumns.includes(colId);

        if (!isChecked && limitReached) {
            toast.warning(
                `সর্বোচ্চ ${MAX_TOTAL_COLUMNS}টি কলাম নেওয়া যাবে (নির্বাচিত + নতুন কলাম মিলিয়ে)।`
            );
            return;
        }

        setSelectedColumns((prev) =>
            isChecked ? prev.filter((id) => id !== colId) : [...prev, colId]
        );
    };

    const handleDeselectAll = () => {
        if (selectedColumns.length === 0) return;
        setSelectedColumns([]);
        toast.info(translate("All columns deselected"));
    };

    /* ============================================================
       ✅ Add new custom column
    ============================================================ */
    const handleAddCustomColumn = () => {
        if (limitReached) {
            toast.warning(
                `সর্বোচ্চ ${MAX_TOTAL_COLUMNS}টি কলাম নেওয়া যাবে (নির্বাচিত + নতুন কলাম মিলিয়ে)।`
            );
            return;
        }
        append({ text: "", size: DEFAULT_COL_SIZE });
        toast.success(translate("New column added"));
    };

    /* ============================================================
       ✅ handleEditReport
    ============================================================ */
    const handleEditReport = (fieldKey) => {
        if (!fieldKey) {
            toast.error(translate("Invalid template"));
            return;
        }

        if (editingTemplateKey === fieldKey && isEditMode) {
            toast.info(translate("Already editing this report"));
            return;
        }

        // ✅ নতুন key তে populate হবে
        populatedKeyRef.current = null;
        setEditingTemplateKey(fieldKey);
        setIsEditMode(true);

        setTimeout(() => {
            const formEl = document.querySelector("form");
            if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    };

    /* ============================================================
       ✅ Cancel Edit
    ============================================================ */
    const handleCancelEdit = () => {
        setEditingTemplateKey(null);
        setIsEditMode(false);
        populatedKeyRef.current = null;
        reset({ ReportName: "", column: [] });
        setSelectedColumns([]);
        toast.info(translate("Edit cancelled"));
    };

    /* ============================================================
       ✅ Delete single
    ============================================================ */
    const handleRemoveReport = async (fieldKey) => {
        if (!fieldKey) {
            toast.error(translate("Invalid template"));
            return;
        }

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
            heightAuto: false,
            target: document.body,
            didOpen: () => { document.body.style.overflow = 'hidden'; },
            willClose: () => { document.body.style.overflow = ''; },
        });

        if (!result.isConfirmed) return;

        try {
            await deleteTemplate(fieldKey).unwrap();
            toast.success(translate("Report removed"));

            if (editingTemplateKey === fieldKey) handleCancelEdit();
        } catch (err) {
            toast.error(err?.data?.error || translate("Failed to delete report"));
        }
    };

    /* ============================================================
       ✅ Clear all
    ============================================================ */
    const handleClearAllReports = async (e) => {
        e?.stopPropagation();

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
            didOpen: () => { document.body.style.overflow = 'hidden'; },
            willClose: () => { document.body.style.overflow = ''; },
        });

        if (!result.isConfirmed) return;

        try {
            const res = await deleteAllTemplates().unwrap();
            toast.success(`${translate("All reports cleared")} — ${res.deletedCount || 0}`);
            handleCancelEdit();
        } catch (err) {
            toast.error(err?.data?.error || translate("Failed to clear all"));
        }
    };

    /* ============================================================
       ✅ Submit — CREATE or UPDATE
    ============================================================ */
    const onSubmit = async (data) => {
        if (selectedColumns.length === 0 && (data.column || []).length === 0) {
            toast.error(translate("Please select at least one column"));
            return;
        }

        if (!data.ReportName?.trim()) {
            toast.error(translate("Please enter a report name"));
            return;
        }

        const customCols = (data.column || [])
            .map((c) => ({
                text: (c?.text || "").trim().replace(/::/g, ":"),
                size: Number(c?.size),
            }))
            .filter((c) => c.text);

        if (selectedColumns.length + customCols.length > MAX_TOTAL_COLUMNS) {
            toast.error(
                `সর্বোচ্চ ${MAX_TOTAL_COLUMNS}টি কলাম নেওয়া যাবে (নির্বাচিত + নতুন কলাম মিলিয়ে)।`
            );
            return;
        }

        const badSize = customCols.find(
            (c) => !Number.isFinite(c.size) || c.size < MIN_COL_SIZE || c.size > MAX_COL_SIZE
        );
        if (badSize) {
            toast.error(
                `"${badSize.text}" কলামের Size ${MIN_COL_SIZE} থেকে ${MAX_COL_SIZE} (%) এর মধ্যে দিন।`
            );
            return;
        }

        const seen = new Set();
        for (const c of customCols) {
            const key = c.text.toLowerCase();
            if (seen.has(key)) {
                toast.error(`"${c.text}" নামে একাধিক নতুন কলাম আছে। আলাদা নাম দিন।`);
                return;
            }
            seen.add(key);
        }

        const customColumnIds = customCols.map(
            (c) => `custom_${c.text}${CUSTOM_SIZE_SEP}${c.size}`
        );

        const body = {
            ReportName: data.ReportName.trim(),
            selectedColumns: [...selectedColumns, ...customColumnIds],
        };

        try {
            if (isEditMode && editingTemplateKey) {
                const res = await updateTemplate({
                    fieldKey: editingTemplateKey,
                    ...body,
                }).unwrap();

                toast.success(
                    `${translate("Report updated")} — ${res?.data?.FieldValue?.ReportName || body.ReportName}`
                );

                setEditingTemplateKey(null);
                setIsEditMode(false);
                populatedKeyRef.current = null;
            } else {
                const res = await createTemplate(body).unwrap();
                toast.success(
                    `${translate("Report saved")} — ${res?.data?.FieldValue?.ReportName || ""}`
                );
            }

            reset({ ReportName: "", column: [] });
            setSelectedColumns([]);
            refetchTemplates();
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
                    const { label, size } = parseCustomColumn(id);
                    return { id, name: label, label, field: label, size, type: "text", isCustom: true };
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

    const isSaving = isCreating || isUpdating;

    /* ============================================================
       ✅ Loading state — edit mode + fetching
    ============================================================ */
    const isEditLoading =
        isEditMode && (isLoadingSingleTemplate || isFetchingSingleTemplate);

    return (
        <FormProvider {...methods}>
            {/* ============================================================
                ✅ FULL MODAL BLOCK during edit fetch
            ============================================================ */}
            {isEditLoading && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 font-semibold text-sm">
                            {translate("Loading template...")}
                        </p>
                        <p className="text-gray-400 text-xs">
                            {translate("Please wait")}
                        </p>
                    </div>
                </div>
            )}

            {/* ============================================================
                ✅ Edit mode indicator bar (fixed top)
            ============================================================ */}
            {isEditMode && !isEditLoading && (
                <div className="fixed top-0 left-0 right-0 z-[9998] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {translate("Edit Mode Active")} — {translate("Only the form below is editable")}
                    </div>
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition"
                    >
                        {translate("Exit Edit")}
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className={`space-y-4 ${isEditMode && !isEditLoading ? "pt-12" : ""}`}
            >
                {/* ============================================================
                    ✅ FORM SECTION
                ============================================================ */}
                <div className={`rounded-xl border bg-white shadow-sm overflow-hidden ${isEditMode ? "border-amber-400 ring-2 ring-amber-200" : "border-gray-200"
                    }`}>
                    <div className={`px-5 py-3 ${isEditMode
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        }`}>
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            {isEditMode
                                ? translate("Edit Data Export Configuration")
                                : translate("Data Export Configuration")}
                            {isEditMode && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-white/20 rounded-full">
                                    {translate("Editing")}
                                </span>
                            )}
                        </h3>
                    </div>

                    <div className="p-5 space-y-4">
                        <DefaultInput
                            label="Report Name"
                            registerKey="ReportName"
                            placeholder="রিপোর্টের নাম লিখুন..."
                            require
                            showError
                        />

                        {/* ✅ Add New Column */}
                        <div>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex gap-2 items-center p-2.5 rounded-lg border border-gray-200 bg-gray-50/60"
                                    >
                                        <div className="flex w-full gap-2.5 items-end">
                                            <div className="flex-1">
                                                {/* ✅ key দিয়ে force re-mount */}
                                                <DefaultInput
                                                    key={`text-${field.id}-${index}`}
                                                    registerKey={`column.${index}.text`}
                                                    defaultValue={field.text || ""}
                                                    placeholder={`Point ${index + 1}`}
                                                />
                                            </div>

                                            <div className="w-28">
                                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                    {translate("Size")} (%)
                                                </label>
                                                <input
                                                    key={`size-${field.id}-${index}`}
                                                    type="number"
                                                    min={MIN_COL_SIZE}
                                                    max={MAX_COL_SIZE}
                                                    step="1"
                                                    defaultValue={field.size ?? DEFAULT_COL_SIZE}
                                                    {...register(`column.${index}.size`)}
                                                    className="w-full h-9 px-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
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

                            {fields.length > 0 && (
                                <p className="mt-2 text-[11px] text-gray-500">
                                    Size = প্রিন্ট টেবিলের মোট প্রস্থের শতাংশ ({MIN_COL_SIZE}% – {MAX_COL_SIZE}%)
                                </p>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={handleAddCustomColumn}
                                    disabled={limitReached}
                                    className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg leading-none">+</span>
                                    {translate("Add New Column")}
                                </button>
                                <span className="ml-1 px-2 mt-3 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                                    {fields.length}
                                </span>
                            </div>
                        </div>

                        {/* ✅ Select Columns */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                    <label className="font-bold text-gray-800 text-sm">
                                        {translate("Select Columns")}
                                    </label>
                                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                        {selectedColumns.length} / {MAX_TOTAL_COLUMNS}
                                    </span>
                                </div>
                                <div
                                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm ${limitReached
                                        ? "bg-amber-50 border-amber-300 text-amber-800"
                                        : "bg-blue-50 border-blue-200 text-blue-800"
                                        }`}
                                >
                                    <span className="font-semibold">
                                        মোট কলাম (নির্বাচিত + নতুন):{" "}
                                        <b>{totalColumns}</b> / {MAX_TOTAL_COLUMNS}
                                    </span>
                                    <span className="text-xs">
                                        {limitReached
                                            ? "সীমা শেষ — আর কলাম যোগ করা যাবে না"
                                            : `আরও ${remainingColumns}টি কলাম নেওয়া যাবে`}
                                    </span>
                                </div>
                                {selectedColumns.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleDeselectAll}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-red-50 text-red-600 border-red-200"
                                    >
                                        {translate("Deselect All")}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 shadow-sm max-h-[420px] overflow-y-auto">
                                {allColumns.map((col) => {
                                    const isChecked = selectedColumns.includes(col.id);
                                    const isDisabled = !isChecked && limitReached;
                                    return (
                                        <label
                                            key={col.id}
                                            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg border ${isChecked
                                                ? "cursor-pointer bg-blue-50 border-blue-400 ring-1 ring-blue-200"
                                                : isDisabled
                                                    ? "cursor-not-allowed bg-gray-100 border-gray-200 opacity-50"
                                                    : "cursor-pointer bg-white border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={col.id}
                                                checked={isChecked}
                                                disabled={isDisabled}
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

                        {/* ✅ Save/Update Button */}
                        <div className="flex flex-row justify-between text-end pt-4 border-t border-gray-100">
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
                            </div>

                            <div className="flex flex-row gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => refetchTemplates()}
                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 transition-all duration-200"
                                    >
                                        {translate("Refresh")}
                                    </button>

                                    {reports.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearAllReports}
                                            disabled={isDeleting}
                                            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                            {isDeletingAll ? translate("Clearing...") : translate("Clear All")}
                                        </button>
                                    )}
                                </div>

                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all duration-200"
                                    >
                                        {translate("Cancel")}
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg text-white border shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isEditMode
                                        ? "bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600"
                                        : "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 hover:border-emerald-600"
                                        }`}
                                >
                                    {isSaving
                                        ? (isEditMode ? translate("Updating...") : translate("Saving..."))
                                        : (isEditMode ? translate("Update") : translate("Save"))}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    ✅ REPORTS SECTION
                ============================================================ */}
                <div className="space-y-5 mt-6">
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
                        const templateKey = template.FieldKey;
                        const report = template.FieldValue || {};
                        const columns = buildColumns(report);
                        const rows = buildRows(columns);
                        const isCurrentlyEditing = editingTemplateKey === templateKey;

                        return (
                            <div
                                key={templateKey}
                                className={`overflow-hidden rounded-lg transition-all duration-200 ${isCurrentlyEditing ? "ring-2 ring-amber-400 ring-offset-2" : ""
                                    }`}
                            >
                                <div className="bg-gray-50">
                                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                                        <div className="flex flex-row items-center mb-3 relative">
                                            <div className="flex-1 flex justify-center">
                                                <h3 className="font-bold text-lg text-gray-900 border-b-2 border-gray-800 pb-1">
                                                    {report.ReportName}
                                                    {isCurrentlyEditing && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                                                            {translate("Editing")}
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>

                                            <div className="absolute right-0 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditReport(templateKey)}
                                                    disabled={isDeleting || isCurrentlyEditing}
                                                    className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isCurrentlyEditing
                                                        ? "bg-amber-50 text-amber-600 border-amber-300"
                                                        : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    {isCurrentlyEditing ? translate("Editing...") : translate("Edit")}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveReport(templateKey)}
                                                    disabled={isDeleting}
                                                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                    {translate("Delete")}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        {columns.map((col) => (
                                                            <th
                                                                key={col.id}
                                                                style={col.isCustom && col.size ? { width: `${col.size}%` } : undefined}
                                                                className="px-3 py-2 text-center font-bold text-gray-800 border-b border-r whitespace-nowrap"
                                                            >
                                                                {translate(col.label)}
                                                                {col.isCustom && (
                                                                    <span className="ml-1 text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-normal">
                                                                        custom{col.size ? ` · ${col.size}%` : ""}
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