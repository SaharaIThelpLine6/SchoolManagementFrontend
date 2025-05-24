import React from "react";
import ReactApexChart from "react-apexcharts";
import { useGetStudentNumberByClassQuery } from "../../features/dashboard/dashboardQuerySlice";
import PieChartSkeleton from "../Skeleton/PieChartSkeleton";

const PieChart = () => {
  const {
    data: student_count,
    isLoading,
    isError,
  } = useGetStudentNumberByClassQuery();

  // যদি লোডিং হয়
  if (isLoading) return <PieChartSkeleton />;
  if (isError) return <p>ডেটা আনতে সমস্যা হয়েছে!</p>;

  // labels and series তৈরি করা
  const labels = student_count?.map((item) => item.className) || [];
  const series = student_count?.map((item) => item.student) || [];

  const options = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "pie",
    },
    colors: [
      "#FF6384",
      "#3C50E0",
      "#FFBB28",
      "#00C49F",
      "#6577F3",
      "#A28BD4",
      "#FF6B6B",
    ],
    labels: labels,
    legend: false,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontFamily: "Satoshi, sans-serif",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="w-full h-[400px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        শ্রেণি ভিত্তিক শিক্ষার্থী বন্টন
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <ReactApexChart
          options={options}
          series={series}
          type="pie"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default PieChart;
