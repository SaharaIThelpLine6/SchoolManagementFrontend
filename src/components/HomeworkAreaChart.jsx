import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';

const colors = ['#4CAF50', '#F44336', '#FFC107']; // Green, Red, Yellow

const HomeworkAreaChart = (props) => {
  // ✅ Use default parameters with proper fallback structure
  const {
    data = {
      chartData: {
        completed: [],
        pending: [],
        classNotDone: [],
        categories: []
      }
    }
  } = props || {};

  // ✅ Safely extract chartData with fallback
  const chartData = data?.chartData || {
    completed: [],
    pending: [],
    classNotDone: [],
    categories: []
  };

  // Use safe extraction for all arrays
  const completed = Array.isArray(chartData.completed) ? chartData.completed : [];
  const pending = Array.isArray(chartData.pending) ? chartData.pending : [];
  const classNotDone = Array.isArray(chartData.classNotDone) ? chartData.classNotDone : [];
  const categories = Array.isArray(chartData.categories) ? chartData.categories : [];

  // Provide default categories if empty
  const defaultCategories = categories.length > 0
    ? categories
    : ['কোন তথ্য নেই'];

  // Ensure we have at least one data point for each series
  const series = [
    {
      name: 'পড়া দিয়েছে',
      data: completed.length > 0 ? completed : defaultCategories.map(() => 0)
    },
    {
      name: 'পড়া দেয়নি',
      data: pending.length > 0 ? pending : defaultCategories.map(() => 0)
    },
    {
      name: 'ক্লাস করেনি',
      data: classNotDone.length > 0 ? classNotDone : defaultCategories.map(() => 0)
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      stacked: false,
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    colors: colors,
    xaxis: {
      categories: defaultCategories,
      labels: {
        rotate: -45,
        style: { fontSize: '12px' },
        show: false
      },
    },
    yaxis: {
      title: { text: 'ক্লাস সংখ্যা' },
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} ক্লাস`,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: false,
      // position: 'top',
      // horizontalAlign: 'center'
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 4,
    },
    noData: {
      text: 'কোন তথ্য নেই',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#666',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
};

// ✅ Keep PropTypes for development validation
HomeworkAreaChart.propTypes = {
  data: PropTypes.shape({
    chartData: PropTypes.shape({
      completed: PropTypes.arrayOf(PropTypes.number),
      pending: PropTypes.arrayOf(PropTypes.number),
      classNotDone: PropTypes.arrayOf(PropTypes.number),
      categories: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

export default HomeworkAreaChart;
