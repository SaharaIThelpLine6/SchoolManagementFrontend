export const buildSingleChartData = (subjects, dates, historyData) => {
  return dates.map((date, index) => {
    let completed = 0;
    let pending = 0;
    let notHeld = 0;

    subjects.forEach((s) => {
      const status = historyData[s.name]?.[index];

      if (status === 1) completed++;
      else if (status === 2) pending++;
      else if (status === 3) notHeld++;
    });

    return {
      date: `2026-${date.replace('.', '-')}`,
      completed,
      pending,
      notHeld,
    };
  });
};
