export const convertToTimeLocal = (value) => {
  if (!value) return null;

  const isoString = Array.isArray(value) ? value[0] : value;
  const date = new Date(isoString);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 0 should be 12 in 12-hour format
  const hoursStr = hours.toString().padStart(2, '0');

  return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
};
