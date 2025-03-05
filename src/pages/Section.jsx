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
import { useDispatch, useSelector } from "react-redux";
import { fetchClassData, setEditMode, updateClassSerial } from "../features/class/classSlice";
import { updateInData } from "../utils/update/api";
import { insertData } from "../utils/create/api";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ThemeInputBox1 from "../components/Forms/ThemeInputBox1";
import { setPageName } from "../features/auth/authSlice";
import SelectBox1 from "../components/Forms/SelectBox1";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import useTranslate from "../utils/Translate";
import { toast } from "react-toastify";


const RowDragHandleCell = ({ rowId }) => {
    const { attributes, listeners } = useSortable({
        id: rowId,
    })
    return (
        <button {...attributes} {...listeners} className="w-full flex items-center justify-center text-theme-dark">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-grip-vertical"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
        </button>
    )
}

const DraggableRow = ({ row, headers, statename }) => {
    const dispatch = useDispatch();

    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.CGSL ? row.CGSL : row.SubClassID,
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
                    <RowDragHandleCell rowId={row.CGSL ? row.CGSL : row.SubClassID} />
                </div>
            </td>
            {headers.map((header) => (
                <td key={header} className="py-2 px-4 border border-slate-100">
                    {row[header]}
                </td>
            ))}
            <td className="pt-3 text-center">
                <button type="button" onClick={() => {
                    dispatch(setEditMode(row.id))
                }}>
                    <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                </button>
                {/* <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" /> */}
            </td>
        </tr>
    );
};

const Section = ({ pageTitle }) => {
    const translate = useTranslate()
    const [rows, setRows] = useState([]);
    const tableHeader = ["Class Serial", "Class", "Section Serial", "Section", "English", "Arabic"];
    const { classList, subClassList, editMode, status, error } = useSelector((state) => state.class);
    const { academicSession } = useSelector((state) => state.settings);

    const [dataUpdate, setDataUpdate] = useState(false);
    const {
        handleSubmit,
        reset,
        formState: { errors },
    } = useFormContext()
    // const headers = Object.keys(tableRows.length ? tableRows[0] : {});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        console.log(pageTitle);
        
        dispatch(setPageName(pageTitle))
        if (status === 'idle') {
            dispatch(fetchClassData());
            dispatch(fetchSettingsData());
        }

        if (status === 'succeeded') {
            const transformedData = subClassList.map((item) => ({
                id: item.SubClassID.toString(),
                "Class Serial": item.Serial,
                Class: item.Class?.ClassName,
                "Section Serial": item.CGSL,
                Section: item.SubClass,
                English: item.SubClassEng,
                Arabic: item.SubClassAra
            }));
            setRows(transformedData);

        }
    }, [status, dispatch]);

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
    
        if (active && over && active.id !== over.id) {
            setRows((currentRows) => {
                if (!Array.isArray(currentRows)) return currentRows;
    
                const oldIndex = currentRows.findIndex((row) => row.CGSL === active.id);
                const newIndex = currentRows.findIndex((row) => row.CGSL === over.id);
    
                const updatedRows = arrayMove(currentRows, oldIndex, newIndex);
                const updatedRowsWithSerial = updatedRows.map((row, index) => ({ ...row, Serial: index + 1 }));
    
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
                    const response = await updateInData(1, rows, '/api/academic/update_subclass_serial');
                    // Handle response if needed
                } catch (error) {
                    console.error('Failed to update serial:', error);
                }
            }
    
            updateSerial();
        }
    }, [dataUpdate, rows]);

    useEffect(() => {

        if (editMode !== 0) {
            const selectedClass = subClassList.find((item) => item.SubClassID == editMode);
            // console.log(selectedClass);

            reset(selectedClass);
        }
    }, [editMode]);


    const onSubmit = async (data) => {
        const id = toast.dark("তথ্য যুক্ত করা হচ্ছে...", {
            type: "success",
            isLoading: true,
            className: " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
            style: {
                boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
            },
        });
        function getSerialBySubClassId(subclassId) {
            const item = subClassList.find(item => item.SubClassID === subclassId);

            return item ? item.Serial : null; // Return the Serial if found, otherwise return null
        }
        try {
            if (editMode === 0) {
                const submitedData = { ...data, Serial: getSerialBySubClassId(data.ClassID), CGSL: rows.length + 1 }
                const submitRes = await insertData(submitedData, "/api/academic/insert_sub_class")
                if(submitRes.success){
                    dispatch(fetchClassData());
                    toast.update(id, { render: submitRes.data.message, type: "success", isLoading: false, autoClose: true });
                }
                else {
                    dispatch(fetchClassData());
                    toast.update(id, { render: submitRes.error, type: "error", isLoading: false, autoClose: true });
                }
                
            }
            else {
                console.log(data);
                
                const submitRes = await updateInData(editMode, data, "/api/academic/update_sub_class")
                dispatch(setEditMode(0));
                if(submitRes.success){
                    reset({ SubClass: "", ClassID: "", SubClassEng: "", SubClassAra: "" });
                    dispatch(fetchClassData());
                    toast.update(id, { render: submitRes.data.message, type: "success", isLoading: false, autoClose: true });
                }
                else {
                    toast.update(id, { render: submitRes.error, type: "error", isLoading: false, autoClose: true });
                }
            }

        } catch (err) {
            toast.update(id, { render: submitRes.error, type: "error", isLoading: false, autoClose: true });
            console.error(err.message)
        }
    }


    return (
        <div className="p-4">
            {/* <SortableCompo /> */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <div className="w-full lg:w-[40%] lg:h-fit lg:sticky lg:top-0  border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
                    <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">{translate("Add Section")}</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* <div className="mb-4">
                            <SelectBox1
                                label={"শিক্ষাবর্ষ:"}
                                options={academicSession}
                                valueField={"SessionID"}
                                nameField={"SessionName"}
                                registerKey={"class"}
                                require={"Session is require"}
                            />
                        </div> */}
                        <div className="mb-4">
                            <SelectBox1
                                label={"মারহালা/ক্লাশ:"}
                                options={classList}
                                valueField={"ClassID"}
                                nameField={"ClassName"}
                                registerKey={"ClassID"}
                                require={"Class is require"}
                                type={"number"}
                            />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"Section"} registerKey={"SubClass"} require={"Sub Class Name is require"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"English"} registerKey={"SubClassEng"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"عربي"} registerKey={"SubClassAra"} type={"text"} />
                        </div>

                        <button type="submit" className="bg-theme-color transation ease-linear font-bold duration-500 inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-[#121212] font-SolaimanLipi">
                            {translate("Save")}
                        </button>
                        <button type="button" onClick={() => {
                            setEditMode(0);
                            reset({
                                SubClass: "",
                                SubClassEng: "",
                                SubClassAra: "",
                                ClassID: ""
                            })
                        }} className="bg-[#121212] transation ease-linear duration-500 font-bold inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-slate-700 ms-[20px] font-SolaimanLipi">
                            {translate("Add New")}
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
                                    <tr className="bg-theme-dark text-left text-sm text-white font-SolaimanLipi">
                                        <th></th>
                                        {tableHeader.map((title) => (
                                            <th key={title} className="py-2 px-3">
                                                {title}
                                            </th>
                                        ))}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                {
                                    rows.length > 0 ? (
                                        <SortableContext
                                            items={rows.map((row, index) => row.CGSL ? row.CGSL : row.SubClassID)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <tbody className="font-SolaimanLipi text-semibold">
                                                {rows.map((row) => (
                                                    <DraggableRow key={row.id} row={row} headers={tableHeader} />
                                                ))}
                                            </tbody>
                                        </SortableContext>
                                    ) : null
                                }

                            </table>
                        </div>
                    </div>

                </DndContext>


            </div>

        </div>
    );
};

export default Section;
