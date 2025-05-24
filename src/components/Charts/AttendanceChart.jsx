import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const AttendanceChart = () => {
  const [state] = useState({
    series: [70, 30], // Present vs Absent
    options: {
      chart: {
        type: "donut",
      },
      labels: ["উপস্থিত", "অনুপস্থিত"],
      colors: ["#3C50E0", "#FF6B6B"],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val}%`,
        style: {
          fontSize: "12px",
          fontFamily: "Satoshi, sans-serif",
        },
      },
      legend: {
        position: "bottom",
        offsetY: 0,
        height: 50,
        markers: {
          radius: 12,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 350,
            },
            legend: {
              position: "bottom",
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: "bottom",
              fontSize: "10px",
            },
          },
        },
      ],
    },
  });

  return (
    <div className="w-full h-[400px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        উপস্থিতি ও অনুপস্থিতি
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="donut"
        />
      </div>
    </div>
  );
};

export default AttendanceChart;
