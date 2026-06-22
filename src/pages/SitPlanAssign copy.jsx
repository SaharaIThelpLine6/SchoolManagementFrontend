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
                { id: 155, seats: 3 }, // ← 3 seats instead of 4 — variable bench handled
            ],
        },
    ],
};

const CLASS_META = {
    'cls-a': { label: 'Class 10A', count: 42, bg: 'bg-[#E1F5EE]', border: 'border-[#9FE1CB]', text: 'text-[#0F6E56]', hex: '#E1F5EE', hexBorder: '#9FE1CB', hexText: '#0F6E56' },
    'cls-b': { label: 'Class 10B', count: 38, bg: 'bg-[#E6F1FB]', border: 'border-[#B5D4F4]', text: 'text-[#0C447C]', hex: '#E6F1FB', hexBorder: '#B5D4F4', hexText: '#0C447C' },
    'cls-c': { label: 'Class 9A',  count: 45, bg: 'bg-[#FBEAF0]', border: 'border-[#F4C0D1]', text: 'text-[#72243E]', hex: '#FBEAF0', hexBorder: '#F4C0D1', hexText: '#72243E' },
    'cls-d': { label: 'Class 9B',  count: 40, bg: 'bg-[#FAEEDA]', border: 'border-[#FAC775]', text: 'text-[#633806]', hex: '#FAEEDA', hexBorder: '#FAC775', hexText: '#633806' },
};

// ─── Pattern Engine ────────────────────────────────────────────────────────────
// Handles variable bench sizes safely — if a selected seat number exceeds
// the actual seats on a bench, that seat is simply skipped for that row.

function getSeatsForPattern(col, startRowIdx, seatPosOdd, seatPosEven, format, skip) {
    const result = [];
    col.rows.forEach((row, ri) => {
        if (ri < startRowIdx) return;
        const relRow = ri - startRowIdx;
        const skipFactor = skip ? 2 : 1;
        if (relRow % skipFactor !== 0) return;

        // zigzag: odd relative rows use seatPosEven, even use seatPosOdd
        const isEvenRel = relRow % 2 === 0;
        const seatList = format === 'zigzag'
            ? (isEvenRel ? seatPosOdd : seatPosEven)
            : seatPosOdd;

        seatList.forEach(sn => {
            // ✅ key fix: only assign seat if bench actually has that seat
            if (sn <= row.seats) {
                result.push({ rowIdx: ri, rowId: row.id, seatNum: sn, maxSeats: row.seats });
            }
            // if sn > row.seats → silently skip, no error
        });
    });
    return result;
}

// ─── Toggle Button ─────────────────────────────────────────────────────────────

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

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-medium text-gray-900">{value}</p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const SitPlanAssign = () => {
    const [startSeat, setStartSeat]       = useState(null);
    const [assignments, setAssignments]   = useState({});
    const [format, setFormat]             = useState('straight');
    const [skip, setSkip]                 = useState(false);
    const [seatPosOdd, setSeatPosOdd]     = useState([]);
    const [seatPosEven, setSeatPosEven]   = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [results, setResults]           = useState([]);
    const [toast, setToast]               = useState('');

    // max seats in the selected column — used to build seat toggles safely
    const selectedCol = startSeat !== null ? HALL.columns[startSeat.colIdx] : null;
    const maxSeatsInCol = selectedCol
        ? Math.max(...selectedCol.rows.map(r => r.seats))
        : 0;

    const previewSeats = selectedCol && seatPosOdd.length > 0
        ? getSeatsForPattern(selectedCol, startSeat.rowIdx, seatPosOdd, seatPosEven, format, skip)
        : [];

    const previewKeys = new Set(
        previewSeats.map(s => `${startSeat?.colIdx}-${s.rowIdx}-${s.seatNum}`)
    );

    const availableSeats = previewSeats.length;
    const studentCount   = selectedClass ? CLASS_META[selectedClass].count : 0;
    const canAssign      = selectedClass && startSeat !== null && seatPosOdd.length > 0;

    // ── handlers ──────────────────────────────────────────────────────────────

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    }

    function clickSeat(colIdx, rowIdx, seatNum) {
        setStartSeat({ colIdx, rowIdx, seatNum });
        setSeatPosOdd([seatNum]);
        setSeatPosEven([]);
    }

    function toggleSeatPos(sn, list, setList) {
        setList(list.includes(sn) ? list.filter(s => s !== sn) : [...list, sn].sort((a, b) => a - b));
    }

    function doAssign() {
        if (!canAssign) return;
        const col     = HALL.columns[startSeat.colIdx];
        const seats   = getSeatsForPattern(col, startSeat.rowIdx, seatPosOdd, seatPosEven, format, skip);
        const toAssign = seats.slice(0, studentCount);

        const next = { ...assignments };
        toAssign.forEach(s => {
            const key = `${startSeat.colIdx}-${s.rowIdx}-${s.seatNum}`;
            next[key] = selectedClass;
        });
        setAssignments(next);

        setResults(prev => [
            ...prev,
            {
                cls: selectedClass,
                colLabel: col.label,
                seats: toAssign,
                assigned: toAssign.length,
                unassigned: Math.max(0, studentCount - toAssign.length),
            },
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
        setResults([]);
    }

    // ── pattern preview text ───────────────────────────────────────────────

    const patternLines = selectedCol
        ? selectedCol.rows.map((row, ri) => {
            if (ri < startSeat.rowIdx) return `Row ${ri + 1}: —`;
            const relRow = ri - startSeat.rowIdx;
            if (skip && relRow % 2 !== 0) return `Row ${ri + 1}: (skipped)`;
            const isEvenRel = relRow % 2 === 0;
            const list = format === 'zigzag' ? (isEvenRel ? seatPosOdd : seatPosEven) : seatPosOdd;
            // only show seats that exist on this bench
            const valid = list.filter(s => s <= row.seats);
            const skipped = list.filter(s => s > row.seats);
            let line = `Row ${ri + 1}: seat${valid.length !== 1 ? 's' : ''} ${valid.length ? valid.join(', ') : '—'}`;
            if (skipped.length) line += ` (seat ${skipped.join(',')} skipped — only ${row.seats} seats on bench)`;
            return line;
        })
        : [];

    // ── render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-5 font-sans">
            {/* header */}
            <div className="mb-5">
                <h1 className="text-xl font-medium text-gray-900">Seat assignment — Hall {HALL.name}</h1>
                <p className="text-sm text-gray-400 mt-1">Click a seat to set start position, configure pattern, then assign.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-4 items-start">

                {/* ── Hall map ─────────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Hall layout — click any seat to set start position</p>
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 items-start min-w-fit">
                            {HALL.columns.map((col, ci) => (
                                <>
                                    <div key={col.id} className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{col.label}</span>
                                        {col.rows.map((row, ri) => (
                                            <div key={row.id} className="flex gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1">
                                                <span className="text-xs text-gray-300 w-4 text-center self-center">{ri + 1}</span>
                                                {Array.from({ length: row.seats }).map((_, si) => {
                                                    const sn  = si + 1;
                                                    const key = `${ci}-${ri}-${sn}`;
                                                    const assignedCls = assignments[key];
                                                    const isStart     = startSeat?.colIdx === ci && startSeat?.rowIdx === ri && startSeat?.seatNum === sn;
                                                    const isPreview   = previewKeys.has(key);
                                                    const c = assignedCls ? CLASS_META[assignedCls] : null;

                                                    return (
                                                        <button
                                                            key={sn}
                                                            type="button"
                                                            title={`${col.label} · Row ${ri + 1} · Seat ${sn}`}
                                                            onClick={() => clickSeat(ci, ri, sn)}
                                                            style={c ? { background: c.hex, borderColor: c.hexBorder, color: c.hexText } : {}}
                                                            className={`w-8 h-8 rounded-md border text-xs flex items-center justify-center cursor-pointer transition-all shrink-0 font-medium
                                                                ${c
                                                                    ? 'text-[10px]'
                                                                    : isStart
                                                                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                                        : isPreview
                                                                            ? 'bg-blue-50 border-blue-200 text-blue-400 opacity-60'
                                                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {c ? c.label.replace('Class ', '') : isStart ? '▶' : sn}
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
                                <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" /> Empty
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
                        </div>
                    )}
                </div>

                {/* ── Right panel ──────────────────────────────────────── */}
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
                                <ToggleBtn label="Zigzag" active={format === 'zigzag'} onClick={() => setFormat('zigzag')} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {format === 'zigzag'
                                    ? 'Seat alternates per row: row 1→seat A, row 2→seat B, row 3→seat A…'
                                    : 'Same seat position used for every row.'}
                            </p>
                        </div>

                        {/* seat positions */}
                        {maxSeatsInCol > 0 && (
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">
                                    Seat positions — odd rows {format === 'zigzag' ? '(rows 1, 3, 5…)' : '(all rows)'}
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
                                    If a bench has fewer seats, the extra seat is automatically skipped — no error.
                                </p>
                            </div>
                        )}

                        {/* zigzag even seats */}
                        {format === 'zigzag' && maxSeatsInCol > 0 && (
                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-xs text-gray-500">Seat positions — even rows (rows 2, 4, 6…)</label>
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
                                <ToggleBtn label="No skip" active={!skip} onClick={() => setSkip(false)} />
                                <ToggleBtn label="Skip 1 row" active={skip} onClick={() => setSkip(true)} />
                            </div>
                        </div>

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
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Pattern preview</p>
                                <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed font-sans">
                                    {patternLines.join('\n')}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* stats + assign */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                            <StatCard label="Available seats" value={canAssign ? availableSeats : '—'} />
                            <StatCard label="Students" value={selectedClass ? studentCount : '—'} />
                        </div>
                        {canAssign && availableSeats < studentCount && (
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                                Only {availableSeats} seats available for {studentCount} students. {studentCount - availableSeats} will remain unassigned.
                            </p>
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

                    {/* results */}
                    {results.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm font-medium text-gray-900 mb-3">Assignment log</p>
                            {results.map((r, i) => {
                                const c = CLASS_META[r.cls];
                                return (
                                    <div key={i} className="py-2.5 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{c.label}</span>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-lg border font-medium"
                                                style={{ background: c.hex, borderColor: c.hexBorder, color: c.hexText }}
                                            >
                                                {r.assigned} seats · {r.colLabel}
                                            </span>
                                        </div>
                                        {r.unassigned > 0 && (
                                            <p className="text-xs text-amber-600">{r.unassigned} students could not be seated</p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            Rows: {[...new Set(r.seats.map(s => s.rowIdx + 1))].join(', ')}
                                        </p>
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