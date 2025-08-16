import React from "react";
import dataJSON from "../../public/data.json";
import DeleteButton from "./Button/DeleteButton";
import EditButton from "./Button/EditButton";

export const Table = ({ rows, deleteRow, editRow }) => {
  const fields = Object.keys(Object.values(dataJSON)[0]).filter(
    (item: any) => !item.startsWith("delta_")
  );

  return (
    <div className="max-w-full overflow-x-auto table-wrapper">
      <table className="table">
        <thead>
          <tr className="bg-gray-2 text-left">
            <th className="min-w-[220px] py-4 px-4 font-medium text-black">
              Bond
            </th>
            <th className="min-w-[150px] py-4 px-4 font-medium text-black">
              Paramter
            </th>
            <th className="py-4 px-4 font-medium text-black ">Criterion</th>
            <th className="py-4 px-4 font-medium text-black ">
              Value to give alert
            </th>
            <th className="py-4 px-4 font-medium text-black ">Alert type</th>
            <th className="py-4 px-4 font-medium text-black ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, idx: number) => {
            return (
              <tr key={idx} className="content-center">
                <td className="border-b border-[#eee] py-5 px-4 ">{row.id}</td>
                <td className="border-b border-[#eee] py-5 px-4 ">
                  <span className={`label label-${row.para}`}>{row.para}</span>
                </td>

                <td className="border-b border-[#eee] py-5 px-4 ">
                  <span>
                    {row.criterion == 0
                      ? "goes down by"
                      : row.criterion == 1
                      ? "goes up by"
                      : row.criterion == 2
                      ? "is smaller than"
                      : row.criterion == 3
                      ? "is greater than"
                      : "is equal to"}
                  </span>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 ">
                  {row.value}
                </td>
                <td className="border-b border-[#eee] py-5 px-4">
                  <span>
                    {row.type == 0
                      ? "Info"
                      : row.type == 1
                      ? "Warning"
                      : "Alert"}
                  </span>
                </td>

                <td className="border-b border-[#eee] py-5 px-4 ">
                  <div className="actions flex grid-cols-2 gap-4">
                    <DeleteButton onClick={() => deleteRow(idx)} />

                    <EditButton onClick={() => editRow(idx)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
