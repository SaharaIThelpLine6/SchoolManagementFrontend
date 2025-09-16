import React, { useState, useEffect } from "react";
import useTranslate from "../../utils/Translate";

const FeeMatrix = ({
  data,
  studentData,
  setStudentData,
  studentFemaleData,
  setStudentFemaleData,
  amounts,
  setAmounts,
  initialStudentState,
}) => {
  const translate = useTranslate();

  useEffect(() => {
    data({
      MaleAbaNew: studentData.residential.newAmount,
      MaleAbaOld: studentData.residential.oldAmount,
      MaleOnaOld: studentData.nonResidential.oldAmount,
      MaleOnaNew: studentData.nonResidential.newAmount,
      MaleDayNew: studentData.dayCare.newAmount,
      MaleDayOld: studentData.dayCare.oldAmount,

      FemaleAbaNew: studentFemaleData.residential.newAmount,
      FemaleAbaOld: studentFemaleData.residential.oldAmount,
      FemaleOnaNew: studentFemaleData.nonResidential.newAmount,
      FemaleOnaOld: studentFemaleData.nonResidential.oldAmount,
      FemaleDayNew: studentFemaleData.dayCare.newAmount,
      FemaleDayOld: studentFemaleData.dayCare.oldAmount,
    });
  }, [studentData, studentFemaleData, data]);

  const categoryTranslations = {
    residential: translate("Residence"),
    nonResidential: translate("Non-resident"),
    dayCare: translate("Daycare"),
  };

  // Handlers
  const handleCheckboxChange = (gender, category, type) => {
    const setter = gender === "male" ? setStudentData : setStudentFemaleData;
    setter((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
        // Clear amount if unchecked
        [`${type}Amount`]: !prev[category][type]
          ? prev[category][`${type}Amount`]
          : "",
      },
    }));
  };

  const handleAmountChange = (gender, value) => {
    setAmounts((prev) => ({ ...prev, [gender]: value }));

    const setter = gender === "male" ? setStudentData : setStudentFemaleData;
    setter((prev) => {
      const newState = {};
      for (const category in prev) {
        newState[category] = { ...prev[category] };
        if (prev[category].new) newState[category].newAmount = value;
        if (prev[category].old) newState[category].oldAmount = value;
      }
      return newState;
    });
  };

  const handleCategoryAmountChange = (gender, category, type, value) => {
    const setter = gender === "male" ? setStudentData : setStudentFemaleData;
    setter((prev) => ({
      ...prev,
      [category]: { ...prev[category], [`${type}Amount`]: value },
    }));
  };

  const handleCheckAll = (gender) => {
    const setter = gender === "male" ? setStudentData : setStudentFemaleData;
    const currentState = gender === "male" ? studentData : studentFemaleData;

    const allChecked = Object.values(currentState).every(
      (cat) => cat.new && cat.old
    );

    if (allChecked) {
      setter(initialStudentState);
      setAmounts((prev) => ({ ...prev, [gender]: "" }));
    } else {
      const newState = {};
      Object.keys(initialStudentState).forEach((category) => {
        newState[category] = {
          ...initialStudentState[category],
          new: true,
          old: true,
          newAmount: amounts[gender] || "",
          oldAmount: amounts[gender] || "",
        };
      });
      setter(newState);
    }
  };

  // Componentsz
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
      {index % 2 === 0 ? translate("New") : translate("Old")}
    </td>
  );

  const CheckboxCell = ({
    gender,
    category,
    type,
    checked,
    amount,
    onAmountChange,
  }) => {
    const [localAmount, setLocalAmount] = useState(amount || "");

    useEffect(() => {
      setLocalAmount(amount || "");
    }, [amount]);

    const handleBlur = () => {
      onAmountChange(gender, category, type, localAmount);
    };

    return (
      <td className="p-1 border border-gray-200 text-center">
        <div className="flex flex-col gap-1 justify-center items-center">
          <input
            type="text"
            value={localAmount}
            onChange={(e) => setLocalAmount(e.target.value)}
            onBlur={handleBlur}
            className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-xs"
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
  };

  const AmountInput = ({ gender }) => {
    const currentState = gender === "male" ? studentData : studentFemaleData;
    const allChecked = Object.values(currentState).every(
      (cat) => cat.new && cat.old
    );

    const [localAmount, setLocalAmount] = useState(amounts[gender] || "");

    useEffect(() => {
      setLocalAmount(amounts[gender] || "");
    }, [amounts[gender]]);

    const handleBlur = () => {
      handleAmountChange(gender, localAmount);
    };

    return (
      <td colSpan={6} className="p-2 border border-gray-200">
        <div className="flex flex-col items-center gap-1">
          <input
            type="text"
            value={localAmount}
            onChange={(e) => setLocalAmount(e.target.value)}
            onBlur={handleBlur}
            placeholder={translate("Enter TK")}
            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-center text-sm"
          />
          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={() => handleCheckAll(gender)}
              className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">
              {translate("Check All")}
            </span>
          </div>
        </div>
      </td>
    );
  };

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
                {translate("Male Student")}
              </th>
              <th
                colSpan={6}
                className="p-2 border border-gray-200 text-center font-semibold text-gray-700 text-sm"
              >
                {translate("Female Student")}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Category Headers */}
            <tr>
              {Object.keys(initialStudentState).map((cat) => (
                <CategoryHeader key={`male-${cat}`} category={cat} />
              ))}
              {Object.keys(initialStudentState).map((cat) => (
                <CategoryHeader key={`female-${cat}`} category={cat} />
              ))}
            </tr>

            {/* New/Old Labels */}
            <tr>
              {[...Array(6)].map((_, i) => (
                <NewOldLabel key={`male-label-${i}`} index={i} />
              ))}
              {[...Array(6)].map((_, i) => (
                <NewOldLabel key={`female-label-${i}`} index={i} />
              ))}
            </tr>

            {/* Checkbox + Amount Row */}
            <tr>
              {Object.entries(studentData).map(([category, types]) => (
                <React.Fragment key={`male-${category}`}>
                  <CheckboxCell
                    gender="male"
                    category={category}
                    type="new"
                    checked={types.new}
                    amount={types.newAmount}
                    onAmountChange={handleCategoryAmountChange}
                  />
                  <CheckboxCell
                    gender="male"
                    category={category}
                    type="old"
                    checked={types.old}
                    amount={types.oldAmount}
                    onAmountChange={handleCategoryAmountChange}
                  />
                </React.Fragment>
              ))}

              {Object.entries(studentFemaleData).map(([category, types]) => (
                <React.Fragment key={`female-${category}`}>
                  <CheckboxCell
                    gender="female"
                    category={category}
                    type="new"
                    checked={types.new}
                    amount={types.newAmount}
                    onAmountChange={handleCategoryAmountChange}
                  />
                  <CheckboxCell
                    gender="female"
                    category={category}
                    type="old"
                    checked={types.old}
                    amount={types.oldAmount}
                    onAmountChange={handleCategoryAmountChange}
                  />
                </React.Fragment>
              ))}
            </tr>

            {/* Main Amount Input Row */}
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
