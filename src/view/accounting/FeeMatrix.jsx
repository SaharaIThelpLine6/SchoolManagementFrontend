import React, { useState } from "react";

const FeeMatrix = () => {
  // State initialization
  const initialStudentState = {
    residential: { new: false, old: false },
    nonResidential: { new: false, old: false },
    dayCare: { new: false, old: false },
  };

  const [studentData, setStudentData] = useState(initialStudentState);
  const [studentFemaleData, setStudentFemaleData] = useState(initialStudentState);
  const [amounts, setAmounts] = useState({ male: "", female: "" });

  // Category translations
  const categoryTranslations = {
    residential: "আবাসিক",
    nonResidential: "অনাবাসিক",
    dayCare: "ডে-কেয়ার",
  };

  // Handler functions
  const handleCheckboxChange = (gender, category, type) => {
    const setter = gender === "male" ? setStudentData : setStudentFemaleData;
    setter((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      },
    }));
  };

  const handleAmountChange = (gender, value) => {
    setAmounts((prev) => ({ ...prev, [gender]: value }));
  };

  // Reusable components
  const CategoryHeader = ({ category }) => (
    <td
      colSpan={2}
      className="p-2 border border-gray-200 text-center font-medium text-gray-600 text-sm"
    >
      {categoryTranslations[category]}
    </td>
  );

  const NewOldLabel = ({ index }) => (
    <td className="p-1 border border-gray-200 text-center text-xs text-gray-500">
      {index % 2 === 0 ? "নতুন" : "পুরাতন"}
    </td>
  );

  const CheckboxCell = ({ gender, category, type, checked }) => (
    <td className="p-1 border border-gray-200 text-center">
      <div className="flex flex-col gap-1 justify-center items-center">
        <input
          type="text"
          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-xs"
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={() => handleCheckboxChange(gender, category, type)}
          className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      </div>
    </td>
  );

  const AmountInput = ({ gender }) => (
    <td colSpan={6} className="p-2 border border-gray-200">
      <div className="flex flex-col items-center gap-1">
        <input
          type="text"
          value={amounts[gender]}
          onChange={(e) => handleAmountChange(gender, e.target.value)}
          placeholder="টাকা লিখুন"
          className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-sm"
        />
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
      </div>
    </td>
  );

  return (
    <div className="flex justify-center py-2">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th
                colSpan={6}
                className="p-2 border border-gray-200 text-center font-semibold text-gray-700 text-sm"
              >
                ছাত্র (Male Students)
              </th>
              <th
                colSpan={6}
                className="p-2 border border-gray-200 text-center font-semibold text-gray-700 text-sm"
              >
                ছাত্রী (Female Students)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Category Row */}
            <tr>
              {Object.keys(initialStudentState).map((category) => (
                <CategoryHeader key={`male-${category}`} category={category} />
              ))}
              {Object.keys(initialStudentState).map((category) => (
                <CategoryHeader key={`female-${category}`} category={category} />
              ))}
            </tr>

            {/* New/Old Labels Row */}
            <tr>
              {[...Array(6)].map((_, i) => (
                <NewOldLabel key={`male-label-${i}`} index={i} />
              ))}
              {[...Array(6)].map((_, i) => (
                <NewOldLabel key={`female-label-${i}`} index={i} />
              ))}
            </tr>

            {/* Checkboxes Row */}
            <tr>
              {/* Male Checkboxes */}
              {Object.entries(studentData).map(([category, types]) => (
                <React.Fragment key={`male-${category}`}>
                  <CheckboxCell
                    gender="male"
                    category={category}
                    type="new"
                    checked={types.new}
                  />
                  <CheckboxCell
                    gender="male"
                    category={category}
                    type="old"
                    checked={types.old}
                  />
                </React.Fragment>
              ))}

              {/* Female Checkboxes */}
              {Object.entries(studentFemaleData).map(([category, types]) => (
                <React.Fragment key={`female-${category}`}>
                  <CheckboxCell
                    gender="female"
                    category={category}
                    type="new"
                    checked={types.new}
                  />
                  <CheckboxCell
                    gender="female"
                    category={category}
                    type="old"
                    checked={types.old}
                  />
                </React.Fragment>
              ))}
            </tr>

            {/* Amount Input Row */}
            <tr>
              <AmountInput gender="male" />
              <AmountInput gender="female" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeMatrix;