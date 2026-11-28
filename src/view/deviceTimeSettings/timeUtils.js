
export const toHHMM = (value) => {
  if (!value) return '';
  const text = String(value);
  const match = text.match(/T(\d{2}):(\d{2})/) || text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

// "06:30" → মিনিট (390)
export const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

// "06:30" → "6:30 AM"
export const toDisplay = (hhmm) => {
  if (!hhmm) return '--:--';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (value) => String(value ?? '').replace(/\d/g, (d) => BN_DIGITS[d]);

// "06:30" → "০৬:৩০ পূর্বাহ্ণ"
export const toBnDisplay = (hhmm) => {
  if (!hhmm) return '--:--';
  const [h, m] = hhmm.split(':').map(Number);
  const hour12 = String(h % 12 || 12).padStart(2, '0');
  return `${toBnDigits(`${hour12}:${String(m).padStart(2, '0')}`)} ${h >= 12 ? 'অপরাহ্ণ' : 'পূর্বাহ্ণ'}`;
};

// সার্ভার (routes/attendance.js → toBangladeshSqlTime) ISO সময় নিয়ে তার সাথে ৬ ঘণ্টা যোগ করে।
// তাই ব্রাউজারের টাইমজোন যা-ই হোক, এখানে আগে থেকে ৬ ঘণ্টা বিয়োগ করে পাঠানো হয়।
export const toServerTime = (hhmm) => {
  const minutes = toMinutes(hhmm);
  if (minutes == null) return null;
  return new Date(Date.UTC(2000, 0, 1, 0, minutes - 6 * 60)).toISOString();
};

export const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;

export const fieldClass =
  'h-[38px] w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[14px] text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100';
