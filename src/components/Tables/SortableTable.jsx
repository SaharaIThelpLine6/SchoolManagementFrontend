import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import bnBijoy2Unicode from '../../utils/conveter';
import { useSelector } from 'react-redux';

const SortableTable = ({
  columns,
  data,
  isFilterColumn = true,
  onRowClick,
  close,
  checkboxes = {}, // নতুন প্রপ: চেকবক্স স্টেট
  onCheckboxChange, // নতুন প্রপ: চেকবক্স হ্যান্ডলার
  rowWrap = true,
  tdclass,
}) => {
  const [filters, setFilters] = useState({});
  const { currectLanguage } = useSelector((state) => state.language);
  const fontClass =
    currectLanguage === 'bn' ? 'font-SolaimanLipi' : 'font-lato';

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value === 'All' ? null : value,
    }));
  };

  // ফিল্টারিং লজিক (অপরিবর্তিত)
  const filteredData = data.filter((row) =>
    columns.every((column) => {
      if (!filters[column.field] && filters[column.field] !== 0) return true;

      if (column.type === 'text') {
        return row[column.field]
          ?.toString()
          .toLowerCase()
          .includes(filters[column.field].toLowerCase());
      }
      if (column.type === 'select') {
        return row[column.field] === Number(filters[column.field]);
      }
      if (column.type === 'date') {
        const rowDate = new Date(row[column.field]).setHours(0, 0, 0, 0);
        const filterDate = new Date(filters[column.field]).setHours(0, 0, 0, 0);
        return rowDate === filterDate;
      }
      if (column.type === 'range') {
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
  const alignClass = {
    start: 'text-left',
    center: 'text-center',
    end: 'text-right',
  };
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead
          className={`text-xs sm:text-sm text-theme-dark ${fontClass} uppercase bg-gray-50`}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-3 py-3 text-nowrap ${
                  alignClass[column.hozAlign] || 'text-left'
                }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  <span>{column.title}</span>
                  {column.hasCheckbox && onCheckboxChange && (
                    <input
                      type="checkbox"
                      checked={checkboxes[column.field] || false}
                      onChange={() => onCheckboxChange(column.field)}
                      className="ml-2"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>

          {isFilterColumn && (
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3 h-[40px] text-${column.hozAlign || 'start'}`}
                >
                  {column.filterable && (
                    <>
                      {column.type === 'text' && (
                        <input
                          type="text"
                          placeholder={`Filter ${column.title}`}
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] || ''}
                          onChange={(e) =>
                            handleFilterChange(column.field, e.target.value)
                          }
                        />
                      )}
                      {column.type === 'select' && (
                        <select
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          value={filters[column.field] ?? 'All'}
                          onChange={(e) =>
                            handleFilterChange(
                              column.field,
                              e.target.value === 'All'
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        >
                          <option value="All">All</option>
                          {column.options.map((option, i) => (
                            <option key={i} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {column.type === 'date' && (
                        <Flatpickr
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          options={{ dateFormat: 'Y-m-d' }}
                          value={filters[column.field] || ''}
                          onChange={(selectedDates) =>
                            handleFilterChange(column.field, selectedDates[0])
                          }
                        />
                      )}
                      {column.type === 'range' && (
                        <Flatpickr
                          className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                          options={{ mode: 'range', dateFormat: 'Y-m-d' }}
                          value={filters[column.field] || ''}
                          onChange={(selectedDates) =>
                            handleFilterChange(
                              column.field,
                              selectedDates.length ? selectedDates : []
                            )
                          }
                        />
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-3 py-4 font-medium text-theme-dark ${rowWrap ? 'whitespace-nowrap' : 'whitespace-wrap'}  ${fontClass} text-${
                    column.hozAlign || 'start'
                  } ${tdclass}`}
                >
                  {column.render
                    ? column.render(row, rowIndex)
                    : column?.unicode
                      ? bnBijoy2Unicode(row[column.field])
                      : row[column.field] || 'N/A'}
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
