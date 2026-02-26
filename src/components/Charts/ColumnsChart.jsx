import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useGetStudentBySessionQuery } from "../../features/dashboard/dashboardQuerySlice";
import bnBijoy2Unicode from "../../utils/conveter";
import BarChartSkeleton from "../Skeleton/BarChartSkeleton";
import useTranslate from "../../utils/Translate";
const ColumnsChart = () => {
  const translate = useTranslate();
  const {
    data: studentCount,
    isLoading,
    isError,
  } = useGetStudentBySessionQuery();

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

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "ভর্তি সংখ্যা",
        data: [],
      },
    ],
    options: {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      // title: {
      //   text: translate(
      //     "Number of students according to the previous academic year"
      //   ),
      //   align: "center",
      //   style: {
      //     fontSize: "18px",
      //     fontWeight: "bold",
      //     fontFamily: "inherit",
      //   },
      // },
      colors: colors,

      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: "30px", // বা percentage: "50%" ইত্যাদি

          distributed: true,
          dataLabels: {
            position: "top", // show label above the bar
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return `${val} জন`;
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories: [],
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
                columnWidth: "30px",
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

  // Update chart when data is loaded
  useEffect(() => {
    if (studentCount && Array.isArray(studentCount)) {
      const categories = studentCount.map((item) =>
        bnBijoy2Unicode(item.sessionName)
      );
      const values = studentCount.map((item) => item.student_count);

      setChartData((prev) => ({
        ...prev,
        series: [{ name: "ভর্তি সংখ্যা", data: values }],
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories,
          },
        },
      }));
    }
  }, [studentCount]);

  if (isLoading) return <BarChartSkeleton />;
  if (isError) return <p>ডেটা আনতে সমস্যা হয়েছে।</p>;

  return (
    <div className="w-full h-[450px]  mx-auto mt-6 bg-white p-4 md:p-6 rounded-md shadow">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {translate(
          "Number of students according to the previous academic year"
        )}
      </h2>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ColumnsChart;
