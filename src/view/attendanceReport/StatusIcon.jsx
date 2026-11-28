// হাজিরার অবস্থার রঙিন চিহ্ন: ✓ উপস্থিত, × অনুপস্থিত, ☒ ব্যক্তিগত ছুটি, ☑ প্রাতিষ্ঠানিক ছুটি, ⊙ সাপ্তাহিক ছুটি।
// রং SVG এর ভেতরেই লেখা (currentColor নয়), যাতে PDF (html2canvas) এও একই রং আসে।
import PropTypes from 'prop-types';

const STATUS_COLORS = {
  present: '#16a34a',
  late: '#d97706',
  absent: '#dc2626',
  leave: '#1d4ed8',
  holiday: '#c026d3',
  weekend: '#3f3f46',
};
const MONO = '#1f2937';

const StatusIcon = ({ status, size = 14, mono = false }) => {
  const color = STATUS_COLORS[status];
  if (!color) return null;
  const c = mono ? MONO : color;
  const svg = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: c,
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: { display: 'inline-block', verticalAlign: 'middle', flex: 'none' },
  };
  switch (status) {
    case 'present':
      return (
        <svg {...svg}>
          <path d="M2.5 8.6l3.6 3.6L13.6 4" />
        </svg>
      );
    case 'late': // ✓ + ছোট ঘড়ি
      return (
        <svg {...svg}>
          <path d="M1.6 8.4l3.2 3.2 6-7" />
          <circle cx="12" cy="11.6" r="3" strokeWidth="1.3" fill="#ffffff" />
          <path d="M12 10.1v1.6l1 .7" strokeWidth="1.1" />
        </svg>
      );
    case 'absent':
      return (
        <svg {...svg}>
          <path d="M3.8 3.8l8.4 8.4M12.2 3.8l-8.4 8.4" />
        </svg>
      );
    case 'leave': // ☒
      return (
        <svg {...svg}>
          <rect x="1.8" y="1.8" width="12.4" height="12.4" rx="1" strokeWidth="1.4" />
          <path d="M5 5l6 6M11 5l-6 6" strokeWidth="1.6" />
        </svg>
      );
    case 'holiday': // ☑
      return (
        <svg {...svg}>
          <rect x="1.8" y="1.8" width="12.4" height="12.4" rx="1" strokeWidth="1.4" />
          <path d="M4.4 8.3l2.5 2.5L11.8 5.4" strokeWidth="1.7" />
        </svg>
      );
    case 'weekend': // ⊙
      return (
        <svg {...svg}>
          <circle cx="8" cy="8" r="6.2" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="1.9" fill={c} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
};

StatusIcon.propTypes = {
  status: PropTypes.string,
  size: PropTypes.number,
  mono: PropTypes.bool,
};

export default StatusIcon;
