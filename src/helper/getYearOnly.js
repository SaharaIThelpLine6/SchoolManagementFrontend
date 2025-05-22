const getYearOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date) ? "" : date.getFullYear();
};

export default getYearOnly;
