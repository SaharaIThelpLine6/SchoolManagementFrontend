// হাজিরা রিপোর্ট — /attendance_report এর ডাটা থেকে রিপোর্টের কলাম ও সারি তৈরি।
// সব ধরনের রিপোর্ট (সারাংশ, দৈনিক, রেজিস্টার, পাঞ্চ লগ, ব্যক্তিগত …) এখানেই তৈরি হয়;
// প্রিভিউ / PDF (ReportDocument) আর Excel (exportExcel) শুধু এর ফলাফল দেখায়।
import { toBnDigits } from '../deviceTimeSettings/timeUtils';

// ---------------------------------------------------------------- অবস্থা
// symbol = Excel এ চিহ্ন (প্রিভিউ / PDF এ StatusIcon এর রঙিন ছবি)
export const STATUS_META = {
  present: { label: 'উপস্থিত', symbol: '✓', tone: 'text-[#16a34a]' },
  late: { label: 'দেরিতে উপস্থিত', symbol: '✔', tone: 'text-[#d97706]' },
  absent: { label: 'অনুপস্থিত', symbol: '×', tone: 'text-[#dc2626]' },
  leave: { label: 'ব্যক্তিগত ছুটি', symbol: '☒', tone: 'text-[#1d4ed8]' },
  holiday: { label: 'প্রাতিষ্ঠানিক ছুটি', symbol: '☑', tone: 'text-[#c026d3]' },
  weekend: { label: 'সাপ্তাহিক ছুটি', symbol: '⊙', tone: 'text-[#3f3f46]' },
  future: { label: '', symbol: '', tone: '' },
};
export const STATUS_KEYS = ['present', 'late', 'absent', 'leave', 'holiday', 'weekend'];
export const legendText = (legend) => (legend || []).map((k) => `${STATUS_META[k].symbol} ${STATUS_META[k].label}`).join('   ');

// ---------------------------------------------------------------- রিপোর্টের ধরন
export const REPORT_TYPES = [
  { id: 'summary', name: 'সারাংশ রিপোর্ট', hint: 'প্রত্যেকের উপস্থিত, অনুপস্থিত, ছুটি, দেরি ও হার', icon: 'TbBarChart', title: 'হাজিরা সারাংশ রিপোর্ট' },
  { id: 'daily', name: 'দৈনিক রিপোর্ট', hint: 'তারিখ অনুযায়ী অবস্থা ও পাঞ্চের সময়', icon: 'SubCalendar', title: 'দৈনিক হাজিরা রিপোর্ট' },
  { id: 'register', name: 'মাসিক রেজিস্টার', hint: 'দিনভিত্তিক ছক (সর্বোচ্চ ৩১ দিন)', icon: 'TbChecklist', title: 'মাসিক হাজিরা রেজিস্টার', maxDays: 31 },
  { id: 'absent', base: 'daily', statuses: ['absent'], name: 'অনুপস্থিত তালিকা', hint: 'যারা অনুপস্থিত ছিল', icon: 'TbUserOff', title: 'অনুপস্থিত তালিকা' },
  { id: 'late', base: 'daily', statuses: ['late'], name: 'দেরিতে উপস্থিতি', hint: 'যারা দেরিতে এসেছে ও কত দেরি', icon: 'TbAlertCircle', title: 'দেরিতে উপস্থিতির তালিকা' },
  { id: 'leave', base: 'daily', statuses: ['leave'], name: 'ছুটির তালিকা', hint: 'যারা ছুটিতে ছিল', icon: 'SubDocument', title: 'ছুটির তালিকা' },
  { id: 'punch', name: 'পাঞ্চ লগ', hint: 'ডিভাইসের প্রতিটি পাঞ্চ', icon: 'SubDevice', title: 'ডিভাইস পাঞ্চ লগ' },
  { id: 'individual', name: 'ব্যক্তিগত রিপোর্ট', hint: 'একজনের দিনভিত্তিক হাজিরা', icon: 'SubUser', title: 'ব্যক্তিগত হাজিরা রিপোর্ট', needsUser: true },
];
export const typeOf = (id) => REPORT_TYPES.find((t) => t.id === id) || REPORT_TYPES[0];
export const baseOf = (id) => typeOf(id).base || typeOf(id).id;

export const SORT_OPTIONS = [
  { value: 'default', label: 'ডিফল্ট (টাইপ, শ্রেণী, আইডি)' },
  { value: 'code', label: 'আইডি' },
  { value: 'name', label: 'নাম' },
  { value: 'percentDesc', label: 'হার (বেশি থেকে কম)' },
  { value: 'percentAsc', label: 'হার (কম থেকে বেশি)' },
  { value: 'absentDesc', label: 'সবচেয়ে বেশি অনুপস্থিত' },
  { value: 'lateDesc', label: 'সবচেয়ে বেশি দেরি' },
];
export const GROUP_OPTIONS = [
  { value: 'none', label: 'ভাগ নেই' },
  { value: 'class', label: 'শ্রেণী অনুযায়ী' },
  { value: 'type', label: 'ইউজার টাইপ অনুযায়ী' },
  { value: 'shift', label: 'শিফট অনুযায়ী' },
  { value: 'residential', label: 'আবাসিক অবস্থা অনুযায়ী' },
  { value: 'date', label: 'তারিখ অনুযায়ী', only: ['daily', 'punch'] },
];
export const groupOptionsFor = (base) =>
  base === 'individual' ? GROUP_OPTIONS.slice(0, 1) : GROUP_OPTIONS.filter((g) => !g.only || g.only.includes(base));

// ---------------------------------------------------------------- ফরম্যাট
const WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const WEEKDAY_SHORT = ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'];
const dayIndex = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const weekdayOf = (iso) => WEEKDAYS[dayIndex(iso)];

const pad = (n) => String(n).padStart(2, '0');
const hmsToSec = (hms) => {
  if (!hms) return 0;
  const [h, m, s] = String(hms).split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
};
export const fmtDate = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');
export const fmtDuration = (sec) => {
  if (!sec) return '';
  const minutes = Math.round(sec / 60);
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};
export const fmtTime = (hms, timeFormat) => {
  if (!hms) return '';
  const [h, m] = String(hms).split(':').map(Number);
  if (timeFormat === '24') return `${pad(h)}:${pad(m)}`;
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const digits = (value, settings) => (settings.digits === 'bn' ? toBnDigits(value) : String(value ?? ''));

// প্রিভিউ / PDF এর লেখা
export function cellText(col, value, settings) {
  if (value == null || value === '') return '';
  switch (col.kind) {
    case 'percent':
      return digits(`${Number(value).toFixed(1)}%`, settings);
    case 'date':
      return digits(fmtDate(value), settings);
    case 'time':
      return digits(fmtTime(value, settings.timeFormat), settings);
    case 'duration':
      return digits(fmtDuration(value), settings);
    case 'status':
      return STATUS_META[value]?.label || '';
    case 'mark':
      return STATUS_META[value]?.symbol || '';
    case 'number':
    case 'code':
      return digits(value, settings);
    default:
      return String(value); // নাম, শ্রেণী, ডিভাইস — যেমন লেখা আছে তেমনই
  }
}

// Excel এর মান — সংখ্যা সংখ্যাই থাকে (যোগফল / সর্ট করা যায়), তারিখ-সময় ইংরেজি অঙ্কে
export function excelValue(col, value, settings) {
  if (value == null || value === '') return '';
  switch (col.kind) {
    case 'number':
      return Number(value);
    case 'percent':
      return Math.round(Number(value) * 10) / 10;
    case 'date':
      return fmtDate(value);
    case 'time':
      return fmtTime(value, settings.timeFormat);
    case 'duration':
      return fmtDuration(value);
    case 'status':
      return STATUS_META[value]?.label || '';
    case 'mark':
      return STATUS_META[value]?.symbol || '';
    default:
      return typeof value === 'number' ? value : String(value);
  }
}

export const statText = (stat, settings) =>
  cellText({ kind: stat.kind || 'number' }, stat.value ?? 0, settings) || digits(0, settings);

// ---------------------------------------------------------------- ডাটা প্রস্তুত
// প্রত্যেক ইউজারের প্রতিদিনের অবস্থা:
//   পাঞ্চ আছে বা রেজিস্টারে ১ → উপস্থিত (কোনো পাঞ্চে দেরি থাকলে "দেরিতে উপস্থিত")
//   আজকের পরের দিন → future (কোনো হিসাবে ধরা হয় না)
//   রেজিস্টারে ২ ছুটি, ৩ বন্ধ, ৪ সাপ্তাহিক ছুটি; বাকি সব অনুপস্থিত
export function prepare(data) {
  const { days = [], users = [], status = {}, punches = [], checkTypes = [], today = '' } = data || {};
  const punchesOf = new Map();
  for (const p of punches) {
    const key = `${p.UserID}|${p.Date}`;
    if (!punchesOf.has(key)) punchesOf.set(key, []);
    punchesOf.get(key).push(p);
  }

  const people = users.map((user, rank) => {
    const codes = status[user.UserID] || [];
    const t = { present: 0, late: 0, absent: 0, leave: 0, holiday: 0, weekend: 0, work: 0, lateSec: 0, percent: null };
    const cells = days.map((date, i) => {
      const list = punchesOf.get(`${user.UserID}|${date}`) || [];
      const code = codes[i];
      const lateSec = list.reduce((sum, p) => sum + hmsToSec(p.LateTime), 0);
      let st;
      if (list.length || code === 1) st = lateSec > 0 ? 'late' : 'present';
      else if (date > today) st = 'future';
      else if (code === 2) st = 'leave';
      else if (code === 3) st = 'holiday';
      else if (code === 4) st = 'weekend';
      else st = 'absent';

      if (st === 'present' || st === 'late') t.present += 1;
      if (st === 'late') t.late += 1;
      if (t[st] !== undefined && st !== 'present' && st !== 'late') t[st] += 1;
      t.lateSec += lateSec;
      return { date, index: i, status: st, punches: list, lateSec };
    });
    t.work = t.present + t.absent + t.leave;
    t.percent = t.work ? (t.present * 100) / t.work : null;
    return { user, rank, cells, totals: t };
  });

  const usedTypes = new Set(punches.map((p) => p.CheckTypeID));
  return {
    days,
    today,
    people,
    punches,
    checkTypes: checkTypes.filter((c) => usedTypes.has(c.ID)),
  };
}

// ---------------------------------------------------------------- কলাম
const col = (key, label, w, kind = 'text', align = 'left') => ({ key, label, w, kind, align });
const USER_COLS = [
  col('code', 'আইডি', 1.1, 'code', 'center'),
  col('name', 'নাম', 2.8),
  col('father', 'পিতার নাম', 2.4),
  col('mobile', 'মোবাইল', 1.6, 'code', 'center'),
  col('type', 'ইউজার টাইপ', 1.4),
  col('session', 'সেশন', 1, 'code', 'center'),
  col('class', 'শ্রেণী', 1.5),
  col('residential', 'আবাসিক অবস্থা', 1.4),
  col('shift', 'শিফট', 1.5),
  col('designation', 'পদবি', 1.5),
];
const SL = col('sl', 'ক্রমিক', 0.7, 'number', 'center');
const DATE = col('date', 'তারিখ', 1.3, 'date', 'center');
const WEEKDAY = col('weekday', 'বার', 1.2, 'text', 'center');
const STATUS = col('status', 'অবস্থা', 1.5, 'status', 'center');
const FIRST = col('first', 'প্রথম পাঞ্চ', 1.3, 'time', 'center');
const LAST = col('last', 'শেষ পাঞ্চ', 1.3, 'time', 'center');
const LATE = col('lateTotal', 'দেরি (ঘ:মি)', 1.1, 'duration', 'center');
const DEVICE = col('device', 'ডিভাইস', 1.5);
const DAYS = { key: 'days', label: 'দিনের ঘর (১, ২, ৩ …)', w: 0, kind: 'days' };
const COUNTS = {
  work: col('work', 'কর্মদিবস', 1, 'number', 'center'),
  present: { ...col('present', 'উপস্থিত', 1, 'number', 'center'), status: 'present' },
  late: { ...col('late', 'দেরিতে উপস্থিত', 0.9, 'number', 'center'), status: 'late' },
  absent: { ...col('absent', 'অনুপস্থিত', 1.1, 'number', 'center'), status: 'absent' },
  leave: { ...col('leave', 'ব্যক্তিগত ছুটি', 0.9, 'number', 'center'), status: 'leave' },
  holiday: { ...col('holiday', 'প্রাতিষ্ঠানিক ছুটি', 0.9, 'number', 'center'), status: 'holiday' },
  weekend: { ...col('weekend', 'সাপ্তাহিক ছুটি', 1.1, 'number', 'center'), status: 'weekend' },
  lateTotal: col('lateTotal', 'মোট দেরি (ঘ:মি)', 1.2, 'duration', 'center'),
  percent: col('percent', 'হার', 1, 'percent', 'center'),
};
const ctCols = (checkTypes) => checkTypes.map((c) => ({ ...col(`ct${c.ID}`, c.Name, 1.3, 'time', 'center'), checkTypeId: c.ID }));

// ধরন অনুযায়ী সব কলাম ও কোনগুলো শুরুতে চালু থাকবে
export function columnsFor(base, prepared) {
  const ct = ctCols(prepared?.checkTypes || []);
  const ctKeys = ct.map((c) => c.key);
  const multiDay = (prepared?.days?.length || 0) > 1;
  switch (base) {
    case 'daily':
      return {
        all: [SL, DATE, WEEKDAY, ...USER_COLS, STATUS, ...ct, FIRST, LAST, LATE, DEVICE],
        defaults: ['sl', ...(multiDay ? ['date'] : []), 'code', 'name', 'class', 'status', ...ctKeys, 'lateTotal'],
      };
    case 'register':
      return {
        all: [
          SL,
          ...USER_COLS,
          DAYS,
          COUNTS.present,
          COUNTS.late,
          COUNTS.absent,
          COUNTS.leave,
          COUNTS.holiday,
          COUNTS.weekend,
          COUNTS.percent,
        ],
        defaults: ['sl', 'code', 'name', 'days', 'present', 'late', 'absent', 'leave', 'holiday', 'weekend', 'percent'],
      };
    case 'punch':
      return {
        all: [
          SL,
          DATE,
          WEEKDAY,
          col('time', 'পাঞ্চের সময়', 1.3, 'time', 'center'),
          ...USER_COLS,
          col('punchShift', 'পাঞ্চের শিফট', 1.5),
          col('checkType', 'পাঞ্চের ধরন', 1.3),
          col('scheduled', 'নির্ধারিত সময়', 1.3, 'time', 'center'),
          col('lateFrom', 'দেরি গণনা শুরু', 1.3, 'time', 'center'),
          LATE,
          DEVICE,
        ],
        defaults: ['sl', 'date', 'time', 'code', 'name', 'class', 'checkType', 'lateTotal', 'device'],
      };
    case 'individual':
      return {
        all: [SL, DATE, WEEKDAY, STATUS, ...ct, FIRST, LAST, LATE, DEVICE],
        defaults: ['sl', 'date', 'weekday', 'status', ...ctKeys, 'lateTotal'],
      };
    default:
      return {
        all: [SL, ...USER_COLS, ...Object.values(COUNTS)],
        defaults: ['sl', 'code', 'name', 'class', 'work', 'present', 'late', 'absent', 'leave', 'percent'],
      };
  }
}

// সংরক্ষিত কলাম তালিকা [{key,on}] কে বর্তমান কলামের সাথে মেলানো — ক্রম ঠিক থাকে, নতুন কলাম শেষে যোগ হয়
export function normalizeColumns(saved, base, prepared) {
  const { all, defaults } = columnsFor(base, prepared);
  const keys = new Set(all.map((c) => c.key));
  const list = (saved || []).filter((c) => keys.has(c.key));
  const seen = new Set(list.map((c) => c.key));
  // সংরক্ষিত তালিকায় নেই এমন সুইচ কলাম (নতুন ডাটায় এসেছে) — ডিফল্টে থাকলে চালু
  for (const c of all) if (!seen.has(c.key)) list.push({ key: c.key, on: !saved?.length ? defaults.includes(c.key) : Boolean(c.checkTypeId) && defaults.includes(c.key) });
  return list.map((c) => ({ ...c, label: all.find((a) => a.key === c.key).label }));
}

// ---------------------------------------------------------------- সাজানো ও ভাগ
const SORTERS = {
  code: (a, b) => Number(a.user.UserCode) - Number(b.user.UserCode) || String(a.user.UserCode).localeCompare(String(b.user.UserCode)),
  name: (a, b) => String(a.user.UserName || '').localeCompare(String(b.user.UserName || ''), 'bn'),
  percentDesc: (a, b) => (b.totals.percent ?? -1) - (a.totals.percent ?? -1),
  percentAsc: (a, b) => (a.totals.percent ?? 101) - (b.totals.percent ?? 101),
  absentDesc: (a, b) => b.totals.absent - a.totals.absent,
  lateDesc: (a, b) => b.totals.late - a.totals.late || b.totals.lateSec - a.totals.lateSec,
};
const sortPeople = (people, sortBy) => {
  const by = SORTERS[sortBy];
  return by ? [...people].sort((a, b) => by(a, b) || a.rank - b.rank) : people;
};

const GROUPS = {
  class: (r) => ({ key: r._u.ClassID ?? '-', label: r._u.ClassName || 'শ্রেণী নেই', order: r._u.ClassID ?? Infinity }),
  type: (r) => ({ key: r._u.UserTypeID ?? '-', label: r._u.UserTypeName || 'টাইপ নেই', order: r._u.UserTypeID ?? Infinity }),
  shift: (r) => ({ key: r._u.ShiftID ?? '-', label: r._u.ShiftName || 'শিফট নেই', order: r._u.ShiftID ?? Infinity }),
  residential: (r) => ({
    key: r._u.ResidentialID ?? '-',
    label: r._u.ResidentialName || 'আবাসিক অবস্থা নেই',
    order: r._u.ResidentialID ?? Infinity,
  }),
  date: (r) => ({ key: r._date, label: `${fmtDate(r._date)}, ${weekdayOf(r._date)}`, order: r._date }),
};
const compareOrder = (a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)));

const userValues = (u) => ({
  code: u.UserCode,
  name: u.UserName,
  father: u.FatherName,
  mobile: u.Mobile,
  type: u.UserTypeName,
  session: u.SessionName,
  class: u.ClassName,
  residential: u.ResidentialName,
  shift: u.ShiftName,
  designation: u.Designation,
});

// একদিনের পাঞ্চগুলো থেকে সুইচভিত্তিক সময়, প্রথম/শেষ পাঞ্চ ও ডিভাইস
const dayValues = (cell) => {
  const v = { status: cell.status, lateTotal: cell.lateSec || null };
  const times = cell.punches.map((p) => p.Time).filter(Boolean).sort();
  for (const p of cell.punches) if (p.CheckTypeID != null && !v[`ct${p.CheckTypeID}`]) v[`ct${p.CheckTypeID}`] = p.Time;
  v.first = times[0] || null;
  v.last = times.length > 1 ? times[times.length - 1] : null;
  v.device = [...new Set(cell.punches.map((p) => p.DeviceName).filter(Boolean))].join(', ') || null;
  return v;
};

// ---------------------------------------------------------------- রিপোর্ট তৈরি
// ফলাফল: { columns, rows, stats, info, legend, notice }
//   rows: সাধারণ সারি (কলাম key → মান, _status) অথবা { kind: 'group', label, count }
export function buildReport(prepared, settings) {
  const type = typeOf(settings.reportType);
  const base = baseOf(settings.reportType);
  const { all } = columnsFor(base, prepared);
  const byKey = new Map(all.map((c) => [c.key, c]));
  const days = prepared.days;
  const out = { columns: [], rows: [], stats: [], info: null, legend: null, notice: null };

  if (type.maxDays && days.length > type.maxDays) {
    out.notice = `মাসিক রেজিস্টার সর্বোচ্চ ${toBnDigits(type.maxDays)} দিনের হয়। তারিখের পরিসর ছোট করুন।`;
    return out;
  }

  for (const c of normalizeColumns(settings.columns, base, prepared)) {
    if (!c.on) continue;
    if (c.key === 'days') {
      days.forEach((d, i) =>
        out.columns.push({
          key: `d${i}`,
          label: String(Number(d.slice(8, 10))),
          sub: WEEKDAY_SHORT[dayIndex(d)],
          w: 0.55,
          kind: 'mark',
          align: 'center',
          dayCol: true,
        })
      );
    } else {
      const column = byKey.get(c.key);
      // রেজিস্টারে নিচে সংকেত থাকে, তাই গণনার কলামের হেডারে শুধু চিহ্ন (জায়গা বাঁচে)
      out.columns.push(base === 'register' && column.status ? { ...column, iconOnly: true } : column);
    }
  }

  const people = sortPeople(prepared.people, settings.sortBy);
  const statuses = new Set(settings.statuses?.length ? settings.statuses : STATUS_KEYS);
  let rows = [];

  if (base === 'summary') {
    rows = people.map((p) => ({ _u: p.user, ...userValues(p.user), ...p.totals, lateTotal: p.totals.lateSec || null }));
  } else if (base === 'register') {
    rows = people.map((p) => {
      const r = { _u: p.user, ...userValues(p.user), ...p.totals };
      p.cells.forEach((c) => {
        r[`d${c.index}`] = c.status;
      });
      return r;
    });
    out.legend = STATUS_KEYS;
  } else if (base === 'daily') {
    days.forEach((date, i) => {
      people.forEach((p, userOrder) => {
        const cell = p.cells[i];
        if (cell.status === 'future' || !statuses.has(cell.status)) return;
        rows.push({
          _u: p.user,
          _date: date,
          _status: cell.status,
          _o: [i, userOrder],
          date,
          weekday: weekdayOf(date),
          ...userValues(p.user),
          ...dayValues(cell),
        });
      });
    });
  } else if (base === 'punch') {
    const orderOf = new Map(people.map((p, i) => [p.user.UserID, i]));
    const userOf = new Map(people.map((p) => [p.user.UserID, p.user]));
    for (const p of prepared.punches) {
      const u = userOf.get(p.UserID);
      if (!u) continue;
      const lateSec = hmsToSec(p.LateTime);
      if (settings.punchFilter === 'late' && !lateSec) continue;
      if (settings.punchFilter === 'ontime' && lateSec) continue;
      rows.push({
        _u: u,
        _date: p.Date,
        _status: lateSec ? 'late' : 'present',
        _o: [p.Date, p.Time || '', orderOf.get(p.UserID)],
        date: p.Date,
        weekday: weekdayOf(p.Date),
        time: p.Time,
        ...userValues(u),
        punchShift: p.ShiftName,
        checkType: p.CheckTypeName,
        scheduled: p.ScheduledTime,
        lateFrom: p.StartLate,
        lateTotal: lateSec || null,
        device: p.DeviceName,
      });
    }
  } else if (base === 'individual') {
    const person = prepared.people.find((p) => String(p.user.UserID) === String(settings.userId));
    if (!person) {
      out.notice = prepared.people.length
        ? 'ব্যক্তিগত রিপোর্টের জন্য একজন ইউজার নির্বাচন করুন।'
        : 'এই ফিল্টারে কোনো ইউজার নেই।';
      return out;
    }
    const u = person.user;
    out.info = [
      ['নাম', u.UserName],
      ['আইডি', u.UserCode, true],
      ['পিতার নাম', u.FatherName],
      ['ইউজার টাইপ', u.UserTypeName],
      [u.Designation ? 'পদবি' : 'শ্রেণী', u.Designation || u.ClassName],
      ['শিফট', u.ShiftName],
      ['সেশন', u.SessionName, true],
      ['মোবাইল', u.Mobile, true],
    ].filter(([, v]) => v != null && v !== '');
    person.cells.forEach((cell) => {
      if (cell.status === 'future' || !statuses.has(cell.status)) return;
      rows.push({ _u: u, _date: cell.date, _status: cell.status, date: cell.date, weekday: weekdayOf(cell.date), ...dayValues(cell) });
    });
    const t = person.totals;
    out.stats = [
      { label: 'কর্মদিবস', value: t.work },
      { label: 'উপস্থিত', value: t.present },
      { label: 'দেরিতে', value: t.late },
      { label: 'অনুপস্থিত', value: t.absent },
      { label: 'ব্যক্তিগত ছুটি', value: t.leave },
      { label: 'প্রাতিষ্ঠানিক / সাপ্তাহিক ছুটি', value: t.holiday + t.weekend },
      { label: 'মোট দেরি', value: t.lateSec, kind: 'duration' },
      { label: 'উপস্থিতির হার', value: t.percent, kind: 'percent' },
    ];
  }

  // ---- সারির ক্রম ও ভাগ
  if (rows[0]?._o) {
    rows.sort((a, b) => {
      for (let k = 0; k < a._o.length; k += 1) {
        const d = compareOrder(a._o[k], b._o[k]);
        if (d) return d;
      }
      return 0;
    });
  }
  const groupBy = base === 'individual' || (settings.groupBy === 'date' && days.length < 2) ? 'none' : settings.groupBy;
  const grouper = GROUPS[groupBy];
  if (grouper && (groupBy !== 'date' || base === 'daily' || base === 'punch')) {
    const withGroup = rows.map((r, i) => ({ r, g: grouper(r), i }));
    withGroup.sort((a, b) => compareOrder(a.g.order, b.g.order) || a.i - b.i);
    const grouped = [];
    let current = null;
    let sl = 0;
    for (const { r, g } of withGroup) {
      if (!current || current.key !== g.key) {
        current = { kind: 'group', key: g.key, label: g.label, count: 0, dateLabel: groupBy === 'date' };
        grouped.push(current);
        if (settings.slPerGroup) sl = 0;
      }
      current.count += 1;
      sl += 1;
      grouped.push({ ...r, sl });
    }
    rows = grouped;
  } else {
    rows = rows.map((r, i) => ({ ...r, sl: i + 1 }));
  }
  out.rows = rows;

  // ---- সারসংক্ষেপ
  if (base === 'summary' || base === 'register') {
    const sum = (k) => people.reduce((s, p) => s + p.totals[k], 0);
    const rated = people.filter((p) => p.totals.percent != null);
    out.stats = [
      { label: 'মোট জন', value: people.length },
      { label: 'উপস্থিত (দিন)', value: sum('present') },
      { label: 'দেরি (দিন)', value: sum('late') },
      { label: 'অনুপস্থিত (দিন)', value: sum('absent') },
      { label: 'ব্যক্তিগত ছুটি (দিন)', value: sum('leave') },
      {
        label: 'গড় উপস্থিতির হার',
        value: rated.length ? rated.reduce((s, p) => s + p.totals.percent, 0) / rated.length : null,
        kind: 'percent',
      },
    ];
  } else if (base === 'daily') {
    const count = { present: 0, late: 0, absent: 0, leave: 0 };
    people.forEach((p) =>
      p.cells.forEach((c) => {
        if (c.status === 'present' || c.status === 'late') count.present += 1;
        if (count[c.status] !== undefined && c.status !== 'present') count[c.status] += 1;
      })
    );
    const unit = days.length > 1 ? ' (জন-দিন)' : '';
    out.stats = [
      { label: 'মোট জন', value: people.length },
      ...(days.length > 1 ? [{ label: 'মোট দিন', value: days.length }] : []),
      { label: `উপস্থিত${unit}`, value: count.present },
      { label: `দেরিতে${unit}`, value: count.late },
      { label: `অনুপস্থিত${unit}`, value: count.absent },
      { label: `ব্যক্তিগত ছুটি${unit}`, value: count.leave },
      { label: 'তালিকায় সারি', value: rows.filter((r) => r.kind !== 'group').length },
    ];
  } else if (base === 'punch') {
    const list = rows.filter((r) => r.kind !== 'group');
    out.stats = [
      { label: 'মোট পাঞ্চ', value: list.length },
      { label: 'দেরিতে পাঞ্চ', value: list.filter((r) => r._status === 'late').length },
      { label: 'মোট জন', value: new Set(list.map((r) => r._u.UserID)).size },
    ];
  }
  return out;
}

// ---------------------------------------------------------------- সেটিংস
export const DISPLAY_KEYS = [
  'paper',
  'fontSize',
  'digits',
  'timeFormat',
  'showHeader',
  'showLogo',
  'showStats',
  'showSignature',
  'showGeneratedAt',
  'colorStatus',
  'signatures',
  'sortBy',
  'slPerGroup',
];

export function defaultSettings(typeId, keep = {}) {
  const type = typeOf(typeId);
  const base = baseOf(typeId);
  const display = Object.fromEntries(DISPLAY_KEYS.filter((k) => keep[k] !== undefined).map((k) => [k, keep[k]]));
  return {
    reportType: type.id,
    title: type.title,
    subtitle: '',
    columns: [],
    sortBy: 'default',
    groupBy: base === 'daily' ? 'date' : 'none',
    slPerGroup: true,
    statuses: type.statuses || STATUS_KEYS,
    punchFilter: 'all',
    paper: 'a4',
    orientation: base === 'register' ? 'landscape' : 'portrait',
    fontSize: '11',
    digits: 'bn',
    timeFormat: '12',
    showHeader: true,
    showLogo: true,
    showStats: true,
    showSignature: true,
    showGeneratedAt: true,
    colorStatus: true,
    signatures: 'প্রস্তুতকারী, যাচাইকারী, প্রধান শিক্ষক',
    ...display,
  };
}
