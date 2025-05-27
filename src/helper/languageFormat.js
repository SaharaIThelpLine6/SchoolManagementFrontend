export const enToBnNumber = (number) => {
  if (!number && number !== 0) return " "; // Handle null/undefined
  const en = "0123456789";
  const bn = "০১২৩৪৫৬৭৮৯";
  return number.toString().split('').map(d => bn[en.indexOf(d)] || d).join('');
};

// Format date to Bangla
export const formatDateToBangla = (dateStr) => {
  if (!dateStr) return " ";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return " "; // Handle invalid date
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    const formatted = new Intl.DateTimeFormat('bn-BD', options).format(date);
    return formatted;
  } catch (error) {
    console.error("Locale error:", error);
    return " ";
  }
};

export const getVacationDaysCount = (fromDate, toDate) => {
  if (!fromDate || !toDate) return 0;
  const from = new Date(fromDate);
  const to = new Date(toDate);

  // একদিন যোগ করা হচ্ছে কারণ শুরু ও শেষ দিন উভয়ই ইনক্লুড
  const diffTime = to - from;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const formatTimeToBangla = (dateStr) => {
  if (!dateStr) return " ";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return " ";

  let hours = date.getHours();
  let minutes = date.getMinutes();
  const period = hours >= 12 ? "সকাল" : "বিকাল";

  hours = hours % 12 || 12; // 0 → 12
  const formattedHours = enToBnNumber(hours.toString().padStart(2, '0'));
  const formattedMinutes = enToBnNumber(minutes.toString().padStart(2, '0'));

  return `${formattedHours}:${formattedMinutes} ${period}`;
};
