import React, { useState, useEffect } from "react";

import Print1 from "/printview/print1.png";
import Print2 from "/printview/print2.png";
import Print3 from "/printview/print3.png";
import Print4 from "/printview/print4.png";

import PrintTwo from "./print/PrintTwo";
import { hideModal } from "../../../utils/ModalControlar";

const PrintOptions = () => {
  const [selectedOption, setSelectedOption] = useState(1);
  const [previewImage, setPreviewImage] = useState(Print1);
  const [printComponent, setPrintComponent] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false); // controls when to trigger print

  const handleOptionChange = (optionNumber) => {
    setSelectedOption(optionNumber);
    switch (optionNumber) {
      case 1:
        setPreviewImage(Print1);
        break;
      case 2:
        setPreviewImage(Print2);
        break;
      case 3:
        setPreviewImage(Print3);
        break;
      case 4:
        setPreviewImage(Print4);
        break;
      default:
        setPreviewImage(Print1);
    }
  };

  const handlePrint = () => {
    // Select component based on option
    switch (selectedOption) {
      case 2:
        setPrintComponent(<PrintTwo />);
        break;
      default:
        setPrintComponent(<PrintTwo />);
    }

    setShouldPrint(true); // trigger effect
  };

  // After printComponent is set, wait a moment then print
  useEffect(() => {
    if (shouldPrint && printComponent) {
      const timeout = setTimeout(() => {
        hideModal(); // ✅ hide modal before print
        window.print();
        setShouldPrint(false);
      }, 200); // Allow time for printComponent to render

      return () => clearTimeout(timeout);
    }
  }, [printComponent, shouldPrint]);

  return (
    <>
      {/* Normal UI */}
      <div className="max-w-3xl mx-auto font-SolaimanLipi print:hidden">
        <div className="flex items-center flex-col sm:flex-row gap-5 sm:gap-0 justify-between space-x-4">
          {/* Left - Radio Buttons */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((num) => (
              <label
                key={num}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="paperOption"
                  className="accent-black"
                  checked={selectedOption === num}
                  onChange={() => handleOptionChange(num)}
                />
                <span className="text-gray-800 font-medium">
                  {num === 1 && "A4 বাংলা রঙিন Landscape"}
                  {num === 2 && "A4 বাংলা প্রেসে ছাপানো কাগজে portrait"}
                  {num === 3 && "A4 বাংলা প্রেসে ছাপানো Landscape"}
                  {num === 4 && "ছাউড়ত্র"}
                </span>
              </label>
            ))}
          </div>

          {/* Right - Image Preview */}
          <div className="pt-2">
            <img
              src={previewImage}
              alt={`Print ${selectedOption} preview`}
              className="w-64 h-40"
            />
          </div>
        </div>

        {/* Preview Button */}
        <div className="mt-6 text-center">
          <button
            className="bg-lime-400 hover:bg-lime-500 text-white font-semibold py-2 px-6 rounded transition"
            onClick={handlePrint}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Only show this in print mode */}
      <div className="hidden print:block">{printComponent}</div>
    </>
  );
};

export default PrintOptions;
