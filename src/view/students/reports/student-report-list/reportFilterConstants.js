// view/students/reports/student-report-list/reportFilterConstants.js
//
// ফিল্টার প্যানেলের static অপশনগুলো এক জায়গায় — ReportFilterFields আর
// ReportBuilder (subHeader লেবেলের জন্য) দুই জায়গাতেই ব্যবহার হয়, যাতে
// ভবিষ্যতে অন্য কোনো রিপোর্টেও একই অপশন সেট reuse করা যায়।

export const GENDER_OPTIONS = [
  // { value: "", label: "সকল" },
  { value: "1", label: "পুরুষ" },
  { value: "2", label: "মহিলা" },
  { value: "", label: "উভয়" },
];

// NewOldId: 1 = নতুন, 2 = পুরাতন (ব্যাকএন্ড কনভেনশন অনুযায়ী)
export const ADMISSION_TYPE_OPTIONS = [
  // { value: "", label: "সকল" },
  { value: "1", label: "নতুন" },
  { value: "2", label: "পুরাতন" },
  { value: "", label: "উভয়" },
];

// is_active: 1 = Active, 0 = InActive, '' = Both (কোনো ফিল্টার না)
export const USER_STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "InActive" },
  { value: "", label: "Both" },
];