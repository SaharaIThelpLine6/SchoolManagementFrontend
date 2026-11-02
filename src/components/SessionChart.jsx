import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { useGetSessionsWithStudentQuery } from "../features/session/sessionSlice";
import useTranslate from "../utils/Translate";

const SessionChart = () => {
  const t = useTranslate();
  const {
    data: sessionsWithStudent,
    isLoading: isSessionsWithStudentLoading,
    isError: isSessionsWithStudentError,
  } = useGetSessionsWithStudentQuery();

  console.log("Sessions with Student Data:", sessionsWithStudent);

  const { chartOptions, chartSeries, totalStudents } = useMemo(() => {
    const sessions = Array.isArray(sessionsWithStudent?.sessions)
      ? sessionsWithStudent.sessions
      : [];

    // Sort by Serial ascending so the timeline flows left -> right
    const sorted = [...sessions].sort((a, b) => (a.Serial ?? 0) - (b.Serial ?? 0));

    // Categories = session names
    const categories = sorted.map(
      (s) => s.SessionName || s.SessionEngName || `Session ${s.SessionID}`
    );

    // Series = student count per session
    const studentSeries = sorted.map((s) => Number(s.studentCount) || 0);

    const totalStudents = studentSeries.reduce((sum, n) => sum + n, 0);

    const chartSeries = [{ name: t("Students"), data: studentSeries }];

    const chartOptions = {
      chart: {
        type: "area",
        height: 350,
        fontFamily: "inherit",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
        dropShadow: {
          enabled: true,
          opacity: 0.15,
          blur: 4,
          left: 1,
          top: 4,
        },
      },
      colors: ["#6366f1"], // indigo
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2.5,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      markers: {
        size: 4,
        hover: { size: 7 },
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: "12px", colors: "#6b7280" },
          rotate: -25,
          trim: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", colors: "#6b7280" },
          formatter: (val) => Math.round(val),
        },
        min: 0,
        forceNiceScale: true,
        title: { text: t("Students"), style: { color: "#6b7280" } },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "13px",
        markers: { radius: 6, width: 10, height: 10 },
        itemMargin: { horizontal: 12 },
        labels: { colors: "#374151" },
      },
      tooltip: {
        theme: "light",
        x: { show: true },
        y: {
          formatter: (val) => `${val} ${t("Students")}`,
        },
      },
    };

    return { chartOptions, chartSeries, totalStudents };
  }, [sessionsWithStudent, t]);

  if (isSessionsWithStudentLoading) {
    return (
      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-72 w-full rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isSessionsWithStudentError) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 ring-1 ring-red-100">
        {t("Failed to load sessions. Please try again.")}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {t("Session Students Overview")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Number of students admitted per session")}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          {t("Total Students")}: {totalStudents}
        </span>
      </div>

      {/* Chart */}
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={350}
      />
    </div>
  );
};

export default SessionChart;