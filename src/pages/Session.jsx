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
import { setReqLoading } from "../features/requestHandeler/requestHandelerSlice";


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

const Session = ({ pageTitle }) => {
    const translate = useTranslate()
    const [rows, setRows] = useState([]);
    const tableHeader = ["Session Serial", "Session", "English", "Arabic"];
    const { editMode } = useSelector((state) => state.class);
    const { academicSession, status } = useSelector((state) => state.settings);
    const { reqLoading } = useSelector((state) => state.requestHandeler);

    const [dataUpdate, setDataUpdate] = useState(false);
    const {
        handleSubmit,
        reset,
        formState: { errors },
    } = useFormContext()
    // const headers = Object.keys(tableRows.length ? tableRows[0] : {});
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageName(pageTitle))
        dispatch(setEditMode(0));
        if (status === 'idle') {
            dispatch(fetchSettingsData());
        }
        if (status === 'succeeded') {
            const transformedData = academicSession.map((item) => ({
                id: item.SessionID.toString(),
                "Session Serial": item.Serial,
                Session: item.SessionName,
                English: item.SessionEngName,
                Arabic: item.SessionAraName
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
            const selectedClass = academicSession.find((item) => item.SessionID == editMode);
            reset(selectedClass);
        }

    }, [editMode]);


    const onSubmit = async (data) => {
        if (reqLoading) {
            console.log("Request already in progress. Please wait...");
            return false;
        }
        dispatch(setReqLoading(true))
        const id = toast.dark("তথ্য যুক্ত করা হচ্ছে...", {
            className: " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
            style: {
                boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
            },
            // transition: bounce,
            position: "bottom-center",
            type: "success",
            closeButton: false,
            isLoading: true
        });

        try {
            if (editMode === 0) {
                const submitedData = { ...data, Serial: rows.length + 1 }
                const submitRes = await insertData(submitedData, "/api/academic/insert_session")
                // console.log(submitRes);
                if (submitRes.success) {
                    reset({ SessionName: "", SessionEngName: "", SessionAraName: "" });
                    toast.update(id, { render: "তথ্য যুক্ত করা হয়েছে।", type: "success", isLoading: false, autoClose: true });
                    dispatch(fetchSettingsData());
                    dispatch(setReqLoading(false))
                }
                else {
                    toast.update(id, { render: String(submitRes.error), type: "error", isLoading: false, autoClose: true });
                    dispatch(setReqLoading(false))
                    console.error("Failed to insert data:", submitRes.error);
                }

            }
            else {
                const submitRes = await updateInData(editMode, data, "/api/academic/update_session")
                dispatch(setEditMode(0));
                reset({ SessionName: "", SessionEngName: "", SessionAraName: "" });

                if (submitRes.success) {
                    reset({ SessionName: "", SessionEngName: "", SessionAraName: "" });
                    toast.update(id, { render: "তথ্য যুক্ত করা হয়েছে।", type: "success", isLoading: false, autoClose: true });
                    dispatch(fetchSettingsData());
                    dispatch(setReqLoading(false))
                }
                else {
                    toast.update(id, { render: String(submitRes.error), type: "error", isLoading: false, autoClose: true });
                    dispatch(setReqLoading(false))
                    console.error("Failed to insert data:", submitRes.error);
                }
            }

        } catch (err) {
            reset({ SessionName: "", SessionEngName: "", SessionAraName: "" });
            toast.update(id, { render: String(err.message), type: "error", isLoading: false, autoClose: true });
            dispatch(setReqLoading(false))
            console.error(err.message)
        }
    }

    const FieldValue = [
        {
            "serial": 1,
            "type": "input",
            "title": "User Name",
            "key": "username",
            "options": [],
            "required": "true"
        },
        {
            "serial": 2,
            "type": "select",
            "title": "user req",
            "key": "user req",
            "options": [
                {
                    "title": "book name",
                    "value": "book_name"
                },
                {
                    "title": "class id",
                    "value": "class_id"
                }
            ],
            "required": "true"
        },
        {
            "type": "list",
            "serial": 3,
            "title": "user req",
            "key": "user req",
            "options": [
                {
                    "title": "book name",
                    "value": "book_name"
                },
                {
                    "title": "class id",
                    "value": "class_id"
                }
            ],
            "required": "true"
        }
    ]

    return (
        <div className="p-4">
            {/* <SortableCompo /> */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <div className="w-full lg:w-[40%] lg:h-fit lg:sticky lg:top-0  border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
                    <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">{translate("Add Session")}</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div className="mb-3">
                            <ThemeInputBox1 label={"Session"} registerKey={"SessionName"} require={"Session Name Name is require"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"English"} registerKey={"SessionEngName"} type={"text"} />
                        </div>
                        <div className="mb-3">
                            <ThemeInputBox1 label={"عربي"} registerKey={"SessionAraName"} type={"text"} />
                        </div>

                        <button type="submit" className="bg-theme-color transation ease-linear font-bold duration-500 inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-[#121212] font-SolaimanLipi">
                            {translate("Save")}
                        </button>
                        <button type="button" onClick={() => {
                            setEditMode(0);
                            reset({
                                SessionName: "",
                                SessionEngName: "",
                                SessionAraName: "",
                                SessionID: ""
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

export default Session;
