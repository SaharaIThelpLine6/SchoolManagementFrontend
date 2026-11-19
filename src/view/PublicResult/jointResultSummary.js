// Joint result hole মোট = target exam er Total + shob joint (source) exam er Total.
// গড় = ei combined মোট / target exam er AverageSubsonkha.
// Joint na thakle shudhu ei exam er Total / AverageSubsonkha.
export const getResultSummary = (studentResult) => {
  const ownTotal = Number(studentResult?.Total || 0);
  const jointExams = studentResult?.jointSourceExams ?? [];
  const userId = String(studentResult?.UserID);

  const combinedTotal = jointExams.reduce(
    (sum, exam) => sum + Number(exam?.TotalByUserID?.[userId] || 0),
    ownTotal
  );

  const averageSubjectCount =
    Number(studentResult?.averageCondition?.AverageSubsonkha) ||
    Number(studentResult?.averageCondition?.SubSonkha) ||
    0;

  const average = averageSubjectCount > 0 ? combinedTotal / averageSubjectCount : 0;

  return {
    isJoint: jointExams.length > 0,
    total: combinedTotal,
    average: average.toFixed(2),
  };
};
