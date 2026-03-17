export const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;

  const now = Date.now();
  const target = new Date(targetDate).getTime();

  if (isNaN(target)) return null;

  const difference = target - now;

  if (difference <= 0) return null;

  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / (60 * 60 * 24)),
    hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
  };
};