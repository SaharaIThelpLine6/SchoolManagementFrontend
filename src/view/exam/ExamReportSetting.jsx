import React from "react";
import SortableTable from "../../components/Tables/SortableTable";

const ExamReportSetting = () => {

  return (
    <div className="w-full max-w-auto bg-blue-50 shadow-lg rounded-lg border border-blue-200">
      <div className="bg-blue-600 max-w-auto text-white text-center py-3 rounded-t-lg text-xl font-semibold">
        Admit Card Setting
      </div>
      <div className="p-6 space-y-5">
        {/* Reusable Row Component */}
        {[
          { label: "Photos", name: "photos", options: ["Unhide", "Hide"] },
          {
            label: "Seat No",
            name: "seatNo",
            options: ["Code", "Ad Serial", "None"],
          },
          {
            label: "Signature Name",
            name: "signatureName",
            options: ["Unhide", "Hide"],
          },
          {
            label: "Signature",
            name: "signature",
            options: ["Unhide", "Hide"],
          },
          {
            label: "Signature Date",
            name: "signatureDate",
            options: ["Unhide", "Hide"],
          },
        ].map((row, index) => (
          <div key={index} className="flex items-center gap-4">
            <label className="w-1/3 text-right font-medium text-gray-700">
              {row.label} :
            </label>
            <div className="flex gap-4 bg-white p-3 flex-wrap justify-start rounded-md shadow-sm w-2/3">
              {row.options.map((option, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-gray-800"
                >
                  <input
                    type="radio"
                    name={row.name}
                    defaultChecked={i === 0}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamReportSetting;
