import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const PieChart = () => {
  const [state] = useState({
    series: [30, 20, 25, 15, 10], // Adjusted to match approximate percentages from image
    options: {
      chart: {
        fontFamily: "Satoshi, sans-serif",
        type: "pie",
      },
      colors: ["#FF6384", "#3C50E0", "#FFBB28", "#00C49F", "#6577F3"],
      labels: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val}%`,
        style: {
          fontSize: "12px",
          fontFamily: "Satoshi, sans-serif",
        },
      },
    },
  });

  return (
    <div className="w-full  h-[400px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        Class Distribution
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="pie"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default PieChart;
