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
import SvgIcon from "./icons/SvgIcon";
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
      <th className="px-4 py-3 text-left">
         <SvgIcon
              name={"GrDrag"}
              size={16}
            />
      </th>{" "}
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
      <td className="border px-4 py-2 whitespace-nowrap">{row.UserCode}</td>
      <td className="border px-4 py-2 whitespace-nowrap">
        {bnBijoy2Unicode(row.UserName)}
      </td>
      <td className="border px-4 py-2 whitespace-nowrap">
        {row.FatherName || "-"}
      </td>
      <td className="border px-4 py-2 whitespace-nowrap">{row.ClassName}</td>
      <td className="border px-4 py-2 whitespace-nowrap">{row.Fee}</td>
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
                {translate(
                  "যে সকল শিক্ষার্থী পরীক্ষায় অংশ গ্রহন করছে না তাদের তালিকা।"
                )}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                         <SvgIcon
              name={"GrDrag"}
              size={16}
            />
                      </th>{" "}
                      <th className="px-4 py-3 text-left whitespace-nowrap">
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
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        {translate("ID")}
                      </th>
                      <th className="px-4 py-3 text-left">
                        {translate("Name")}
                      </th>
                      <th className="px-4 py-3 whitespace-nowrap text-left">
                        {translate("Father Name")}
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        {translate("Class")}
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
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
                {translate("যে সকল শিক্ষার্থী পরীক্ষায় অংশ গ্রহন করছে।")}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                       <SvgIcon
              name={"GrDrag"}
              size={16}
            />
                      </th>{" "}
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
                      <th className="px-4 py-3 text-left whitespace-nowrap">{translate("ID")}</th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        {translate("Name")}
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        {translate("Father Name")}
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
                        {translate("Class")}
                      </th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">
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
