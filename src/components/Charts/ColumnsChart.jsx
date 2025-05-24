import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const ColumnsChart = () => {
  const colors = [
    "#3C50E0",
    "#6577F3",
    "#00C49F",
    "#FFBB28",
    "#FF6384",
    "#A28BD4",
    "#00B8D9",
    "#FF6B6B",
  ];

  const [state, setState] = useState({
    series: [
      {
        name: "ভর্তি সংখ্যা", // Admission Count
        data: [120, 135, 150, 145, 160, 175, 190, 205],
      },
    ],
    options: {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: "বিগত ৮ বছরের শিক্ষার্থী ভর্তি চাট",
        align: "center",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          fontFamily: "inherit",
        },
      },
      colors: colors,
      plotOptions: {
        bar: {
          columnWidth: "50%",
          distributed: true,
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories: [
          "২০১৭",
          "২০১৮",
          "২০১৯",
          "২০২০",
          "২০২১",
          "২০২২",
          "২০২৩",
          "২০২৪",
        ],
        labels: {
          style: {
            colors: colors,
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: "শিক্ষার্থী সংখ্যা",
          style: {
            fontSize: "14px",
            fontWeight: 600,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} জন`,
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
            plotOptions: {
              bar: {
                columnWidth: "60%",
              },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 280,
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: "10px",
                },
              },
            },
          },
        },
      ],
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 bg-white p-4 md:p-6 rounded-md shadow">
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ColumnsChart;
