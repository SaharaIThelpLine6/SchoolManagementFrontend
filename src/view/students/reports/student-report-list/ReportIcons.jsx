// view/students/reports/student-report-list/ReportIcons.jsx
//
// 🔹 রিপোর্ট মডিউলের সব আইকন এক জায়গায় — inline SVG।
//    প্রজেক্টের SvgIcon সেটে Fi* এর অনেকগুলো (FiSettings, FiCheck, FiTrash2,
//    FiChevronLeft/Right ...) নেই বলে ফাঁকা বক্স দেখাচ্ছিল। এখানে সবগুলো
//    নিজেরাই আঁকা, তাই আর কোনো আইকন লাইব্রেরির উপর নির্ভর করতে হবে না।

const base = (size, strokeWidth) => ({
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
});

// ⚙️ সেটিং
export function GearIcon({ size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ✓ চেক (চেকবক্সের ভেতরে)
export function CheckIcon({ size = 12, strokeWidth = 3.2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// 🗑 ডিলিট
export function TrashIcon({ size = 14, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

// ＋ যোগ
export function PlusIcon({ size = 16, strokeWidth = 2.2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// ⟳ রিসেট / রিফ্রেশ
export function RefreshIcon({ size = 15, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

// 🖨 প্রিন্ট
export function PrinterIcon({ size = 16, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

// 📄 ডকুমেন্ট
export function DocIcon({ size = 16, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

// ▦ লেআউট
export function LayoutIcon({ size = 16, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

// ‹ › চেভরন
export function ChevronIcon({ dir = "left", size = 18, strokeWidth = 2, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

// ✕ ক্লোজ
export function CloseIcon({ size = 16, strokeWidth = 2.4, className = "" }) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
