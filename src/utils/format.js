import { LABELS, MONTHS_BN, MONTHS_SHORT_BN } from '../helper/labels';

/**
 * Formats a number as Bangladeshi Taka, e.g. 12000 -> "৳ 12,000"
 */
export function formatMoney(amount) {
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num)) return `${LABELS.app.currencySymbol} 0`;
  const rounded = Math.round(num);
  const formatted = new Intl.NumberFormat('en-IN').format(Math.abs(rounded));
  return rounded < 0
    ? `-${LABELS.app.currencySymbol} ${formatted}`
    : `${LABELS.app.currencySymbol} ${formatted}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into DD/MM/YYYY
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function getTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getMonthNameBn(month) {
  return MONTHS_BN[month - 1] ?? '';
}

export function getMonthShortBn(month) {
  return MONTHS_SHORT_BN[month - 1] ?? '';
}

export function toBengaliDigits(value) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
}

const BN_0_TO_99 = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

/**
 * Converts a non-negative integer up to 99,99,999 into Bengali words.
 */
export function numberToBengaliWords(num, withCurrency = true) {
  const n = Math.floor(Math.max(0, Number(num) || 0));
  if (n > 9999999) {
    const formatted = formatMoney(n);
    return withCurrency ? `${formatted} ${LABELS.common.takaOnly}` : formatted;
  }

  if (n === 0) {
    return withCurrency ? `শূন্য ${LABELS.common.takaOnly}` : 'শূন্য';
  }

  const parts = [];

  const lakh = Math.floor(n / 100000);
  const afterLakh = n % 100000;
  const thousand = Math.floor(afterLakh / 1000);
  const afterThousand = afterLakh % 1000;
  const hundred = Math.floor(afterThousand / 100);
  const remainder = afterThousand % 100;

  if (lakh > 0) {
    parts.push(`${BN_0_TO_99[lakh]} লক্ষ`);
  }
  if (thousand > 0) {
    parts.push(`${BN_0_TO_99[thousand]} হাজার`);
  }
  if (hundred > 0) {
    parts.push(`${BN_0_TO_99[hundred]} শত`);
  }
  if (remainder > 0) {
    parts.push(BN_0_TO_99[remainder]);
  }

  const words = parts.join(' ');
  return withCurrency ? `${words} ${LABELS.common.takaOnly}` : words;
}