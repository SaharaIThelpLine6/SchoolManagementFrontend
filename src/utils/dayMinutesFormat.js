// 🔹 English number → Bangla number converter
export const formatNumberToBangla = (num) => {
  if (num === null || num === undefined) return '';
  const banglaDigits = {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  };
  return num.toString().replace(/[0-9]/g, (d) => banglaDigits[d]);
};

// 🔹 দিন ও মিনিট বের করার ফাংশন
export const getVacationDuration = (fromDate, toDate, fromTime, toTime) => {
  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  const startTime = new Date(fromTime);
  const endTime = new Date(toTime);

  // দিন পার্থক্য
  const dayDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  // মিনিট পার্থক্য
  const minuteDiff = Math.floor((endTime - startTime) / (1000 * 60));

  return {
    days: dayDiff,
    minutes: minuteDiff,
  };
};

