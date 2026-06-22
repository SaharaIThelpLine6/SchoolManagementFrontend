import { useState } from 'react';

// ─── Hall Data (from API) ─────────────────────────────────────────────────────

const HALL = {
    id: 18,
    name: '10020',
    columns: [
        {
            id: 49, label: 'কলাম ১', colIndex: 0,
            rows: [
                { id: 144, seats: 3 },
                { id: 145, seats: 3 },
                { id: 146, seats: 3 },
                { id: 147, seats: 3 },
            ],
        },
        {
            id: 50, label: 'কলাম ২', colIndex: 1,
            rows: [
                { id: 148, seats: 4 },
                { id: 149, seats: 4 },
                { id: 150, seats: 4 },
                { id: 151, seats: 4 },
            ],
        },
        {
            id: 51, label: 'কলাম ৩', colIndex: 2,
            rows: [
                { id: 152, seats: 4 },
                { id: 153, seats: 4 },
                { id: 154, seats: 4 },
                { id: 155, seats: 3 }, // variable bench — handled safely
            ],
        },
    ],
};

const CLASS_META = {
    'cls-a': { label: 'Class 10A', count: 42, hex: '#E1F5EE', hexBorder: '#9FE1CB', hexText: '#0F6E56' },
    'cls-b': { label: 'Class 10B', count: 38, hex: '#E6F1FB', hexBorder: '#B5D4F4', hexText: '#0C447C' },
    'cls-c': { label: 'Class 9A',  count: 45, hex: '#FBEAF0', hexBorder: '#F4C0D1', hexText: '#72243E' },
    'cls-d': { label: 'Class 9B',  count: 40, hex: '#FAEEDA', hexBorder: '#FAC775', hexText: '#633806' },
};

// ─── Scope options ─────────────────────────────────────────────────────────────
// this-column  → fill only the current column with the pattern, stop there
// this-room    → when column runs out, continue same pattern into next columns
// till-end     → continue across columns AND across rooms until all students seated

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

function getSeatsForColumn(col, startRowIdx, seatPosOdd, seatPosEven, format, skip) {
    const result = [];
    col.rows.forEach((row, ri) => {
        if (ri < startRowIdx) return;
        const relRow    = ri - startRowIdx;
        const skipFactor = skip ? 2 : 1;
        if (relRow % skipFactor !== 0) return;
        const isEvenRel = relRow % 2 === 0;
        const seatList  = format === 'zigzag'
            ? (isEvenRel ? seatPosOdd : seatPosEven)
            : seatPosOdd;
        seatList.forEach(sn => {
            if (sn <= row.seats) {
                result.push({ colIdx: col.colIndex, rowIdx: ri, rowId: row.id, seatNum: sn, colId: col.id });
            }
        });
    });
    return result;
}

// Builds the full seat list based on scope
// Returns array of seat slots across 1 or more columns
function buildSeatSlots(hall, startColIdx, startRowIdx, seatPosOdd, seatPosEven, format, skip, scope) {
    const allSlots = [];

    if (scope === 'this-column') {
        const col = hall.columns[startColIdx];
        const seats = getSeatsForColumn(col, startRowIdx, seatPosOdd, seatPosEven, format, skip);
        return seats;
    }

    if (scope === 'this-room') {
        hall.columns.forEach((col, ci) => {
            const fromRow = ci === startColIdx ? startRowIdx : 0;
            if (ci < startColIdx) return;
            const seats = getSeatsForColumn(col, fromRow, seatPosOdd, seatPosEven, format, skip);
            seats.forEach(s => allSlots.push({ ...s, colIdx: ci }));
        });
        return allSlots;
    }

    if (scope === 'till-end') {
        // For this demo, we show the same as this-room but tag overflow
        hall.columns.forEach((col, ci) => {
            const fromRow = ci === startColIdx ? startRowIdx : 0;
            if (ci < startColIdx) return;
            const seats = getSeatsForColumn(col, fromRow, seatPosOdd, seatPosEven, format, skip);
            seats.forEach(s => allSlots.push({ ...s, colIdx: ci }));
        });
        return allSlots; // in real app: loop through other halls too
    }

    return allSlots;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleBtn({ label, active, onClick }) {
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
            {label}
        </button>
    );
}

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-medium text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const SitPlanAssign = () => {
    const [startSeat, setStartSeat]         = useState(null);
    const [assignments, setAssignments]     = useState({});
    const [format, setFormat]               = useState('straight');
    const [skip, setSkip]                   = useState(false);
    const [seatPosOdd, setSeatPosOdd]       = useState([]);
    const [seatPosEven, setSeatPosEven]     = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [scope, setScope]                 = useState('this-column');
    const [results, setResults]             = useState([]);
    const [toast, setToast]                 = useState('');

    const selectedCol    = startSeat !== null ? HALL.columns[startSeat.colIdx] : null;
    const maxSeatsInCol  = selectedCol ? Math.max(...selectedCol.rows.map(r => r.seats)) : 0;

    const previewSlots = (selectedCol && seatPosOdd.length > 0)
        ? buildSeatSlots(HALL, startSeat.colIdx, startSeat.rowIdx, seatPosOdd, seatPosEven, format, skip, scope)
        : [];

    const previewKeys    = new Set(previewSlots.map(s => `${s.colIdx}-${s.rowIdx}-${s.seatNum}`));
    const availableSeats = previewSlots.length;
    const studentCount   = selectedClass ? CLASS_META[selectedClass].count : 0;
    const canAssign      = selectedClass && startSeat !== null && seatPosOdd.length > 0;
    const willOverflow   = scope === 'till-end' && studentCount > availableSeats;

    // ── helpers ───────────────────────────────────────────────────────────────

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 2800);
    }

    function clickSeat(colIdx, rowIdx, seatNum) {
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
        if (!canAssign) return;
        const slots     = buildSeatSlots(HALL, startSeat.colIdx, startSeat.rowIdx, seatPosOdd, seatPosEven, format, skip, scope);
        const toAssign  = slots.slice(0, studentCount);
        const remaining = Math.max(0, studentCount - toAssign.length);

        const next = { ...assignments };
        toAssign.forEach(s => {
            const key = `${s.colIdx}-${s.rowIdx}-${s.seatNum}`;
            next[key] = selectedClass;
        });
        setAssignments(next);

        // group by column for log
        const byCol = {};
        toAssign.forEach(s => {
            const lbl = HALL.columns[s.colIdx]?.label || `Col ${s.colIdx + 1}`;
            if (!byCol[lbl]) byCol[lbl] = 0;
            byCol[lbl]++;
        });

        setResults(prev => [
            {
                cls: selectedClass,
                scope,
                assigned: toAssign.length,
                remaining,
                byCol,
                slots: toAssign,
            },
            ...prev,
        ]);

        showToast(`Assigned ${toAssign.length} seats to ${CLASS_META[selectedClass].label}`);
    }

    function clearAll() {
        setAssignments({});
        setStartSeat(null);
        setSeatPosOdd([]);
        setSeatPosEven([]);
        setFormat('straight');
        setSkip(false);
        setSelectedClass('');
        setScope('this-column');
        setResults([]);
    }

    // pattern preview lines (for selected column only — always shows column-level detail)
    const patternLines = selectedCol
        ? selectedCol.rows.map((row, ri) => {
            if (ri < startSeat.rowIdx) return `Row ${ri + 1}: —`;
            const relRow     = ri - startSeat.rowIdx;
            if (skip && relRow % 2 !== 0) return `Row ${ri + 1}: (skipped)`;
            const isEvenRel  = relRow % 2 === 0;
            const list       = format === 'zigzag' ? (isEvenRel ? seatPosOdd : seatPosEven) : seatPosOdd;
            const valid      = list.filter(s => s <= row.seats);
            const skippedSns = list.filter(s => s > row.seats);
            let line = `Row ${ri + 1}: seat${valid.length !== 1 ? 's' : ''} ${valid.length ? valid.join(', ') : '—'}`;
            if (skippedSns.length) line += `  ⚠ seat ${skippedSns.join(',')} skipped (bench has ${row.seats})`;
            return line;
        })
        : [];

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-5 font-sans">
            <div className="mb-5">
                <h1 className="text-xl font-medium text-gray-900">Seat assignment — Hall {HALL.name}</h1>
                <p className="text-sm text-gray-400 mt-1">Click a seat to set start position, configure the pattern, then assign.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

                {/* ── Hall map ──────────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                        Hall layout — click any seat to set start position
                    </p>
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 items-start min-w-fit">
                            {HALL.columns.map((col, ci) => (
                                <>
                                    <div key={col.id} className="flex flex-col items-center gap-1.5">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                            {col.label}
                                        </span>
                                        {col.rows.map((row, ri) => (
                                            <div key={row.id} className="flex gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1">
                                                <span className="text-xs text-gray-300 w-4 text-center self-center shrink-0">
                                                    {ri + 1}
                                                </span>
                                                {Array.from({ length: row.seats }).map((_, si) => {
                                                    const sn           = si + 1;
                                                    const key          = `${ci}-${ri}-${sn}`;
                                                    const assignedCls  = assignments[key];
                                                    const isStart      = startSeat?.colIdx === ci && startSeat?.rowIdx === ri && startSeat?.seatNum === sn;
                                                    const isPreview    = previewKeys.has(key) && !assignedCls;
                                                    const c            = assignedCls ? CLASS_META[assignedCls] : null;

                                                    return (
                                                        <button
                                                            key={sn}
                                                            type="button"
                                                            title={`${col.label} · Row ${ri + 1} · Seat ${sn}`}
                                                            onClick={() => clickSeat(ci, ri, sn)}
                                                            style={c ? { background: c.hex, borderColor: c.hexBorder, color: c.hexText } : {}}
                                                            className={`w-8 h-8 rounded-md border text-xs flex items-center justify-center cursor-pointer transition-all shrink-0 font-medium
                                                                ${c
                                                                    ? 'text-[9px]'
                                                                    : isStart
                                                                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                                        : isPreview
                                                                            ? 'bg-blue-50 border-blue-200 text-blue-400 opacity-70'
                                                                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {c
                                                                ? c.label.replace('Class ', '')
                                                                : isStart
                                                                    ? '▶'
                                                                    : sn
                                                            }
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    {ci < HALL.columns.length - 1 && (
                                        <div key={`div-${ci}`} className="w-px bg-gray-100 self-stretch mx-1" />
                                    )}
                                </>
                            ))}
                        </div>
                    </div>

                    {/* legend */}
                    {Object.keys(assignments).length > 0 && (
                        <div className="flex gap-3 flex-wrap mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
                                Empty
                            </div>
                            {[...new Set(Object.values(assignments))].map(cls => {
                                const c = CLASS_META[cls];
                                return (
                                    <div key={cls} className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <div className="w-3 h-3 rounded-sm border" style={{ background: c.hex, borderColor: c.hexBorder }} />
                                        {c.label}
                                    </div>
                                );
                            })}
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200 opacity-70" />
                                Preview
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right panel ───────────────────────────────────────── */}
                <div className="flex flex-col gap-3">

                    {/* pattern config */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-900 mb-4">Pattern configuration</p>

                        {/* class */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs text-gray-500">Class / group</label>
                            <select
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400 w-full"
                            >
                                <option value="">— select class —</option>
                                {Object.entries(CLASS_META).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label} ({v.count} students)</option>
                                ))}
                            </select>
                        </div>

                        {/* format */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs text-gray-500">Format</label>
                            <div className="flex gap-2 flex-wrap">
                                <ToggleBtn label="Straight" active={format === 'straight'} onClick={() => setFormat('straight')} />
                                <ToggleBtn label="Zigzag"   active={format === 'zigzag'}   onClick={() => setFormat('zigzag')} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {format === 'zigzag'
                                    ? 'Seat alternates per row: row 1→seat A, row 2→seat B, row 3→seat A…'
                                    : 'Same seat used for every row.'}
                            </p>
                        </div>

                        {/* seat positions — odd / all */}
                        {maxSeatsInCol > 0 && (
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">
                                    Seat positions{format === 'zigzag' ? ' — odd rows (1, 3, 5…)' : ''}
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {Array.from({ length: maxSeatsInCol }).map((_, i) => (
                                        <ToggleBtn
                                            key={i + 1}
                                            label={`Seat ${i + 1}`}
                                            active={seatPosOdd.includes(i + 1)}
                                            onClick={() => toggleSeatPos(i + 1, seatPosOdd, setSeatPosOdd)}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Seats exceeding a bench size are skipped automatically.
                                </p>
                            </div>
                        )}

                        {/* zigzag even seat positions */}
                        {format === 'zigzag' && maxSeatsInCol > 0 && (
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">Seat positions — even rows (2, 4, 6…)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {Array.from({ length: maxSeatsInCol }).map((_, i) => (
                                        <ToggleBtn
                                            key={i + 1}
                                            label={`Seat ${i + 1}`}
                                            active={seatPosEven.includes(i + 1)}
                                            onClick={() => toggleSeatPos(i + 1, seatPosEven, setSeatPosEven)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* skip */}
                        <div className="flex flex-col gap-1.5 mb-4">
                            <label className="text-xs text-gray-500">Row skipping</label>
                            <div className="flex gap-2 flex-wrap">
                                <ToggleBtn label="No skip"    active={!skip} onClick={() => setSkip(false)} />
                                <ToggleBtn label="Skip 1 row" active={skip}  onClick={() => setSkip(true)} />
                            </div>
                        </div>

                        {/* ── SCOPE ──────────────────────────────────────── */}
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
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${scope === opt.value ? 'border-blue-500' : 'border-gray-300'}`}>
                                                {scope === opt.value && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium ${scope === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {opt.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ml-5 ${scope === opt.value ? 'text-blue-500' : 'text-gray-400'}`}>
                                            {opt.sub}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* till-end note */}
                        {scope === 'till-end' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                                <p className="text-xs text-amber-700 font-medium mb-0.5">Multi-room mode</p>
                                <p className="text-xs text-amber-600">
                                    After this hall is full, the system will continue assigning remaining students to the next available hall using the same pattern.
                                </p>
                            </div>
                        )}

                        {/* start position */}
                        <div className="border-t border-gray-100 pt-4">
                            <label className="text-xs text-gray-500 block mb-1">Start position</label>
                            {startSeat ? (
                                <p className="text-sm font-medium text-gray-900">
                                    {HALL.columns[startSeat.colIdx].label} · Row {startSeat.rowIdx + 1} · Seat {startSeat.seatNum}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">Click a seat in the hall layout →</p>
                            )}
                        </div>

                        {/* pattern preview */}
                        {patternLines.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-3 mt-3">
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
                                sub={scope === 'this-room' ? 'in this hall' : scope === 'till-end' ? 'this hall + others' : 'this column'}
                            />
                            <StatCard
                                label="Students"
                                value={selectedClass ? studentCount : '—'}
                            />
                        </div>

                        {/* overflow warning */}
                        {canAssign && availableSeats < studentCount && scope !== 'till-end' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
                                <p className="text-xs text-amber-700 font-medium mb-0.5">
                                    {studentCount - availableSeats} students won't be seated
                                </p>
                                <p className="text-xs text-amber-600">
                                    Not enough seats in {scope === 'this-column' ? 'this column' : 'this room'}.
                                    Switch scope to <strong>Until list ends</strong> to continue into other rooms.
                                </p>
                            </div>
                        )}

                        {/* till-end overflow note */}
                        {canAssign && willOverflow && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-3">
                                <p className="text-xs text-blue-700 font-medium mb-0.5">
                                    {studentCount - availableSeats} students will continue to next room
                                </p>
                                <p className="text-xs text-blue-500">
                                    All {availableSeats} seats here will be filled. Remaining {studentCount - availableSeats} carry forward.
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={doAssign}
                            disabled={!canAssign}
                            className="w-full h-10 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed mb-2"
                        >
                            Assign seats
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="w-full h-9 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 cursor-pointer hover:bg-gray-50"
                        >
                            Clear all
                        </button>
                    </div>

                    {/* assignment log */}
                    {results.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-gray-900 mb-3">Assignment log</p>
                            {results.map((r, i) => {
                                const c        = CLASS_META[r.cls];
                                const scopeOpt = SCOPE_OPTIONS.find(o => o.value === r.scope);
                                return (
                                    <div key={i} className="py-2.5 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-gray-900">{c.label}</span>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-lg border font-medium"
                                                style={{ background: c.hex, borderColor: c.hexBorder, color: c.hexText }}
                                            >
                                                {r.assigned} seats
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Scope: {scopeOpt?.label}
                                        </p>
                                        {Object.entries(r.byCol).map(([col, count]) => (
                                            <p key={col} className="text-xs text-gray-500">
                                                {col} — {count} seats
                                            </p>
                                        ))}
                                        {r.remaining > 0 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                {r.remaining} students not seated in this hall
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* toast */}
            {toast && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default SitPlanAssign;