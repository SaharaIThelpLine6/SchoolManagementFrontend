// view/students/reports/student-report-list/reportSettingsConstants.js
//
// রিপোর্টের ⚙️ সেটিং প্যানেলের ডিফল্ট মান ও হেল্পার।
// এই মানগুলো ব্যাকএন্ডে Report_Template টেবিলে (ReportType = 'report_settings')
// JSON আকারে সেভ হয়, ফলে ইউজার একবার সেট করলে পরেরবার সেটাই লোড হবে।

import { Buffer } from "buffer";

export const DEFAULT_REPORT_SETTINGS = {
  // ---------- লেখার আকার (px) ----------
  InstitutionFontSize: 22, // প্রতিষ্ঠানের নাম (h1)
  BodyFontSize: 13,        // ঠিকানা / সাধারণ অনুচ্ছেদ (p)
  TitleFontSize: 16,       // রিপোর্টের শিরোনাম (h2)
  TableHeadFontSize: 11,   // টেবিলের হেডার (th)
  TableBodyFontSize: 11,   // টেবিলের ডাটা (td)

  // ---------- জলছাপ (Watermark) ----------
  WatermarkEnabled: false, // প্রতিষ্ঠানের লোগো জলছাপ আকারে বসবে কিনা
  WatermarkOpacity: 8,     // কতটুকু দেখা যাবে (%)
  WatermarkSize: 55,       // পেজের প্রস্থের কত % জায়গা নেবে

  // ---------- পেজ ----------
  RowsPerPage: 25,         // প্রতি পেজে কয়টি রো
};

export const FONT_FIELDS = [
  { key: "InstitutionFontSize", label: "প্রতিষ্ঠানের নাম", min: 12, max: 40 },
  { key: "TitleFontSize", label: "রিপোর্টের শিরোনাম", min: 10, max: 32 },
  { key: "BodyFontSize", label: "ঠিকানা ও সাধারণ লেখা", min: 8, max: 26 },
  { key: "TableHeadFontSize", label: "টেবিলের হেডার", min: 6, max: 22 },
  { key: "TableBodyFontSize", label: "টেবিলের ডাটা", min: 6, max: 22 },
];

export const REPORT_SETTINGS_STORAGE_PREFIX = "studentReport_settings_";

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// সার্ভার/লোকাল থেকে আসা কাঁচা অবজেক্টকে নিরাপদ ডিফল্টের সাথে মিলিয়ে নেওয়া
// (অচেনা বা বাদ দেওয়া key — যেমন পুরনো WatermarkRotate — এমনিতেই বাদ পড়বে)
export const mergeReportSettings = (raw, defaults = {}) => {
  const base = { ...DEFAULT_REPORT_SETTINGS, ...defaults };
  if (!raw || typeof raw !== "object") return base;

  const merged = { ...base };
  Object.keys(base).forEach((key) => {
    if (raw[key] === undefined || raw[key] === null || raw[key] === "") return;
    if (typeof base[key] === "boolean") merged[key] = Boolean(raw[key]);
    else if (typeof base[key] === "number") merged[key] = toNumber(raw[key], base[key]);
    else merged[key] = raw[key];
  });
  return merged;
};

// Logo/Image ফিল্ড (Buffer, base64 string, { data: [] } — যেকোনো ফরম্যাট) থেকে <img src>
export const toImageSrc = (imgData) => {
  if (!imgData) return null;
  try {
    if (typeof imgData === "string") {
      return imgData.startsWith("data:") ? imgData : `data:image/png;base64,${imgData}`;
    }
    const raw = imgData.data ?? imgData;
    if (Array.isArray(raw)) {
      return `data:image/png;base64,${Buffer.from(raw).toString("base64")}`;
    }
    if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
      return `data:image/png;base64,${Buffer.from(raw.data).toString("base64")}`;
    }
    if (typeof raw === "string") {
      return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
    }
    return null;
  } catch (err) {
    console.error("Image render error:", err);
    return null;
  }
};
