// utils/calculateAge.js
export const calculateAge = (dateOfBirth, currentDate = new Date()) => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const current = new Date(currentDate);

  let years = current.getFullYear() - birthDate.getFullYear();
  let months = current.getMonth() - birthDate.getMonth();
  let days = current.getDate() - birthDate.getDate();

  // দিন ঋণাত্মক হলে আগের মাস থেকে ধার
  if (days < 0) {
    months--;
    const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // মাস ঋণাত্মক হলে আগের বছর থেকে ধার
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};
