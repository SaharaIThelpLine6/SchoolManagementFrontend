import React, { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";

const SortableTable = ({ columns, data, isFilterColumn = true }) => {
  const [filters, setFilters] = useState({});

  // Handle filter input changes
  // const handleFilterChange = (field, value) => {
  //   setFilters((prevFilters) => ({
  //     ...prevFilters,
  //     [field]: value,
  //   }));
  // };

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value === "All" ? null : value, // Use null to reset filter
    }));
  };

  // Apply filtering logic
  const filteredData = data.filter((row) =>
    columns.every((column) => {
      // if (!filters[column.field] || filters[column.field] === "All") return true;
      if (!filters[column.field] && filters[column.field] !== 0) return true;

      if (column.type === "text") {
        return row[column.field]
          ?.toString()
          .toLowerCase()
          .includes(filters[column.field].toLowerCase());
      }

      // if (column.type === "select") {
      //   return row[column.field] === filters[column.field];
      // }
      if (column.type === "select") {
        return row[column.field] === Number(filters[column.field]); // Compare as number
      }

      if (column.type === "date") {
        const rowDate = new Date(row[column.field]).setHours(0, 0, 0, 0);
        const filterDate = new Date(filters[column.field]).setHours(0, 0, 0, 0);
        return rowDate === filterDate;
      }

      if (column.type === "range") {
        const rowDate = new Date(row[column.field]).setHours(0, 0, 0, 0);
        const [startDate, endDate] = filters[column.field] || [];
        return startDate && endDate
          ? rowDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
          rowDate <= new Date(endDate).setHours(0, 0, 0, 0)
          : true;
      }

      return true;
    })
  );

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={`px-3 py-3 text-nowrap text-${column.hozAlign || "start"}`}>
                {column.title}
              </th>
            ))}
          </tr>
          {
            isFilterColumn && <tr>
              {columns.map((column, index) => (
                <th key={index} className={`px-3 h-[40px] text-${column.hozAlign || "start"}`}>
                  {column.filterable && (
                    <>
                      {column.type === "text" && (
                        <input
                          type="text"
                          placeholder={`Filter ${column.title}`}
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] || ""}
                          onChange={(e) => handleFilterChange(column.field, e.target.value)}
                        />
                      )}

                      {column.type === "select" && (
                        // <select
                        //   className="w-full px-2 py-1 border rounded-md text-xs"
                        //   value={filters[column.field] || "All"}
                        //   onChange={(e) => handleFilterChange(column.field, e.target.value)}
                        // >
                        //   <option value="All">All</option>
                        //   {column.options.map((option, i) => (
                        //     <option key={i} value={option}>
                        //       {option}
                        //     </option>
                        //   ))}
                        // </select>
                        <select
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] ?? "All"}
                          onChange={(e) => handleFilterChange(column.field, e.target.value === "All" ? null : Number(e.target.value))}
                        >
                          <option value="All">All</option>
                          {column.options.map((option, i) => (
                            <option key={i} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}



                      {column.type === "date" && (
                        <Flatpickr
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          options={{ dateFormat: "Y-m-d" }}
                          value={filters[column.field] || ""}
                          onChange={(selectedDates) =>
                            handleFilterChange(column.field, selectedDates[0])
                          }
                        />
                      )}

                      {column.type === "range" && (
                        <Flatpickr
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          options={{ mode: "range", dateFormat: "Y-m-d" }}
                          value={filters[column.field] || ""}
                          onChange={(selectedDates) =>
                            handleFilterChange(column.field, selectedDates.length ? selectedDates : [])
                          }
                        />
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          }

        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
              {columns.map((column, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-4 font-medium text-theme-dark whitespace-nowrap font-SolaimanLipi text-${column.hozAlign || "start"}`}
                >
                  {column.render ? column.render(row) : row[column.field] || "N/A"}
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
