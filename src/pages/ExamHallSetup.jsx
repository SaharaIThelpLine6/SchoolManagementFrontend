import { IconCheck, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import DefaultInput from '../components/Forms/DefaultInput';
import {
    FormProvider,
    useFieldArray,
    useForm,
    useFormContext,
    useWatch,
} from 'react-hook-form';
import useTranslate from '../utils/Translate';
import Swal from 'sweetalert2';
import bnBijoy2Unicode from '../utils/conveter';
import { useHallEntryMutation } from '../features/examhall/examHallQuerySlice';
import { useNavigate } from 'react-router-dom';

// ─── helpers ─────────────────────────────────────────────────────────────────

const createColumn = (index) => ({
    label: `কলাম ${bnBijoy2Unicode(String(index + 1))}`,
    rows: [
        { label: 'বেঞ্চ নং ১', seats: 2 },
        { label: 'বেঞ্চ নং ২', seats: 2 },
        { label: 'বেঞ্চ নং ৩', seats: 2 },
    ],
});

const getTotalSeats = (columns = []) =>
    columns.reduce(
        (sum, col) =>
            sum + (col?.rows || []).reduce((r, row) => r + (Number(row?.seats) || 0), 0),
        0
    );

const getTotalRows = (columns = []) =>
    columns.reduce((sum, col) => sum + (col?.rows?.length || 0), 0);

// ─── ColumnCard ───────────────────────────────────────────────────────────────

const ColumnCard = ({ index, onRemove, label }) => {
    const { control, setValue } = useFormContext();
    const rowsPath = `columns.${index}.rows`;
    const rows = useWatch({ control, name: rowsPath }) || [];

    const changeSeats = (rowIndex, delta) => {
        const next = rows.map((row, i) =>
            i === rowIndex
                ? { ...row, seats: Math.max(1, Math.min(6, (Number(row?.seats) || 1) + delta)) }
                : row
        );
        setValue(rowsPath, next, { shouldDirty: true, shouldValidate: true });
    };

    const addRow = () => {
        setValue(
            rowsPath,
            [
                ...rows,
                {
                    label: `বেঞ্চ নং ${bnBijoy2Unicode(String(rows.length + 1))}`,
                    seats: 2,
                },
            ],
            { shouldDirty: true, shouldValidate: true }
        );
    };

    const removeRow = (rowIndex) => {
        if (rows.length <= 1) return;
        setValue(
            rowsPath,
            rows.filter((_, i) => i !== rowIndex),
            { shouldDirty: true, shouldValidate: true }
        );
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            {/* column header */}
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <DefaultInput
                        placeholder="Column label"
                        registerKey={`columns.${index}.label`}
                        defaultValue={label}
                    />
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                >
                    <IconTrash size={14} />
                </button>
            </div>

            {/* rows */}
            <p className="text-xs text-gray-400 mb-2">
                Rows — {rows.length} row{rows.length !== 1 ? 's' : ''}
            </p>

            <div className="flex flex-col gap-2">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5 text-right shrink-0">
                            {rowIndex + 1}
                        </span>
                        <div className="flex-1">
                            <DefaultInput
                                placeholder="Row label (optional)"
                                registerKey={`columns.${index}.rows.${rowIndex}.label`}
                                defaultValue={row.label}
                            />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">Seats:</span>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => changeSeats(rowIndex, -1)}
                                disabled={Number(row?.seats) <= 1}
                                className="w-6 h-6 rounded border border-gray-200 bg-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                −
                            </button>
                            <span className="text-sm font-medium text-gray-800 w-6 text-center">
                                {Number(row?.seats) || 0}
                            </span>
                            <button
                                type="button"
                                onClick={() => changeSeats(rowIndex, 1)}
                                disabled={Number(row?.seats) >= 6}
                                className="w-6 h-6 rounded border border-gray-200 bg-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeRow(rowIndex)}
                            disabled={rows.length <= 1}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <IconX size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addRow}
                className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer bg-transparent border-none hover:text-gray-700"
            >
                <IconPlus size={12} /> Add row
            </button>
        </div>
    );
};

// ─── ExamHallSetup ────────────────────────────────────────────────────────────

const ExamHallSetup = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const methods = useForm({
        defaultValues: {
            HallName: '',
            columns: [],
        },
    });

    const { handleSubmit, control, reset } = methods;

    const [
        hallEntry,
        { isLoading, isError, isSuccess, data: newApplicationResponse },
    ] = useHallEntryMutation()

    const {
        fields: columnFields,
        append: appendColumn,
        remove: removeColumn,
    } = useFieldArray({ control, name: 'columns' });

    const columns = useWatch({ control, name: 'columns' }) || [];

    const addColumn = () => appendColumn(createColumn(columnFields.length));

    const onSubmit = async (data) => {
        if (!data.columns || data.columns.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: translate('Add at least one column'),
                text: translate('Please add columns before saving the hall.'),
                confirmButtonText: 'OK',
            });
            return;
        }


        console.log(data);



        // Show loading indicator
        Swal.fire({
            title: translate('Saving...'),
            text: translate('Please wait while we save the hall'),
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const totalSeats = getTotalSeats(data.columns);
            const response = await hallEntry(data).unwrap();
            console.log(response);
            
            // Close loading and show success
            Swal.fire({
                icon: 'success',
                title: translate('Hall saved successfully'),
                html: `<b>${data.HallName}</b><br/>
               ${data.columns.length} columns · ${getTotalRows(data.columns)} rows · ${totalSeats} seats`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            }).then((result) => {
                if (result.isConfirmed) {
                    reset({ HallName: '', columns: [] });
                }
            });

        } catch (err) {
            console.error('Error submitting data:', err);

            // Handle different error types
            let errorTitle = translate('Error');
            let errorContent = '';

            if (err.status === 400) {
                errorTitle = translate('Validation Error');
                errorContent = err.data?.message || translate('Please check your input');
            } else if (err.status === 401) {
                errorTitle = translate('Unauthorized');
                errorContent = translate('Please login again');
            } else if (err.status === 409) {
                errorTitle = translate('Duplicate Entry');
                errorContent = translate('A hall with this name already exists');
            } else if (err.status === 500) {
                errorTitle = translate('Server Error');
                errorContent = translate('Something went wrong on the server');
            } else {
                errorContent = err.data?.message || err.message || translate('Failed to save hall');
            }

            // Show error popup
            await Swal.fire({
                icon: 'error',
                title: errorTitle,
                html: errorContent,
                confirmButtonText: translate('OK'),
                confirmButtonColor: '#d33',
            });
        }


        if (result.isConfirmed) {
            reset({ HallName: '', columns: [] });
        }
    };

    return (
        <div className="p-7 font-SolaimanLipi">
            <div className="mb-6 flex item-start justify-between">
                <h1 className="text-xl font-medium text-gray-900">{translate('Add exam hall')}</h1>
           

                <button
                    type="button"
                    onClick={() => navigate('/exam/exam-hallist')}
                    className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
                >
                    {translate('Back')}
                </button>
            </div>

            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="pt-[100px] lg:pt-0 lg:mt-5 lg:ml-5 mb-20"
                >
                    {/* hall name */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                        <DefaultInput
                            label="Hall Name"
                            placeholder="e.g. 10001 / বসন্ত"
                            registerKey="HallName"
                            require
                        />
                    </div>

                    {/* columns section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-base font-medium text-gray-900">
                                    {translate('Columns & rows')}
                                </p>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {translate('Add columns and configure rows and seat count per bench.')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addColumn}
                                className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg px-3 h-9 cursor-pointer hover:bg-blue-50 shrink-0"
                            >
                                <IconPlus size={14} /> {translate('Add column')}
                            </button>
                        </div>

                        {columnFields.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                {translate('No columns yet. Click "Add column" to build the layout.')}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {columnFields.map((field, index) => (
                                        <ColumnCard
                                            key={field.id}
                                            index={index}
                                            onRemove={() => removeColumn(index)}
                                            label={field.label}
                                        />
                                    ))}
                                </div>

                                {/* stats bar */}
                                <div className="grid grid-cols-3 gap-2.5 mt-4">
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 mb-0.5">{translate('Columns')}</p>
                                        <p className="text-xl font-medium text-gray-900">{columnFields.length}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 mb-0.5">{translate('Total rows')}</p>
                                        <p className="text-xl font-medium text-gray-900">{getTotalRows(columns)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-400 mb-0.5">{translate('Total seats')}</p>
                                        <p className="text-xl font-medium text-gray-900">{getTotalSeats(columns)}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end mt-5">
                        <button
                            type="submit"
                            className="flex items-center gap-2 h-10 px-6 text-sm rounded-lg bg-gray-900 text-white cursor-pointer hover:opacity-85"
                        >
                            <IconCheck size={15} /> {translate('Save hall')}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default ExamHallSetup;