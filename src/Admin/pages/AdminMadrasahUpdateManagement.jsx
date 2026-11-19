// src/Admin/pages/AdminMadrasahUpdateManagement.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import Button from "../../components/Button/Button";
import Loading from "../../components/Loading/Loading";
import DefaultPagination from "../../components/Pagination/DefaultPagination";
import SortableTable from "../../components/Tables/SortableTable";
import { setPageName } from "../../features/auth/authSlice";
import {
  useCreateTemplateTypeMutation,
  useCreateUpdateTemplateMutation,
  useDeleteTemplateTypeMutation,
  useDeleteUpdateTemplateMutation,
  useGetTemplateEntriesQuery,
  useGetTemplateStatsQuery,
  useGetUpdateTemplatesQuery,
  useSaveTemplateEntriesBulkMutation,
  useSaveTemplateEntryMutation,
  useUpdateTemplateTypeMutation,
  useUpdateUpdateTemplateMutation,
} from "../../features/Admin/madrasahUpdateSlice";
import useTranslate from "../../utils/Translate";

/* ---------------- Color palette ---------------- */
const C = {
  gradient: "bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4]",
  primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
};

// Colors offered for a type. The hex value is what goes into ColorCode.
const TYPE_COLORS = [
  "#DC2626", // red
  "#EA580C", // orange
  "#D97706", // amber
  "#16A34A", // green
  "#0D9488", // teal
  "#2563EB", // blue
  "#4F46E5", // indigo
  "#7C3AED", // violet
  "#DB2777", // pink
  "#475569", // slate
];

const DEFAULT_TYPE_COLOR = "#7C3AED";

/* ---------------- Date helpers ---------------- */

// API value -> the yyyy-mm-dd that an <input type="date"> needs
const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

// yyyy-mm-dd -> dd/mm/yyyy, the format shown on screen
const toDisplayDate = (value) => {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

// dd/mm/yyyy -> yyyy-mm-dd, empty when the typed date is not a real one
const fromDisplayDate = (text) => {
  const match = String(text || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "";
  if (date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month)) return "";
  if (date.getDate() !== Number(day)) return "";

  return `${year}-${month}-${day}`;
};

/**
 * Date cell shown as dd/mm/yyyy.
 * A native <input type="date"> always follows the browser locale, which is
 * why the visible field is a text input; the native picker is kept next to
 * it, hidden, and opened by the calendar button.
 */
const DateCell = ({ value, onChange, placeholder }) => {
  const [text, setText] = useState(toDisplayDate(value));
  const nativeRef = useRef(null);

  useEffect(() => {
    setText(toDisplayDate(value));
  }, [value]);

  const handleTextChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    let next = digits;
    if (digits.length > 4) {
      next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setText(next);

    if (!next) {
      onChange("");
      return;
    }

    const iso = fromDisplayDate(next);
    if (iso) onChange(iso);
  };

  // A half typed date is thrown away rather than saved wrong
  const handleBlur = () => {
    if (!text) return;
    if (!fromDisplayDate(text)) setText(toDisplayDate(value));
  };

  const openPicker = () => {
    const input = nativeRef.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
      input.click();
    } catch {
      // Browser refused to open the picker; the field can still be typed in
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder || "dd/mm/yyyy"}
        className="h-9 w-full rounded-lg border border-[#DDD6FE] bg-white pl-2 pr-7 text-[13px] text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
      />

      <button
        type="button"
        onClick={openPicker}
        title="Open calendar"
        className="absolute right-0.5 flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:text-[#7C3AED]"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      <input
        ref={nativeRef}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-6 h-0 w-0 border-0 p-0 opacity-0"
      />
    </div>
  );
};

/* ---------------- Color picker used for a type ---------------- */
const ColorSwatches = ({ value, onPick }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {TYPE_COLORS.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() => onPick(color)}
        title={color}
        style={{ backgroundColor: color }}
        className={`h-6 w-6 rounded-full border-2 transition ${
          value === color ? "border-slate-800 ring-2 ring-slate-300" : "border-white shadow-sm"
        }`}
      />
    ))}
  </div>
);

const AdminMadrasahUpdateManagement = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // ---------- Page state ----------
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Rows edited on screen but not saved yet, keyed by UserCode
  const [draftRows, setDraftRows] = useState({});

  // True once the first template has been opened automatically
  const hasAutoSelected = useRef(false);

  // ---------- Modal state ----------
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ id: null, Title: "", Remark: "" });
  const [isTypePanelOpen, setIsTypePanelOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState(DEFAULT_TYPE_COLOR);

  // Type being edited inline (null = the panel is closed)
  const [typeEditId, setTypeEditId] = useState(null);
  const [typeEditForm, setTypeEditForm] = useState({ TypeName: "", ColorCode: DEFAULT_TYPE_COLOR });

  // ---------- Queries ----------
  const {
    data: templateData,
    isLoading: isLoadingTemplates,
    isFetching: isFetchingTemplates,
    isError: isErrorTemplates,
  } = useGetUpdateTemplatesQuery();

  const templates = useMemo(() => templateData?.data || [], [templateData]);

  const {
    data: entryData,
    isLoading: isLoadingEntries,
    isFetching: isFetchingEntries,
    isError: isErrorEntries,
  } = useGetTemplateEntriesQuery(
    {
      templateId: selectedTemplateId,
      page: currentPage,
      limit: 50,
      search: searchTerm || undefined,
      typeId: typeFilter || undefined,
    },
    { skip: !selectedTemplateId, refetchOnMountOrArgChange: true }
  );

  const { data: statsData } = useGetTemplateStatsQuery(selectedTemplateId, {
    skip: !selectedTemplateId,
  });

  // ---------- Mutations ----------
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateUpdateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdatingTemplate }] = useUpdateUpdateTemplateMutation();
  const [deleteTemplate] = useDeleteUpdateTemplateMutation();
  const [createType, { isLoading: isCreatingType }] = useCreateTemplateTypeMutation();
  const [updateType] = useUpdateTemplateTypeMutation();
  const [deleteType] = useDeleteTemplateTypeMutation();
  const [saveEntry] = useSaveTemplateEntryMutation();
  const [saveEntriesBulk, { isLoading: isSavingBulk }] = useSaveTemplateEntriesBulkMutation();

  // ---------- Derived data ----------
  const selectedTemplate = useMemo(
    () => templates.find((item) => item.ID === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const types = entryData?.types || selectedTemplate?.Types || [];
  const rows = useMemo(() => entryData?.data || [], [entryData]);
  const totalPages = entryData?.pagination?.totalPages || 1;
  const totalRecords = entryData?.pagination?.totalRecords || 0;
  const stats = statsData?.data || null;
  const changedCount = Object.keys(draftRows).length;

  // Set page title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // The newest template is opened once, on the first load only, so that
  // choosing the blank option later really does clear the selection
  useEffect(() => {
    if (isFetchingTemplates || hasAutoSelected.current) return;
    if (!templates.length) return;

    hasAutoSelected.current = true;
    setSelectedTemplateId(templates[0].ID);
  }, [templates, isFetchingTemplates]);

  // A template that no longer exists (deleted here or in another tab) is
  // dropped, otherwise the page keeps asking the API for a missing ID
  useEffect(() => {
    if (isFetchingTemplates || !selectedTemplateId) return;
    if (templates.some((item) => item.ID === selectedTemplateId)) return;

    setSelectedTemplateId(null);
    setCurrentPage(1);
    setTypeFilter("");
  }, [templates, selectedTemplateId, isFetchingTemplates]);

  // Unsaved edits belong to the template and page they were made on
  useEffect(() => {
    setDraftRows({});
  }, [selectedTemplateId, currentPage, searchTerm, typeFilter]);

  // Close the type edit panel on an outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".type-edit-container")) {
        setTypeEditId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- Row editing ----------
  const getRowValue = useCallback(
    (row, field) => {
      const draft = draftRows[row.UserCode];
      if (draft && draft[field] !== undefined) return draft[field];
      if (field === "ActionDate") return toInputDate(row.ActionDate);
      return row[field] ?? "";
    },
    [draftRows]
  );

  const handleRowChange = useCallback((row, field, value) => {
    setDraftRows((previous) => ({
      ...previous,
      [row.UserCode]: {
        TypeID: row.TypeID ?? "",
        ActionDate: toInputDate(row.ActionDate),
        Comment: row.Comment ?? "",
        ...(previous[row.UserCode] || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleSaveRow = useCallback(
    async (row) => {
      const draft = draftRows[row.UserCode];

      if (!draft) return;

      try {
        await saveEntry({
          TemplateID: selectedTemplateId,
          UserCode: row.UserCode,
          TypeID: draft.TypeID || null,
          ActionDate: draft.ActionDate || null,
          Comment: draft.Comment || null,
        }).unwrap();

        setDraftRows((previous) => {
          const next = { ...previous };
          delete next[row.UserCode];
          return next;
        });

        Swal.fire({
          title: "Saved",
          text: `${row.InstituteName || row.UserCode} updated.`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire("Error!", error?.data?.message || "Failed to save.", "error");
      }
    },
    [draftRows, saveEntry, selectedTemplateId]
  );

  const handleSaveAll = useCallback(async () => {
    if (!changedCount) return;

    const payloadRows = Object.entries(draftRows).map(([userCode, draft]) => ({
      UserCode: Number(userCode),
      TypeID: draft.TypeID || null,
      ActionDate: draft.ActionDate || null,
      Comment: draft.Comment || null,
    }));

    try {
      await saveEntriesBulk({
        TemplateID: selectedTemplateId,
        Rows: payloadRows,
      }).unwrap();

      setDraftRows({});

      Swal.fire({
        title: "Saved",
        text: `${payloadRows.length} rows updated.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to save.", "error");
    }
  }, [changedCount, draftRows, saveEntriesBulk, selectedTemplateId]);

  // ---------- Template handlers ----------
  const handleOpenCreateTemplate = () => {
    setTemplateForm({ id: null, Title: "", Remark: "" });
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (template) => {
    if (!template) return;

    setTemplateForm({
      id: template.ID,
      Title: template.Title,
      Remark: template.Remark || "",
    });
    setIsTemplateModalOpen(true);
  };

  const handleSubmitTemplate = async () => {
    if (!templateForm.Title.trim()) {
      Swal.fire("Error!", "Template title is required.", "error");
      return;
    }

    try {
      if (templateForm.id) {
        await updateTemplate({
          id: templateForm.id,
          Title: templateForm.Title,
          Remark: templateForm.Remark,
        }).unwrap();
      } else {
        const created = await createTemplate({
          Title: templateForm.Title,
          Remark: templateForm.Remark,
        }).unwrap();

        if (created?.data?.ID) setSelectedTemplateId(created.data.ID);
      }

      setIsTemplateModalOpen(false);
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to save template.", "error");
    }
  };

  // Deletes exactly the one template that was clicked, never the others
  const handleDeleteTemplate = async (template) => {
    if (!template) return;

    const result = await Swal.fire({
      title: `Delete "${template.Title}"?`,
      text: "Only this template is deleted, with its own types and madrasah entries. Other templates stay as they are.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTemplate(template.ID).unwrap();

      if (template.ID === selectedTemplateId) setSelectedTemplateId(null);

      Swal.fire({
        title: "Deleted",
        text: `"${template.Title}" is gone.`,
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to delete template.", "error");
    }
  };

  // ---------- Type handlers ----------
  const handleAddType = async () => {
    if (!newTypeName.trim() || !selectedTemplateId) return;

    try {
      await createType({
        templateId: selectedTemplateId,
        TypeName: newTypeName.trim(),
        ColorCode: newTypeColor,
      }).unwrap();

      setNewTypeName("");
      setNewTypeColor(DEFAULT_TYPE_COLOR);
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to add type.", "error");
    }
  };

  // Opens the edit panel of one type, or closes it when it is already open
  const handleToggleTypeEdit = (type) => {
    if (typeEditId === type.ID) {
      setTypeEditId(null);
      return;
    }

    setTypeEditId(type.ID);
    setTypeEditForm({
      TypeName: type.TypeName,
      ColorCode: type.ColorCode || DEFAULT_TYPE_COLOR,
    });
  };

  /**
   * Saves the name and the color of a type.
   * The madrasah rows keep pointing at the same TypeID, so renaming a type
   * never touches the data already entered against it.
   */
  const handleSaveType = async (type) => {
    const name = typeEditForm.TypeName.trim();

    if (!name) {
      Swal.fire("Error!", "Type name is required.", "error");
      return;
    }

    try {
      await updateType({
        id: type.ID,
        TypeName: name,
        ColorCode: typeEditForm.ColorCode,
      }).unwrap();

      setTypeEditId(null);
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to update the type.", "error");
    }
  };

  const handleDeleteType = async (type) => {
    const result = await Swal.fire({
      title: "Delete this type?",
      text: `"${type.TypeName}" will be removed from every madrasah that uses it.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteType(type.ID).unwrap();
    } catch (error) {
      Swal.fire("Error!", error?.data?.message || "Failed to delete type.", "error");
    }
  };

  // ---------- Table columns ----------
  const columns = [
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
      width: 70,
      render: (row) => <p className="text-sm">{row.ID}</p>,
    },
    {
      title: translate("Code"),
      field: "UserCode",
      hozAlign: "center",
      width: 90,
      render: (row) => <p className="text-sm font-semibold">{row.UserCode}</p>,
    },
    {
      title: translate("Institution Name"),
      field: "InstituteName",
      hozAlign: "left",
      render: (row) => (
        <div className="max-w-xs">
          <p className="truncate text-sm font-medium">{row.InstituteName}</p>
          <p className="truncate text-[11px] text-gray-500">{row.DatabaseName}</p>
        </div>
      ),
    },
    {
      title: translate("Type"),
      field: "TypeID",
      hozAlign: "center",
      width: 180,
      headerSort: false,
      render: (row) => {
        const currentId = getRowValue(row, "TypeID");
        const currentType = types.find((type) => String(type.ID) === String(currentId)) || null;
        const color = currentType?.ColorCode || null;

        return (
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full border"
              style={{
                backgroundColor: color || "transparent",
                borderColor: color || "#CBD5E1",
              }}
            />
            <select
              value={currentId}
              onChange={(e) => handleRowChange(row, "TypeID", e.target.value)}
              style={color ? { color, borderColor: color } : undefined}
              className="h-9 w-full rounded-lg border border-[#DDD6FE] bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            >
              <option value="">{translate("Select")}</option>
              {types.map((type) => (
                <option key={type.ID} value={type.ID}>
                  {type.TypeName}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      title: translate("Date"),
      field: "ActionDate",
      hozAlign: "center",
      width: 125,
      headerSort: false,
      render: (row) => (
        <DateCell
          value={getRowValue(row, "ActionDate")}
          onChange={(value) => handleRowChange(row, "ActionDate", value)}
        />
      ),
    },
    {
      title: translate("Comment"),
      field: "Comment",
      hozAlign: "left",
      width: 420,
      headerSort: false,
      render: (row) => {
        const comment = getRowValue(row, "Comment");

        return (
          // A textarea rather than a single line input: the bottom-right
          // corner can be dragged down, so a long comment is read in place
          // instead of being scrolled through with the mouse.
          <textarea
            rows={1}
            value={comment}
            title={comment || undefined}
            onChange={(e) => handleRowChange(row, "Comment", e.target.value)}
            placeholder={translate("Write a comment...")}
            className="block min-h-[36px] w-full resize-y rounded-lg border border-[#DDD6FE] bg-white px-2 py-[7px] text-sm leading-snug text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          />
        );
      },
    },
    {
      title: translate("Action"),
      field: "actions",
      hozAlign: "center",
      width: 110,
      headerSort: false,
      render: (row) => {
        const isDirty = Boolean(draftRows[row.UserCode]);

        return (
          <button
            type="button"
            disabled={!isDirty}
            onClick={() => handleSaveRow(row)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              isDirty
                ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {translate("Save")}
          </button>
        );
      },
    },
  ];

  if (isLoadingTemplates) return <Loading />;

  if (isErrorTemplates) {
    return <div className="text-center text-red-600">Error fetching templates</div>;
  }

  return (
    <div className="font-default rounded-xl bg-white p-6 shadow-lg">
      {/* ================= Header ================= */}
      <div className="filter_header mb-6 flex flex-col items-start justify-between gap-4 border-b border-[#e9edf4] pb-5 sm:flex-row sm:items-center">
        <h3 className="font-default text-2xl font-bold text-gray-800">
          {translate("Madrasah Update Management")}
        </h3>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button onClick={handleOpenCreateTemplate} className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {translate("Add Template")}
          </Button>
        </div>
      </div>

      {/* ================= Template selector ================= */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-gray-600">
            {translate("Template")}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedTemplateId || ""}
              onChange={(e) => {
                setSelectedTemplateId(Number(e.target.value) || null);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            >
              <option value="">{translate("Select a template")}</option>
              {templates.map((template) => (
                <option key={template.ID} value={template.ID}>
                  {template.Title}
                </option>
              ))}
            </select>

            {selectedTemplate && (
              <button
                type="button"
                onClick={() => handleOpenEditTemplate(selectedTemplate)}
                title={translate("Rename this template")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E9D5FF] bg-white text-[#7C3AED] transition hover:bg-[#F5F3FF]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}

            {templates.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTemplateListOpen(true)}
                title={translate("Manage templates one by one")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-600 transition hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            {translate("Search")}
          </label>
          <input
            type="text"
            placeholder={translate("Search madrasah...")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            {translate("Filter by type")}
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          >
            <option value="">{translate("All")}</option>
            <option value="none">{translate("Pending (no type)")}</option>
            {types.map((type) => (
              <option key={type.ID} value={type.ID}>
                {type.TypeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTemplateId ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
          {templates.length
            ? translate("Select a template above to see the madrasah list.")
            : translate("Create a template first, then select it to update the madrasah list.")}
        </div>
      ) : (
        <>
          {/* ================= Type manager ================= */}
          <div className="mb-5 rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700">
                {translate("Types of this template")}
              </h4>
              <button
                type="button"
                onClick={() => setIsTypePanelOpen((open) => !open)}
                className="rounded-lg border border-[#E9D5FF] bg-white px-3 py-1.5 text-xs font-bold text-[#7C3AED] transition hover:bg-[#F5F3FF]"
              >
                {isTypePanelOpen ? translate("Close") : translate("Add Type")}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {types.length === 0 && (
                <span className="text-xs text-gray-500">
                  {translate("No type added yet. Add Done / Close / Cancel or anything you need.")}
                </span>
              )}

              {types.map((type) => {
                const color = type.ColorCode || DEFAULT_TYPE_COLOR;

                return (
                  <span
                    key={type.ID}
                    className="type-edit-container relative flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-bold"
                    style={{ borderColor: color, color }}
                  >
                    {/* The dot and the name open the edit panel of this type */}
                    <button
                      type="button"
                      onClick={() => handleToggleTypeEdit(type)}
                      title={translate("Edit name and color")}
                      className="flex items-center gap-2"
                    >
                      <span
                        style={{ backgroundColor: color }}
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-white shadow-sm"
                      />
                      {type.TypeName}
                      <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteType(type)}
                      className="text-slate-400 transition hover:text-red-600"
                      title={translate("Delete")}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {typeEditId === type.ID && (
                      <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                        <p className="mb-1 text-[11px] font-bold text-slate-500">
                          {translate("Type name")}
                        </p>
                        <input
                          type="text"
                          value={typeEditForm.TypeName}
                          onChange={(e) =>
                            setTypeEditForm((previous) => ({
                              ...previous,
                              TypeName: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveType(type);
                            }
                          }}
                          className="h-9 w-full rounded-lg border border-gray-300 px-2 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                        />

                        <p className="mb-1.5 mt-3 text-[11px] font-bold text-slate-500">
                          {translate("Color")}
                        </p>
                        <ColorSwatches
                          value={typeEditForm.ColorCode}
                          onPick={(picked) =>
                            setTypeEditForm((previous) => ({ ...previous, ColorCode: picked }))
                          }
                        />

                        <p className="mt-3 text-[11px] leading-snug text-slate-500">
                          {translate(
                            "Renaming keeps every madrasah already marked with this type."
                          )}
                        </p>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setTypeEditId(null)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                          >
                            {translate("Cancel")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveType(type)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${C.primary}`}
                          >
                            {translate("Save")}
                          </button>
                        </div>
                      </div>
                    )}
                  </span>
                );
              })}
            </div>

            {isTypePanelOpen && (
              <div className="mt-3 rounded-lg border border-[#E9D5FF] bg-white p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddType();
                      }
                    }}
                    placeholder={translate("Type name (Done, Close, Cancel...)")}
                    className="h-10 w-full max-w-xs rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">{translate("Color")}</span>
                    <ColorSwatches value={newTypeColor} onPick={setNewTypeColor} />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddType}
                    disabled={isCreatingType || !newTypeName.trim()}
                    className={`h-10 rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${C.primary}`}
                  >
                    {translate("Add")}
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  {translate("A type can be renamed or recolored later by clicking its chip.")}
                </p>
              </div>
            )}
          </div>

          {/* ================= Stats ================= */}
          {stats && (
            <div className="mb-5 flex flex-wrap gap-3">
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2">
                <span className="text-xs font-medium text-blue-600">
                  {translate("Total Madrasah")}
                </span>
                <span className="ml-2 text-base font-bold text-blue-700">
                  {stats.totalMadrasah}
                </span>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-2">
                <span className="text-xs font-medium text-green-600">{translate("Updated")}</span>
                <span className="ml-2 text-base font-bold text-green-700">{stats.selected}</span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-xs font-medium text-gray-600">{translate("Pending")}</span>
                <span className="ml-2 text-base font-bold text-gray-700">{stats.pending}</span>
              </div>
              {stats.types?.map((type) => {
                const color = type.ColorCode || DEFAULT_TYPE_COLOR;

                return (
                  <div
                    key={type.TypeID}
                    className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2"
                    style={{ borderColor: color }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium" style={{ color }}>
                      {type.TypeName}
                    </span>
                    <span className="text-base font-bold" style={{ color }}>
                      {type.Total}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= Save all bar ================= */}
          {changedCount > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
              <span className="text-sm font-medium text-amber-800">
                {changedCount} {translate("rows changed but not saved yet")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraftRows({})}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  {translate("Reset")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSavingBulk}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:opacity-60 ${C.primary}`}
                >
                  {isSavingBulk ? translate("Saving...") : translate("Save All")}
                </button>
              </div>
            </div>
          )}

          {/* ================= Table ================= */}
          {isErrorEntries ? (
            <div className="text-center text-red-600">Error fetching madrasah list</div>
          ) : isLoadingEntries ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <SortableTable
                columns={columns}
                data={rows}
                className="min-w-full"
                isFilterColumn={false}
              />
            </div>
          )}

          {/* ================= Pagination ================= */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              {translate("Showing")} {rows.length} {translate("of")} {totalRecords}{" "}
              {translate("madrasahs")}
              {isFetchingEntries && (
                <span className="ml-2 animate-pulse text-xs font-semibold text-indigo-600">
                  {translate("Loading...")}
                </span>
              )}
            </p>
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* ================= Template list modal ================= */}
      {isTemplateListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`${C.gradient} flex items-center justify-between px-5 py-4`}>
              <div>
                <h3 className="text-lg font-bold text-white">{translate("All Templates")}</h3>
                <p className="mt-0.5 text-xs text-white/80">
                  {translate("Rename or delete any single template")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateListOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.ID}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                      template.ID === selectedTemplateId
                        ? "border-[#7C3AED] bg-[#F5F3FF]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(template.ID);
                        setCurrentPage(1);
                        setIsTemplateListOpen(false);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-bold text-slate-700">{template.Title}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {template.Types?.length || 0} {translate("types")}
                        {template.Remark ? ` · ${template.Remark}` : ""}
                      </p>
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTemplateListOpen(false);
                          handleOpenEditTemplate(template);
                        }}
                        title={translate("Rename")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E9D5FF] bg-white text-[#7C3AED] transition hover:bg-[#F5F3FF]"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template)}
                        title={translate("Delete only this template")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setIsTemplateListOpen(false)}
                className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                {translate("Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Template form modal ================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`${C.gradient} flex items-center justify-between px-5 py-4`}>
              <h3 className="text-lg font-bold text-white">
                {templateForm.id ? translate("Edit Template") : translate("New Template")}
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  {translate("Template Title")}
                </label>
                <input
                  type="text"
                  value={templateForm.Title}
                  onChange={(e) =>
                    setTemplateForm((previous) => ({ ...previous, Title: e.target.value }))
                  }
                  placeholder={translate("Example: Madrasha Status")}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  {translate("Remark")}
                </label>
                <input
                  type="text"
                  value={templateForm.Remark}
                  onChange={(e) =>
                    setTemplateForm((previous) => ({ ...previous, Remark: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                {translate("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSubmitTemplate}
                disabled={isCreatingTemplate || isUpdatingTemplate}
                className={`rounded-lg px-5 py-2 text-sm font-bold shadow-sm transition disabled:opacity-60 ${C.primary}`}
              >
                {isCreatingTemplate || isUpdatingTemplate
                  ? translate("Saving...")
                  : translate("Save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMadrasahUpdateManagement;