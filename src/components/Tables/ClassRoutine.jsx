import React from "react";

const ClassRoutine = () => {
  const routineItems = [
    { name: "তাকমিল (দাওরায়ে হাদিস)", count: "০০০" },
    { name: "স্মৃতিকথা", count: "৩০" },
    { name: "মানসীবিন", count: "০৬" },
    { name: "সেমিনার", count: "০১" },
    { name: "বিশ্বকোষ", count: "২০০" },
  ];

  return (
    <div className="w-full h-[400px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col font-sans">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        ক্লাস ভিত্তিক শিক্ষার্থীর সংখ্যা
      </h2>
      <ul className="space-y-3 flex-1 overflow-y-auto">
        {routineItems.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-200"
          >
            <span className="text-gray-700 text-base">{item.name}</span>
            <span className="flex items-center justify-center w-8 h-8   font-semibold rounded-full text-sm">
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassRoutine;
