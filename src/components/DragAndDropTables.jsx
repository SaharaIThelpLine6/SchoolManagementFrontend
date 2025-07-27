import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useTranslate from "../utils/Translate";
import { useGetGetStudentListQuery } from "../features/exam/examQuerySlice";
import { skipToken } from "@reduxjs/toolkit/query";
import bnBijoy2Unicode from "../utils/conveter";

// Droppable wrapper for tables
function DroppableTable({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const style = {
    backgroundColor: isOver ? "#e0f7fa" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

// Draggable row component
function DraggableRow({ row, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.UserID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    backgroundColor: isSelected ? "#ebf5ff" : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="text-center hover:bg-gray-50"
      onClick={(e) => {
        if (e.target.type !== "checkbox") {
          onSelect(row.UserID, !isSelected);
        }
      }}
    >
      <td className="border px-4 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(row.UserID, e.target.checked);
          }}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      <td className="border px-4 py-2">{row.UserCode}</td>
      <td className="border px-4 py-2">{bnBijoy2Unicode(row.UserName)}</td>
      <td className="border px-4 py-2">{row.FatherName || "-"}</td>
      <td className="border px-4 py-2">{row.ClassName}</td>
      <td className="border px-4 py-2">{row.Fee}</td>
    </tr>
  );
}

export default function DragAndDropTables({
  filter,
  setLeftRows,
  leftRows,
  setRightRows,
  rightRows,
}) {
  const translate = useTranslate();
  const [selectedRows, setSelectedRows] = useState({
    left: [],
    right: [],
  });
  // Fetch student data
  const {
    data: studentData = {
      Exam_StudentLoadView: [],
      Exam_StudentUnloadView: [],
    },
    isLoading,
    isFetching,
    error,
  } = useGetGetStudentListQuery(
    filter?.SessionId && filter?.ExamId && filter?.SubClassId
      ? {
          SessionID: filter.SessionId,
          ExamID: filter.ExamId,
          SubClassID: filter.SubClassId,
        }
      : skipToken
  );



  useEffect(() => {
    if (!studentData) return;

    const newLeft = studentData.Exam_StudentUnloadView || [];
    const newRight = studentData.Exam_StudentLoadView || [];

    const leftUnchanged = JSON.stringify(newLeft) === JSON.stringify(leftRows);
    const rightUnchanged =
      JSON.stringify(newRight) === JSON.stringify(rightRows);

    if (!leftUnchanged) setLeftRows(newLeft);
    if (!rightUnchanged) setRightRows(newRight);
  }, [studentData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );


  const LEFT_CONTAINER = "left";
  const RIGHT_CONTAINER = "right";

  const findContainer = (id) => {
    if (leftRows.some((r) => r.UserID === id)) return LEFT_CONTAINER;
    if (rightRows.some((r) => r.UserID === id)) return RIGHT_CONTAINER;
    return id;
  };

  const handleSelect = (table, id, isChecked) => {
    setSelectedRows((prev) => ({
      ...prev,
      [table]: isChecked
        ? [...prev[table], id]
        : prev[table].filter((item) => item !== id),
    }));
  };

  const handleSelectAll = (table, isChecked) => {
    const rows = table === LEFT_CONTAINER ? leftRows : rightRows;
    setSelectedRows((prev) => ({
      ...prev,
      [table]: isChecked ? rows.map((row) => row.UserID) : [],
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const from = findContainer(active.id);
    const to =
      over.id === LEFT_CONTAINER || over.id === RIGHT_CONTAINER
        ? over.id
        : findContainer(over.id);

    if (!active.id || !to || from === to) return;

    const selectedIds = selectedRows[from];
    const movingIds = selectedIds.includes(active.id)
      ? selectedIds
      : [active.id];

    if (movingIds.length === 0) return;

    const sourceRows = from === LEFT_CONTAINER ? leftRows : rightRows;
    const movingRows = sourceRows.filter((r) => movingIds.includes(r.UserID));

    if (from === LEFT_CONTAINER) {
      setLeftRows((prev) => prev.filter((r) => !movingIds.includes(r.UserID)));
      setRightRows((prev) => [...prev, ...movingRows]);
    } else {
      setRightRows((prev) => prev.filter((r) => !movingIds.includes(r.UserID)));
      setLeftRows((prev) => [...prev, ...movingRows]);
    }

    setSelectedRows((prev) => ({
      ...prev,
      [from]: prev[from].filter((id) => !movingIds.includes(id)),
    }));
  };

  if (isLoading || isFetching) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="w-full p-6 bg-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Available Students Table */}
          <DroppableTable id={LEFT_CONTAINER}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold p-4 border-b border-gray-200">
                {translate("যে সকর শিক্ষার্থী পরীক্ষায় অংশ গ্রহন করছে না তাদের তালিকা।")}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.left.length > 0 &&
                            selectedRows.left.length === leftRows.length
                          }
                          onChange={(e) =>
                            handleSelectAll(LEFT_CONTAINER, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">{translate("ID")}</th>
                      <th className="px-4 py-3 text-left">
                        {translate("Name")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Father Name")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Class")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Fee")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <SortableContext
                      items={leftRows.map((r) => r.UserID)}
                      strategy={rectSortingStrategy}
                    >
                      {leftRows.length > 0 ? (
                        leftRows.map((row) => (
                          <DraggableRow
                            key={row.UserID}
                            row={row}
                            isSelected={selectedRows.left.includes(row.UserID)}
                            onSelect={(id, isChecked) =>
                              handleSelect(LEFT_CONTAINER, id, isChecked)
                            }
                          />
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-4 text-center text-gray-500"
                          >
                            {translate("No students available")}
                          </td>
                        </tr>
                      )}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </div>
          </DroppableTable>

          {/* Selected Students Table */}
          <DroppableTable id={RIGHT_CONTAINER}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold p-4 border-b border-gray-200">
                {translate("যে সকর শিক্ষার্থী পরীক্ষায় অংশ গ্রহন করছে।")}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.right.length > 0 &&
                            selectedRows.right.length === rightRows.length
                          }
                          onChange={(e) =>
                            handleSelectAll(RIGHT_CONTAINER, e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">{translate("ID")}</th>
                      <th className="px-4 py-3 text-left">
                        {translate("Name")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Father Name")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Class")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Fee")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <SortableContext
                      items={rightRows.map((r) => r.UserID)}
                      strategy={rectSortingStrategy}
                    >
                      {rightRows.length > 0 ? (
                        rightRows.map((row) => (
                          <DraggableRow
                            key={row.UserID}
                            row={row}
                            isSelected={selectedRows.right.includes(row.UserID)}
                            onSelect={(id, isChecked) =>
                              handleSelect(RIGHT_CONTAINER, id, isChecked)
                            }
                          />
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-4 text-center text-gray-500"
                          >
                            {translate("Drop students here")}
                          </td>
                        </tr>
                      )}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </div>
          </DroppableTable>
        </div>
      </DndContext>
    </div>
  );
}
// import React, { useState } from "react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   useDroppable,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   rectSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import useTranslate from "../utils/Translate";
// import { useGetGetStudentListQuery } from "../features/exam/examQuerySlice";
// import { skipToken } from "@reduxjs/toolkit/query";

// // Initial data
// const initialLeftTable = [
//   {
//     id: "1",
//     session: "2024",
//     examName: "Half-Yearly",
//     className: "Six",
//     feeName: "Tuition Fee",
//     fee: 500,
//   },
//   {
//     id: "2",
//     session: "2024",
//     examName: "Final",
//     className: "Seven",
//     feeName: "Lab Fee",
//     fee: 300,
//   },
//   {
//     id: "3",
//     session: "2023",
//     examName: "Mid-Term",
//     className: "Eight",
//     feeName: "Library Fee",
//     fee: 200,
//   },
// ];

// const initialRightTable = [
//   {
//     id: "4",
//     session: "2023",
//     examName: "Annual",
//     className: "Nine",
//     feeName: "Admission Fee",
//     fee: 1000,
//   },
// ];

// // Droppable wrapper for tables
// function DroppableTable({ id, children }) {
//   const { setNodeRef, isOver } = useDroppable({ id });
//   const style = {
//     backgroundColor: isOver ? "#e0f7fa" : undefined,
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       {children}
//     </div>
//   );
// }

// // Draggable row
// function DraggableRow({ row, isSelected, onSelect }) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: row.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     cursor: "grab",
//     backgroundColor: isSelected ? "#ebf5ff" : undefined,
//   };

//   return (
//     <tr
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className="text-center"
//       onClick={(e) => {
//         // Toggle selection on row click (but not when clicking checkbox)
//         if (e.target.type !== "checkbox") {
//           onSelect(row.id, !isSelected);
//         }
//       }}
//     >
//       <td className="border px-2 py-1">
//         <div className="text-center">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => {
//               e.stopPropagation();
//               onSelect(row.id, e.target.checked);
//             }}
//             className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//           />
//         </div>
//       </td>
//       <td className="border px-2 py-1">{row.id}</td>
//       <td className="border px-2 py-1">{row.session}</td>
//       <td className="border px-2 py-1">{row.examName}</td>
//       <td className="border px-2 py-1">{row.className}</td>
//       <td className="border px-2 py-1">{row.feeName}</td>
//       <td className="border px-2 py-1">{row.fee}</td>
//     </tr>
//   );
// }

// export default function DragAndDropTables({filter}) {
//   const translate = useTranslate();

//   const [selectedRows, setSelectedRows] = useState({
//     left: [],
//     right: [],
//   });
//   const {
//     data: studentListData = [],
//     isLoading,
//     error,
//     isFetching,
//   } = useGetGetStudentListQuery(
//     filter?.SessionId && filter?.ExamId && filter?.SubClassId
//       ? {
//           SessionID: filter?.SessionId,
//           ExamID: filter?.ExamId,
//           SubClassID: filter?.SubClassId,
//         }
//       : skipToken
//   );
//   const [leftRows, setLeftRows] = useState(studentListData.Exam_StudentLoadView);
//   const [rightRows, setRightRows] = useState(studentListData.Exam_StudentUnloadView);
//   console.log(studentListData, "studentListData");

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 5, // Require 5px movement before dragging starts
//       },
//     })
//   );

//   const LEFT_CONTAINER = "left";
//   const RIGHT_CONTAINER = "right";

//   const findContainer = (id) => {
//     if (leftRows.some((r) => r.id === id)) return LEFT_CONTAINER;
//     if (rightRows.some((r) => r.id === id)) return RIGHT_CONTAINER;
//     return id;
//   };

//   const handleSelect = (table, id, isChecked) => {
//     setSelectedRows((prev) => ({
//       ...prev,
//       [table]: isChecked
//         ? [...prev[table], id]
//         : prev[table].filter((item) => item !== id),
//     }));
//   };

//   const handleSelectAll = (table, isChecked) => {
//     const rows = table === LEFT_CONTAINER ? leftRows : rightRows;
//     setSelectedRows((prev) => ({
//       ...prev,
//       [table]: isChecked ? rows.map((row) => row.id) : [],
//     }));
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (!over) return;

//     const from = findContainer(active.id);
//     const to =
//       over.id === LEFT_CONTAINER || over.id === RIGHT_CONTAINER
//         ? over.id
//         : findContainer(over.id);

//     if (!active.id || !to || from === to) return;

//     // Get all selected rows from the source table
//     const selectedIds = selectedRows[from];
//     const movingIds = selectedIds.includes(active.id)
//       ? selectedIds
//       : [active.id];

//     if (movingIds.length === 0) return;

//     // Get the rows to move
//     const sourceRows = from === LEFT_CONTAINER ? leftRows : rightRows;
//     const movingRows = sourceRows.filter((r) => movingIds.includes(r.id));

//     // Update the tables
//     if (from === LEFT_CONTAINER) {
//       setLeftRows((prev) => prev.filter((r) => !movingIds.includes(r.id)));
//       setRightRows((prev) => [...prev, ...movingRows]);
//     } else {
//       setRightRows((prev) => prev.filter((r) => !movingIds.includes(r.id)));
//       setLeftRows((prev) => [...prev, ...movingRows]);
//     }

//     // Clear selection from source table
//     setSelectedRows((prev) => ({
//       ...prev,
//       [from]: prev[from].filter((id) => !movingIds.includes(id)),
//     }));
//   };

//   return (
//     <div className="w-full min-h-screen p-6 bg-white">
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
//           {/* Left Table */}
//           <DroppableTable id={LEFT_CONTAINER}>
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">
//               {translate("Select those to whom you will charge fees.")}
//             </h2>
//             <SortableContext
//               items={leftRows.map((r) => r.id)}
//               strategy={rectSortingStrategy}
//             >
//               <div className="w-full overflow-x-auto">
//                 <table className="min-w-full border border-gray-300">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         <input
//                           type="checkbox"
//                           checked={
//                             selectedRows.left.length > 0 &&
//                             selectedRows.left.length === leftRows.length
//                           }
//                           onChange={(e) =>
//                             handleSelectAll(LEFT_CONTAINER, e.target.checked)
//                           }
//                           className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">{translate("SL")}</th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Session")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Exam Name")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Class/Jamaat")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                        {translate("Fee Name")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Fee")}
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {leftRows.length > 0 ? (
//                       leftRows.map((row) => (
//                         <DraggableRow
//                           key={row.id}
//                           row={row}
//                           isSelected={selectedRows.left.includes(row.id)}
//                           onSelect={(id, isChecked) =>
//                             handleSelect(LEFT_CONTAINER, id, isChecked)
//                           }
//                         />
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="7"
//                           className="text-center text-gray-400 italic py-4"
//                         >
//                           Drop items here
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </SortableContext>
//           </DroppableTable>

//           {/* Right Table */}
//           <DroppableTable id={RIGHT_CONTAINER}>
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">
//               {translate("Accept the following student fees.")}
//             </h2>
//             <SortableContext
//               items={rightRows.map((r) => r.id)}
//               strategy={rectSortingStrategy}
//             >
//               <div className="w-full overflow-x-auto">
//                 <table className="min-w-full border border-gray-300">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         <input
//                           type="checkbox"
//                           checked={
//                             selectedRows.right.length > 0 &&
//                             selectedRows.right.length === rightRows.length
//                           }
//                           onChange={(e) =>
//                             handleSelectAll(RIGHT_CONTAINER, e.target.checked)
//                           }
//                           className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                       </th>
//                  <th className="border px-2 py-1 whitespace-nowrap">{translate("SL")}</th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Session")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Exam Name")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Class/Jamaat")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                        {translate("Fee Name")}
//                       </th>
//                       <th className="border px-2 py-1 whitespace-nowrap">
//                         {translate("Fee")}
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {rightRows.length > 0 ? (
//                       rightRows.map((row) => (
//                         <DraggableRow
//                           key={row.id}
//                           row={row}
//                           isSelected={selectedRows.right.includes(row.id)}
//                           onSelect={(id, isChecked) =>
//                             handleSelect(RIGHT_CONTAINER, id, isChecked)
//                           }
//                         />
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="7"
//                           className="text-center text-gray-400 italic py-4"
//                         >
//                           Drop items here
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </SortableContext>
//           </DroppableTable>
//         </div>
//       </DndContext>
//     </div>
//   );
// }
