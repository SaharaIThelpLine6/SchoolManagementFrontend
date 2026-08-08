export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const enToBn = (str) => str.replace(/\d/g, (d) => banglaDigits[d]);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `তারিখ: ${enToBn(`${dd}/${mm}/${yyyy}`)}`;
};




export const attendanceFormatTime = (value) => {
  if (!value) return '';

  let date;

  // যদি HH:mm বা HH:mm:ss format হয়
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    date = new Date(`1970-01-01T${value}`);
  } else {
    // ISO Date
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC', // ISO string এর জন্য UTC ধরে
  });
};

export const attendanceFormatTimeTest = (value, withAmPm = true) => {
  if (!value) return '';

  let hours;
  let minutes;

  // HH:mm বা HH:mm:ss
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    [hours, minutes] = value.split(':');
  } else {
    // ISO Date
    const match = value.match(/T(\d{2}):(\d{2})/);

    if (!match) return '';

    hours = match[1];
    minutes = match[2];
  }

  hours = Number(hours);

  if (!withAmPm) {
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};