import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ThemeInputBox1 from "../Forms/ThemeInputBox1";
import { useDispatch, useSelector } from "react-redux";
import { fetchClassData, setEditMode, updateClassSerial } from "../../features/class/classSlice";
import { updateInData, updateUserInfo } from "../../utils/update/api";
import { insertData } from "../../utils/create/api";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { updateClassSerial } from "../../features/class/classSlice";


const RowDragHandleCell = ({ rowId }) => {
    const { attributes, listeners } = useSortable({
        id: rowId,
    })
    return (
        <button {...attributes} {...listeners} className="w-full flex items-center justify-center text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-grip-vertical"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
        </button>
    )
}

const DraggableRow = ({ row, headers, statename }) => {
    const dispatch = useDispatch();
    // console.log(row);
    

    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.Serial,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td>
                <div className="w-full">
                    <RowDragHandleCell rowId={row.Serial} />
                </div>
            </td>
            {headers.map((header) => (
                <td key={header} className="py-2 px-4 border border-slate-100">
                    {row[header]}
                </td>
            ))}
            <td className="pt-3 flex gap-2">
                <button type="button" onClick={() => {
                    dispatch(setEditMode(row.id))
                }}>
                    <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                </button>
                <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" />
            </td>
        </tr>
    );
};

const InputTable2 = ({ tableTitle, field, tableRows, tableHeader }) => {
    const [rows, setRows] = useState(tableRows);
    const { classList } = useSelector((state) => state.class);

    const [dataUpdate, setDataUpdate] = useState(false);
    const editMode = useSelector((state) => state.class.editMode);
    const subClassList = useSelector((state) => state.class.subClassList);
    const {
        handleSubmit,
        reset,
        formState: { errors },
    } = useFormContext()
    // const headers = Object.keys(tableRows.length ? tableRows[0] : {});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setRows(tableRows)
    }, [tableHeader, tableRows]);

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    /* const handleDragEnd = (event) => {
         const { active, over } = event;
 
         if (active && over && active.id !== over.id) {
             setRows((currentRows) => {
                 if (!Array.isArray(currentRows)) return currentRows;
                 const oldIndex = currentRows.findIndex((row) => row.id === active.id);
                 const newIndex = currentRows.findIndex((row) => row.id === over.id);
                 const updatedRows = arrayMove(currentRows, oldIndex, newIndex);
                 const updatedRowsWithSerial = updatedRows.map((row, index) => ({ ...row, Serial: index + 1 }));
                 try {
                    async function updateSerial() {
                        await dispatch(updateClassSerial({ id: "2", data: updatedRowsWithSerial }));
                     }
                     updateSerial()
                     return updatedRowsWithSerial
                 } catch (error) {
                     console.log(error);
                 }
                 
             });
         }
     };*/

    /*const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setRows((currentRows) => {
                if (!Array.isArray(currentRows)) return currentRows;

                const oldIndex = currentRows.findIndex((row) => row.id === active.id);
                const newIndex = currentRows.findIndex((row) => row.id === over.id);

                const updatedRows = arrayMove(currentRows, oldIndex, newIndex);
                const updatedRowsWithSerial = updatedRows.map((row, index) => ({ ...row, Serial: index + 1 }));
                const updatedState = updatedRowsWithSerial;

                setDataUpdate(true);
                return updatedState;
            });
        }
    };


    useEffect(() => {
        if (update) {
            setDataUpdate(false);
            async function updateSerial() {
                try {
                    await dispatch(updateClassSerial({ id: "2", data: rows }));
                } catch (error) {
                    console.log(error);
                }
            }
            updateSerial();
        }
    }, [update, dispatch, rows]);*/

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setRows((currentRows) => {
                if (!Array.isArray(currentRows)) return currentRows;

                const oldIndex = currentRows.findIndex((row) => row.Serial === active.id);
                const newIndex = currentRows.findIndex((row) => row.Serial === over.id);

                const updatedRows = arrayMove(currentRows, oldIndex, newIndex);
                const updatedRowsWithSerial = updatedRows.map((row, index) => ({ ...row, Serial: index + 1 }));


                // setRows(updatedRowsWithSerial); 
                setDataUpdate(true);
                return updatedRowsWithSerial;
            });
        }
    };

    useEffect(() => {
        if (dataUpdate) {
            setDataUpdate(false);

            async function updateSerial() {
                try {
                    const response = await updateInData(1, rows, `/api/academic/update_serial`);
                    dispatch(fetchClassData());

                } catch (error) {
                    console.log(error);
                }
            }

            updateSerial();
        }
    }, [dataUpdate, dispatch, rows]);

    useEffect(() => {

        if (editMode !== 0) {
            const selectedClass = classList.find((item) => item.ClassID == editMode);
            console.log(selectedClass);
            
            reset(selectedClass);
        }
    }, [editMode]);

    // const refreshSection = async () => {
    //     try {
    //         // setRows(classList);
    //         console.log(classList);
            
    //     } catch (error) {
    //         console.log("Error refreshing section:", error);
    //     }
    // };

    const onSubmit = async (data) => {
        console.log(data);


        try {
            if (editMode === 0) {
                const submitedData = { ...data, Serial: rows.length + 1 }
                const submitRes = await insertData(submitedData, "/api/academic/insert_class")
                navigate(0);
            }
            else {
                console.log("Emon Hasan");
                console.log(editMode, data);
                const id = toast.loading("Please wait...")
                
                const submitRes = await updateInData(editMode, data, "/api/academic/update_class")
                dispatch(setEditMode(0));
                reset({ClassName: "", EnglishClass: "", ArabicClass: ""});
                toast.update(id, { render: "Unicode Converted Successfully", type: "success", isLoading: false });
                dispatch(fetchClassData()); 
                // navigate(0);
            }

        } catch (err) {
            console.error(err.message)
        }
    }


    return (
        <div className="p-4">
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <div className="w-full lg:w-[40%] border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
                    <h1 className="font-semibold text-lg text-slate-700 mb-4">{tableTitle}</h1>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <ThemeInputBox1 label={field} registerKey={"ClassName"} require={"Class Name is require"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"English"} registerKey={"EnglishClass"} require={"Class Name in English is require"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"عربي"} registerKey={"ArabicClass"} require={"Class Name in Arabic is require"} type={"text"} />
                        </div>
                        {/* <div className="mb-4">
                            <p className="text-slate-500 pb-2">
                                Sections <span className="text-red-700">*</span>
                            </p>
                            <div className="flex gap-5 flex-wrap">
                                {
                                    subClassList.map((subClass) => {
                                        return (
                                            <div key={subClass.SubClassID} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`section-${subClass.SubClassID}`}
                                                    value={subClass.SubClassID}
                                                    className="h-4 w-4 text-slate-600 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`section-${subClass.SubClassID}`}
                                                    className="ml-2 text-slate-600 text-sm"
                                                >
                                                    {subClass.SubClass}
                                                </label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div> */}
                        <button type="submit" className="bg-slate-700 px-4 py-2 text-white rounded-md mt-4 w-full hover:bg-slate-700">
                            Save
                        </button>
                    </form>
                </div>

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <div className="w-full flex-1 border rounded-lg bg-white shadow-sm">
                        <div className="relative overflow-x-auto">
                            <table className="w-full h-fit border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-left text-sm text-slate-600">
                                        <th></th>
                                        {tableHeader.map((title) => (
                                            <th key={title} className="py-2 px-3">
                                                {title}
                                            </th>
                                        ))}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <SortableContext
                                    items={rows.map((row) => row.Serial)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <tbody>
                                        {rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} headers={tableHeader} />
                                        ))}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </div>
                    </div>

                </DndContext>


            </div>

        </div>
    );
};

export default InputTable2;
