// components/HomeworkAreaChart.jsx
import Chart from 'react-apexcharts';

const HomeworkAreaChart = ({ subjects = [], dates = [], historyData = {} }) => {
  // =========================
  // 1️⃣ Build chart data
  // =========================
  const chartData = dates.map((date, i) => {
    let completed = 0;
    let pending = 0;

    subjects.forEach((subject) => {
      const status = historyData[subject.name]?.[i];
      if (status === 1) completed++;
      else if (status === 2) pending++;
    });

    return {
      x: `2026-${date.replace('.', '-')}`, // example: 2026-1-10
      completed,
      pending,
    };
  });

  // =========================
  // 2️⃣ Prepare series (only two series)
  // =========================
  const series = [
    {
      name: 'পড়া দিয়েছে',
      data: chartData.map((d) => d.completed),
    },
    {
      name: 'পড়া দেয়নি',
      data: chartData.map((d) => d.pending),
    },
  ];

  // =========================
  // 3️⃣ Apex chart options
  // =========================
  const options = {
    chart: {
      type: 'area',
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.6, opacityTo: 0.15 },
    },
    colors: ['#22c55e', '#ef4444'], // Green and Red only
    xaxis: {
      type: 'datetime',
      categories: chartData.map((d) => d.x),
      labels: {
        format: 'dd MMM',
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM',
          day: 'dd',
          hour: 'HH:mm'
        }
      },
    },
    yaxis: {
      min: 0,
      tickAmount: subjects.length,
      title: { text: 'মোট বিষয়' },
      labels: {
        formatter: (val) => Math.round(val)
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 0) return `${value} জন পড়া দিয়েছে`;
          if (seriesIndex === 1) return `${value} জন পড়া দেয়নি`;
          return `${value}`;
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center'
    },
    grid: { strokeDashArray: 4 },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        📊 সকল বিষয়ের হোমওয়ার্ক অগ্রগতি
      </h2>

      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default HomeworkAreaChart;
