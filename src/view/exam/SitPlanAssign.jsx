import { useState, useEffect } from 'react';
import { useGetExamHallListQuery } from '../../features/examhall/examHallQuerySlice';
import Button from '../../components/Button/Button';
import { useMultiStepForm } from '../../hooks/useMultiStepForm';
import PropTypes from 'prop-types';
import useTranslate from '../../utils/Translate';
import {
    useGetExamShiftQuery,
    useGetExamSubClassQuery,
    useGetExamSubClassStudentsQuery,
    useGetSitPlanBySitPlanIDQuery,
    useSaveSitPlanMutation,
} from '../../features/exam/examSitPlanQuerySlice';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import bnBijoy2Unicode from '../../utils/conveter';
import { Link, useNavigate, useParams } from 'react-router-dom';
const SCOPE_OPTIONS = [
    {
        value: 'this-column',
        label: 'This column only',
        sub: 'Pattern applies to selected column only. Stop when column ends.',
    },
    {
        value: 'this-room',
        label: 'Entire room',
        sub: 'When column runs out, continue same pattern into next columns in this hall.',
    },
    {
        value: 'till-end',
        label: 'Until list ends',
        sub: 'Continue across all columns and all rooms until every student is seated.',
    },
];

// ─── Pattern Engine ────────────────────────────────────────────────────────────

function getSeatsForColumn(hallId, col, startRowIdx, seatPosOdd, seatPosEven, format, skip) {
    const result = [];
    col.rows.forEach((row, ri) => {
        if (ri < startRowIdx) return;
        const relRow = ri - startRowIdx;
        const skipFactor = skip ? 2 : 1;
        if (relRow % skipFactor !== 0) return;
        const isEvenRel = relRow % 2 === 0;
        const seatList =
            format === 'zigzag' ? (isEvenRel ? seatPosOdd : seatPosEven) : seatPosOdd;
        seatList.forEach(sn => {
            if (sn <= row.seats) {
                result.push({
                    hallId,
                    colIdx: col.colIndex,
                    rowIdx: ri,
                    rowId: row.id,
                    seatNum: sn,
                    colId: col.id,
                });
            }
        });
    });
    return result;
}

function buildSeatSlots(hall, startColIdx, startRowIdx, seatPosOdd, seatPosEven, format, skip, scope) {
    const allSlots = [];

    if (scope === 'this-column') {
        const col = hall.columns[startColIdx];
        return getSeatsForColumn(hall.id, col, startRowIdx, seatPosOdd, seatPosEven, format, skip);
    }

    if (scope === 'this-room' || scope === 'till-end') {
        hall.columns.forEach((col, ci) => {
            if (ci < startColIdx) return;
            const fromRow = ci === startColIdx ? startRowIdx : 0;
            const seats = getSeatsForColumn(hall.id, col, fromRow, seatPosOdd, seatPosEven, format, skip);
            seats.forEach(s => allSlots.push({ ...s, colIdx: ci }));
        });
        return allSlots;
    }

    return allSlots;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleBtn({ label, active, onClick }) {
    const tranlate = useTranslate();
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap
                ${active
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                }`}
        >
            {tranlate(label)}
        </button>
    );
}

ToggleBtn.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

function StatCard({ label, value, sub }) {
    const translate = useTranslate()
    return (
        <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">{translate(label)}</p>
            <p className="text-xl font-medium text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

StatCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sub: PropTypes.string,
};

// ─── Colour palette for class badges ─────────────────────────────────────────
const CLASS_COLORS = [
    { hex: '#E1F5EE', hexBorder: '#9FE1CB', hexText: '#0F6E56' },
    { hex: '#E6F1FB', hexBorder: '#B5D4F4', hexText: '#0C447C' },
    { hex: '#FBEAF0', hexBorder: '#F4C0D1', hexText: '#72243E' },
    { hex: '#FAEEDA', hexBorder: '#FAC775', hexText: '#633806' },
    { hex: '#F3E8FF', hexBorder: '#D8B4FE', hexText: '#6B21A8' },
    { hex: '#ECFDF5', hexBorder: '#A7F3D0', hexText: '#065F46' },
];

// ─── Helper: normalise API hall shape ─────────────────────────────────────────
function normaliseHall(h) {
    return {
        id: h.HallID,
        name: h.HallName,
        totalSeats: h.TotalSeats,
        totalColumns: h.TotalColumns,
        totalRows: h.TotalRows,
        columns: (h.columns || []).map((col, ci) => ({
            id: col.ColumnID,
            label: col.Label,
            colIndex: ci,
            rows: (col.rows || []).map(r => ({
                id: r.RowID,
                seats: r.Seats,
                label: r.RowLabel,
            })),
        })),
    };
}

// ─── Main Component ────────────────────────────────────────────────────────────
const SitPlanAssign = ({ sessionId, examId, sharedStepData }) => {
    const { next, previous } = useMultiStepForm('employeeForm');

    // assignments: { "shiftId-hallId-colIdx-rowIdx-seatNum" -> { cls, userCode, shiftId, assignmentId? } }
    const [assignments, setAssignments] = useState({});
    const [isLocked, setIsLocked] = useState(false); // true when sitPlan isActive = true

    // ── FIX P1: track which shift each class is locked to ────────────────────
    // classShiftMap: { subClassId -> shiftId }
    const [classShiftMap, setClassShiftMap] = useState({});

    const [startSeat, setStartSeat] = useState(null);
    const [format, setFormat] = useState('straight');
    const [skip, setSkip] = useState(false);
    const [seatPosOdd, setSeatPosOdd] = useState([]);
    const [seatPosEven, setSeatPosEven] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedShift, setSelectedShift] = useState('');
    const [scope, setScope] = useState('this-column');
    const [results, setResults] = useState([]);
    const [toast, setToast] = useState('');
    const [openHalls, setOpenHalls] = useState({});
    const [selectedHallId, setSelectedHallId] = useState(null);
    const translate = useTranslate();

    const { data: examShift } = useGetExamShiftQuery({ sessionId, examId });
    const { data: examSubClasses } = useGetExamSubClassQuery({ sessionId, examId });
    const { data: examHallList, isLoading: isLoadingExamHallList } = useGetExamHallListQuery();
    const { data: studentList, isLoading: isLoadingStudentCount } = useGetExamSubClassStudentsQuery(
        { sessionId, examId, subClassId: selectedClass },
        { skip: !selectedClass }
    );
    const { data: sitPlanDetails } = useGetSitPlanBySitPlanIDQuery(
        { sitplanid: sharedStepData },
        { skip: !sharedStepData }
    );
    const [saveSitPlan] = useSaveSitPlanMutation();
    const { currectLanguage } = useSelector((state) => state.language);

    // ── Derive class meta (label + colour) ───────────────────────────────────
    const [classMeta] = useState({});

    function getClassMeta(subClassId) {
        if (!subClassId) return null;
        if (classMeta[subClassId]) return classMeta[subClassId];
        const found = examSubClasses?.find(k => String(k.SubClassID) === String(subClassId));
        const label = found?.Class?.SubClass || `Class ${subClassId}`;
        const idx =
            (typeof subClassId === 'number' ? subClassId : parseInt(subClassId) || 0) %
            CLASS_COLORS.length;
        const color = CLASS_COLORS[idx] || CLASS_COLORS[0];
        const meta = { label, ...color };
        classMeta[subClassId] = meta;
        return meta;
    }

    // ── FIX P2: count already-assigned seats per class per shift ─────────────
    function getAssignedCountForClass(cls) {
        return Object.entries(assignments).filter(
            ([key, v]) => v.cls === String(cls) && key.startsWith(`${selectedShift}-`)
        ).length;
    }

    // ── Load existing sitPlan into state ─────────────────────────────────────
    useEffect(() => {
        console.log("Seat Plan details");
        console.log(sharedStepData);
        

        console.log(sitPlanDetails);
        
        
        if (!sitPlanDetails || !hallList.length) return;

        const { isActive, SitPlan } = sitPlanDetails;
        if (!SitPlan || SitPlan.length === 0) return;

        setIsLocked(!!isActive);

        // Build assignments map from existing plan data
        const loadedAssignments = {};
        const loadedClassShiftMap = {};

        SitPlan.forEach(item => {
            const { ShiftID, HallID, ColumnID, RowID, SeatNum, SubClassID, UserCode, AssignmentID } = item;

            // Find colIdx and rowIdx from hall structure
            const hall = hallList.find(h => h.id === HallID);
            if (!hall) return;

            const colIdx = hall.columns.findIndex(c => c.id === ColumnID);
            if (colIdx === -1) return;

            const rowIdx = hall.columns[colIdx].rows.findIndex(r => r.id === RowID);
            if (rowIdx === -1) return;

            const key = `${ShiftID}-${HallID}-${colIdx}-${rowIdx}-${SeatNum}`;
            loadedAssignments[key] = {
                cls: String(SubClassID),
                userCode: String(UserCode),
                shiftId: String(ShiftID),
                assignmentId: AssignmentID, // keep original DB id for updates
            };

            // Lock class → shift
            if (!loadedClassShiftMap[String(SubClassID)]) {
                loadedClassShiftMap[String(SubClassID)] = String(ShiftID);
            }
        });

        // Build results log grouped by shiftId + subClassId + hallId
        const groupMap = {};
        SitPlan.forEach(item => {
            const { ShiftID, SubClassID, HallID, ColumnID, SeatNum } = item;
            const hall = hallList.find(h => h.id === HallID);
            if (!hall) return;
            const colIdx = hall.columns.findIndex(c => c.id === ColumnID);
            if (colIdx === -1) return;
            const rowIdx = hall.columns[colIdx].rows.findIndex(r => r.id === item.RowID);
            if (rowIdx === -1) return;

            const groupKey = `${ShiftID}-${SubClassID}-${HallID}`;
            if (!groupMap[groupKey]) {
                groupMap[groupKey] = {
                    cls: String(SubClassID),
                    shiftId: String(ShiftID),
                    hallName: hall.name,
                    scope: 'loaded',
                    assigned: 0,
                    remaining: 0,
                    byHallCol: {},
                    slots: [],
                };
            }
            const entry = groupMap[groupKey];
            entry.assigned += 1;
            const colLabel = hall.columns[colIdx]?.label || `Col ${colIdx + 1}`;
            const colGroupKey = `Hall ${hall.name} - ${colLabel}`;
            entry.byHallCol[colGroupKey] = (entry.byHallCol[colGroupKey] || 0) + 1;
            entry.slots.push({ hallId: HallID, colIdx, rowIdx, seatNum: SeatNum });
        });

        setAssignments(loadedAssignments);
        setClassShiftMap(loadedClassShiftMap);
        setResults(Object.values(groupMap));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sitPlanDetails, examHallList]); // examHallList triggers re-run once halls are loaded

    const studentCount = studentList ? studentList.length : 0;

    // remaining = total students minus already seated globally for this class
    const alreadyAssigned = selectedClass ? getAssignedCountForClass(selectedClass) : 0;
    const remainingStudents = Math.max(0, studentCount - alreadyAssigned);

    // ── Hall / column helpers ─────────────────────────────────────────────────
    const rawHallList = examHallList && examHallList.length > 0 ? examHallList : [];
    const hallList = rawHallList.map(normaliseHall);
    const activeHall = hallList.find(h => h.id === selectedHallId) || null;

    const selectedCol =
        startSeat !== null && activeHall ? activeHall.columns[startSeat.colIdx] : null;
    const maxSeatsInCol = selectedCol ? Math.max(...selectedCol.rows.map(r => r.seats)) : 0;

    const canAssign =
        selectedClass &&
        selectedShift &&
        startSeat !== null &&
        seatPosOdd.length > 0 &&
        activeHall !== null;

    // ── FIX P1: shift conflict check ─────────────────────────────────────────
    const shiftConflict = (() => {
        if (!selectedClass || !selectedShift) return false;
        const locked = classShiftMap[String(selectedClass)];
        return locked !== undefined && String(locked) !== String(selectedShift);
    })();

    const lockedShiftName = (() => {
        if (!shiftConflict) return '';
        const shiftId = classShiftMap[String(selectedClass)];
        return examShift?.find(s => String(s.ShiftID) === String(shiftId))?.ShiftName || `Shift ${shiftId}`;
    })();

    // ── FIX P2: preview uses remainingStudents as cap ────────────────────────
    const previewSlots = (() => {
        if (!selectedCol || seatPosOdd.length === 0 || !activeHall) return [];

        if (scope === 'till-end') {
            const activeIdx = hallList.findIndex(h => h.id === activeHall.id);
            const slots = [];
            const activeSlots = buildSeatSlots(
                activeHall, startSeat.colIdx, startSeat.rowIdx,
                seatPosOdd, seatPosEven, format, skip, 'this-room'
            );
            slots.push(...activeSlots);
            let i = activeIdx + 1;
            while (slots.length < remainingStudents && i < hallList.length) {
                const nextSlots = buildSeatSlots(
                    hallList[i], 0, 0,
                    seatPosOdd, seatPosEven, format, skip, 'this-room'
                );
                slots.push(...nextSlots);
                i++;
            }
            // cap to remaining students, not total
            return slots.slice(0, remainingStudents);
        }

        // this-column / this-room: also cap to remainingStudents
        const slots = buildSeatSlots(
            activeHall, startSeat.colIdx, startSeat.rowIdx,
            seatPosOdd, seatPosEven, format, skip, scope
        );
        return slots.slice(0, remainingStudents);
    })();

    const previewKeys = new Set(
        previewSlots.map(s => `${selectedShift}-${s.hallId}-${s.colIdx}-${s.rowIdx}-${s.seatNum}`)
    );

    const availableSeats = (() => {
        if (!canAssign) return 0;
        if (scope === 'till-end') {
            const activeIdx = hallList.findIndex(h => h.id === activeHall.id);
            let total = buildSeatSlots(
                activeHall, startSeat.colIdx, startSeat.rowIdx,
                seatPosOdd, seatPosEven, format, skip, 'this-room'
            ).length;
            for (let i = activeIdx + 1; i < hallList.length; i++) {
                total += buildSeatSlots(
                    hallList[i], 0, 0,
                    seatPosOdd, seatPosEven, format, skip, 'this-room'
                ).length;
            }
            return total;
        }
        // for column/room scopes, available is capped to remaining students
        return Math.min(previewSlots.length, remainingStudents);
    })();

    const willOverflow =
        scope === 'till-end' && remainingStudents > availableSeats && remainingStudents > 0;

    // ── helpers ───────────────────────────────────────────────────────────────

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 2800);
    }

    function clickSeat(hallId, colIdx, rowIdx, seatNum) {
        // In locked mode, block clicking already-assigned seats
        if (isLocked && selectedShift) {
            const key = `${selectedShift}-${hallId}-${colIdx}-${rowIdx}-${seatNum}`;
            if (assignments[key]) {
                showToast('এই সিটটি ইতিমধ্যে নির্ধারিত এবং লক করা আছে।');
                return;
            }
        }
        setSelectedHallId(hallId);
        setStartSeat({ colIdx, rowIdx, seatNum });
        setSeatPosOdd([seatNum]);
        setSeatPosEven([]);
    }

    function toggleSeatPos(sn, list, setList) {
        setList(
            list.includes(sn)
                ? list.filter(s => s !== sn)
                : [...list, sn].sort((a, b) => a - b)
        );
    }

    function doAssign() {
        if (!canAssign || !activeHall) return;

        // ── FIX P1: block if class already locked to a different shift ────────
        if (shiftConflict) {
            showToast(`এই ক্লাস ইতিমধ্যে "${lockedShiftName}" শিফটে নির্ধারিত।`);
            return;
        }

        // ── FIX P2: use remainingStudents as the cap, not studentCount ────────
        if (remainingStudents === 0) {
            showToast('All students of this class are already seated.');
            return;
        }

        let slots = [];

        if (scope === 'till-end') {
            const activeIdx = hallList.findIndex(h => h.id === activeHall.id);
            const activeSlots = buildSeatSlots(
                activeHall, startSeat.colIdx, startSeat.rowIdx,
                seatPosOdd, seatPosEven, format, skip, 'this-room'
            );
            slots.push(...activeSlots);
            let i = activeIdx + 1;
            while (slots.length < remainingStudents && i < hallList.length) {
                const nextSlots = buildSeatSlots(
                    hallList[i], 0, 0,
                    seatPosOdd, seatPosEven, format, skip, 'this-room'
                );
                slots.push(...nextSlots);
                i++;
            }
        } else {
            slots = buildSeatSlots(
                activeHall, startSeat.colIdx, startSeat.rowIdx,
                seatPosOdd, seatPosEven, format, skip, scope
            );
        }

        // cap to remaining students (P2 fix)
        const toAssign = slots.slice(0, remainingStudents);

        // only free seats within the current shift
        const freeSlots = toAssign.filter(slot => {
            const key = `${selectedShift}-${slot.hallId}-${slot.colIdx}-${slot.rowIdx}-${slot.seatNum}`;
            return assignments[key] === undefined;
        });

        const duplicateCount = toAssign.length - freeSlots.length;

        if (freeSlots.length === 0) {
            showToast('All selected seats are already allocated.');
            return;
        }

        // ── FIX P3: pull next N students by UserCode in order ─────────────────
        const startIndex = alreadyAssigned; // how many already placed globally
        const studentsToPlace = (studentList || []).slice(
            startIndex,
            startIndex + freeSlots.length
        );

        const nextAssignments = { ...assignments };
        freeSlots.forEach((slot, idx) => {
            const key = `${selectedShift}-${slot.hallId}-${slot.colIdx}-${slot.rowIdx}-${slot.seatNum}`;
            nextAssignments[key] = {
                cls: String(selectedClass),
                userCode: studentsToPlace[idx]?.User?.UserCode ?? `#${startIndex + idx + 1}`,
                shiftId: String(selectedShift),
            };
        });

        setAssignments(nextAssignments);

        // ── FIX P1: lock this class to this shift on first assignment ─────────
        if (!classShiftMap[String(selectedClass)]) {
            setClassShiftMap(prev => ({
                ...prev,
                [String(selectedClass)]: String(selectedShift),
            }));
        }

        const byHallCol = {};
        freeSlots.forEach(slot => {
            const hall = hallList.find(h => h.id === slot.hallId);
            const hallName = hall?.name || 'Unknown';
            const colLabel = hall?.columns[slot.colIdx]?.label || `Col ${slot.colIdx + 1}`;
            const groupKey = `Hall ${hallName} - ${colLabel}`;
            if (!byHallCol[groupKey]) byHallCol[groupKey] = 0;
            byHallCol[groupKey]++;
        });

        const newAlreadyAssigned = alreadyAssigned + freeSlots.length;
        const newRemaining = Math.max(0, studentCount - newAlreadyAssigned);

        setResults(prev => [
            {
                cls: selectedClass,
                shiftId: selectedShift,
                hallName: activeHall.name,
                scope,
                assigned: freeSlots.length,
                remaining: newRemaining,
                byHallCol,
                slots: freeSlots,
            },
            ...prev,
        ]);

        if (duplicateCount > 0) {
            showToast(
                `${freeSlots.length} seats assigned. ${duplicateCount} seats were already booked.`
            );
        } else {
            showToast(
                `Assigned ${freeSlots.length} seats to ${getClassMeta(selectedClass)?.label}`
            );
        }
    }

    function cancelAssignment(index) {
        const updatedResults = results.filter((_, i) => i !== index);

        // Simpler rebuild: keep all assignments except those from the cancelled log
        const cancelledKeys = new Set(
            results[index].slots.map(
                slot => `${results[index].shiftId}-${slot.hallId}-${slot.colIdx}-${slot.rowIdx}-${slot.seatNum}`
            )
        );

        const cleanAssignments = {};
        Object.entries(assignments).forEach(([key, val]) => {
            if (!cancelledKeys.has(key)) cleanAssignments[key] = val;
        });

        setAssignments(cleanAssignments);
        setResults(updatedResults);

        // ── FIX P1: if no more assignments remain for that class, unlock shift ─
        const cancelledCls = String(results[index].cls);
        const stillHasAssignments = Object.values(cleanAssignments).some(
            v => v.cls === cancelledCls
        );
        if (!stillHasAssignments) {
            setClassShiftMap(prev => {
                const next = { ...prev };
                delete next[cancelledCls];
                return next;
            });
        }

        showToast('Assignment removed successfully');
    }

    function clearAll() {
        setAssignments({});
        setClassShiftMap({});
        setStartSeat(null);
        setSeatPosOdd([]);
        setSeatPosEven([]);
        setFormat('straight');
        setSkip(false);
        setSelectedClass('');
        setSelectedShift('');
        setScope('this-column');
        setResults([]);
    }

    const patternLines = selectedCol
        ? selectedCol.rows.map((row, ri) => {
            if (ri < startSeat.rowIdx) return `Row ${ri + 1}: —`;
            const relRow = ri - startSeat.rowIdx;
            if (skip && relRow % 2 !== 0) return `Row ${ri + 1}: (skipped)`;
            const isEvenRel = relRow % 2 === 0;
            const list =
                format === 'zigzag' ? (isEvenRel ? seatPosOdd : seatPosEven) : seatPosOdd;
            const valid = list.filter(s => s <= row.seats);
            const skippedSns = list.filter(s => s > row.seats);
            let line = `Row ${ri + 1}: seat${valid.length !== 1 ? 's' : ''} ${valid.length ? valid.join(', ') : '—'}`;
            if (skippedSns.length)
                line += `  ⚠ seat ${skippedSns.join(',')} skipped (bench has ${row.seats})`;
            return line;
        })
        : [];

    function toggleAccordion(hallId) {
        setOpenHalls(prev => ({ ...prev, [hallId]: !prev[hallId] }));
    }

    function selectHall(hall) {
        setSelectedHallId(hall.id);
        setStartSeat(null);
        setSeatPosOdd([]);
        setSeatPosEven([]);
        setOpenHalls(prev => ({ ...prev, [hall.id]: true }));
    }

    const handleAssignNextStep = async () => {
        const payload = Object.entries(assignments).map(([key, val]) => {
            const [shiftId, hallId, colIdx, rowIdx, seatNum] = key.split('-');
            const hall = hallList.find(h => String(h.id) === hallId);
            const col = hall?.columns[Number(colIdx)];
            const row = col?.rows[Number(rowIdx)];
            return {
                subClassId: Number(val.cls),
                shiftId: Number(val.shiftId),
                userCode: val.userCode,
                hallId: Number(hallId),
                columnId: col?.id ?? null,
                rowId: row?.id ?? null,
                seatNum: Number(seatNum),
            };
        });

        if (payload.length === 0) {
            Swal.fire({
                icon: "error",
                title: "সাবমিশন ব্যর্থ!",
                text: `No seats assigned yet.`,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "ঠিক আছে",
            });
            return;
        }
        try {
            console.log(payload);
            await saveSitPlan({ SessionID: sessionId, ExamID: examId, assignments: payload }).unwrap();
            Swal.close();
            Swal.fire({
                icon: "success",
                title: "সাবমিশন সফল!",
                text: "শিক্ষাথীদের সিট প্লান সফল হয়েছে। ",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "ঠিক আছে",
            }).then((result) => {
                if (result.isConfirmed) {
                    // nextFunction();
                } Swal.close();
            });
            // showToast(`Saved ${payload.length} seat assignments.`);
            // next();
        } catch (err) {
            console.error('Save failed:', err);
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "সাবমিশন ব্যর্থ!",
                text: err?.data?.error || "কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
                confirmButtonColor: "#d33",
                confirmButtonText: "বুঝেছি",
            });
            // showToast('Failed to save. Please try again.');
        }
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className={`lg:px-5 lg:py-1 ${currectLanguage == 'en' ? 'font-lato' : 'font-SolaimanLipi'}`}>

            {/* ── Locked banner ─────────────────────────────────────────────── */}
            {isLocked && (
                <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                    <span className="text-lg">🔒</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Seat plan is active — read only</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            This plan is currently active. No changes can be made. Deactivate the plan first to edit assignments.
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-2 flex justify-between items-center flex-wrap">
                <div>
                    <h1 className="text-xl font-medium text-gray-900 ">{translate("Seat Allocation")}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {activeHall ? (
                            <>
                                {translate("Active hall")}:{' '}
                                <span className="font-semibold text-gray-700">{activeHall.name}</span> —
                                {translate("click a seat to set start position, configure the pattern, then assign.")}
                            </>
                        ) : (translate('Select a hall below to begin assigning seats.'))}
                    </p>
                </div>

                <Link to="/exam/exam-hallist" className="py-2 px-2 bg-blue-500 text-white rounded-[4px] mb-2">পরীক্ষার কক্ষ সেট করুন</Link>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

                {/* ── Hall accordion list ──────────────────────────────── */}
                <div className="flex flex-col gap-3">
                    {isLoadingExamHallList && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
                            Loading halls…
                        </div>
                    )}

                    {hallList.map(hall => {
                        const isOpen = !!openHalls[hall.id];
                        const isActive = hall.id === selectedHallId;
                        const hallAssignments = Object.entries(assignments).filter(([key]) =>
                            key.includes(`-${hall.id}-`)
                        );
                        const assignedCount = hallAssignments.length;

                        return (
                            <div
                                key={hall.id}
                                className={`border rounded-[10px] lg:rounded-xl overflow-hidden transition-all ${isActive
                                    ? 'border-blue-300 shadow-sm shadow-blue-100'
                                    : 'border-gray-200'
                                    }`}
                            >
                                {/* Accordion header */}
                                <div
                                    className={`flex items-center justify-between px-2 lg:px-4 py-2 lg:py-3 cursor-pointer select-none transition-colors ${isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleAccordion(hall.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''
                                                }`}
                                        >
                                            ▶
                                        </span>
                                        <div>
                                            <p
                                                className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-800'
                                                    }`}
                                            >
                                                {hall.name}
                                                {isActive && (
                                                    <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {hall.totalColumns} columns · {hall.totalRows} rows ·{' '}
                                                {hall.totalSeats} seats
                                                {assignedCount > 0 && (
                                                    <span className="ml-2 text-blue-500">
                                                        {assignedCount} assigned
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion body */}
                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-white p-4">
                                        <p className="text-xs text-gray-400 mb-2">
                                            {isActive
                                                ? 'Click a seat to set the start position for assignment.'
                                                : 'Click a seat to select this hall and set the start position.'}
                                        </p>
                                        <div className="overflow-x-auto">
                                            <div className="flex flex-wrap gap-2 items-start min-w-fit">
                                                {hall.columns.map((col, ci) => (
                                                    <div
                                                        key={col.id}
                                                        className="flex flex-col items-center gap-1.5"
                                                    >
                                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                            {col.label}
                                                        </span>
                                                        {col.rows.map((row, ri) => (
                                                            <div
                                                                key={row.id}
                                                                className="flex gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1"
                                                            >
                                                                <span className="text-xs text-gray-300 w-4 text-center self-center shrink-0">
                                                                    {ri + 1}
                                                                </span>
                                                                {Array.from({ length: row.seats }).map(
                                                                    (_, si) => {
                                                                        const sn = si + 1;

                                                                        const previousColumnsSeats = hall.columns
                                                                            .slice(0, ci)
                                                                            .reduce(
                                                                                (total, column) =>
                                                                                    total +
                                                                                    column.rows.reduce((sum, row) => sum + row.seats, 0),
                                                                                0
                                                                            );

                                                                        // Seats in previous rows of current column
                                                                        const previousRowsSeats = col.rows
                                                                            .slice(0, ri)
                                                                            .reduce((sum, row) => sum + row.seats, 0);

                                                                        // Continuous seat number for the whole hall
                                                                        const seatSerial = previousColumnsSeats + previousRowsSeats + si + 1;
                                                                        // Display: look up this seat across ALL shifts so colour
                                                                        // shows even before a shift is selected in the dropdown.
                                                                        // We scan every shiftId that has an entry for this seat.
                                                                        const seatSuffix = `${hall.id}-${ci}-${ri}-${sn}`;
                                                                        const assignedVal = (() => {
                                                                            // 1. Prefer current shift if selected
                                                                            if (selectedShift) {
                                                                                const exact = assignments[`${selectedShift}-${seatSuffix}`];
                                                                                if (exact) return exact;
                                                                            }
                                                                            // 2. Fall back to any shift (for display of loaded data)
                                                                            const fallbackKey = Object.keys(assignments).find(k => k.endsWith(`-${seatSuffix}`));
                                                                            return fallbackKey ? assignments[fallbackKey] : undefined;
                                                                        })();
                                                                        const key = `${selectedShift}-${seatSuffix}`;
                                                                        const isStart =
                                                                            isActive &&
                                                                            startSeat?.colIdx === ci &&
                                                                            startSeat?.rowIdx === ri &&
                                                                            startSeat?.seatNum === sn;
                                                                        const isPreview =
                                                                            previewKeys.has(key) && !assignedVal;
                                                                        const c = assignedVal
                                                                            ? getClassMeta(assignedVal.cls)
                                                                            : null;

                                                                        return (
                                                                            <button
                                                                                key={sn}
                                                                                type="button"
                                                                                // ── FIX P3: show UserCode as tooltip and in cell ─
                                                                                title={
                                                                                    assignedVal
                                                                                        ? `${c?.label} · ${assignedVal.userCode}`
                                                                                        : `${col.label} · Row ${ri + 1} · Seat ${sn}`
                                                                                }
                                                                                onClick={() =>
                                                                                    clickSeat(hall.id, ci, ri, sn)
                                                                                }
                                                                                style={
                                                                                    c
                                                                                        ? {
                                                                                            background: c.hex,
                                                                                            borderColor: c.hexBorder,
                                                                                            color: c.hexText,
                                                                                        }
                                                                                        : {}
                                                                                }
                                                                                className={`w-[38px] h-[38px] p-[4px] rounded-md border text-[10px] flex items-center justify-center transition-all shrink-0 font-medium overflow-hidden
                                                                                    ${c
                                                                                        ? 'cursor-pointer'
                                                                                        : isStart
                                                                                            ? 'bg-blue-100 border-blue-400 text-blue-700 cursor-pointer'
                                                                                            : isPreview
                                                                                                ? 'bg-blue-50 border-blue-200 text-blue-400 opacity-70 cursor-pointer'
                                                                                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                                                                                    }`}
                                                                            >
                                                                                {/* ── FIX P3: display UserCode, fallback to seat# ── */}
                                                                                {assignedVal
                                                                                    ? bnBijoy2Unicode(String(assignedVal.userCode))
                                                                                    : isStart
                                                                                        ? '▶'
                                                                                        : seatSerial}
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* legend */}
                                        {hallAssignments.length > 0 && (
                                            <div className="flex gap-3 flex-wrap mt-4 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                                                    Empty
                                                </div>
                                                {[
                                                    ...new Set(
                                                        hallAssignments
                                                            .filter(([key]) => !selectedShift || key.startsWith(`${selectedShift}-`))
                                                            .map(([, val]) => val.cls)
                                                    ),
                                                ].map(cls => {
                                                    const c = getClassMeta(cls);
                                                    if (!c) return null;
                                                    return (
                                                        <div
                                                            key={cls}
                                                            className="flex items-center gap-1.5 text-xs text-gray-500"
                                                        >
                                                            <div
                                                                className="w-3 h-3 rounded-sm border"
                                                                style={{
                                                                    background: c.hex,
                                                                    borderColor: c.hexBorder,
                                                                }}
                                                            />
                                                            {c.label}
                                                        </div>
                                                    );
                                                })}
                                                {(isActive ||
                                                    [...previewKeys].some(pk =>
                                                        pk.startsWith(`${hall.id}-`)
                                                    )) && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200 opacity-70" />
                                                            Preview
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Right panel ───────────────────────────────────────── */}
                <div className="flex flex-col gap-3">

                    {/* pattern config */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-900 mb-4">{translate("Pattern configuration")}</p>

                        {/* Sub Class */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs text-gray-500">{translate('Sub Class')}</label>
                            <select
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400 w-full"
                            >
                                <option value="">— select class —</option>
                                {examSubClasses &&
                                    examSubClasses.map(k => (
                                        <option key={k.SubClassID} value={k.SubClassID}>
                                            {k?.Class?.SubClass}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Exam Shift */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs text-gray-500">{translate('Exam Shift')}</label>
                            <select
                                value={selectedShift}
                                onChange={e => setSelectedShift(e.target.value)}
                                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400 w-full"
                            >
                                <option value="">Select Exam Shift</option>
                                {examShift &&
                                    examShift.map(k => (
                                        <option key={k.ShiftID} value={k.ShiftID}>
                                            {k?.ShiftName}
                                        </option>
                                    ))}
                            </select>

                            {/* ── FIX P1: shift conflict warning ───────────── */}
                            {shiftConflict && (
                                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">
                                    <p className="text-xs text-red-700 font-medium">Shift conflict</p>
                                    <p className="text-xs text-red-500">
                                        This class is already assigned to{' '}
                                        <strong>{lockedShiftName}</strong>. You cannot assign it to a
                                        different shift.
                                    </p>
                                </div>
                            )}

                            {/* ── show locked shift as info when no conflict ── */}
                            {!shiftConflict &&
                                selectedClass &&
                                classShiftMap[String(selectedClass)] && (
                                    <p className="text-xs text-green-600 mt-0.5">
                                        ✓ Locked to{' '}
                                        {examShift?.find(
                                            s =>
                                                String(s.ShiftID) ===
                                                String(classShiftMap[String(selectedClass)])
                                        )?.ShiftName || 'this shift'}
                                    </p>
                                )}
                        </div>

                        {/* ── FIX P2: show remaining students info ─────────── */}
                        {selectedClass && studentCount > 0 && (
                            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
                                <span className="text-xs text-gray-500">{translate("Students remaining")}</span>
                                <span className={`text-sm font-semibold ${remainingStudents === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                    {remainingStudents === 0
                                        ? '✓ All seated'
                                        : `${remainingStudents} / ${studentCount}`}
                                </span>
                            </div>
                        )}

                        {/* format, seat positions, skip, scope — locked when isActive */}
                        <div className={`${isLocked ? 'opacity-50 pointer-events-none select-none' : ''}`}>

                            {/* format */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">Format</label>
                                <div className="flex gap-2 flex-wrap">
                                    {/* <ToggleBtn
                                        label="Straight"
                                        active={format === 'straight'}
                                        onClick={() => setFormat('straight')}
                                    /> */}

                                    <button
                                        type="button"
                                        onClick={() => setFormat('straight')}
                                        className={`w-[80px] text-xs px-1 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap
                                            ${format === 'straight'
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <img src="/images/straight-pattern.png" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormat('zigzag')}
                                        className={`w-[80px] text-xs px-1 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap
                                            ${format === 'zigzag'
                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <img src="/images/xigzag-pattern.png" />
                                    </button>
                                    {/* <ToggleBtn
                                        label="Zigzag"
                                        active={format === 'zigzag'}
                                        onClick={() => setFormat('zigzag')}
                                    /> */}
                                </div>
                                {/* <p className="text-xs text-gray-400 mt-0.5">
                                    {format === 'zigzag'
                                        ? 'Seat alternates per row: row 1→seat A, row 2→seat B, row 3→seat A…'
                                        : 'Same seat used for every row.'}
                                </p> */}
                            </div>

                            {/* seat positions */}
                            {maxSeatsInCol > 0 && (
                                <div className="flex flex-col gap-1.5 mb-4">
                                    <label className="text-xs text-gray-500">
                                        Seat positions
                                        {format === 'zigzag' ? ' — odd rows (1, 3, 5…)' : ''}
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {Array.from({ length: maxSeatsInCol }).map((_, i) => (
                                            <ToggleBtn
                                                key={i + 1}
                                                label={`${translate("Seat No")} ${bnBijoy2Unicode(String(i + 1))}`}
                                                active={seatPosOdd.includes(i + 1)}
                                                onClick={() => toggleSeatPos(i + 1, seatPosOdd, setSeatPosOdd)}
                                            />
                                        ))}
                                    </div>
                                    {/* <p className="text-xs text-gray-400 mt-0.5">
                                        Seats exceeding a bench size are skipped automatically.
                                    </p> */}
                                </div>
                            )}

                            {/* zigzag even rows */}
                            {format === 'zigzag' && maxSeatsInCol > 0 && (
                                <div className="flex flex-col gap-1.5 mb-4">
                                    <label className="text-xs text-gray-500">
                                        Seat positions — even rows (2, 4, 6…)
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {Array.from({ length: maxSeatsInCol }).map((_, i) => (
                                            <ToggleBtn
                                                key={i + 1}
                                                label={`${translate("Seat No")} ${bnBijoy2Unicode(String(i + 1))}`}
                                                active={seatPosEven.includes(i + 1)}
                                                onClick={() =>
                                                    toggleSeatPos(i + 1, seatPosEven, setSeatPosEven)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* skip */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">{translate("Row skipping")}</label>
                                <div className="flex gap-2 flex-wrap">
                                    <ToggleBtn
                                        label="No skip"
                                        active={!skip}
                                        onClick={() => setSkip(false)}
                                    />
                                    <ToggleBtn
                                        label="Skip 1 row"
                                        active={skip}
                                        onClick={() => setSkip(true)}
                                    />
                                </div>
                            </div>

                            {/* scope */}
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">Assignment scope</label>
                                <div className="flex flex-col gap-2">
                                    {SCOPE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setScope(opt.value)}
                                            className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer
                                            ${scope === opt.value
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${scope === opt.value ? 'border-blue-500' : 'border-gray-300'}`}
                                                >
                                                    {scope === opt.value && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs font-medium ${scope === opt.value ? 'text-blue-700' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {translate(opt.label)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {scope === 'till-end' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                                    <p className="text-xs text-amber-700 font-medium mb-0.5">
                                        {translate("Multi-room mode")}
                                    </p>
                                    <p className="text-xs text-amber-600">
                                        {translate("After this hall is full, remaining students continue into the next hall using the same pattern.")}
                                    </p>
                                </div>
                            )}

                        </div>{/* end locked wrapper */}

                        {/* start position */}
                        <div className="border-t border-gray-100 pt-4 hidden">
                            <label className="text-xs text-gray-500 block mb-1">Start position</label>
                            {startSeat && activeHall ? (
                                <p className="text-sm font-medium text-gray-900">
                                    {activeHall.columns[startSeat.colIdx]?.label} · Row{' '}
                                    {startSeat.rowIdx + 1} · Seat {startSeat.seatNum}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">
                                    {activeHall ? 'Click a seat in the hall layout ←' : 'Select a hall first'}
                                </p>
                            )}
                        </div>

                        {/* pattern preview */}
                        {patternLines.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-3 mt-3 hidden">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                    Column pattern preview
                                </p>
                                <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed font-sans">
                                    {patternLines.join('\n')}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* stats + assign */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                            <StatCard
                                label="Available seats"
                                value={canAssign ? availableSeats : '—'}
                                sub={
                                    scope === 'this-room'
                                        ? 'in this hall'
                                        : scope === 'till-end'
                                            ? 'this hall + others'
                                            : 'this column'
                                }
                            />
                            {/* ── FIX P2: show remaining not total ── */}
                            <StatCard
                                label="Students remaining"
                                value={selectedClass ? remainingStudents : '—'}
                                sub={
                                    selectedClass && alreadyAssigned > 0
                                        ? `${alreadyAssigned} already seated`
                                        : undefined
                                }
                            />
                        </div>

                        {/* not enough seats warning */}
                        {canAssign && availableSeats < remainingStudents && scope !== 'till-end' && remainingStudents > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
                                <p className="text-xs text-amber-700 font-medium mb-0.5">
                                    {remainingStudents - availableSeats} students won&apos;t be seated
                                </p>
                                <p className="text-xs text-amber-600">
                                    Not enough seats in{' '}
                                    {scope === 'this-column' ? 'this column' : 'this room'}. Switch
                                    scope to <strong>Until list ends</strong> to continue into other
                                    rooms.
                                </p>
                            </div>
                        )}

                        {canAssign && willOverflow && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-3">
                                <p className="text-xs text-red-700 font-medium mb-0.5">
                                    Not enough seats across all halls
                                </p>
                                <p className="text-xs text-red-500">
                                    Only {availableSeats} seats available total for {remainingStudents}{' '}
                                    remaining students.
                                </p>
                            </div>
                        )}

                        {/* all students seated notice */}
                        {selectedClass && remainingStudents === 0 && studentCount > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                                <p className="text-xs text-green-700 font-medium">
                                    ✓ All {studentCount} students are seated
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={doAssign}
                            disabled={!canAssign || shiftConflict || remainingStudents === 0}
                            className="w-full h-10 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
                        >
                            {remainingStudents === 0 && selectedClass
                                ? translate('All students seated')
                                : translate("Assign seats")}
                        </button>
                        {!isLocked && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="w-full h-9 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer hover:bg-gray-50"
                            >
                                {translate("Clear all")}
                            </button>
                        )}
                    </div>

                    {/* Step Navigation */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-2">
                        <Button
                            type="button"
                            className="w-1/2 bg-yellow-300 hover:bg-yellow-400 text-black border border-yellow-400 font-SolaimanLipi"
                            onClick={previous}
                        >
                            {translate("Previous Step")}
                        </Button>
                        <Button
                            type="button"
                            className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-SolaimanLipi"
                            onClick={handleAssignNextStep}
                        >
                            {translate("Save & Continue")}
                        </Button>
                    </div>

                    {/* assignment log */}
                    {results.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-gray-900 mb-3">Assignment log</p>
                            {results.map((r, i) => {
                                const c = getClassMeta(r.cls);
                                if (!c) return null;
                                const scopeOpt = SCOPE_OPTIONS.find(o => o.value === r.scope);
                                const shiftName =
                                    examShift?.find(s => String(s.ShiftID) === String(r.shiftId))
                                        ?.ShiftName || `Shift ${r.shiftId}`;
                                return (
                                    <div
                                        key={i}
                                        className="py-2.5 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {c.label}
                                                </span>
                                                {r.hallName && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        Hall {r.hallName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-lg border font-medium"
                                                    style={{
                                                        background: c.hex,
                                                        borderColor: c.hexBorder,
                                                        color: c.hexText,
                                                    }}
                                                >
                                                    {r.assigned} seats
                                                </span>
                                                {!isLocked && (
                                                    <button
                                                        type="button"
                                                        onClick={() => cancelAssignment(i)}
                                                        disabled={isLocked}
                                                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-0.5">
                                            Scope: {r.scope === 'loaded' ? 'Pre-loaded' : scopeOpt?.label} · Shift: {shiftName}
                                        </p>
                                        {Object.entries(r.byHallCol || {}).map(([key, count]) => (
                                            <p key={key} className="text-xs text-gray-500">
                                                {key} — {count} seats
                                            </p>
                                        ))}
                                        {r.remaining > 0 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                {r.remaining} students still need seating
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* {toast && (
                    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
                        {toast}
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default SitPlanAssign;