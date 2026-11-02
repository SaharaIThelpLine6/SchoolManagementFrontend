import React, { useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useGetStudentNumberByClassQuery } from "../../features/dashboard/dashboardQuerySlice";
import PieChartSkeleton from "../Skeleton/PieChartSkeleton";
import bnBijoy2Unicode from "../../utils/conveter";
import useTranslate from "../../utils/Translate";

const COLORS = [
  "#FF6384",
  "#3C50E0",
  "#FFBB28",
  "#00C49F",
  "#6577F3",
  "#A28BD4",
  "#FF6B6B",
  "#10B981",
  "#F97316",
  "#06B6D4",
  "#8B5CF6",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
];

const PieChart = () => {
  const translate = useTranslate();
  const {
    data: student_count,
    isLoading,
    isError,
  } = useGetStudentNumberByClassQuery();

  // drilldown: কোন ক্লাস সিলেক্ট করা হয়েছে (index)
  const [selectedIndex, setSelectedIndex] = useState(null);

  const { labels, series, total } = useMemo(() => {
    const data = student_count || [];
    return {
      labels: data.map((item) => bnBijoy2Unicode(item.className)),
      series: data.map((item) => Number(item.student) || 0),
      total: data.reduce((sum, item) => sum + (Number(item.student) || 0), 0),
    };
  }, [student_count]);

  if (isLoading) return <PieChartSkeleton />;
  if (isError) return <p>ডেটা আনতে সমস্যা হয়েছে!</p>;

  const selected =
    selectedIndex !== null && student_count?.[selectedIndex]
      ? {
        name: labels[selectedIndex],
        count: series[selectedIndex],
        percent: total ? ((series[selectedIndex] / total) * 100).toFixed(1) : 0,
        color: COLORS[selectedIndex % COLORS.length],
      }
      : null;

  const options = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const idx = config.dataPointIndex;
          // একই স্লাইসে আবার ক্লিক করলে drilldown বন্ধ
          setSelectedIndex((prev) => (prev === idx ? null : idx));
        },
      },
    },
    colors: COLORS,
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
      fontFamily: "SolaimanLipi, sans-serif",
      markers: { width: 10, height: 10, radius: 10 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    stroke: { width: 2, colors: ["#fff"] },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "SolaimanLipi, sans-serif",
              offsetY: -6,
            },
            value: {
              show: true,
              fontSize: "26px",
              fontWeight: 700,
              offsetY: 4,
              formatter: (val) => val,
            },
            total: {
              show: true,
              showAlways: true,
              label: translate("Total Students") || "মোট শিক্ষার্থী",
              fontSize: "14px",
              fontFamily: "SolaimanLipi, sans-serif",
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "11px",
        fontFamily: "Satoshi, sans-serif",
      },
      dropShadow: { enabled: false },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} জন`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div className="w-full min-h-[450px] 2xl:min-h-[580px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col font-SolaimanLipi">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {translate("Class-based student distribution")}
      </h2>

      <div className="flex-1 flex items-center justify-center mt-2">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          width="100%"
          height={380}
        />
      </div>

      {/* Drilldown detail card */}
      {selected ? (
        <div
          className="mt-4 p-4 rounded-lg border flex items-center justify-between"
          style={{ borderColor: selected.color, backgroundColor: `${selected.color}15` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
            <div>
              <p className="text-lg font-bold text-gray-800">{selected.name}</p>
              <p className="text-sm text-gray-600">
                মোট শিক্ষার্থী: <b>{selected.count}</b> জন ({selected.percent}%)
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedIndex(null)}
            className="px-3 py-1 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700"
          >
            ← ফিরে যান
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-gray-500">
          বিস্তারিত দেখতে চার্টের কোনো অংশে ক্লিক করুন
        </p>
      )}
    </div>
  );
};

export default PieChart;