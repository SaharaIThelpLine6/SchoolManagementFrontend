import React, { useState } from "react";

const FeeMatrix = () => {
  const [studentData, setStudentData] = useState({
    residential: { new: false, old: false },
    nonResidential: { new: false, old: false },
    dayCare: { new: false, old: false },
  });

  const [studentFemaleData, setStudentFemaleData] = useState({
    residential: { new: false, old: false },
    nonResidential: { new: false, old: false },
    dayCare: { new: false, old: false },
  });

  const [amounts, setAmounts] = useState({
    male: "",
    female: "",
  });

  const handleCheckboxChange = (gender, category, type) => {
    if (gender === "male") {
      setStudentData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [type]: !prev[category][type],
        },
      }));
    } else {
      setStudentFemaleData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [type]: !prev[category][type],
        },
      }));
    }
  };

  const handleAmountChange = (gender, value) => {
    setAmounts((prev) => ({
      ...prev,
      [gender]: value,
    }));
  };

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full border-collapse shadow-lg bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th
                colSpan={6}
                className="p-4 border border-gray-200 text-center font-semibold text-gray-700"
              >
                ছাত্র (Male Students)
              </th>
              <th
                colSpan={6}
                className="p-4 border border-gray-200 text-center font-semibold text-gray-700"
              >
                ছাত্রী (Female Students)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Category Row */}
            <tr>
              {["residential", "nonResidential", "dayCare"].map((category) => (
                <React.Fragment key={`male-${category}`}>
                  <td
                    colSpan={2}
                    className="p-3 border border-gray-200 text-center font-medium text-gray-600"
                  >
                    {category === "residential"
                      ? "আবাসিক"
                      : category === "nonResidential"
                      ? "অনাবাসিক"
                      : "ডে-কেয়ার"}
                  </td>
                </React.Fragment>
              ))}
              {["residential", "nonResidential", "dayCare"].map((category) => (
                <React.Fragment key={`female-${category}`}>
                  <td
                    colSpan={2}
                    className="p-3 border border-gray-200 text-center font-medium text-gray-600"
                  >
                    {category === "residential"
                      ? "আবাসিক"
                      : category === "nonResidential"
                      ? "অনাবাসিক"
                      : "ডে-কেয়ার"}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            {/* New/Old Labels Row */}
            <tr>
              {[...Array(6)].map((_, i) => (
                <td
                  key={`male-label-${i}`}
                  className="p-3 border border-gray-200 text-center text-sm text-gray-500"
                >
                  {i % 2 === 0 ? "নতুন" : "পুরাতন"}
                </td>
              ))}
              {[...Array(6)].map((_, i) => (
                <td
                  key={`female-label-${i}`}
                  className="p-3 border border-gray-200 text-center text-sm text-gray-500"
                >
                  {i % 2 === 0 ? "নতুন" : "পুরাতন"}
                </td>
              ))}
            </tr>

            {/* Checkboxes Row */}
            <tr>
              {/* Male Checkboxes */}
              {Object.entries(studentData).map(([category, types]) => (
                <React.Fragment key={`male-check-${category}`}>
                  <td className="p-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={types.new}
                      onChange={() =>
                        handleCheckboxChange("male", category, "new")
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={types.old}
                      onChange={() =>
                        handleCheckboxChange("male", category, "old")
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                </React.Fragment>
              ))}

              {/* Female Checkboxes */}
              {Object.entries(studentFemaleData).map(([category, types]) => (
                <React.Fragment key={`female-check-${category}`}>
                  <td className="p-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={types.new}
                      onChange={() =>
                        handleCheckboxChange("female", category, "new")
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={types.old}
                      onChange={() =>
                        handleCheckboxChange("female", category, "old")
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                </React.Fragment>
              ))}
            </tr>

            {/* Amount Input Row */}
            <tr>
              <td colSpan={6} className="p-4 border border-gray-200">
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="text"
                    value={amounts.male}
                    onChange={(e) => handleAmountChange("male", e.target.value)}
                    placeholder="টাকা লিখুন"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">সক্রিয় করুন</span>
                  </div>
                </div>
              </td>
              <td colSpan={6} className="p-4 border border-gray-200">
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="text"
                    value={amounts.female}
                    onChange={(e) =>
                      handleAmountChange("female", e.target.value)
                    }
                    placeholder="টাকা লিখুন"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeMatrix;
