import React, { useState } from 'react';
// import { IconCheck, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import DefaultInput from '../components/Forms/DefaultInput';
import { FormProvider, useForm } from 'react-hook-form';

const ExamHallSetup = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [columns, setColumns] = useState([]);
    const [nextColId, setNextColId] = useState(1);

    // Form fields
    const [hallName, setHallName] = useState('');
    const [hallBuilding, setHallBuilding] = useState('');
    const [hallFloor, setHallFloor] = useState('');
    const [hallDesc, setHallDesc] = useState('');


    const methods = useForm();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        getValues,
    } = methods;

    const addColumn = () => {
        const newColumn = {
            id: nextColId,
            label: `Col ${String.fromCharCode(64 + columns.length + 1)}`,
            rows: [{ seats: 2 }, { seats: 2 }, { seats: 2 }]
        };
        setColumns([...columns, newColumn]);
        setNextColId(nextColId + 1);
    };

    const removeColumn = (id) => {
        setColumns(columns.filter(col => col.id !== id));
    };

    const addRow = (colId) => {
        setColumns(columns.map(col =>
            col.id === colId
                ? { ...col, rows: [...col.rows, { seats: 2 }] }
                : col
        ));
    };

    const removeRow = (colId, rowIndex) => {
        setColumns(columns.map(col =>
            col.id === colId && col.rows.length > 1
                ? { ...col, rows: col.rows.filter((_, idx) => idx !== rowIndex) }
                : col
        ));
    };

    const changeSeats = (colId, rowIndex, delta) => {
        setColumns(columns.map(col =>
            col.id === colId
                ? {
                    ...col,
                    rows: col.rows.map((row, idx) =>
                        idx === rowIndex
                            ? { ...row, seats: Math.max(1, Math.min(6, row.seats + delta)) }
                            : row
                    )
                }
                : col
        ));
    };

    const updateColumnLabel = (id, newLabel) => {
        setColumns(columns.map(col =>
            col.id === id ? { ...col, label: newLabel } : col
        ));
    };

    const updateRowLabel = (colId, rowIndex, newLabel) => {
        setColumns(columns.map(col =>
            col.id === colId
                ? {
                    ...col,
                    rows: col.rows.map((row, idx) =>
                        idx === rowIndex ? { ...row, label: newLabel } : row
                    )
                }
                : col
        ));
    };

    const goToStep = (step) => {
        if (step === 2 && !hallName.trim()) {
            // Highlight error - in real app you'd want to show an error message
            return;
        }
        if (step === 2 && columns.length === 0) {
            addColumn();
        }
        setCurrentStep(step);
    };

    const resetForm = () => {
        setColumns([]);
        setNextColId(1);
        setHallName('');
        setHallBuilding('');
        setHallFloor('');
        setHallDesc('');
        setCurrentStep(1);
    };

    const saveHall = () => {
        setCurrentStep(4);
    };

    const getTotalSeats = () => {
        return columns.reduce((sum, col) =>
            sum + col.rows.reduce((rowSum, row) => rowSum + row.seats, 0), 0
        );
    };

    const getTotalRows = () => {
        return columns.reduce((sum, col) => sum + col.rows.length, 0);
    };

    const onSubmit = async (data) => {
        try {
            const {
                ID,
                VacationDateFrom,
                VacationDateTo,
                VacationTimeFrom,
                VacationTimeTo,
                RelationID,
                ...rest
            } = data;

            
            const convertedData = {
                ...rest,
                VacationID: ID,
                GuardianID: RelationID,
                VacationDateFrom: VacationDateFrom?.[0] || null,
                VacationDateTo: VacationDateTo?.[0] || null,
                VacationTimeFrom: VacationTimeFrom?.[0] || null,
                VacationTimeTo: VacationTimeTo?.[0] || null,
            };

            await postStudentsVacation(convertedData).unwrap();

            Swal.close();
            Swal.fire({
                icon: "success",
                title: "সাবমিশন সফল!",
                text: "ছুটির আবেদন সফলভাবে সাবমিট হয়েছে।",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "ঠিক আছে",
            });

            reset();
        } catch (err) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "সাবমিশন ব্যর্থ!",
                text: err?.data?.error || "কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
                confirmButtonColor: "#d33",
                confirmButtonText: "বুঝেছি",
            });
            console.error("Error submitting data:", err);
        }
    };


    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center mb-8" id="steps-bar">
            {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                    <div className="flex items-center gap-2 text-sm flex-1">
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-medium ${currentStep > step
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : currentStep === step
                                ? 'bg-gray-900 text-white border-transparent'
                                : 'border-gray-200 text-gray-400'
                            }`}>
                            {currentStep > step ? <IconCheck size={12} /> : step}
                        </div>
                        <span className={currentStep === step ? 'font-medium text-gray-900' : 'text-gray-400'}>
                            {step === 1 ? 'Hall info' : step === 2 ? 'Column & row setup' : 'Review & save'}
                        </span>
                    </div>
                    {step < 3 && <div className="h-px bg-gray-200 flex-1 mx-2"></div>}
                </React.Fragment>
            ))}
        </div>
    );

    // Step 1: Hall Information
    const Step1 = () => (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-base font-medium text-gray-900 mb-1">Hall information</p>
                <p className="text-sm text-gray-400 mb-5">Basic details about the exam hall.</p>
                <div className="flex flex-col gap-1.5 mb-4">
                    <DefaultInput label={"Hell Name"} placeholder={"e:g: 10001"} registerKey={"HallName"} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-500">Building / block</label>
                        <input
                            type="text"
                            value={hallBuilding}
                            onChange={(e) => setHallBuilding(e.target.value)}
                            placeholder="e.g. Main building"
                            className="h-10 px-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400 w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-500">Floor</label>
                        <input
                            type="text"
                            value={hallFloor}
                            onChange={(e) => setHallFloor(e.target.value)}
                            placeholder="e.g. Ground floor"
                            className="h-10 px-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400 w-full"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-500">Description</label>
                    <textarea
                        value={hallDesc}
                        onChange={(e) => setHallDesc(e.target.value)}
                        placeholder="Any notes about this hall (optional)"
                        className="h-20 px-3 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400 w-full resize-none"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-5">
                <button onClick={() => goToStep(2)} className="h-10 px-5 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85">
                    Continue →
                </button>
            </div>
        </>
    );

    // Step 2: Column & Row Setup with Preview
    const Step2 = () => (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-base font-medium text-gray-900 mb-1">Columns & rows</p>
                        <p className="text-sm text-gray-400">Add each column, its rows, and seat count per bench.</p>
                    </div>
                    <button onClick={addColumn} className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg px-3 h-9 cursor-pointer hover:bg-blue-50">
                        <IconPlus size={14} /> Add column
                    </button>
                </div>

                <div id="columns-list" className="flex flex-col gap-3">
                    {columns.map((col, colIndex) => (
                        <div key={col.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 shrink-0">
                                    {colIndex + 1}
                                </div>
                                <input
                                    type="text"
                                    value={col.label}
                                    onChange={(e) => updateColumnLabel(col.id, e.target.value)}
                                    placeholder="Column label"
                                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400"
                                />
                                <button onClick={() => removeColumn(col.id)} className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200">
                                    <IconTrash size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">Rows — {col.rows.length} row{col.rows.length !== 1 ? 's' : ''}</p>
                            <div className="flex flex-col gap-2">
                                {col.rows.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-5 text-right shrink-0">{rowIndex + 1}</span>
                                        <input
                                            type="text"
                                            placeholder="Row label (optional)"
                                            value={row.label || ''}
                                            onChange={(e) => updateRowLabel(col.id, rowIndex, e.target.value)}
                                            className="flex-1 h-8 px-3 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-gray-400"
                                        />
                                        <span className="text-xs text-gray-400 shrink-0">Seats:</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => changeSeats(col.id, rowIndex, -1)} className="w-6 h-6 rounded border border-gray-200 bg-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-100">−</button>
                                            <span className="text-sm font-medium text-gray-800 w-4 text-center">{row.seats}</span>
                                            <button onClick={() => changeSeats(col.id, rowIndex, 1)} className="w-6 h-6 rounded border border-gray-200 bg-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-100">+</button>
                                        </div>
                                        <button onClick={() => removeRow(col.id, rowIndex)} className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200">
                                            <IconX size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addRow(col.id)} className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer bg-transparent border-none hover:text-gray-700">
                                <IconPlus size={12} /> Add row
                            </button>
                        </div>
                    ))}
                    {columns.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">No columns added yet. Click "Add column" to start.</div>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Live preview</p>
                    <div id="preview-hall" className="flex gap-3 flex-wrap">
                        {columns.map(col => (
                            <div key={col.id} className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-400 mb-1">{col.label || '—'}</span>
                                {col.rows.map((row, idx) => (
                                    <div key={idx} className="flex gap-0.5">
                                        {Array(row.seats).fill().map((_, i) => (
                                            <div key={i} className="w-3.5 h-3.5 rounded-sm bg-white border border-gray-200"></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {columns.length === 0 && (
                            <span className="text-xs text-gray-400">No columns added yet</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-5">
                <button onClick={() => goToStep(1)} className="h-10 px-5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50">
                    ← Back
                </button>
                <button onClick={() => goToStep(3)} className="h-10 px-5 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85">
                    Review →
                </button>
            </div>
        </>
    );

    // Step 3: Review
    const Step3 = () => (
        <>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-base font-medium text-gray-900 mb-1">Review hall details</p>
                <p className="text-sm text-gray-400 mb-5">Check everything before saving.</p>

                <div className="grid grid-cols-2 gap-2.5 mb-5">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Hall name</p>
                        <p className="text-base font-medium text-gray-900">{hallName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="text-base font-medium text-gray-900">{[hallBuilding, hallFloor].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Total columns</p>
                        <p className="text-2xl font-medium text-gray-900">{columns.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Total rows</p>
                        <p className="text-2xl font-medium text-gray-900">{getTotalRows()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Total seat capacity</p>
                        <p className="text-3xl font-medium text-gray-900">{getTotalSeats()} seats</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Column breakdown</p>
                    {columns.map((col, colIndex) => (
                        <div key={col.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                                {colIndex + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{col.label}</p>
                                <p className="text-xs text-gray-400">
                                    {col.rows.length} rows · {col.rows.map((row, i) => `row ${i + 1}: ${row.seats} seat${row.seats !== 1 ? 's' : ''}`).join(', ')}
                                </p>
                            </div>
                            <span className="text-sm text-gray-500">{col.rows.reduce((sum, row) => sum + row.seats, 0)} seats</span>
                        </div>
                    ))}
                </div>
                {hallDesc && (
                    <div className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{hallDesc}</div>
                )}
            </div>
            <div className="flex justify-between mt-5">
                <button onClick={() => goToStep(2)} className="h-10 px-5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50">
                    ← Back
                </button>
                <button onClick={saveHall} className="h-10 px-5 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85">
                    Save hall
                </button>
            </div>
        </>
    );

    // Step 4: Success
    const Step4 = () => (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            {/* <div className="text-center py-10 px-5">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <IconCheck size={24} className="text-green-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-1.5">Hall saved successfully</h2>
                <p className="text-sm text-gray-500 mb-5">"{hallName}" saved with {columns.length} columns and {getTotalSeats()} seats.</p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">{columns.length} columns</span>
                    <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">{getTotalRows()} rows</span>
                    <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">{getTotalSeats()} total seats</span>
                </div>
                <div className="flex gap-2.5 justify-center flex-wrap">
                    <button onClick={resetForm} className="h-10 px-5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50">
                        Add another hall
                    </button>
                    <button className="h-10 px-5 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85">
                        Go to sit plan ↗
                    </button>
                </div>
            </div> */}
        </div>
    );

    return (
        <div className="p-7 font-sans">

            {/* <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="font-lato pt-[100px] lg:pt-0 lg:mt-5 lg:ml-5 mb-20"
                >
                    {currentStep !== 4 && <StepIndicator />}

                    {currentStep === 1 && <Step1 />}
                    {currentStep === 2 && <Step2 />}
                    {currentStep === 3 && <Step3 />}
                    {currentStep === 4 && <Step4 />}
                </form>
            </FormProvider> */}
        </div>
    );
};

export default ExamHallSetup;