// AreaChart.js - সংশোধিত ভার্সন
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import useTranslate from '../../utils/Translate';

const AreaChart = ({ tableData }) => {
  const translate = useTranslate();

  // Ensure tableData is an array
  const results = useMemo(() => {
    if (!tableData) return [];

    // tableData সরাসরি একটি অ্যারে
    if (Array.isArray(tableData)) {
      return tableData.filter(item => item && item.ExamName); // ExamName ব্যবহার করুন
    }

    return [];
  }, [tableData]);

  // ডেটা প্রসেসিং - আপনার JSON ডেটা অনুযায়ী
  const categories = results.map((item) => item?.ExamName || 'N/A');
  const totalValues = results.map((item) => item?.Total || 0);

  // সাবজেক্ট ভিত্তিক মার্কস
  const subjectMarks = useMemo(() => {
    if (results.length === 0) return [];

    // প্রথম ৭টি সাবজেক্টের মার্কস নিন
    const subjects = [];
    for (let i = 1; i <= 7; i++) {
      const subjectName = results[0]?.[`Subject${i}`];
      const subjectMark = results[0]?.[`SubVal${i}`] || 0;

      if (subjectName) {
        subjects.push({
          name: subjectName,
          mark: subjectMark
        });
      }
    }
    return subjects;
  }, [results]);

  // Calculate statistics
  const totalMarks = totalValues.reduce((a, b) => a + b, 0);
  const highestMark = results.length > 0 ? Math.max(...totalValues) : 0;
  const averageMark = results.length > 0 ? (totalMarks / results.length).toFixed(1) : 0;
  const lowestMark = results.length > 0 ? Math.min(...totalValues) : 0;

  // গ্রাফের সিরিজ ডেটা
  const series = [
    {
      name: translate('Total Marks'),
      data: totalValues,
    },
  ];

  const options = {
    chart: {
      type: 'area',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        }
      },
      fontFamily: 'Satoshi, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val;
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ["#304758"]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#3C50E0'],
    },
    markers: {
      size: 5,
      colors: ['#FFFFFF'],
      strokeColors: '#3C50E0',
      strokeWidth: 3,
      hover: {
        size: 7,
      }
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#6B7280',
        },
        rotate: categories.length > 3 ? -45 : 0,
      },
      title: {
        // text: translate('Exams'),
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
        }
      }
    },
    yaxis: {
      title: {
        text: translate('Marks'),
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
        }
      },
      min: 0,
      max: highestMark > 0 ? Math.ceil(highestMark * 1.1) : 100,
      labels: {
        formatter: function(val) {
          return val.toFixed(0);
        }
      }
    },
    colors: ['#3C50E0'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val) {
          return val + ' ' + translate('Marks');
        }
      },
      x: {
        formatter: function(val, { seriesIndex, dataPointIndex, w }) {
          return w.globals.categoryLabels[dataPointIndex];
        }
      },
      theme: 'dark',
      style: {
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif'
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 5,
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      itemMargin: { horizontal: 20 },
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          stroke: { width: 2 },
          legend: {
            fontSize: '12px',
            position: 'bottom'
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: { fontSize: '10px' }
            }
          },
          yaxis: {
            title: {
              style: { fontSize: '12px' }
            }
          }
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            fontSize: '10px',
            position: 'bottom'
          }
        },
      },
    ],
  };

  // Empty state handling
  if (results.length === 0) {
    return (
      <div className="w-full bg-white shadow-md rounded-xl p-3 sm:p-4 md:p-5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-3 sm:mb-4">
          {translate('Student Performance Chart')}
        </h2>
        <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-center text-lg mb-2">
            {translate('No exam data available')}
          </p>
          <p className="text-gray-400 text-center text-sm">
            {translate('Results will appear here once available')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-md rounded-xl p-3 sm:p-4 md:p-5">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-3 sm:mb-4">
        {translate('Student Performance Chart')}
      </h2>

      {/* Chart */}
      <div className="w-full h-auto sm:h-[400px] md:h-[450px]">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          width="100%"
          height="100%"
        />
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">
            মোট পরীক্ষার সংখ্যা
          </p>
          <p className="text-xl font-bold text-blue-700 mt-1">
            {results.length}
          </p>
          <div className="mt-2 text-xs text-blue-500">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
              সর্বমোট
            </span>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">মোট প্রাপ্ত নম্বর</p>
          <p className="text-xl font-bold text-green-700 mt-1">{totalMarks}</p>
          <div className="mt-2 text-xs text-green-500">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              সমষ্টিগত
            </span>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">
            সর্বোচ্চ প্রাপ্ত নম্বর
          </p>
          <p className="text-xl font-bold text-purple-700 mt-1">
            {highestMark}
          </p>
          <div className="mt-2 text-xs text-purple-500">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              সেরা ফলাফল
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 font-medium">গড় নম্বর</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">
            {averageMark}
          </p>
          <div className="mt-2 text-xs text-yellow-500">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              প্রতি পরীক্ষায়
            </span>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      {results.length > 1 && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium text-gray-800">ফলাফলের প্রবণতা:</span>
            {totalValues[totalValues.length - 1] > totalValues[0]
              ? ` 📈 পরীক্ষার ফলাফলে উন্নতির ধারা লক্ষ্য করা যাচ্ছে`
              : ` 📊 পরীক্ষাগুলোতে ফলাফল প্রায় একই রকম রয়েছে`}
          </p>

          <div className="flex justify-center items-center mt-2">
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
              প্রথম পরীক্ষা: {totalValues[0]} | সর্বশেষ পরীক্ষা:{' '}
              {totalValues[totalValues.length - 1]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaChart;
