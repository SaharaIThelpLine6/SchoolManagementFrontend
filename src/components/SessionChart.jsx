import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import useTranslate from "../utils/Translate";

const SessionChart = () => {
  const { data, isLoading, isError } = useGetSessionsQuery();
  const t = useTranslate();

  // Build series from the data dynamically
  const { chartOptions, chartSeries, totals } = useMemo(() => {
    const sessions = Array.isArray(data) ? data : [];

    // Sort by CreateAt ascending so the timeline flows left -> right
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.CreateAt) - new Date(b.CreateAt)
    );

    // Categories = session names (fallback to SessionID)
    const categories = sorted.map(
      (s) => s.SessionName || s.SessionEngName || `Session ${s.SessionID}`
    );

    // Series 1: Active sessions (SessionStatus === 1)
    const activeSeries = sorted.map((s) => (s.SessionStatus === 1 ? 1 : 0));

    // Series 2: Cumulative created sessions
    let running = 0;
    const createdSeries = sorted.map(() => ++running);

    // Totals
    const totalSessions = sorted.length;
    const activeCount = sorted.filter((s) => s.SessionStatus === 1).length;
    const inactiveCount = totalSessions - activeCount;

    const chartSeries = [
      { name: t("Created Sessions"), data: createdSeries },
      { name: t("Active Sessions"), data: activeSeries },
    ];

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
      colors: ["#6366f1", "#10b981"], // indigo & emerald
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
        size: 0,
        hover: { size: 6 },
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
        y: { formatter: (val) => `${val}` },
      },
    };

    return {
      chartOptions,
      chartSeries,
      totals: { totalSessions, activeCount, inactiveCount },
    };
  }, [data, t]);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-72 w-full rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError) {
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
            {t("Session Overview")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Distribution of sessions over time")}
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {t("Total")}: {totals.totalSessions}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t("Active")}: {totals.activeCount}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {t("Inactive")}: {totals.inactiveCount}
          </span>
        </div>
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