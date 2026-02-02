export const formatToDDMMYYYY = (dateString) => {
  try {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // যদি তারিখ হয় 01/01/1955, তাহলে খালি স্ট্রিং রিটার্ন করবে
    if (day === '01' && month === '01' && year === 1955) {
      return '';
    }

    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};


export const formatDateToYMD = (date) => {
  if (!date) return ''; // no date, return empty string
  const d = new Date(date);
  if (isNaN(d.getTime())) return ''; // invalid date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Example:
// const fromDate = new Date('Thu Jan 01 2026 00:00:00 GMT+0600');
//  const formattedFromDate = formatDateToYMD(fromDate);
// console.log(formattedFromDate); // "2026-01-01"
