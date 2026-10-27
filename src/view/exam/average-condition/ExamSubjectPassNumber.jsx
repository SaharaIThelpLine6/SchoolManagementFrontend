import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import useTranslate from "../../../utils/Translate";
import Button from "../../../components/Button/Button";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetAcademicSubjectsQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";
import SortableTable from "../../../components/Tables/SortableTable";
import {
  useGetExamDivitionByTypeQuery,
  usePostExamDivitionMutation,
  useUpdateExamDivitionMutation,
} from "../../../features/exam/examQuerySlice";
import EditButton from "../../../components/Button/EditButton";
import CheckboxOption from "./CheckboxOption";
import DefaultInput from "../../../components/Forms/DefaultInput";
import SvgIcon from "../../../components/icons/SvgIcon";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import MultiSelect from "../../../components/Forms/MultiSelect";

const MAX_GRADE_BANDS = 7;

const passNumberOrDefault = (passNumber) =>
  passNumber === "" || passNumber == null ? 33 : passNumber;

const withDefaultSubjectNumbers = (subjects) =>
  subjects.map((subject) => ({
    ...subject,
    MaxNumber:
      subject.MaxNumber === "" || subject.MaxNumber == null
        ? 100
        : subject.MaxNumber,
    PassNumber: passNumberOrDefault(subject.PassNumber),
  }));

const SubjectColumnHeader = ({ label, helpText }) => (
  <span className="inline-flex items-center gap-1">
    <span>{label}</span>
    <button
      type="button"
      aria-label={`${label}: ${helpText}`}
      data-tooltip-id="subject-column-tooltip"
      data-tooltip-content={helpText}
      data-tooltip-place="top"
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="6.5" r="1" fill="currentColor" />
      </svg>
    </button>
  </span>
);

SubjectColumnHeader.propTypes = {
  label: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
};

const SortableSubjectRow = ({ id, index, label, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        backgroundColor: isDragging ? "white" : undefined,
      }}
      className="border-t border-gray-100"
    >
      <td className="px-2 py-2 text-center align-middle">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${label} ${index + 1}`}
          className="inline-flex cursor-grab items-center justify-center rounded p-2 text-gray-500 hover:bg-gray-100 active:cursor-grabbing"
          style={{ touchAction: "none" }}
        >
          <SvgIcon name="GrDrag" size={18} />
        </button>
      </td>
      {children}
    </tr>
  );
};

SortableSubjectRow.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const getUniqueDivisionIds = (gradeBands = []) =>
  new Set(
    (gradeBands || [])
      .filter(
        (band) =>
          band &&
          band.DivisionID !== "" &&
          band.DivisionID !== null &&
          band.DivisionID !== undefined
      )
      .map((band) => String(band.DivisionID))
  );

const normalizeGradeColorSettings = (settings, subjectGradeList = []) => {
  const serialByDivisionId = new Map();
  (subjectGradeList || []).forEach((subject) => {
    (subject?.gradeBands || []).forEach((band, index) => {
      if (band?.DivisionID !== "" && band?.DivisionID != null) {
        const divisionId = String(band.DivisionID);
        if (!serialByDivisionId.has(divisionId)) {
          serialByDivisionId.set(divisionId, Number(band.Serial) || index + 1);
        }
      }
    });
  });

  const entries = Array.isArray(settings)
    ? settings
    : Object.entries(settings || {}).map(([DivisionID, color], index) => ({
      DivisionID,
      Serial: index + 1,
      ...color,
    }));
  const normalized = new Map();

  entries.forEach((entry, index) => {
    if (!entry || entry.DivisionID === "" || entry.DivisionID == null) return;
    const divisionId = String(entry.DivisionID);
    normalized.set(divisionId, {
      DivisionID: divisionId,
      Serial:
        serialByDivisionId.get(divisionId) || Number(entry.Serial) || index + 1,
      isHighlighted: Boolean(entry.isHighlighted),
      highlightColor: entry.highlightColor || "#ffeb3b",
    });
  });

  return [...normalized.values()].sort((left, right) => left.Serial - right.Serial);
};

const getGradeColorSettings = (subjectGradeList = []) => {
  const settings = [];

  (subjectGradeList || []).forEach((subject) => {
    (subject?.gradeBands || []).forEach((band, index) => {
      if (
        band?.DivisionID !== "" &&
        band?.DivisionID !== null &&
        band?.DivisionID !== undefined &&
        !settings.some((setting) => String(setting.DivisionID) === String(band.DivisionID))
      ) {
        settings.push({
          DivisionID: String(band.DivisionID),
          Serial: Number(band.Serial) || index + 1,
          ...(band.color || {
            isHighlighted: false,
            highlightColor: "#ffeb3b",
          }),
        });
      }
    });
  });

  return normalizeGradeColorSettings(settings, subjectGradeList);
};

function HighlightToggle({ isHighlighted, highlightColor, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isHighlighted}
          onChange={(event) => onChange({ isHighlighted: event.target.checked })}
        />
        <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4" />
      </label>

      {isHighlighted && (
        <input
          type="color"
          value={highlightColor}
          title="হাইলাইট রঙ নির্বাচন করুন"
          className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
          onChange={(event) => onChange({ highlightColor: event.target.value })}
        />
      )}
    </div>
  );
}


const ExamSubjectPassNumber = ({ sharedStepData, setSharedStepData }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const { next, previous } = useMultiStepForm(sharedStepData?.isEditMode ? 'examConditionEdit' : 'examCondition');
  const { data: examDivitions } = useGetExamDivitionByTypeQuery(sharedStepData?.ExamType, {
    skip: !sharedStepData?.ExamType,
  });
  const [pointConditionFilter, setPointConditionFilter] = useState(null);
  const [showDivisionManager, setShowDivisionManager] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [editingSubjectGradeIndex, setEditingSubjectGradeIndex] = useState(null);
  const [divitionList, setDivitionList] = useState()
  const persistedSubjectIds = useRef(
    new Set(
      sharedStepData?.isEditMode
        ? (sharedStepData?.subjectGradeList || []).map((subject) =>
          String(subject.SubjectID)
        )
        : []
    )
  );
  const methods = useForm({
    defaultValues: {
      SessionID: sharedStepData?.SessionID,
      ExamID: sharedStepData?.ExamID,
      SubClassID: sharedStepData?.SubClassID,
      ExamType: sharedStepData?.ExamType,
      gradeBands: sharedStepData?.ExamType != 4 ? sharedStepData?.gradeBands || [] : [
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 1 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 2 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 3 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 4 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 5 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 6 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 7 },
      ],
      subjectPassNumbers: sharedStepData?.subjectPassNumbers?.length
        ? withDefaultSubjectNumbers(sharedStepData.subjectPassNumbers)
        : sharedStepData?.ExamType == 4
          ? [{ SubjectID: "", mayeri: "", optional: false, MaxNumber: 100, PassNumber: 33 }]
          : [],
      gradeColorSettings:
        normalizeGradeColorSettings(
          sharedStepData?.gradeColorSettings ||
          getGradeColorSettings(sharedStepData?.subjectGradeList),
          sharedStepData?.subjectGradeList
        ),

    },
  });
  const { data: subjectsListData } = useGetAcademicSubjectsQuery();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods


  useEffect(() => {
    if (!sharedStepData) return;

    const savedBands = sharedStepData?.subjectGradeList?.[0]?.gradeBands;
    if (savedBands?.length > 0) {
      setDivitionList(savedBands);
    }

    methods.reset({
      SessionID: sharedStepData?.SessionID,
      ExamID: sharedStepData?.ExamID,
      SubClassID: sharedStepData?.SubClassID,
      ExamType: sharedStepData?.ExamType,
      gradeBands: sharedStepData?.ExamType != 4
        ? sharedStepData?.gradeBands || []
        : emptyGradeBands,
      subjectPassNumbers: sharedStepData?.subjectPassNumbers?.length
        ? withDefaultSubjectNumbers(sharedStepData.subjectPassNumbers)
        : sharedStepData?.ExamType == 4
          ? [{ SubjectID: "", mayeri: "", optional: false, MaxNumber: 100, PassNumber: 33 }]
          : [],
      subjectGradeList: sharedStepData?.subjectGradeList || [],
      gradeColorSettings:
        normalizeGradeColorSettings(
          sharedStepData?.gradeColorSettings ||
          getGradeColorSettings(sharedStepData?.subjectGradeList),
          sharedStepData?.subjectGradeList
        ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedStepData?.SessionID, sharedStepData?.ExamID, sharedStepData?.SubClassID, sharedStepData?.ExamType]);
  const ExamType = sharedStepData?.ExamType
  console.log(ExamType);
  const [addDivition] = usePostExamDivitionMutation();
  const [updateDivition] = useUpdateExamDivitionMutation();

  const filteredSubjects = sharedStepData && sharedStepData.SubClassID ?
    (subjectsListData || []).filter(
      (subject) =>
        subject.SubClassID === Number(sharedStepData.SubClassID)
    ) : subjectsListData || [];
  const {
    fields: gradeFields,
    append: appendGrade,
    remove: removeGrade,
    replace: replaceGradeBands,
  } = useFieldArray({ control, name: "gradeBands" });

  const {
    fields: subjectFields,
    append: appendSubject,
    remove: removeSubject,
    move: moveSubject,
    replace: replaceSubjects,
  } = useFieldArray({
    control,
    name: "subjectPassNumbers",
  });
  const {
    fields: subjectGradeFields,
    append: appendSubjectGrade,
    remove: removeSubjectGrade,
    replace: replaceSubjectGrade,
  } = useFieldArray({ control, name: "subjectGradeList" });

  const divisionsPrefilled = useRef(false);

  useEffect(() => {
    if (divisionsPrefilled.current) return;
    if (!divitionList?.length || !examDivitions?.length) return;

    divitionList.forEach((band, index) => {
      if (band?.DivisionID !== "" && band?.DivisionID != null) {
        setValue(`gradeBands.${index}.DivisionID`, String(band.DivisionID));
      }
    });
    divisionsPrefilled.current = true;
  }, [divitionList, examDivitions, setValue]);

  const onSubmit = (data) => {
    if (ExamType != 4 && !data.subjectPassNumbers?.length) {
      Swal.fire({
        icon: "warning",
        title: translate("Select at least one subject"),
      });
      return;
    }

    const gradeColorSettings = normalizeGradeColorSettings(
      data.gradeColorSettings,
      data.subjectGradeList
    );
    const subjectGradeList = (data.subjectGradeList || []).map((subject) => ({
      ...subject,
      gradeBands: (subject.gradeBands || []).map((band) => {
        const colorSetting = gradeColorSettings.find(
          (setting) => String(setting.DivisionID) === String(band.DivisionID)
        );

        return {
          ...band,
          color: colorSetting
            ? {
              isHighlighted: colorSetting.isHighlighted,
              highlightColor: colorSetting.highlightColor,
            }
            : band.color || {
              isHighlighted: false,
              highlightColor: "#ffeb3b",
            },
        };
      }),
    }));
    const payload = {
      ...sharedStepData,
      ...data,
      gradeColorSettings,
      subjectGradeList,
    };

    console.log("Old:", sharedStepData);
    console.log("New:", data);
    console.log("Payload:", payload);
    const subjectIds = new Set();
    for (const subject of payload.subjectPassNumbers) {
      if (subjectIds.has(subject.SubjectID)) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Subject",
          text: "একই বিষয় একাধিকবার নির্বাচন করা হয়েছে।",
        });

        return;
      }

      subjectIds.add(subject.SubjectID);
    }
    setSharedStepData(payload);
    next();
  };
  useEffect(() => {
    console.log(sharedStepData?.ExamType);

    if (
      sharedStepData?.ExamType == 4 &&
      Array.isArray(sharedStepData?.subjectGradeList)
    ) {
      replaceSubjectGrade(sharedStepData.subjectGradeList);
    }
  }, [sharedStepData, replaceSubjectGrade]);

  useEffect(() => {
    if (sharedStepData?.subjectPassNumbers?.length) {
      sharedStepData.subjectPassNumbers.forEach((band, idx) => {
        setValue(`subjectPassNumbers.${idx}.SubjectID`, band.SubjectID);
        setValue(
          `subjectPassNumbers.${idx}.PassNumber`,
          passNumberOrDefault(band.PassNumber)
        );
      });
    }
  }, [subjectsListData, sharedStepData?.SubClassID, sharedStepData?.subjectPassNumbers, setValue]);


  const handleSaveAndContinue = handleSubmit((data) => {
    onSubmit(data);
  });
  const handleSaveAndPrevious = () => {
    previous();
  };

  // Reused to reset the grade band rows after each subject is stored
  const emptyGradeBands = [
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 1 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 2 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 3 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 4 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 5 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 6 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 7 },
  ];

  const clearSubjectGradeForm = () => {
    setValue("SubjectID", "");
    setValue("PassNumber", "");
    setValue("MaxNumber", "");
    setValue("mayeri", "");
    replaceGradeBands(emptyGradeBands);
    setEditingSubjectGradeIndex(null);
  };

  const clearSubjectIDOnly = () => {
    setValue("SubjectID", "");
    setEditingSubjectGradeIndex(null);
  };

  const handleEditSubjectGrade = (index) => {
    const rowData = watch(`subjectGradeList.${index}`) || {};
    setValue("SubjectID", rowData.SubjectID || "");
    setValue("PassNumber", rowData.PassNumber || "");
    setValue("MaxNumber", rowData.MaxNumber || "");
    setValue("mayeri", rowData.mayeri || "");
    replaceGradeBands(
      Array.isArray(rowData.gradeBands)
        ? rowData.gradeBands.map((band) => ({ ...band }))
        : emptyGradeBands
    );
    setEditingSubjectGradeIndex(index);
  };

  const handleAddAnotherSubject = () => {
    try {
      const subjectID = watch("SubjectID");
      const passNumber = watch("PassNumber");
      const maxNumber = watch("MaxNumber");
      const mayeri = watch("mayeri");

      const currentGradeBands = watch("gradeBands") || [];
      const existingSubjectList = watch("subjectGradeList") || [];
      const existingSubjectGradeBands = existingSubjectList
        .filter((_, rowIndex) => rowIndex !== editingSubjectGradeIndex)
        .flatMap((item) => item?.gradeBands || []);
      const incompleteGrade = currentGradeBands.some(
        (band) =>
          !String(band?.DivisionNumber ?? "").trim() ||
          band?.DivisionID === "" ||
          band?.DivisionID === null ||
          band?.DivisionID === undefined
      );

      if (incompleteGrade) {
        Swal.fire({
          icon: "warning",
          title: translate("Complete all grade rows before adding this subject"),
        });
        return;
      }

      const selectedDivisionIds = currentGradeBands.map((band) =>
        String(band.DivisionID)
      );
      if (new Set(selectedDivisionIds).size !== selectedDivisionIds.length) {
        Swal.fire({
          icon: "error",
          title: translate("A grade division can only be selected once per subject"),
        });
        return;
      }

      const uniqueDivisionIdsInSavedRows = getUniqueDivisionIds(existingSubjectGradeBands);
      const uniqueDivisionIdsForCurrentRow = getUniqueDivisionIds(currentGradeBands);
      const totalUniqueDivisionIds = new Set([
        ...uniqueDivisionIdsInSavedRows,
        ...uniqueDivisionIdsForCurrentRow,
      ]);

      if (!subjectID || !passNumber || !maxNumber) {
        Swal.fire({
          icon: "warning",
          title: translate("Please fill Subject, Pass Number and Highest score first"),
        });
        return;
      }

      if (totalUniqueDivisionIds.size > MAX_GRADE_BANDS) {
        Swal.fire({
          icon: "error",
          title: translate("Maximum 7 unique grade divisions are allowed"),
        });
        return;
      }

      // Prevent adding the same subject twice, except when editing the current row
      const isDuplicate = existingSubjectList.some(
        (item, idx) =>
          Number(item.SubjectID) === Number(subjectID) &&
          idx !== editingSubjectGradeIndex
      );

      if (isDuplicate) {
        Swal.fire({
          icon: "error",
          title: translate("This subject has already been added"),
        });
        return;
      }

      const newSubjectGrade = {
        SubjectID: subjectID,
        PassNumber: passNumber,
        MaxNumber: maxNumber,
        gradeBands: currentGradeBands.map((band) => ({ ...band })),
        mayeri: mayeri != 4 ? 3 : mayeri,
      };

      if (editingSubjectGradeIndex !== null) {
        setValue(`subjectGradeList.${editingSubjectGradeIndex}`, newSubjectGrade);
        // Clear only the subject fields. Keep gradeBands, same as the "add" path.
        setValue("SubjectID", "");
        setValue("PassNumber", "");
        setValue("MaxNumber", "");
        setValue("mayeri", "");
        setEditingSubjectGradeIndex(null);
      } else {
        appendSubjectGrade(newSubjectGrade);
        clearSubjectIDOnly();
      }
    } catch (error) {
      console.error("handleAddAnotherSubject failed:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to add subject"),
        text: error?.message || translate("Please try again."),
      });
    }
  };

  const handleCreateDivision = async (event) => {
    event.preventDefault();

    if (!ExamType) {
      Swal.fire({
        icon: "warning",
        title: translate("Exam Type is required"),
        text: translate("Please select an exam type before adding a division."),
      });
      return;
    }

    const divisionName = watch("DivisionName")?.trim();
    const divisionArabic = watch("DivisionArabic")?.trim() || "";
    const divisionEnglish = watch("DivisionEnglish")?.trim() || "";

    if (!divisionName) {
      Swal.fire({
        icon: "warning",
        title: translate("Division name is required"),
      });
      return;
    }

    try {
      const isEditingDivision = Boolean(editingDivision);
      const payload = {
        DivisionName: divisionName,
        DivisionArabic: divisionArabic,
        DivisionEnglish: divisionEnglish,
        ExamType: ExamType,
      };

      await (isEditingDivision
        ? updateDivition({
          id: editingDivision.ID || editingDivision.id,
          body: payload,
        }).unwrap()
        : addDivition(payload).unwrap());

      setValue("DivisionName", "");
      setValue("DivisionArabic", "");
      setValue("DivisionEnglish", "");
      setEditingDivision(null);

      Swal.fire({
        title: translate(
          isEditingDivision
            ? "Division updated successfully"
            : "Division added successfully"
        ),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("handleCreateDivision failed:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to save division"),
        text: error?.data?.message || error?.data?.error || translate("Please try again."),
      });
    }
  };

  const handleEditDivision = (division) => {
    setEditingDivision(division);
    setValue("DivisionName", division?.DivisionNames || "");
    setValue("DivisionArabic", division?.DivisionArabics || "");
    setValue("DivisionEnglish", division?.DivisionEnglishs || "");
    setShowDivisionManager(true);
  };

  const handleCloseDivisionManager = () => {
    setEditingDivision(null);
    setValue("DivisionName", "");
    setValue("DivisionArabic", "");
    setValue("DivisionEnglish", "");
    setShowDivisionManager(false);
  };

  const colorDivisionIds = new Set(
    [
      ...(watch("subjectGradeList") || []).flatMap((subject) =>
        (subject?.gradeBands || []).map((band) => band?.DivisionID)
      ),
      ...(watch("gradeBands") || []).map((band) => band?.DivisionID),
    ]
      .filter((divisionId) => divisionId !== "" && divisionId != null)
      .map(String)
  );
  const gradeBandsInEditor = watch("gradeBands") || [];
  const gradeColorSettings = watch("gradeColorSettings") || [];
  const editingSubjectId =
    editingSubjectGradeIndex === null
      ? null
      : watch(`subjectGradeList.${editingSubjectGradeIndex}.SubjectID`);
  const isPersistedSubjectGradeEdit =
    editingSubjectId != null &&
    persistedSubjectIds.current.has(String(editingSubjectId));
  const shouldDisableDivisionSelect = isPersistedSubjectGradeEdit || (editingSubjectGradeIndex === null && subjectGradeFields.length > 0);
  const colorDivisions = (examDivitions || []).filter((division) =>
    colorDivisionIds.has(String(division.ID))
  );
  const selectedSubjectIds = (watch("subjectPassNumbers") || [])
    .map((subject) => subject?.SubjectID)
    .filter((id) => id !== "" && id != null)
    .map(String);
  const subjectDragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSubjectDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const from = subjectFields.findIndex((field) => field.id === active.id);
    const to = subjectFields.findIndex((field) => field.id === over.id);
    if (from !== -1 && to !== -1) moveSubject(from, to);
  };

  const handleSubjectSelectionChange = (selectedIds) => {
    const currentRows = getValues("subjectPassNumbers") || [];
    const emptyRow = currentRows.find((row) => !row?.SubjectID);
    const rows = selectedIds.map((id) =>
      currentRows.find((row) => String(row.SubjectID) === id) || {
        ...emptyRow,
        SubjectID: id,
        mayeri: emptyRow?.mayeri || "",
        MaxNumber: emptyRow?.MaxNumber ?? 100,
        PassNumber: passNumberOrDefault(emptyRow?.PassNumber),
        optional: emptyRow?.optional || false,
      }
    );

    replaceSubjects(withDefaultSubjectNumbers(rows));
  };

  const updateGradeColorSetting = (divisionId, changes) => {
    const subjectGradeList = getValues("subjectGradeList") || [];
    const settings = normalizeGradeColorSettings(
      getValues("gradeColorSettings"),
      subjectGradeList
    );
    const divisionKey = String(divisionId);
    const current = settings.find(
      (setting) => String(setting.DivisionID) === divisionKey
    );
    const selectedBand = [
      ...subjectGradeList.flatMap((subject) => subject?.gradeBands || []),
      ...(getValues("gradeBands") || []),
    ].find((band) => String(band?.DivisionID) === divisionKey);
    const serial =
      Number(current?.Serial || selectedBand?.Serial) ||
      colorDivisions.findIndex((division) => String(division.ID) === divisionKey) + 1;
    const nextSettings = current
      ? settings.map((setting) =>
        String(setting.DivisionID) === divisionKey
          ? { ...setting, ...changes }
          : setting
      )
      : [
        ...settings,
        {
          DivisionID: divisionKey,
          Serial: serial,
          isHighlighted: false,
          highlightColor: "#ffeb3b",
          ...changes,
        },
      ];

    setValue(
      "gradeColorSettings",
      normalizeGradeColorSettings(nextSettings, subjectGradeList),
      { shouldDirty: true }
    );
  };

  return (
    <div>

      {
        ExamType != 4 ? (
          <FormProvider {...methods}>
            <form
              className="w-full space-y-10 bg-white"
              onSubmit={handleSubmit(onSubmit)}
            >
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {translate("Subject Pass Number")}
                </h2>
                <MultiSelect
                  options={filteredSubjects}
                  value={selectedSubjectIds}
                  onChange={handleSubjectSelectionChange}
                  valueField="SubjectID"
                  nameField="SubjectName"
                  label={translate("Subject")}
                  placeholder={translate("Select subjects")}
                  searchPlaceholder={translate("Search subjects")}
                  emptyMessage={translate("No subjects found")}
                />
                <div className="min-h-[200px]">
                  {subjectFields.length > 0 && <DndContext
                    sensors={subjectDragSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSubjectDragEnd}
                  >
                    <table className="w-full text-sm border border-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-12 px-2 py-2" aria-label={translate("Reorder subjects")} />
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            {translate("Subject")}
                          </th>
                          {ExamType != 3 && (<th className="text-left px-4 py-2 font-medium text-gray-600">
                            <SubjectColumnHeader
                              label={translate("Meyari")}
                              helpText={`মিয়ারি হচ্ছে কিতাবের গুরুত্বের ধরন। এর মধ্যে কিতাবগুলো ৩ ধরনের কন্ডিশনে ভাগ করা যায়। যথা: ১) গড় মিয়ারি: যেসকল বিষয় কম গুরুত্বপূর্ণ সে সকল বিষয়কে গড় মিয়ারি দ্বারা প্রকাশ করা হয়। পরীক্ষায় যদি এমন কন্ডিশন ব্যবহার করা হয় যেখানে ২/৩/৪ কিতাবে বা তার কম বিষয়ে অকৃতকার্য হওয়ার পরও যদি গড়ে সকল বিষয়ে পাস করে তাহলে তাকে মাকবুল/বিশেষ বিবেচনায় পাস বলে বিবেচনা করার সুযোগ থাকে।
২) মিয়ারি: মধ্যম গুরুত্বপূর্ণ এমন বিষয়গুলোকে মিয়ারি দ্বারা প্রকাশ করা যায়। মিয়ারি ও গড়মিয়ারির পরীক্ষার কন্ডিশনের ধরন প্রায় একই। নির্দিষ্ট বিষয়ে বা তার কম ফেল করার পর গড়ে পাস করলে মাকবুল/বিশেষ বিবেচনায় পাস বলে বিবেচনা করার সুযোগ থাকে।
৩) অধিকতর মিয়ারি: যেসকল বিষয়গুলোকে অধিক গুরুত্ব দেওয়া হয় বা অধিক গুরুত্বপূর্ণ বিষয় হিসাবে ধরা হয় এবং যেগুলো ১ বিষয়ে অকৃতকার্য হলেই রাসিব বা ফেল হয় সে বিষয়গুলো অধিকতর গুরুত্বপূর্ণ বিষয় বলে বিবেচনা করা হয়। গড় মিয়ারি ও মিয়ারি বিষয়ে যা হোক না কেনো অধিকতর বিষয়ে ১ বিষয়ে অকৃতকার্য হলেই ফলাফলে তখন রাসিব বা ফেল দেখাবে। `}
                            />
                          </th>)}

                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            <SubjectColumnHeader
                              label={translate("Max Number")}
                              helpText={`১ টি পরীক্ষার ১ টি বিষয়ে সর্বোচ্চ যত নাম্বারে পরীক্ষা হয় উক্ত নাম্বারকে সর্বোচ্চ প্রাপ্য নম্বর বলে ধরা হয়। উদাহরনস্বরুপ: মাসিক পরীক্ষা যদি ২০ নাম্বারের হয় তাহলে সর্বোচ্চ প্রাপ্য নাম্বার হবে ২০, সাময়িক পরীক্ষা যদি ১০০ নাম্বারের হয় তখন উক্ত পরীক্ষার প্রাপ্য নাম্বার হবে ১০০। `}
                            />
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            <SubjectColumnHeader
                              label={translate("Pass Number")}
                              helpText={`১টি পরীক্ষায় কোনো নির্দিষ্ট বিষয়ে যত নাম্বার পেলে গড়ে মাকবুল বা পাস করে উক্ত প্রাপ্য নাম্বারকে পাস নাম্বার বলে বিবেচনা করা হয়। সকল স্কুল/মাদরাসা নিয়ম অনুযায়ী পরীক্ষার ৩৩%-৪০% নাম্বার পাস নাম্বার বলে ধরা হয়। যদি ১০০ নাম্বারে পরীক্ষা হয় পাস নাম্বার হবে ৩৩, ৫০ এ পরীক্ষা হলে পাস নাম্বার হবে ১৭, ২০ নাম্বারে পরীক্ষা হলে পাস নাম্বার হবে ৭।`}
                            />
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            <SubjectColumnHeader
                              label={translate("Optional")}
                              helpText={`ক্বেরাত কন্ডিশন বলতে অপশনাল বিষয় বুঝায়, যেসকল বিষয়ের পরীক্ষা হয় কিন্তু উক্ত পরীক্ষার নাম্বার মোট নাম্বারের সাথে যুক্ত হয় না, সেসকল বিষয় ক্বেরাত কন্ডিশন বলে বিবেচনা করা হয়। উল্লেখ্য, অপশনাল বিষয়ে অকৃতকার্য / অনুপস্থিত হলে রাসিব/ বিবেচনায় পাস বলে বিবেচনা করা যাবে।`}
                            />
                          </th>
                          {/* <th className="px-4 py-2 w-10"></th> */}
                        </tr>
                      </thead>
                      <tbody>
                        <SortableContext
                          items={subjectFields.map((field) => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {subjectFields.map((field, index) => (
                            <SortableSubjectRow
                              key={field.id}
                              id={field.id}
                              index={index}
                              label={translate("Drag subject row")}
                            >
                              <td className="px-4 py-2 align-top">
                                <DefaultSelect
                                  options={filteredSubjects ?? []}
                                  valueField="SubjectID"
                                  nameField="SubjectName"
                                  registerKey={`subjectPassNumbers.${index}.SubjectID`}
                                  require="This is required!"
                                />
                              </td>

                              {ExamType != 3 && (<td className="px-4 py-2 align-top">
                                <DefaultSelect
                                  options={[
                                    { id: 1, name: translate("Gor mayeri") },
                                    { id: 2, name: translate("Mayeri") },
                                    { id: 3, name: translate("Most Mayeri") },
                                  ]}
                                  valueField="id"
                                  nameField="name"
                                  registerKey={`subjectPassNumbers.${index}.mayeri`}
                                  require="This is required!"
                                  hidePlaceholder={true}

                                />
                              </td>)

                              }

                              <td className="px-4 py-2 align-top">
                                <DefaultInput
                                  type="number"
                                  registerKey={`subjectPassNumbers.${index}.MaxNumber`}
                                  require="This is required!"
                                />
                              </td>
                              <td className="px-4 py-2 align-top">
                                <DefaultInput
                                  type="number"
                                  registerKey={`subjectPassNumbers.${index}.PassNumber`}
                                  require="This is required!"
                                />
                              </td>


                              <td className="px-4 py-2 align-top whitespace-nowrap vertical-align-middle">
                                <CheckboxOption
                                  label={translate("Kerat Condition")}
                                  registerKey={`subjectPassNumbers.${index}.optional`}
                                />
                              </td>

                              {/* <td className="px-4 py-2 align-top text-right">
                          {subjectFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubject(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          )}
                        </td> */}
                            </SortableSubjectRow>
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </DndContext>}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <Button
                      type="button"
                      onClick={handleSaveAndPrevious}
                      className="flex items-center gap-1"
                    >
                      <SvgIcon name="LongArrowLeft" />
                      {translate("Previous")}
                    </Button>
                  </div>

                  {/* <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        appendSubject({
                          SubjectID: "",
                          mayeri: "",
                          optional: false,
                          PassNumber: "",
                        })
                      }
                      className="px-5 py-2 rounded-md shadow-lg text-black bg-gray-200 flex items-center gap-1"
                    >
                      <SvgIcon name={"TbPlus"} /> {translate("Add Subject")}
                    </button>
                  </div> */}

                  <div className="text-end flex justify-end">
                    <Button type="submit" className="flex items-center gap-1">
                      {translate("Next")}
                      <SvgIcon name="LongArrowRight" />
                    </Button>
                  </div>
                </div>
              </section>
            </form>
          </FormProvider>
        ) : (
          <FormProvider {...methods}>
            <form
              className="w-full space-y-10 bg-white p-6 rounded-xl shadow-md"
              onSubmit={handleSubmit(onSubmit)}
            >

              {
                showDivisionManager ? (
                  <div className="w-full space-y-6 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-gray-800 pl-1">
                        {editingDivision ? "বিভাগ সম্পাদনা করুন" : "নতুন বিভাগ যোগ করুন"}
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <DefaultInput type="number" registerKey={"DivisionName"} placeholder={"বিভাগ (বাংলা)"} required />
                      </div>
                      <div>
                        <DefaultInput type="number" registerKey={"DivisionArabic"} placeholder={"বিভাগ (আরবি)"} />
                      </div>
                      <div>
                        <DefaultInput type="number" registerKey={"DivisionEnglish"} placeholder={"বিভাগ (ইংরেজি)"} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        onClick={handleCreateDivision}
                      >
                        {editingDivision ? "আপডেট করুন" : "সাবমিট ও নতুন যোগ করুন"}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex gap-1"
                        onClick={handleCloseDivisionManager}
                      >
                        <SvgIcon name="LongArrowLeft" />
                        এক্সাম কন্ডিশনে ফিরে যান
                      </button>
                    </div>


                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <SortableTable columns={[
                        {
                          title: "Action",
                          render: (row) => (
                            <EditButton onClick={() => handleEditDivision(row)} />
                          ),
                        },
                        { title: "SL.", render: (row, rowIndex) => <>{rowIndex + 1}</> },
                        { title: "বিভাগ (বাংলা).", field: "DivisionNames" },
                        { title: "বিভাগ ( ইংরেজি ).", field: "DivisionEnglishs" },
                        { title: "বিভাগ ( আরবি ).", field: "DivisionArabics" }
                      ]} data={examDivitions} isFilterColumn={false} />
                    </div>
                  </div>
                ) : (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-2">
                      {translate("Grade based on marks")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-5">
                      <DefaultSelect
                        label={translate('Subject')}
                        options={filteredSubjects ?? []}
                        valueField="SubjectID"
                        nameField="SubjectName"
                        registerKey="SubjectID"
                      />{' '}
                      <DefaultInput
                        registerKey={"PassNumber"}
                        label={'Pass Number'}
                        type="number"
                        required
                      />
                      <DefaultInput
                        registerKey={"MaxNumber"}
                        label={'Highest score'}
                        type="number"
                        required
                      />

                      <DefaultSelect
                        options={[
                          // { id: 1, name: "Gor mayeri" }, 
                          // { id: 2, name: "Mayeri" },
                          // { id: 3, name: "Most Mayeri" },
                          { id: 4, name: "Optional" },
                        ]}
                        valueField="id"
                        nameField="name"
                        registerKey={`mayeri`}
                        label={"Meyari"}
                      />
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">
                              {translate("Minimum Number")} (&ge;)
                            </th>
                            <th className="text-left px-4 py-2 font-medium text-gray-600 flex items-center justify-between">
                              {translate("Grade (Bengali)")}
                              <button
                                type='button'
                                className='text-blue-600 flex items-center gap-1'
                                onClick={() => setShowDivisionManager(true)}
                              >
                                <SvgIcon name={"TbPlus"} />
                                {translate("Add Division")}
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeFields.map((field, index) => {
                            const selectedDivisionValue = gradeBandsInEditor[index]?.DivisionID;
                            const divisionsUsedInOtherRows = new Set(
                              gradeBandsInEditor
                                .filter((_, rowIndex) => rowIndex !== index)
                                .map((band) => String(band?.DivisionID ?? ""))
                                .filter(Boolean)
                            );
                            const availableDivisions = (examDivitions || []).filter(
                              (division) =>
                                String(division.ID) === String(selectedDivisionValue) ||
                                !divisionsUsedInOtherRows.has(String(division.ID))
                            );

                            const division = colorDivisions[index]
                            const rowDivisionId = selectedDivisionValue;
                            const hasRowDivision =
                              rowDivisionId !== "" && rowDivisionId !== null && rowDivisionId !== undefined;
                            const rowColorSetting = hasRowDivision
                              ? gradeColorSettings.find(
                                (setting) => String(setting.DivisionID) === String(rowDivisionId)
                              )
                              : null;
                            return (
                              <tr key={field.id} className="border-t border-gray-100">
                                <td className="px-4 py-2">
                                  <DefaultInput
                                    registerKey={`gradeBands.${index}.DivisionNumber`}
                                    type="number"
                                    placeholder="যেমন: ৮০"
                                    required
                                    defaultValue={getValues(`gradeBands.${index}.DivisionNumber`)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <DefaultSelect
                                    label=""
                                    options={availableDivisions}
                                    registerKey={`gradeBands.${index}.DivisionID`}
                                    nameField="DivisionNames"
                                    valueField="ID"
                                    defaultValue={translate("Select Divition")}
                                    disabled={shouldDisableDivisionSelect}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <td className="px-4 py-2">
                                    {hasRowDivision && (
                                      <HighlightToggle
                                        isHighlighted={rowColorSetting?.isHighlighted || false}
                                        highlightColor={rowColorSetting?.highlightColor || "#ffeb3b"}
                                        onChange={(changes) => updateGradeColorSetting(rowDivisionId, changes)}
                                      />
                                    )}
                                  </td>
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* {colorDivisions.length > 0 && (
                      <div className="mt-4">
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                          {translate("Grade highlight colors")}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {colorDivisions.map((division) => (
                            <div key={division.ID} className="flex items-center gap-2">
                              <span>{division.DivisionNames}</span>

                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}
                    <div className="mt-2">
                      <Button type="button" onClick={handleAddAnotherSubject} className="flex gap-1"> <SvgIcon name={"TbPlus"} /> {translate("Add Now")}</Button>
                    </div>

                  </section>
                )
              }

              {subjectGradeFields.length > 0 && (
                <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">SL.</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">{translate("Subject")}</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">{translate("Pass Number")}</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">সর্বোচ্চ নম্বর</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">গ্রেড সংখ্যা</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">মিয়ারি</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectGradeFields.map((field, index) => {
                        const rowData = watch(`subjectGradeList.${index}`);
                        const subjectName =
                          filteredSubjects.find(
                            (s) => Number(s.SubjectID) === Number(rowData?.SubjectID)
                          )?.SubjectName || rowData?.SubjectID;
                        const filledGradeCount = (rowData?.gradeBands || []).filter(
                          (g) => g.DivisionNumber && g.DivisionID
                        ).length;

                        return (
                          <tr key={field.id} className="border-t border-gray-100">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{subjectName}</td>
                            <td className="px-4 py-2">{rowData?.PassNumber}</td>
                            <td className="px-4 py-2">{rowData?.MaxNumber}</td>
                            <td className="px-4 py-2">{filledGradeCount}</td>
                            <td className="px-4 py-2">{rowData?.mayeri == 1 ? "গড় মিয়ারি" : rowData?.mayeri == 2 ? "মিয়ারি" : rowData?.mayeri == 3 ? " অধিকতর মিয়ারি" : rowData?.mayeri == 4 ? "অপশনাল" : ""}</td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <EditButton
                                  onClick={() => handleEditSubjectGrade(index)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSubjectGrade(index)}
                                  className="bg-red-600 hover:bg-red-800 flex justify-center items-center text-white rounded-md py-2 px-3"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 flex justify-between gap-4">
                <div>
                  <Button type="button" onClick={handleSaveAndPrevious}>
                    {translate("Previous")}
                  </Button>
                </div>
                <div className="text-end">
                  <Button type="submit">
                    {translate("Save & Continue")}
                  </Button>
                </div>
              </div>
              {/* <Button type="submit" className="mt-6">{translate("Save & Continue")}</Button> */}
            </form>
          </FormProvider>
        )
      }
    </div>
  );
};
export default ExamSubjectPassNumber;
