import React from "react";

const SortableTable = ({ columns, data }) => {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-3 py-3 text-nowrap text-${column?.hozAlign ? column.hozAlign : "start"}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
              {columns.map((column, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-4 font-medium text-theme-dark whitespace-nowrap font-SolaimanLipi text-${column?.hozAlign ? column.hozAlign : "start"}`}
                >
                 
                  {column.render ? (
                    column.render(row)  
                  ) : (
                    row[column.field] || "N/A"  
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
