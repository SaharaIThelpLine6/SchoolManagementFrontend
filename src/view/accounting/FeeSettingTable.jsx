import React, { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const initialData = [
  {
    id: 1,
    name: "Hasan",
    class: "5",
    SIName: "ABC",
    MAN: 100,
    MON: 110,
    MOO: 120,
    MDN: 130,
    MDO: 140,
    FAN: 150,
    FAO: 160,
    FON: 170,
    FOO: 180,
    FDN: 190,
    FDO: 200,
    SFSID: 210,
  },
  {
    id: 2,
    name: "Rahim",
    class: "4",
    SIName: "XYZ",
    MAN: 90,
    MON: 100,
    MOO: 110,
    MDN: 120,
    MDO: 130,
    FAN: 140,
    FAO: 150,
    FON: 160,
    FOO: 170,
    FDN: 180,
    FDO: 190,
    SFSID: 200,
  },
  {
    id: 3,
    name: "Karima",
    class: "3",
    SIName: "LMN",
    MAN: 80,
    MON: 90,
    MOO: 100,
    MDN: 110,
    MDO: 120,
    FAN: 130,
    FAO: 140,
    FON: 150,
    FOO: 160,
    FDN: 170,
    FDO: 180,
    SFSID: 190,
  },
];

const FeeSettingTable = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(initialData.map((row) => row.id));
    }
    setAllSelected(!allSelected);
  };

  const handleRowToggle = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleEditOpenModal = (id) => {
    alert("Edit for ID: " + id);
  };

  return (
    <div className="bg-white py-4 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b border-gray-200 text-center w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Action
              </th>
              <th className="p-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Class Name
              </th>
              <th className="p-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                SIName
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MAN
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MON
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MOO
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MDN
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MDO
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FAN
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FAO
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FON
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FOO
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FDN
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FDO
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                SFSID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initialData.map((row) => (
              <tr
                key={row.id}
                className={`${
                  selectedRows.includes(row.id)
                    ? "bg-orange-50 hover:bg-orange-100"
                    : "hover:bg-gray-50"
                } transition-colors duration-150`}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowToggle(row.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200 flex items-center justify-center"
                      title="Delete"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditOpenModal(row.id)}
                      className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaRegEdit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-gray-800 font-medium">{row.class}</td>
                <td className="p-3 text-gray-600">{row.SIName}</td>
                <td className="p-3 text-center text-gray-600">{row.MAN}</td>
                <td className="p-3 text-center text-gray-600">{row.MON}</td>
                <td className="p-3 text-center text-gray-600">{row.MOO}</td>
                <td className="p-3 text-center text-gray-600">{row.MDN}</td>
                <td className="p-3 text-center text-gray-600">{row.MDO}</td>
                <td className="p-3 text-center text-gray-600">{row.FAN}</td>
                <td className="p-3 text-center text-gray-600">{row.FAO}</td>
                <td className="p-3 text-center text-gray-600">{row.FON}</td>
                <td className="p-3 text-center text-gray-600">{row.FOO}</td>
                <td className="p-3 text-center text-gray-600">{row.FDN}</td>
                <td className="p-3 text-center text-gray-600">{row.FDO}</td>
                <td className="p-3 text-center text-gray-600 font-mono">
                  {row.SFSID}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeSettingTable;
