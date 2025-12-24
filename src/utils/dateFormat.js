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
