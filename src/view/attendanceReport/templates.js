// হাজিরা রিপোর্টের "আমার টেমপ্লেট" — এই ব্রাউজারে (localStorage) রাখা হয়।
// ব্রাউজার স্টোরেজ বন্ধ থাকলে (প্রাইভেট উইন্ডো ইত্যাদি) খালি তালিকা ফেরত দেয়, পেজ ঠিকমতো চলে।
const KEY = 'attendanceReport.templates.v1';

export function loadTemplates() {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((t) => t && t.name && t.settings) : [];
  } catch {
    return [];
  }
}

export function storeTemplates(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
