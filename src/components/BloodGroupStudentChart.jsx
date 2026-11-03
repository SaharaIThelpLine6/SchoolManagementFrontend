import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { useGetBloodGroupStudentCountQuery } from "../features/session/sessionSlice";
import useTranslate from "../utils/Translate";

const BloodGroupStudentChart = () => {
  const {
    data: bloodGroupData,
    isLoading,
    isError,
  } = useGetBloodGroupStudentCountQuery();
  const t = useTranslate();

  const { chartOptions, chartSeries, totalStudents, groupCount } = useMemo(() => {
    const rows = Array.isArray(bloodGroupData?.data) ? bloodGroupData.data : [];
    const totalStudents = bloodGroupData?.totalStudents || 0;

    // Filter out "Unknown" and empty groups for cleaner chart
    const filtered = rows.filter(
      (r) => r.BloodGroup && r.BloodGroup !== "Unknown" && r.StudentCount > 0
    );

    // Sort by StudentCount ASC so horizontal bar chart flows top -> bottom nicely
    const sorted = [...filtered].sort(
      (a, b) => a.StudentCount - b.StudentCount
    );

    // Categories = blood groups, Series = student counts
    const categories = sorted.map((r) => r.BloodGroup);
    const series = sorted.map((r) => r.StudentCount);

    // Count of unique groups shown
    const groupCount = sorted.length;

    // Color map for each blood group
    const colorMap = {
      "A+": "#ef4444",
      "A-": "#f97316",
      "B+": "#3b82f6",
      "B-": "#06b6d4",
      "O+": "#10b981",
      "O-": "#22c55e",
      "AB+": "#8b5cf6",
      "AB-": "#a855f7",
    };

    const colors = sorted.map((r) => colorMap[r.BloodGroup] || "#6366f1");

    const chartSeries = [{ name: t("Students"), data: series }];

    const chartOptions = {
      chart: {
        type: "bar",
        height: 380,
        fontFamily: "inherit",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 900,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
        dropShadow: {
          enabled: true,
          opacity: 0.12,
          blur: 6,
          left: 2,
          top: 4,
        },
      },
      colors,
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          borderRadiusApplication: "end",
          columnWidth: "55%",
          barHeight: "60%",
          distributed: true,
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val,
        offsetX: 8,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: ["#374151"],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: "12px", colors: "#6b7280" },
          formatter: (val) => Math.round(val),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: t("Number of students"),
          style: { fontSize: "12px", color: "#9ca3af", fontWeight: 500 },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "13px",
            fontWeight: 600,
            colors: "#374151",
          },
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: { left: 8, right: 20 },
      },
      legend: { show: false }, // colors already explain group
      tooltip: {
        theme: "light",
        x: { show: true },
        y: {
          formatter: (val) =>
            `${val} ${t("students")} (${((val / totalStudents) * 100).toFixed(
              1
            )}%)`,
        },
      },
    };

    return { chartOptions, chartSeries, totalStudents, groupCount };
  }, [bloodGroupData, t]);

  // Loading
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-52 rounded bg-gray-200" />
          <div className="h-80 w-full rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 ring-1 ring-red-100">
        {t("Failed to load blood group data")}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {t("Blood Group Distribution")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Number of students per blood group")}
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap gap-2">
          {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {t("Total Students")}: {totalStudents}
          </span> */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t("Groups")}: {groupCount}
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartSeries[0].data.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
          {t("No student data found")}
        </div>
      ) : (
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={380}
        />
      )}
    </div>
  );
};

export default BloodGroupStudentChart;