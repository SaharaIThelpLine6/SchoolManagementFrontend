import React from 'react';
import { Buffer } from 'buffer';
import QRCode from 'react-qr-code';

import { NavyAdmitFace } from './AdmitCardNavy';
import {
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_LANG,
  WATERMARK_DEFAULTS,
  buildAdmitQrValue,
  formatAdmitValue,
  getAdmitDir,
  getAdmitText,
  getFieldValue,
  getPrintDate,
  toLangDigit,
} from '../Data/admitCardConfig';

// ---------------------------------------------------------------------------
// নিজের লেআউটওয়ালা ডিজাইনগুলো — এক জায়গায়।
//
// টেমপ্লেটে `layout: '<নাম>'` থাকলে AdmitCardFace নিজে না এঁকে নিচের
// তালিকা থেকে ঐ নামের কম্পোনেন্টটাকে ডাকে। `layout` না থাকলে আগের
// নিয়মই চলে, তাই পুরোনো সব ডিজাইন অক্ষরে অক্ষরে অক্ষত।
//
//   layout: 'navy'     → AdmitCardNavy.jsx (আলাদা ফাইলে, আগেরটা)
//   layout: 'classic'  → ClassicAdmitFace — ফ্রেমের ধরনটা `chrome` বলে:
//                          chrome: 'gold'   → বাংলা সোনালী
//                          chrome: 'ornate' → সবুজ-সোনালী নকশা
//                          chrome: 'arch'   → মিহরাব (গাঢ় রঙের পটে সাদা ঘর)
//   layout: 'modern'   → ModernAdmitFace — রঙিন ব্যান্ড ও গোল কোনার ঘর
//
// চারটা ডিজাইনেরই ভিতরের গড়ন এক: হেডার → তথ্যের ঘর → আসনের ঘর →
// স্বাক্ষর। তাই ঘরগুলো একবারই লেখা (নিচের InfoTable, SeatPanel,
// SignRow), আর ডিজাইনভেদে কেবল ফ্রেম, রঙ ও হেডারটা বদলায়।
//
// ⚠️ কোনো ডিজাইনেই কোডে লেখা স্থির "নির্দেশাবলী" নেই। ওগুলো ডাটাবেজ
// থেকে আসে না বলে বাদ দেওয়া হয়েছে; ঐ জায়গাটায় শিক্ষার্থীর আসনের
// তথ্য বসে, যেটা আসল ডাটা (Exam_SitAllocation থেকে)।
// ---------------------------------------------------------------------------

const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

/** এক সারিতে দুইটা করে ফিল্ড */
const pairUp = (arr) => {
  const out = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
};

export const LAYOUT_TEXTS = {
  bn: {
    subTitle: 'প্রবেশপত্র',
    academicYear: 'শিক্ষাবর্ষ',
    seatTitle: 'পরীক্ষার্থীর আসন',
    rulesTitle: 'পরীক্ষার্থীদের জন্য নির্দেশাবলী',
  },
  en: {
    subTitle: 'Admission letter',
    academicYear: 'Academic year',
    seatTitle: "Candidate's seat",
    rulesTitle: 'Instructions for candidates',
  },
  ar: {
    subTitle: 'بطاقة الدخول',
    academicYear: 'العام الدراسي',
    seatTitle: 'مقعد الممتحن',
    rulesTitle: 'تعليمات للممتحنين',
  },
};

const layoutText = (key, lang) =>
  LAYOUT_TEXTS[lang]?.[key] ?? LAYOUT_TEXTS.bn[key];

/** উপরে বিসমিল্লাহ — তিন ভাষাতেই আরবিই বসে */
const BISMILLAH = 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ';

// ---------------------------------------------------------------------------
// নির্দেশাবলী।
//
// এগুলো কম্পোনেন্টে লেখা নয় — টেমপ্লেটের `rules` ঘরে দিলে সেটাই বসে,
// না দিলে নিচের ভিত্তি তালিকাটা। তাই এক প্রতিষ্ঠানের জন্য আলাদা লেখা
// লাগলে কেবল ঐ টেমপ্লেটে `rules` বসালেই হলো, কম্পোনেন্টে হাত দিতে হয় না।
//
// পরে ডাটাবেজ থেকে আনতে চাইলেও পথটা একই — রাউট থেকে `rules` পাঠিয়ে
// টেমপ্লেটে বসিয়ে দিলেই চলবে।
// ---------------------------------------------------------------------------
export const DEFAULT_ADMIT_RULES = {
  bn: [
    'সকল পরীক্ষার্থীকে প্রবেশপত্রসহ পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে কেন্দ্রে উপস্থিত হতে হবে।',
    'পরীক্ষার হলে মোবাইল ফোন, স্মার্ট ঘড়ি ও ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।',
    'প্রবেশপত্র ব্যতীত পরীক্ষার হলে প্রবেশ করা যাবে না।',
    'প্রতিটি পরীক্ষা শেষে প্রশ্নপত্র জমা দিতে হবে।',
    'পরীক্ষার হলে নীরবতা বজায় রাখতে হবে, অন্যদের বিঘ্ন ঘটানো যাবে না।',
    'যেকোনো ধরনের অসদুপায় অবলম্বন করলে তাৎক্ষণিকভাবে বহিষ্কার করা হবে।',
  ],
  en: [
    'All candidates must arrive at the center (with admit card) at least 30 minutes before the start of the exam.',
    'Mobile phones, smart watches and electronic devices are completely prohibited in the examination hall.',
    'You will not be allowed to enter the examination hall without an admit card.',
    'Question papers must be submitted at the end of each exam.',
    'Silence must be maintained in the examination hall and no disruptions to others may be caused.',
    'Any type of misconduct will result in immediate expulsion of the candidate.',
  ],
  ar: [
    'على جميع الممتحنين الحضور إلى المركز ومعهم بطاقة الدخول قبل بدء الامتحان بثلاثين دقيقة على الأقل.',
    'تُمنع الهواتف المحمولة والساعات الذكية والأجهزة الإلكترونية منعًا باتًا داخل القاعة.',
    'لا يُسمح بدخول القاعة بدون بطاقة الدخول.',
    'يجب تسليم ورقة الأسئلة عند انتهاء كل امتحان.',
    'يجب الحفاظ على الهدوء داخل القاعة وعدم إزعاج الآخرين.',
    'أي سلوك مخالف يؤدي إلى إخراج الممتحن فورًا.',
  ],
};

// ---------------------------------------------------------------------------
// প্রপগুলো সব ডিজাইনেই এক — তাই একবারেই সব হিসাব করে নেওয়া হয়।
// এটা হুক নয়, সাধারণ ফাংশন; তাই শর্তের ভিতরে ডাকলেও সমস্যা নেই।
// ---------------------------------------------------------------------------
const resolveCard = (p) => {
  const tpl = p.template || {};
  const s = p.student || {};
  const lang = p.lang || DEFAULT_ADMIT_LANG;

  // ⚠️ সেটিংয়ের স্লাইডার ও রঙের ঘরগুলোর মান সারির সাথে আসে
  // (admit_name_size, admit_name_color, …) — পেজ ওগুলো buildPrintRows ও
  // previewStudent দুই জায়গাতেই বসায়।
  //
  // আগে এখানে সরাসরি টেমপ্লেটের মানগুলো পড়া হতো, তাই নতুন ডিজাইনগুলোতে
  // "প্রতিষ্ঠানের নাম / ঠিকানা / পরীক্ষার নাম" এর মাপ-রঙ নাড়লে কিছুই
  // হতো না। সারির মান থাকলে সেটাই জেতে — এখন টেমপ্লেটের উপরেই বসিয়ে
  // দিই, তাই নিচের সব কম্পোনেন্ট আগের মতো `t.nameSize` লিখলেই স্লাইডারের
  // মানটা পায়।
  const t = {
    ...tpl,
    nameSize: s.admit_name_size || tpl.nameSize,
    nameColor: s.admit_name_color || tpl.nameColor,
    addressSize: s.admit_address_size || tpl.addressSize,
    addressColor: s.admit_address_color || tpl.addressColor,
    examNameSize: s.admit_exam_size || tpl.examNameSize,
    examNameColor: s.admit_exam_color || tpl.examNameColor,
  };
  const z = Number(p.zoom) > 0 ? Number(p.zoom) : 1;

  const resolveOn = (newProp, oldProp, tplDefault) => {
    if (newProp !== undefined) return Boolean(newProp);
    if (oldProp !== undefined) return Boolean(oldProp);
    return Boolean(tplDefault);
  };

  const watermarkOn = p.showWatermark === undefined ? true : Boolean(p.showWatermark);

  const exam = getFieldValue(p.student || {}, 'ExamName', lang);
  const session = getFieldValue(p.student || {}, 'SessionName', lang);

  return {
    t,
    lang,
    z,
    dir: getAdmitDir(lang),
    cardH: p.cardHeight || CARD_H,
    // bodyEnd দেওয়া মানে নিচের জায়গাটা রুটিনের — আসনের ঘরটা তখন আঁকা
    // হয় না, রুটিনের ব্লকেই ওটা বসে
    compact: Boolean(p.bodyEnd),

    primary: t.primary || t.accent || '#0f5132',
    gold: t.gold || '#c9a227',
    grid: t.gridColor || '#cbd5e1',
    labelBg: t.labelBg || '#f1f5f9',

    logo: toImageSrc(p.student?.Logo || p.student?.logo || p.inLogo),
    photo: toImageSrc(p.student?.UserImage),
    najemSignature: toImageSrc(p.student?.SignatureNajem || p.student?.signatureNajem),
    principalSignature: toImageSrc(
      p.student?.SignaturePrincipal || p.student?.signaturePrincipal
    ),
    watermark: watermarkOn
      ? toImageSrc(p.student?.Watermark || p.student?.DocumentLogo || p.inWatermark)
      : '',

    stampDate: p.printDate || getPrintDate(new Date(), lang),

    photoEnabled: p.showPhoto === undefined ? Boolean(t.showPhoto) : Boolean(p.showPhoto),
    qrValue:
      (p.showQR === undefined ? Boolean(t.showQR) : Boolean(p.showQR))
        ? buildAdmitQrValue(p.student || {}, p.institutionCode)
        : '',

    najemSignOn: resolveOn(p.najemShowSign, p.showSign, t.showSignature),
    najemNameOn: resolveOn(p.najemShowName, p.showSignName, t.showSignature),
    principalSignOn: resolveOn(p.principalShowSign, p.showSign, t.showSignature),
    principalNameOn: resolveOn(p.principalShowName, p.showSignName, t.showSignature),

    // সেটিংয়ের "তারিখ" ঘরদুইটা — বাঁ ও ডান পাশের জন্য আলাদা
    // (najemShowDate / principalShowDate প্রপ দুইটা পেজ থেকেই আসে)।
    // পুরোনো কোনো ডিজাইন এই দুইটা পড়ে না, তাই ওগুলোতে কোনো বদল নেই।
    najemDateOn: resolveOn(p.najemShowDate, p.showSignDate, t.showSignDate),
    principalDateOn: resolveOn(p.principalShowDate, p.showSignDate, t.showSignDate),

    // সেটিংয়ের দুইটা স্লাইডার — স্বাক্ষর ও QR আলাদা করে উপরে-নিচে।
    // ০ মানে আগের জায়গা, তাই হাত না দিলে কোনো ডিজাইনই নড়ে না।
    signShiftY: Number(p.signOffsetY) || 0,
    qrShiftY: Number(p.qrOffsetY) || 0,

    examLine: exam
      ? session
        ? `${exam}  •  ${layoutText('academicYear', lang)}: ${toLangDigit(session, lang)}`
        : exam
      : '',

    rows: pairUp((p.fields || []).filter(Boolean)),
    seatOn: Boolean(String(p.seatText || '').trim()),
  };
};

// ---------------------------------------------------------------------------
// ঘরগুলো — চার ডিজাইনেই একই, শুধু রঙ বদলায়
// ---------------------------------------------------------------------------

/** মাঝের লোগো ওয়াটারমার্ক */
const Watermark = ({ src, t }) =>
  src ? (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity: t.watermarkOpacity ?? WATERMARK_DEFAULTS.opacity }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: t.watermarkSize ?? WATERMARK_DEFAULTS.size,
          height: t.watermarkSize ?? WATERMARK_DEFAULTS.size,
          objectFit: 'contain',
        }}
      />
    </div>
  ) : null;

/**
 * তথ্যের ঘর — বর্ডার দেওয়া সারি, এক সারিতে দুইটা করে ফিল্ড।
 * বাঁ ঘরে হালকা পটে লেবেল, ডান ঘরে মান। বেজোড় সংখ্যক ফিল্ড হলে শেষেরটা
 * পুরো প্রস্থ জুড়ে বসে, কারণ সারির শেষ ঘরটার ডান রেখা থাকে না।
 */
const InfoTable = ({
  rows,
  student,
  lang,
  dir,
  labelOverrides = {},
  grid,
  labelBg,
  labelColor,
  valueColor,
  labelFont,
  valueFont,
  rowH,
  labelW = 86,
}) => (
  <>
    {rows.map((pair, i) => (
      <div
        key={`row-${i}`}
        className="flex"
        style={{
          height: rowH,
          borderBottom: i < rows.length - 1 ? `1px solid ${grid}` : 'none',
        }}
      >
        {pair.map((fieldName, j) => {
          const label =
            labelOverrides[fieldName] || student?.[`fieldkey_${fieldName}`] || fieldName;
          const value = formatAdmitValue(
            fieldName,
            getFieldValue(student || {}, fieldName, lang),
            lang
          );
          const lastCell = j === pair.length - 1;

          return (
            <React.Fragment key={fieldName}>
              <div
                className="flex shrink-0 items-center overflow-hidden px-[5px]"
                style={{
                  width: labelW,
                  background: labelBg,
                  borderRight: `1px solid ${grid}`,
                  color: labelColor,
                  fontSize: `${labelFont}px`,
                }}
                dir={dir}
              >
                <span className="truncate">{label}</span>
              </div>
              <div
                className="flex min-w-0 flex-1 items-center overflow-hidden px-[5px]"
                style={{
                  borderRight: lastCell ? 'none' : `1px solid ${grid}`,
                  color: valueColor,
                  fontSize: `${valueFont}px`,
                  fontWeight: 600,
                }}
                dir={dir}
              >
                <span className="truncate">{value}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    ))}
  </>
);

/** আসনের ঘর — শিরোনামের পট্টি, নিচে হল/কলাম/সারি/আসন */
const SeatPanel = ({ title, text, primary, gold, grid, bg, height, z, dir, style }) => (
  <div
    className="absolute overflow-hidden"
    dir={dir}
    style={{ border: `1px solid ${grid}`, background: bg, height, ...style }}
  >
    <div className="flex items-center px-2" style={{ height: 17, background: primary }}>
      <p className="font-bold leading-none" style={{ color: gold, fontSize: 9 }}>
        {title}
      </p>
    </div>
    <div
      className="flex items-center justify-center px-2"
      style={{ height: height - 17 }}
    >
      <p
        className="truncate text-center font-bold"
        style={{ color: primary, fontSize: Math.round(12 * z * 10) / 10 }}
        title={text}
      >
        {text}
      </p>
    </div>
  </div>
);

/**
 * নির্দেশাবলীর ঘর — শিরোনাম, নিচে দুই কলামে নম্বরসহ লাইনগুলো।
 * বাঁ কলামে প্রথম অর্ধেক, ডান কলামে বাকিটা — কাগজে এভাবেই পড়তে সুবিধা।
 */
const RulesPanel = ({
  title,
  rules,
  lang,
  dir,
  primary,
  gold,
  grid,
  bg,
  height,
  style,
  // "লেখার মাপ" মাস্টার কন্ট্রোল — কার্ডের বাকি লেখার মতো নির্দেশাবলীও
  // এতে ছোট-বড় হয়। আগে মাপগুলো স্থির ছিল, তাই এই ঘরটাই কেবল বদলাত না।
  z = 1,
}) => {
  const list = rules?.[lang] || rules?.bn || [];
  if (!list.length) return null;
  const half = Math.ceil(list.length / 2);

  const titleFont = Math.round(15 * z * 10) / 10;
  const titleH = Math.max(13, Math.round(titleFont + 6));
  const lineFont = Math.round(11 * z * 10) / 10;
  const lineH = Math.max(9, Math.round(lineFont + 3));

  return (
    <div
      className="absolute overflow-hidden"
      dir={dir}
      style={{ border: `1px solid ${grid}`, background: bg, height, ...style }}
    >
      <div className="flex items-center justify-center" style={{ height: titleH }}>
        <p
          className="font-bold leading-none"
          style={{ color: primary, fontSize: titleFont }}
        >
          <span style={{ color: gold }}>◆</span> {title}{' '}
          <span style={{ color: gold }}>◆</span>
        </p>
      </div>

      <div className="flex gap-3 px-2" style={{ height: height - titleH }}>
        {[list.slice(0, half), list.slice(half)].map((col, ci) => (
          <ol key={ci} className="min-w-0 flex-1">
            {col.map((line, li) => (
              <li
                key={li}
                className="flex gap-1"
                style={{ color: '#1f2937', fontSize: lineFont, lineHeight: `${lineH}px` }}
              >
                <span className="shrink-0" style={{ color: primary }}>
                  {toLangDigit(ci * half + li + 1, lang)}.
                </span>
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </div>
  );
};

/** নিচের সারি — মাঝে QR, দুই পাশে স্বাক্ষর */
const SignRow = ({
  top,
  height,
  left,
  right,
  qrValue,
  qrSize,
  qrColor,
  lineColor,
  nameColor,
  z,
  // স্বাক্ষর ও QR এর উপর-নিচ সরণ — সেটিংয়ের স্লাইডার থেকে।
  // translate দিয়ে সরে, জায়গা দখল করে না; তাই একটা নাড়ালে অন্যটা
  // নিজের জায়গাতেই থাকে।
  qrShiftY = 0,
  signShiftY = 0,
  blocks,
}) => (
  <div className="absolute" style={{ left, right, top, height }}>
    {qrValue ? (
      <div
        className="flex justify-center"
        style={{ transform: qrShiftY ? `translateY(${qrShiftY}px)` : undefined }}
      >
        <QRCode
          value={qrValue}
          size={qrSize}
          level="M"
          bgColor="#ffffff"
          fgColor={qrColor}
          viewBox="0 0 256 256"
          style={{ width: qrSize * z, height: qrSize * z, display: 'block' }}
        />
      </div>
    ) : null}

    <div
      className="absolute bottom-0 left-0 right-0 flex items-end justify-between"
      style={{ transform: signShiftY ? `translateY(${signShiftY}px)` : undefined }}
    >
      {blocks.map((s, i) => (
        <div
          key={i}
          className="w-[140px] text-center"
          style={{
            transform: z !== 1 ? `scale(${z})` : undefined,
            transformOrigin: i === 0 ? 'bottom left' : 'bottom right',
          }}
        >
          {s.on ? (
            <div className="flex h-[18px] items-end justify-center">
              {s.img ? (
                <img src={s.img} alt="" className="max-h-[26px] object-contain" />
              ) : null}
            </div>
          ) : null}
          {s.nameOn ? (
            <p
              className="pt-[2px] leading-tight"
              style={{
                borderTop: `1px solid ${lineColor}`,
                color: nameColor,
                fontSize: 8.5,
              }}
            >
              {s.name}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// ১) ClassicAdmitFace — লোগো ও নাম উপরে মাঝ বরাবর, নিচে ব্যাজ।
//
// তিনটা ফ্রেমের ধরন (`chrome`):
//   'gold'   → দুইটা সোনালী রেখার ফ্রেম, ক্রিম রঙের পট
//   'ornate' → মোটা রঙিন + সোনালী + সরু রঙিন, চার কোনায় সোনালী বর্গ
//   'arch'   → পুরো কার্ড গাঢ় রঙে, ভিতরে সাদা গোল-কোনা ঘর, উপরে
//              সোনালী খিলানের রেখা
// ---------------------------------------------------------------------------
export const ClassicAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const chrome = t.chrome || 'gold';
  const arch = chrome === 'arch';

  const PAD = 10;
  const LOGO = 34;
  const ROW_H = 20;
  const PHOTO_W = 56;
  const PHOTO_H = 66;
  const FOOT_H = 50;

  // খিলানের ডিজাইনে ভিতরের সাদা ঘরটা যেখান থেকে শুরু
  const panelTop = 108;

  // ---- হেডারের উচ্চতা — ফন্টের মাপ থেকেই হিসাব
  //
  // আগে "প্রবেশপত্র" ব্যাজটা হেডারের কলামে বসত, আর পরীক্ষার নাম বসত
  // আলাদা করে স্থির জায়গায় (infoTop − 22)। নাম বা ঠিকানার মাপ একটু
  // বাড়লেই হেডারটা লম্বা হয়ে ঐ স্থির জায়গাটা ছাড়িয়ে যেত — তখন ব্যাজ
  // আর পরীক্ষার নাম একটার উপর আরেকটা পড়ত।
  //
  // এখন পরীক্ষার নামটাও হেডারের ঐ একই কলামেই পরপর বসে, তাই ওরা কখনো
  // একটার উপর আরেকটা পড়ে না। আর তথ্যের ঘরটা শুরু হয় হেডার যেখানে শেষ
  // হয় তার নিচ থেকে — মাপ যাই হোক, ফাঁকটা ঠিক থাকে।
  const HEAD_TOP = 14;
  const BADGE_H = 15;                       // py-[2px] × ২ + ১১px লেখা
  // leading-tight মানে ১.২৫, কিন্তু বাংলার মাত্রা ও কার লাইনের বাক্সের
  // বাইরেও একটু ঝোলে — তাই হিসাবটা একটু উদার (১.৩৫), নইলে পরীক্ষার নামের
  // নিচের অংশ তথ্যের ঘরের উপরের রেখা ছুঁয়ে ফেলত।
  const lineOf = (n) => Math.round((Number(n) || 0) * 1.35);

  // লোগোটা এখন কলামের ভিতরে নেই — কার্ডের বাঁ কোনায় আলাদা করে বসে।
  // তাই তার উচ্চতাটা আর হিসাবেও ধরা হয় না, আর নাম-ঠিকানা-ব্যাজ-পরীক্ষার
  // নাম সবাই ঐ জায়গাটুকু উপরে উঠে আসে।
  const headH =
    lineOf(t.nameSize || 17) +              // নাম
    lineOf(t.addressSize || 9) +            // ঠিকানা
    4 + BADGE_H +                           // mt-1 + ব্যাজ
    (c.examLine ? 4 + lineOf(t.examNameSize || 12) : 0);

  const HEAD_GAP = 12;   // হেডার শেষ হওয়ার পর তথ্যের ঘর শুরুর আগের ফাঁক

  // খিলানের ডিজাইনে ভিতরের সাদা ঘরটা panelTop থেকে শুরু, তাই সেখানে
  // তথ্যের ঘর তার উপরে উঠতে পারে না। বাকি দুই ফ্রেমে ঐ বাধা নেই —
  // হেডার যেখানে শেষ, তার ঠিক নিচ থেকেই শুরু।
  const headEnd = HEAD_TOP + headH + HEAD_GAP;
  const infoTop = arch ? Math.max(panelTop + 10, headEnd) : headEnd;

  // লোগোর নিজের জায়গা — বাঁ কোনায়। টেমপ্লেটে logoTopPx / logoLeftPx
  // দিলে কেবল ঐ ডিজাইনেই সরবে, অন্য কোথাও কোনো প্রভাব নেই।
  const logoTop = t.logoTopPx ?? HEAD_TOP + 2;
  const logoLeft = t.logoLeftPx ?? PAD + 8;

  // লেখাগুলো কার্ডের ঠিক মাঝ বরাবরই থাকবে, তাই দুই পাশেই সমান জায়গা
  // ছাড়া হয় — নইলে লম্বা নাম লোগোর গায়ে গিয়ে উঠত।
  const headSide = PAD + 10 + (c.logo ? LOGO + 6 : 0);
  const tableH = Math.max(c.rows.length * ROW_H, ROW_H);
  const infoH = Math.max(tableH, c.photoEnabled ? PHOTO_H : 0);

  const footTop = cardH - PAD - FOOT_H - (arch ? 6 : 0);
  const seatTop = infoTop + infoH + 8 + (Number(props.seatOffsetY) || 0);
  const seatH = Math.min(Math.max(footTop - 6 - seatTop, 0), 52);

  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  const tableLeft = PAD + (c.photoEnabled ? PHOTO_W + 10 : 6);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#ffffff' }}
    >
      {/* ----------------------------------------------------------- ফ্রেম */}
      {chrome === 'gold' ? (
        <>
          <div className="absolute" style={{ inset: 6, border: `2px solid ${gold}` }} />
          <div className="absolute" style={{ inset: 12, border: `1px solid ${gold}` }} />
        </>
      ) : null}

      {chrome === 'ornate' ? (
        <>
          <div className="absolute" style={{ inset: 5, border: `3px solid ${primary}` }} />
          <div className="absolute" style={{ inset: 11, border: `1px solid ${gold}` }} />
          <div className="absolute" style={{ inset: 15, border: `1px solid ${primary}` }} />
          {[
            { top: 9, left: 9 },
            { top: 9, right: 9 },
            { bottom: 9, left: 9 },
            { bottom: 9, right: 9 },
          ].map((p2, i) => (
            <div
              key={i}
              className="absolute"
              style={{ ...p2, width: 12, height: 12, background: gold }}
            />
          ))}
        </>
      ) : null}

      {arch ? (
        <>
          {/* সোনালী খিলানের রেখা — উপরের দিকটা গোল, নিচের দিকটা খোলা */}
          <div
            className="absolute"
            style={{
              left: 26,
              right: 26,
              top: 12,
              height: 120,
              border: `1.5px solid ${gold}`,
              borderBottom: 'none',
              borderTopLeftRadius: 120,
              borderTopRightRadius: 120,
            }}
          />
          {/* ভিতরের সাদা ঘর — তথ্য, আসন ও স্বাক্ষর সবই এর উপরে বসে */}
          <div
            className="absolute"
            style={{
              left: PAD + 4,
              right: PAD + 4,
              top: panelTop - 8,
              bottom: PAD + 4,
              background: '#ffffff',
              borderRadius: 10,
            }}
          />
        </>
      ) : null}

      <Watermark src={c.watermark} t={t} />

      {/* ------------------------------------------- লোগো — বাঁ কোনায় */}
      {c.logo ? (
        <img
          src={c.logo}
          alt=""
          className="absolute rounded-full bg-white object-contain"
          style={{ left: logoLeft, top: logoTop, width: LOGO, height: LOGO }}
        />
      ) : null}

      {/* ------------------------------------------- হেডার: নাম, ব্যাজ */}
      <div
        className="absolute flex flex-col items-center"
        dir={dir}
        style={{ left: headSide, right: headSide, top: HEAD_TOP }}
      >
        <p
          className="w-full truncate text-center font-bold leading-tight"
          style={{ color: t.nameColor || primary, fontSize: `${t.nameSize || 17}px` }}
        >
          {props.student?.institute_name || props.inName}
        </p>
        <p
          className="w-full truncate text-center leading-tight"
          style={{
            color: t.addressColor || '#6b7280',
            fontSize: `${t.addressSize || 9}px`,
          }}
        >
          {props.student?.institute_address || props.inAddress}
        </p>

        {/* ব্যাজ — "প্রবেশপত্র" */}
        <div
          className="mt-1 rounded-full px-4 py-[2px]"
          style={{ background: gold }}
        >
          <span
            className="font-bold leading-none"
            style={{ color: t.ribbonColor || '#ffffff', fontSize: 11 }}
          >
            {getAdmitText('ribbon', lang)}
          </span>
        </div>

        {/* --------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ
            ব্যাজের ঠিক নিচে, একই কলামে। আগে এটা আলাদা absolute ঘরে ছিল
            বলে বড় ফন্টে ব্যাজের গায়ে উঠে যেত। */}
        {c.examLine ? (
          <p
            className="mt-1 w-full truncate text-center font-bold leading-tight"
            style={{
              color: arch ? primary : t.examNameColor || primary,
              fontSize: `${t.examNameSize || 12}px`,
            }}
          >
            {c.examLine}
          </p>
        ) : null}
      </div>

      {/* ----------------------------------------------------------- ছবি */}
      {c.photoEnabled ? (
        <div
          className="absolute overflow-hidden bg-slate-100"
          style={{
            left: PAD + 6,
            top: infoTop,
            width: PHOTO_W,
            height: PHOTO_H,
            border: `1px solid ${t.photoBorder || grid}`,
          }}
        >
          {c.photo ? (
            <img src={c.photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      ) : null}

      {/* ------------------------------------------------------- তথ্যের ঘর */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: tableLeft,
          right: PAD + 6,
          top: infoTop,
          height: infoH,
          border: `1px solid ${grid}`,
        }}
      >
        <InfoTable
          rows={c.rows}
          student={props.student}
          lang={lang}
          dir={dir}
          labelOverrides={props.labelOverrides}
          grid={grid}
          labelBg={labelBg}
          labelColor={t.labelColor || '#4b5563'}
          valueColor={t.valueColor || '#111827'}
          labelFont={labelFont}
          valueFont={valueFont}
          rowH={ROW_H}
        />
      </div>

      {/* ------------------------------------------------------ আসনের ঘর */}
      {!compact && c.seatOn && seatH > 28 ? (
        <SeatPanel
          title={layoutText('seatTitle', lang)}
          text={props.seatText}
          primary={primary}
          gold={gold}
          grid={grid}
          bg={arch ? '#f8fafc' : labelBg}
          height={seatH}
          z={z}
          dir={dir}
          style={{ left: PAD + 6, right: PAD + 6, top: seatTop }}
        />
      ) : null}

      {/* -------------------------------------------------- QR ও স্বাক্ষর */}
      <SignRow
        top={footTop}
        height={FOOT_H}
        left={PAD + 6}
        right={PAD + 6}
        qrValue={c.qrValue}
        qrSize={t.qrSize || 38}
        qrColor={primary}
        lineColor={t.signLineColor || primary}
        nameColor={t.labelColor || '#374151'}
        z={z}
        qrShiftY={c.qrShiftY}
        signShiftY={c.signShiftY}
        blocks={[
          {
            img: c.najemSignature,
            on: c.najemSignOn,
            nameOn: c.najemNameOn,
            name: props.student?.NajemName || getAdmitText('najem', lang),
          },
          {
            img: c.principalSignature,
            on: c.principalSignOn,
            nameOn: c.principalNameOn,
            name: props.student?.PrincipalName || getAdmitText('principal', lang),
          },
        ]}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ২) ModernAdmitFace — উপরে রঙিন ব্যান্ড, নিচে গোল কোনার সাদা ঘর।
//
// ছাপার সময় ব্রাউজারের "Background graphics" বন্ধ থাকলে রঙিন ব্যান্ডটা
// ছাপে না — তাই ব্যান্ডের লেখাগুলোর নিচে আলাদা করে কোনো রেখা রাখা
// হয়েছে, যাতে রঙ না ছাপলেও হেডারটা ফাঁকা মনে না হয়।
// ---------------------------------------------------------------------------
export const ModernAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const PAD = 8;
  const BAND_H = 66;
  const ROW_H = 20;
  const PHOTO_W = 58;
  const PHOTO_H = 68;
  const FOOT_H = 50;

  const infoTop = PAD + BAND_H + 14;
  const tableH = Math.max(c.rows.length * ROW_H, ROW_H);
  const infoH = Math.max(tableH, c.photoEnabled ? PHOTO_H : 0);

  const footTop = cardH - PAD - FOOT_H;
  const seatTop = infoTop + infoH + 8 + (Number(props.seatOffsetY) || 0);
  const seatH = Math.min(Math.max(footTop - 6 - seatTop, 0), 52);

  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#ffffff' }}
    >
      {/* নিচের পাতলা রঙিন পট্টি — কার্ডটা শেষ হলো বোঝা যায় */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 6, background: primary }}
      />

      <Watermark src={c.watermark} t={t} />

      {/* ------------------------------------------------------ রঙিন ব্যান্ড */}
      <div
        className="absolute flex items-center gap-2 px-3"
        style={{
          left: PAD,
          right: PAD,
          top: PAD,
          height: BAND_H,
          background: primary,
          borderRadius: 10,
        }}
      >
        {c.logo ? (
          <img
            src={c.logo}
            alt=""
            className="h-[44px] w-[44px] shrink-0 rounded-full bg-white object-contain"
          />
        ) : null}

        <div className="min-w-0 flex-1" dir={dir}>
          <p
            className="truncate font-bold leading-tight"
            style={{ color: t.nameColor || '#ffffff', fontSize: `${t.nameSize || 17}px` }}
          >
            {props.student?.institute_name || props.inName}
          </p>
          <p
            className="truncate leading-tight"
            style={{
              color: t.addressColor || '#d1fae5',
              fontSize: `${t.addressSize || 9}px`,
            }}
          >
            {props.student?.institute_address || props.inAddress}
          </p>
        </div>

        <div
          className="shrink-0 rounded-full px-3 py-[3px]"
          style={{ border: `1px solid ${gold}` }}
        >
          <span className="font-bold leading-none" style={{ color: gold, fontSize: 10 }}>
            {getAdmitText('ribbon', lang)}
          </span>
        </div>
      </div>

      {/* ------------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ */}
      {c.examLine ? (
        <div
          className="absolute flex items-center justify-center px-6"
          dir={dir}
          style={{ left: PAD, right: PAD, top: PAD + BAND_H + 1, height: 16 }}
        >
          <p
            className="truncate text-center font-bold"
            style={{
              color: t.examNameColor || primary,
              fontSize: `${t.examNameSize || 12}px`,
            }}
          >
            {c.examLine}
          </p>
        </div>
      ) : null}

      {/* ----------------------------------------------------------- ছবি */}
      {c.photoEnabled ? (
        <div
          className="absolute overflow-hidden bg-slate-100"
          style={{
            left: PAD + 6,
            top: infoTop,
            width: PHOTO_W,
            height: PHOTO_H,
            borderRadius: 8,
            border: `1px solid ${t.photoBorder || grid}`,
          }}
        >
          {c.photo ? (
            <img src={c.photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      ) : null}

      {/* ------------------------------------------------------- তথ্যের ঘর */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: PAD + (c.photoEnabled ? PHOTO_W + 12 : 6),
          right: PAD + 6,
          top: infoTop,
          height: infoH,
          border: `1px solid ${grid}`,
          borderRadius: 8,
        }}
      >
        <InfoTable
          rows={c.rows}
          student={props.student}
          lang={lang}
          dir={dir}
          labelOverrides={props.labelOverrides}
          grid={grid}
          labelBg={labelBg}
          labelColor={t.labelColor || '#4b5563'}
          valueColor={t.valueColor || '#111827'}
          labelFont={labelFont}
          valueFont={valueFont}
          rowH={ROW_H}
        />
      </div>

      {/* ------------------------------------------------------ আসনের ঘর */}
      {!compact && c.seatOn && seatH > 28 ? (
        <SeatPanel
          title={layoutText('seatTitle', lang)}
          text={props.seatText}
          primary={primary}
          gold={gold}
          grid={grid}
          bg={labelBg}
          height={seatH}
          z={z}
          dir={dir}
          style={{ left: PAD + 6, right: PAD + 6, top: seatTop, borderRadius: 8 }}
        />
      ) : null}

      {/* -------------------------------------------------- QR ও স্বাক্ষর */}
      <SignRow
        top={footTop}
        height={FOOT_H - 8}
        left={PAD + 6}
        right={PAD + 6}
        qrValue={c.qrValue}
        qrSize={t.qrSize || 38}
        qrColor={primary}
        lineColor={t.signLineColor || primary}
        nameColor={t.labelColor || '#374151'}
        z={z}
        qrShiftY={c.qrShiftY}
        signShiftY={c.signShiftY}
        blocks={[
          {
            img: c.najemSignature,
            on: c.najemSignOn,
            nameOn: c.najemNameOn,
            name: props.student?.NajemName || getAdmitText('najem', lang),
          },
          {
            img: c.principalSignature,
            on: c.principalSignOn,
            nameOn: c.principalNameOn,
            name: props.student?.PrincipalName || getAdmitText('principal', lang),
          },
        ]}
      />

      {c.stampDate ? (
        <p
          className="absolute"
          style={{
            right: PAD + 8,
            top: footTop - 12,
            color: t.labelColor || '#64748b',
            fontSize: 7.5,
          }}
        >
          {getAdmitText('dateLabel', lang)} : {c.stampDate}
        </p>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ৩) ProfileAdmitFace — শিক্ষার্থীর নামটাই সবচেয়ে বড়।
//
// উপরে সবুজ ঢালের ব্যান্ড, নিচে একটা সাদা গোল-কোনা ঘরে ছবি ও নাম,
// তারপর চারটা ছোট বাক্সের সারি (প্রথমটা আসনের, রঙিন), আর তার নিচে
// বাকি তথ্যগুলো।
//
// ফিল্ডগুলো কোথায় বসবে তা ঠিক হয় বাছাইয়ের ক্রম ধরে — নাম ও পিতার নাম
// উপরে আলাদা করে বসে (ওই দুইটা সব কার্ডেই লাগে), বাকিগুলোর প্রথম দুইটা
// চিপে, পরের তিনটা বাক্সে, তারপরেরগুলো নিচের ঘরে। তাই কোনো ফিল্ডের নাম
// কোডে লেখা নেই; ইউজার যা বাছবেন তাই বসবে।
// ---------------------------------------------------------------------------
export const ProfileAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const PAD = 8;
  const BAND_H = 60;
  const CARD_TOP = PAD + BAND_H + 8;
  const CARD_H2 = 84;
  const BOX_H = 36;
  const ROW_H = 20;
  const FOOT_H = 50;
  const PHOTO_W = 56;
  const PHOTO_H = 64;

  const picked = (props.fields || []).filter(Boolean);
  // নাম ও পিতার নাম উপরে আলাদা করে বসে, তাই বাকিগুলো নিয়ে কাজ
  const rest = picked.filter((f) => f !== 'StudentName' && f !== 'FatherName');
  const chips = rest.slice(0, 2);
  const boxFields = rest.slice(2, 5);
  const tableFields = rest.slice(5);
  const tableRows = pairUp(tableFields);

  const valueOf = (f) =>
    formatAdmitValue(f, getFieldValue(props.student || {}, f, lang), lang);
  const labelOf = (f) =>
    props.labelOverrides?.[f] || props.student?.[`fieldkey_${f}`] || f;

  const boxesTop = CARD_TOP + CARD_H2 + 8;
  const infoTop = boxesTop + BOX_H + 8 + (Number(props.seatOffsetY) || 0);
  const footTop = cardH - PAD - FOOT_H;
  const infoH = Math.min(
    Math.max(footTop - 8 - infoTop, 0),
    Math.max(tableRows.length * ROW_H, 0) + 2
  );

  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  // চারটা বাক্স — প্রথমটা আসনের (রঙিন), বাকিগুলো বাছা ফিল্ডের
  const boxes = [
    ...(c.seatOn
      ? [{ label: layoutText('seatTitle', lang), value: props.seatText, fill: true }]
      : []),
    ...boxFields.map((f) => ({ label: labelOf(f), value: valueOf(f), fill: false })),
  ].slice(0, 4);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#f8fafc' }}
    >
      {/* একদম নিচে পাতলা রঙিন পট্টি */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 6, background: primary }}
      />

      <Watermark src={c.watermark} t={t} />

      {/* ------------------------------------------------- সবুজ ঢালের ব্যান্ড */}
      <div
        className="absolute flex items-center gap-2 px-3"
        style={{
          left: PAD,
          right: PAD,
          top: PAD,
          height: BAND_H,
          background: `linear-gradient(135deg, ${t.primaryDark || primary} 0%, ${primary} 100%)`,
          borderRadius: 12,
        }}
      >
        {c.logo ? (
          <img
            src={c.logo}
            alt=""
            className="h-[40px] w-[40px] shrink-0 rounded-full bg-white object-contain"
          />
        ) : null}

        <div className="min-w-0 flex-1" dir={dir}>
          <p
            className="truncate font-bold leading-tight"
            style={{ color: t.nameColor || '#ffffff', fontSize: `${t.nameSize || 15}px` }}
          >
            {props.student?.institute_name || props.inName}
          </p>
          <p
            className="truncate leading-tight"
            style={{
              color: t.addressColor || '#d1fae5',
              fontSize: `${t.addressSize || 8}px`,
            }}
          >
            {props.student?.institute_address || props.inAddress}
          </p>
        </div>

        <div
          className="shrink-0 rounded-full bg-white px-3 py-[3px]"
          style={{ border: `1px solid ${gold}` }}
        >
          <span className="font-bold leading-none" style={{ color: primary, fontSize: 10 }}>
            {getAdmitText('ribbon', lang)}
          </span>
        </div>
      </div>

      {/* --------------------------------------- সাদা ঘর: ছবি, পরীক্ষা, নাম */}
      <div
        className="absolute flex gap-3 px-3 py-2"
        dir={dir}
        style={{
          left: PAD + 6,
          right: PAD + 6,
          top: CARD_TOP,
          height: CARD_H2,
          background: '#ffffff',
          border: `1px solid ${grid}`,
          borderRadius: 12,
        }}
      >
        {c.photoEnabled ? (
          <div
            className="shrink-0 overflow-hidden bg-slate-100"
            style={{
              width: PHOTO_W,
              height: PHOTO_H,
              borderRadius: 8,
              border: `1px solid ${t.photoBorder || grid}`,
            }}
          >
            {c.photo ? (
              <img src={c.photo} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {c.examLine ? (
            <p
              className="truncate font-bold leading-tight"
              style={{
                color: t.examNameColor || primary,
                fontSize: `${t.examNameSize || 11}px`,
              }}
            >
              {c.examLine}
            </p>
          ) : null}

          <p
            className="truncate font-bold leading-tight"
            style={{ color: t.valueColor || '#111827', fontSize: Math.round(15 * z) }}
          >
            {getFieldValue(props.student || {}, 'StudentName', lang)}
          </p>

          <p
            className="truncate leading-tight"
            style={{ color: t.labelColor || '#6b7280', fontSize: 9 }}
          >
            {labelOf('FatherName')} : {valueOf('FatherName')}
          </p>

          {/* চিপ — বাছা ফিল্ডের প্রথম দুইটা */}
          {chips.length ? (
            <div className="mt-[3px] flex gap-1.5 overflow-hidden">
              {chips.map((f) => (
                <span
                  key={f}
                  className="truncate rounded-full px-2 py-[1px]"
                  style={{ background: labelBg, color: primary, fontSize: 8.5 }}
                >
                  {labelOf(f)} : {valueOf(f)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ------------------------------------------------- চারটা ছোট বাক্স */}
      {boxes.length ? (
        <div
          className="absolute flex gap-[6px]"
          dir={dir}
          style={{ left: PAD + 6, right: PAD + 6, top: boxesTop, height: BOX_H }}
        >
          {boxes.map((b, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden px-2"
              style={{
                background: b.fill ? primary : '#ffffff',
                border: `1px solid ${b.fill ? primary : grid}`,
                borderRadius: 8,
              }}
              title={b.value}
            >
              <p
                className="truncate leading-tight"
                style={{
                  color: b.fill ? gold : t.labelColor || '#6b7280',
                  fontSize: 7.5,
                }}
              >
                {b.label}
              </p>
              <p
                className="truncate font-bold leading-tight"
                style={{
                  color: b.fill ? '#ffffff' : t.valueColor || '#111827',
                  fontSize: Math.round(11 * z * 10) / 10,
                }}
              >
                {b.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* ------------------------------------------- বাকি তথ্য (শুধু A5) */}
      {!compact && tableRows.length && infoH > ROW_H - 2 ? (
        <div
          className="absolute overflow-hidden"
          style={{
            left: PAD + 6,
            right: PAD + 6,
            top: infoTop,
            height: infoH,
            background: '#ffffff',
            border: `1px solid ${grid}`,
            borderRadius: 8,
          }}
        >
          <InfoTable
            rows={tableRows}
            student={props.student}
            lang={lang}
            dir={dir}
            labelOverrides={props.labelOverrides}
            grid={grid}
            labelBg={labelBg}
            labelColor={t.labelColor || '#4b5563'}
            valueColor={t.valueColor || '#111827'}
            labelFont={labelFont}
            valueFont={valueFont}
            rowH={ROW_H}
          />
        </div>
      ) : null}

      {/* -------------------------------------------------- QR ও স্বাক্ষর */}
      <SignRow
        top={footTop}
        height={FOOT_H - 8}
        left={PAD + 6}
        right={PAD + 6}
        qrValue={c.qrValue}
        qrSize={t.qrSize || 38}
        qrColor={primary}
        lineColor={t.signLineColor || primary}
        nameColor={t.labelColor || '#374151'}
        z={z}
        qrShiftY={c.qrShiftY}
        signShiftY={c.signShiftY}
        blocks={[
          {
            img: c.najemSignature,
            on: c.najemSignOn,
            nameOn: c.najemNameOn,
            name: props.student?.NajemName || getAdmitText('najem', lang),
          },
          {
            img: c.principalSignature,
            on: c.principalSignOn,
            nameOn: c.principalNameOn,
            name: props.student?.PrincipalName || getAdmitText('principal', lang),
          },
        ]}
      />

      {c.stampDate ? (
        <p
          className="absolute"
          style={{
            right: PAD + 8,
            top: footTop - 12,
            color: t.labelColor || '#64748b',
            fontSize: 7.5,
          }}
        >
          {getAdmitText('dateLabel', lang)} : {c.stampDate}
        </p>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ৪) RoyalAdmitFace — সবুজ-সোনালী কারুকাজের ফ্রেম।
//
// উপরে বিসমিল্লাহ, প্রতিষ্ঠানের নাম ও ঠিকানা মাঝ বরাবর, নিচে গাঢ় সবুজ
// ব্যাজ। বাঁয়ে খিলান-আকারের ছবির ঘর, ডানে বর্ডার দেওয়া তথ্যের ঘর।
// তার নিচে আসনের পট্টি ও নির্দেশাবলী, একদম নিচে QR, দুআ ও স্বাক্ষর।
// ---------------------------------------------------------------------------
export const RoyalAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const PAD = 16;
  const ROW_H = 20;
  const PHOTO_W = 52;
  const PHOTO_H = 64;
  const SEAT_H = 18;
  const FOOT_H = 44;

  const bodyTop = 128;
  const tableH = Math.max(c.rows.length * ROW_H, ROW_H);
  const infoH = Math.max(tableH, c.photoEnabled ? PHOTO_H : 0);

  const footTop = cardH - PAD - FOOT_H;
  const seatTop = bodyTop + infoH + 6 + (Number(props.seatOffsetY) || 0);
  const seatOn = !compact && c.seatOn;
  const rulesTop = seatTop + (seatOn ? SEAT_H + 6 : 0);
  const rulesH = Math.max(footTop - 6 - rulesTop, 0);

  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#fffdf8' }}
    >
      {/* ------------------------------------------------ কারুকাজের ফ্রেম */}
      <div className="absolute" style={{ inset: 4, border: `3px solid ${primary}` }} />
      <div className="absolute" style={{ inset: 10, border: `2px solid ${gold}` }} />
      <div className="absolute" style={{ inset: 14, border: `1px solid ${primary}` }} />

      {/* চার কোনায় সোনালী পদক */}
      {[
        { top: 2, left: 2 },
        { top: 2, right: 2 },
        { bottom: 2, left: 2 },
        { bottom: 2, right: 2 },
      ].map((p2, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            ...p2,
            width: 26,
            height: 26,
            background: gold,
            border: `2px solid ${primary}`,
          }}
        >
          <span style={{ color: primary, fontSize: 9 }}>✦</span>
        </div>
      ))}

      <Watermark src={c.watermark} t={t} />

      {/* ------------------------------------------- বিসমিল্লাহ, নাম, ঠিকানা */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: PAD + 14, right: PAD + 14, top: 20 }}
      >
        <p className="leading-none" style={{ color: primary, fontSize: 9 }}>
          {BISMILLAH}
        </p>

        <p
          className="mt-1 w-full text-center font-bold leading-tight"
          dir={dir}
          style={{
            color: t.nameColor || primary,
            fontSize: `${t.nameSize || 15}px`,
            maxHeight: 34,
            overflow: 'hidden',
          }}
        >
          {props.student?.institute_name || props.inName}
        </p>

        <p
          className="w-full text-center leading-tight"
          dir={dir}
          style={{
            color: t.addressColor || '#6b7280',
            fontSize: `${t.addressSize || 7.5}px`,
            maxHeight: 18,
            overflow: 'hidden',
          }}
        >
          {props.student?.institute_address || props.inAddress}
        </p>

        {/* ব্যাজ — গাঢ় সবুজ পটে সোনালী রেখা */}
        <div
          className="mt-1 flex items-baseline gap-2 rounded-full px-5 py-[3px]"
          style={{ background: primary, border: `1.5px solid ${gold}` }}
        >
          <span className="font-bold leading-none" style={{ color: gold, fontSize: 11 }}>
            {getAdmitText('ribbon', lang)}
          </span>
          <span className="leading-none" style={{ color: '#ffffff', fontSize: 9 }}>
            {layoutText('subTitle', lang)}
          </span>
        </div>
      </div>

      {/* ------------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ */}
      {c.examLine ? (
        <div
          className="absolute flex items-center justify-center px-8"
          dir={dir}
          style={{ left: PAD, right: PAD, top: bodyTop - 20, height: 16 }}
        >
          <p
            className="truncate text-center font-bold"
            style={{
              color: t.examNameColor || primary,
              fontSize: `${t.examNameSize || 11}px`,
            }}
          >
            {c.examLine}
          </p>
        </div>
      ) : null}

      {/* --------------------------------------------- খিলান আকারের ছবির ঘর */}
      {c.photoEnabled ? (
        <div
          className="absolute overflow-hidden bg-slate-100"
          style={{
            left: PAD + 6,
            top: bodyTop,
            width: PHOTO_W,
            height: PHOTO_H,
            border: `1px solid ${t.photoBorder || grid}`,
            borderTopLeftRadius: PHOTO_W / 2,
            borderTopRightRadius: PHOTO_W / 2,
          }}
        >
          {c.photo ? (
            <img src={c.photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      ) : null}

      {/* ------------------------------------------------------- তথ্যের ঘর */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: PAD + (c.photoEnabled ? PHOTO_W + 12 : 6),
          right: PAD + 6,
          top: bodyTop,
          height: infoH,
          border: `1px solid ${grid}`,
        }}
      >
        <InfoTable
          rows={c.rows}
          student={props.student}
          lang={lang}
          dir={dir}
          labelOverrides={props.labelOverrides}
          grid={grid}
          labelBg={labelBg}
          labelColor={t.labelColor || '#4b5563'}
          valueColor={t.valueColor || '#111827'}
          labelFont={labelFont}
          valueFont={valueFont}
          rowH={ROW_H}
        />
      </div>

      {/* ------------------------------------------------- আসনের এক পট্টি */}
      {seatOn ? (
        <div
          className="absolute flex items-center justify-center px-2"
          dir={dir}
          style={{
            left: PAD + 6,
            right: PAD + 6,
            top: seatTop,
            height: SEAT_H,
            background: labelBg,
            border: `1px solid ${gold}`,
          }}
        >
          <p
            className="truncate font-bold leading-none"
            style={{ color: primary, fontSize: Math.round(9.5 * z * 10) / 10 }}
            title={props.seatText}
          >
            {layoutText('seatTitle', lang)} — {props.seatText}
          </p>
        </div>
      ) : null}

      {/* ------------------------------------------------- নির্দেশাবলী */}
      {!compact && rulesH > 40 ? (
        <RulesPanel
          title={layoutText('rulesTitle', lang)}
          rules={t.rules || DEFAULT_ADMIT_RULES}
          lang={lang}
          dir={dir}
          primary={primary}
          gold={gold}
          grid={grid}
          bg="transparent"
          z={z}
          height={Math.min(rulesH, 96)}
          style={{ left: PAD + 6, right: PAD + 6, top: rulesTop, border: 'none' }}
        />
      ) : null}

      {/* -------------------------------------------------- QR ও স্বাক্ষর */}
      <SignRow
        top={footTop}
        height={FOOT_H}
        left={PAD + 6}
        right={PAD + 6}
        qrValue={c.qrValue}
        qrSize={t.qrSize || 34}
        qrColor={primary}
        lineColor={t.signLineColor || primary}
        nameColor={t.labelColor || '#374151'}
        z={z}
        qrShiftY={c.qrShiftY}
        signShiftY={c.signShiftY}
        blocks={[
          {
            img: c.najemSignature,
            on: c.najemSignOn,
            nameOn: c.najemNameOn,
            name: props.student?.NajemName || getAdmitText('najem', lang),
          },
          {
            img: c.principalSignature,
            on: c.principalSignOn,
            nameOn: c.principalNameOn,
            name: props.student?.PrincipalName || getAdmitText('principal', lang),
          },
        ]}
      />

      {/* নিচের দুআ — টেমপ্লেটে footerNote দিলে সেটাই */}
      <p
        className="absolute text-center"
        style={{
          left: 0,
          right: 0,
          bottom: PAD - 2,
          color: primary,
          fontSize: 8.5,
        }}
      >
        {t.footerNote ?? 'رَبِّ زِدْنِي عِلْمًا'}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ৫) MihrabAdmitFace — গাঢ় রঙের পটে সোনালী খিলান, ভিতরে সাদা ঘর।
//
// হেডারটা (বিসমিল্লাহ, লোগো, নাম, ব্যাজ) বসে গাঢ় পটের উপরেই, আর বাকি
// সব — ছবি, নাম, চারটা বাক্স, নির্দেশাবলী, স্বাক্ষর — একটা সাদা
// গোল-কোনা ঘরের ভিতরে।
// ---------------------------------------------------------------------------
export const MihrabAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const PAD = 10;
  const BOX_H = 34;
  const ROW_H = 20;
  const FOOT_H = 44;
  const PHOTO_W = 52;
  const PHOTO_H = 60;

  const panelTop = 118;
  const nameTop = panelTop + 10;
  const nameH = 62;
  const boxesTop = nameTop + nameH + 6;
  const footTop = cardH - PAD - FOOT_H - 4;

  const rulesTop = boxesTop + BOX_H + 6 + (Number(props.seatOffsetY) || 0);
  const rulesH = Math.max(footTop - 6 - rulesTop, 0);

  const picked = (props.fields || []).filter(Boolean);
  const rest = picked.filter((f) => f !== 'StudentName' && f !== 'FatherName');
  const chips = rest.slice(0, 2);
  const boxFields = rest.slice(2, 5);

  const valueOf = (f) =>
    formatAdmitValue(f, getFieldValue(props.student || {}, f, lang), lang);
  const labelOf = (f) =>
    props.labelOverrides?.[f] || props.student?.[`fieldkey_${f}`] || f;

  const boxes = [
    ...(c.seatOn
      ? [{ label: layoutText('seatTitle', lang), value: props.seatText, fill: true }]
      : []),
    ...boxFields.map((f) => ({ label: labelOf(f), value: valueOf(f), fill: false })),
  ].slice(0, 4);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || primary }}
    >
      {/* সোনালী খিলানের রেখা — উপরের দিকটা গোল, নিচটা খোলা */}
      <div
        className="absolute"
        style={{
          left: 22,
          right: 22,
          top: 8,
          height: 130,
          border: `1.5px solid ${gold}`,
          borderBottom: 'none',
          borderTopLeftRadius: 140,
          borderTopRightRadius: 140,
        }}
      />
      <div className="absolute" style={{ inset: 5, border: `1px solid ${gold}` }} />

      <Watermark src={c.watermark} t={t} />

      {/* --------------------------------------------- হেডার (গাঢ় পটের উপরে) */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: PAD + 20, right: PAD + 20, top: 14 }}
      >
        <p className="leading-none" style={{ color: gold, fontSize: 9 }}>
          {BISMILLAH}
        </p>

        {c.logo ? (
          <img
            src={c.logo}
            alt=""
            className="mt-1 h-[28px] w-[28px] rounded-full bg-white object-contain"
          />
        ) : null}

        <p
          className="mt-1 w-full text-center font-bold leading-tight"
          dir={dir}
          style={{
            color: t.nameColor || '#ffffff',
            fontSize: `${t.nameSize || 14}px`,
            maxHeight: 32,
            overflow: 'hidden',
          }}
        >
          {props.student?.institute_name || props.inName}
        </p>

        <p
          className="w-full truncate text-center leading-tight"
          dir={dir}
          style={{ color: t.addressColor || gold, fontSize: `${t.addressSize || 7.5}px` }}
        >
          {props.student?.institute_address || props.inAddress}
        </p>

        <div
          className="mt-1 flex items-baseline gap-2 rounded-full px-4 py-[2px]"
          style={{ background: '#0a3a3a', border: `1px solid ${gold}` }}
        >
          <span className="font-bold leading-none" style={{ color: gold, fontSize: 10 }}>
            {getAdmitText('ribbon', lang)}
          </span>
          <span className="leading-none" style={{ color: '#ffffff', fontSize: 8.5 }}>
            {layoutText('subTitle', lang)}
          </span>
        </div>
      </div>

      {/* --------------------------------------------------- ভিতরের সাদা ঘর */}
      <div
        className="absolute"
        style={{
          left: PAD + 4,
          right: PAD + 4,
          top: panelTop,
          bottom: PAD + 4,
          background: '#ffffff',
          borderRadius: 10,
          border: `1px solid ${gold}`,
        }}
      />

      {/* পরীক্ষার নাম — সাদা ঘরের একদম উপরে */}
      {c.examLine ? (
        <p
          className="absolute truncate text-center font-bold"
          dir={dir}
          style={{
            left: PAD + 10,
            right: PAD + 10,
            top: panelTop - 16,
            color: t.examNameColor || gold,
            fontSize: `${t.examNameSize || 11}px`,
          }}
        >
          {c.examLine}
        </p>
      ) : null}

      {/* ----------------------------------------------- ছবি ও নামের অংশ */}
      <div
        className="absolute flex gap-3 px-3"
        dir={dir}
        style={{ left: PAD + 8, right: PAD + 8, top: nameTop, height: nameH }}
      >
        {c.photoEnabled ? (
          <div
            className="shrink-0 overflow-hidden bg-slate-100"
            style={{
              width: PHOTO_W,
              height: PHOTO_H,
              borderTopLeftRadius: PHOTO_W / 2,
              borderTopRightRadius: PHOTO_W / 2,
              border: `1px solid ${t.photoBorder || grid}`,
            }}
          >
            {c.photo ? (
              <img src={c.photo} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p
            className="truncate font-bold leading-tight"
            style={{ color: primary, fontSize: Math.round(14 * z) }}
          >
            {getFieldValue(props.student || {}, 'StudentName', lang)}
          </p>
          <p
            className="truncate leading-tight"
            style={{ color: t.labelColor || '#6b7280', fontSize: 9 }}
          >
            {labelOf('FatherName')} : {valueOf('FatherName')}
          </p>

          {chips.length ? (
            <div className="mt-[3px] flex gap-1.5 overflow-hidden">
              {chips.map((f) => (
                <span
                  key={f}
                  className="truncate rounded-[4px] px-2 py-[1px]"
                  style={{ background: labelBg, color: primary, fontSize: 8.5 }}
                >
                  {labelOf(f)} : {valueOf(f)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ------------------------------------------------- চারটা ছোট বাক্স */}
      {boxes.length ? (
        <div
          className="absolute flex gap-[6px]"
          dir={dir}
          style={{ left: PAD + 10, right: PAD + 10, top: boxesTop, height: BOX_H }}
        >
          {boxes.map((b, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden px-2"
              style={{
                background: b.fill ? primary : '#ffffff',
                border: `1px solid ${b.fill ? primary : grid}`,
                borderRadius: 6,
              }}
              title={b.value}
            >
              <p
                className="truncate leading-tight"
                style={{ color: b.fill ? gold : t.labelColor || '#6b7280', fontSize: 7 }}
              >
                {b.label}
              </p>
              <p
                className="truncate font-bold leading-tight"
                style={{
                  color: b.fill ? '#ffffff' : t.valueColor || '#111827',
                  fontSize: Math.round(11 * z * 10) / 10,
                }}
              >
                {b.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* ------------------------------------------------- নির্দেশাবলী */}
      {!compact && rulesH > 40 ? (
        <RulesPanel
          title={layoutText('rulesTitle', lang)}
          rules={t.rules || DEFAULT_ADMIT_RULES}
          lang={lang}
          dir={dir}
          primary={primary}
          gold={gold}
          grid={grid}
          bg="#ffffff"
          z={z}
          height={Math.min(rulesH, 92)}
          style={{
            left: PAD + 10,
            right: PAD + 10,
            top: rulesTop,
            borderRadius: 6,
          }}
        />
      ) : null}

      {/* -------------------------------------------------- QR ও স্বাক্ষর */}
      <SignRow
        top={footTop}
        height={FOOT_H}
        left={PAD + 10}
        right={PAD + 10}
        qrValue={c.qrValue}
        qrSize={t.qrSize || 34}
        qrColor={primary}
        lineColor={t.signLineColor || primary}
        nameColor={t.labelColor || '#374151'}
        z={z}
        qrShiftY={c.qrShiftY}
        signShiftY={c.signShiftY}
        blocks={[
          {
            img: c.najemSignature,
            on: c.najemSignOn,
            nameOn: c.najemNameOn,
            name: props.student?.NajemName || getAdmitText('najem', lang),
          },
          {
            img: c.principalSignature,
            on: c.principalSignOn,
            nameOn: c.principalNameOn,
            name: props.student?.PrincipalName || getAdmitText('principal', lang),
          },
        ]}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// অনুপস্থিতির সতর্কবার্তা — নির্দেশাবলীর মতোই টেমপ্লেট থেকে বদলানো যায়
// (`warning: { bn, en, ar }`), না দিলে নিচেরটাই বসে।
// ---------------------------------------------------------------------------
export const DEFAULT_ADMIT_WARNING = {
  bn: 'অনুপস্থিত কোনো পরীক্ষা নেওয়া হবে না, পরীক্ষার ফলাফল বাতিল হবে।',
  en: 'No absentee exams will be taken, and exam results will be canceled.',
  ar: 'لا تُعاد الامتحانات للغائبين، وتُلغى نتيجة الامتحان.',
};

// ---------------------------------------------------------------------------
// ৬) ImageAdmitFace — নিজের ছবির উপর ছাপা।
//
// টেমপ্লেটের `image` ঘরে দেওয়া ছবিটাই পুরো কার্ডের পট। ঐ ছবিতে নকশা,
// কোনার রঙ, "ADMIT CARD" ব্যাজ — এসব আগে থেকেই আঁকা থাকে, তাই এই
// কম্পোনেন্ট ওগুলো আর আঁকে না; কেবল ডাটাগুলো ছবির উপর বসায়।
//
// কোন তথ্য বসবে তা পুরোপুরি সেটিংয়ের ফিল্ড বাছাই অনুযায়ী — কোনো
// ফিল্ডের নাম এখানে কোডে লেখা নেই।
//
// নিচের সারিটা তিন ভাগে: বাঁয়ে আসনের ঘর, মাঝে QR, আর তার নিচে দুই
// পাশে স্বাক্ষরের রেখা।
// ---------------------------------------------------------------------------
export const ImageAdmitFace = (props) => {
  const c = resolveCard(props);
  const { t, lang, z, dir, cardH, compact, primary, gold, grid, labelBg } = c;

  const PAD = 18;

  // ------------------------------------------------------------------
  // প্রতিটা ঘরের জায়গা ও মাপ — পুরোটাই টেমপ্লেটের নিজের।
  //
  // প্রতিটা ব্যাকগ্রাউন্ড ছবির নকশা আলাদা, তাই এক মাপ সব ছবিতে খাটে না।
  // নিচের যেকোনো ঘর টেমপ্লেটে বসালে কেবল ঐ আইডির ডিজাইনটাই বদলায়,
  // অন্য কোনো ডিজাইনে কোনো প্রভাব পড়ে না। কিছু না দিলে নিচের ডিফল্ট
  // মানগুলোই ধরা হয়।
  //
  // উপর-নিচ (Y):
  //   headerShiftY  পুরো হেডার একসাথে (লোগো, নাম, ঠিকানা, প্রবেশপত্র,
  //                 পরীক্ষার নাম)। মাইনাস = উপরে, প্লাস = নিচে।
  //   logoTopPx, headTopPx, titleTopPx, examTopPx — আলাদা আলাদা
  //   bodyTopPx     ছবি ও তথ্যের ঘর
  //   footTopPx     নিচের সারি (QR ও স্বাক্ষর)
  //
  // বাম-ডান (X):
  //   logoLeftPx                      লোগো
  //   headLeftPx, headRightPx         নাম ও ঠিকানার ব্লকের দুই পাশ
  //   titleOffsetX, examOffsetX       মাঝ বরাবর লেখা দুইটা ডানে/বাঁয়ে
  //   bodyLeftPx, bodyRightPx         ছবি ও তথ্যের ঘর
  //   rulesLeftPx, rulesRightPx       নির্দেশাবলী
  //   seatLeftPx, seatRightPx         আসনের পট্টি
  //   footLeftPx, footRightPx         নিচের সারি
  //
  // ছোট-বড় (মাপ):
  //   logoSizePx, photoWPx, photoHPx, photoGapPx (ছবি ও ঘরের ফাঁক),
  //   rowHPx (তথ্যের এক সারির উচ্চতা), titleSizePx, seatHPx,
  //   rulesMaxHPx, footHPx, qrSize
  // ------------------------------------------------------------------
  const px = (v, fallback) =>
    v === undefined || v === null || v === '' ? fallback : Number(v);

  const shift = px(t.headerShiftY, 0);

  const logoTop = px(t.logoTopPx, 12) + shift;
  const logoLeft = px(t.logoLeftPx, PAD + 6);
  const logoSize = px(t.logoSizePx, 38);

  const headTop = px(t.headTopPx, 12) + shift;
  const headLeft = px(t.headLeftPx, PAD + 52);
  const headRight = px(t.headRightPx, PAD + 52);

  const titleTop = px(t.titleTopPx, 50) + shift;
  const titleSize = px(t.titleSizePx, 13);
  const titleOffsetX = px(t.titleOffsetX, 0);

  const examTop = px(t.examTopPx, 70) + shift;
  const examOffsetX = px(t.examOffsetX, 0);

  const ROW_H = px(t.rowHPx, 20);
  const PHOTO_W = px(t.photoWPx, 58);
  const PHOTO_H = px(t.photoHPx, 70);
  const PHOTO_GAP = px(t.photoGapPx, 12);
  const SEAT_H = px(t.seatHPx, 20);
  const FOOT_H = px(t.footHPx, 46);

  const bodyTop = px(t.bodyTopPx, 96);
  const bodyLeft = px(t.bodyLeftPx, PAD + 4);
  const bodyRight = px(t.bodyRightPx, PAD + 4);

  const tableH = Math.max(c.rows.length * ROW_H, ROW_H);
  const infoH = Math.max(tableH, c.photoEnabled ? PHOTO_H : 0);

  const footTop = px(t.footTopPx, cardH - PAD - FOOT_H);
  const footLeft = px(t.footLeftPx, PAD + 4);
  const footRight = px(t.footRightPx, PAD + 4);

  // আসনের পট্টি — নির্দেশাবলীর নিচে, স্বাক্ষরের সারির ঠিক উপরে।
  // সরণটা (seatOffsetY, সেটিংয়ের স্লাইডার) কেবল এই পট্টিতেই লাগে,
  // নির্দেশাবলীর ঘরটা জায়গায় থাকে — নইলে পট্টি নাড়ালেই উপরের
  // লেখাগুলোও লাফাত।
  const seatBase = footTop - 6 - SEAT_H;
  const seatTop = seatBase + (Number(props.seatOffsetY) || 0);
  const seatLeft = px(t.seatLeftPx, PAD + 4);
  const seatRight = px(t.seatRightPx, PAD + 4);

  const rulesTop = bodyTop + infoH + 6;
  const rulesH = Math.max(seatBase - 6 - rulesTop, 0);
  const rulesLeft = px(t.rulesLeftPx, PAD + 4);
  const rulesRight = px(t.rulesRightPx, PAD + 4);
  const rulesMaxH = px(t.rulesMaxHPx, 104);

  // QR এর নিজের সরণ — নিচের সারির ভিতরে উপর-নিচ ও বাম-ডান।
  // translate দিয়ে সরানো হয়, জায়গা দখল করে না — তাই QR নাড়ালেও
  // স্বাক্ষরের রেখা দুইটা নিজের জায়গাতেই থাকে।
  // টেমপ্লেটের নিজের মান + সেটিংয়ের স্লাইডার — দুইটা যোগ হয়ে চলে।
  // তাই টেমপ্লেটে যা বসানো আছে সেটা ভিত্তি, স্লাইডার তার উপরে সরায়।
  const qrOffsetY = px(t.qrOffsetY, 0) + (Number(props.qrOffsetY) || 0);
  const qrOffsetX = px(t.qrOffsetX, 0);
  const signShiftY = Number(props.signOffsetY) || 0;

  // স্বাক্ষরের নিচে তারিখের লেখার মাপ — টেমপ্লেটে signDateSizePx দিলে
  // কেবল ঐ ডিজাইনেই বদলাবে।
  const signDateSize = px(t.signDateSizePx, 8);

  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#ffffff' }}
    >
      {/* ------------------------------------------------ পটের ছবি */}
      {t.image ? (
        <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-fill" />
      ) : null}

      <Watermark src={c.watermark} t={t} />

      {/* ------------------------------------------------------- লোগো */}
      {c.logo ? (
        <img
          src={c.logo}
          alt=""
          className="absolute rounded-full bg-white object-contain"
          style={{ left: logoLeft, top: logoTop, width: logoSize, height: logoSize }}
        />
      ) : null}

      {/* ------------------------------------ প্রতিষ্ঠানের নাম ও ঠিকানা */}
      <div
        className="absolute text-center"
        dir={dir}
        style={{ left: headLeft, right: headRight, top: headTop }}
      >
        <p
          className="truncate font-bold leading-tight"
          style={{ color: t.nameColor || primary, fontSize: `${t.nameSize || 15}px` }}
        >
          {props.student?.institute_name || props.inName}
        </p>
        <p
          className="truncate leading-tight"
          style={{
            color: t.addressColor || '#6b7280',
            fontSize: `${t.addressSize || 7.5}px`,
          }}
        >
          {props.student?.institute_address || props.inAddress}
        </p>
      </div>

      {/* ------------------------------------------------ "প্রবেশপত্র" */}
      <p
        className="absolute text-center font-bold leading-none"
        style={{
          left: 0,
          right: 0,
          top: titleTop,
          color: primary,
          fontSize: titleSize,
          transform: titleOffsetX ? `translateX(${titleOffsetX}px)` : undefined,
        }}
      >
        {getAdmitText('ribbon', lang)}
      </p>

      {/* ------------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ */}
      {c.examLine ? (
        <p
          className="absolute truncate px-8 text-center font-bold"
          dir={dir}
          style={{
            left: 0,
            right: 0,
            top: examTop,
            color: t.examNameColor || primary,
            fontSize: `${t.examNameSize || 10}px`,
            transform: examOffsetX ? `translateX(${examOffsetX}px)` : undefined,
          }}
        >
          {c.examLine}
        </p>
      ) : null}

      {/* ------------------------------------------------------------ ছবি */}
      {c.photoEnabled ? (
        <div
          className="absolute overflow-hidden bg-white/70"
          style={{
            left: bodyLeft,
            top: bodyTop,
            width: PHOTO_W,
            height: PHOTO_H,
            borderRadius: 6,
            border: `1px solid ${t.photoBorder || grid}`,
          }}
        >
          {c.photo ? (
            <img src={c.photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      ) : null}

      {/* -------------------------------------------- তথ্যের ঘর (সেটিং থেকে) */}
      <div
        className="absolute overflow-hidden bg-white/85"
        style={{
          left: bodyLeft + (c.photoEnabled ? PHOTO_W + PHOTO_GAP : 0),
          right: bodyRight,
          top: bodyTop,
          height: infoH,
          border: `1px solid ${grid}`,
          borderRadius: 4,
        }}
      >
        <InfoTable
          rows={c.rows}
          student={props.student}
          lang={lang}
          dir={dir}
          labelOverrides={props.labelOverrides}
          grid={grid}
          labelBg={labelBg}
          labelColor={t.labelColor || '#4b5563'}
          valueColor={t.valueColor || '#111827'}
          labelFont={labelFont}
          valueFont={valueFont}
          rowH={ROW_H}
        />
      </div>

      {/* -------------------------------------------------- নির্দেশাবলী */}
      {!compact && rulesH > 40 ? (
        <RulesPanel
          title={layoutText('rulesTitle', lang)}
          rules={t.rules || DEFAULT_ADMIT_RULES}
          lang={lang}
          dir={dir}
          primary={primary}
          gold={gold}
          grid={grid}
          bg="transparent"
          z={z}
          height={Math.min(rulesH, rulesMaxH)}
          style={{ left: rulesLeft, right: rulesRight, top: rulesTop, border: 'none' }}
        />
      ) : null}

      {/* ----------------------------------------- আসনের পট্টি (পুরো চওড়া)

          আগে এটা ছিল নিচের বাঁ কোনায় একটা ছোট হলুদ ঘর, আর এই জায়গাটায়
          বসত অনুপস্থিতির লাল সতর্কবার্তা। এখন আসনটাই এই পুরো চওড়া
          পট্টিতে — হল, কলাম, সারি, আসন সবটা একসাথে পড়া যায়, কেটে যায় না। */}
      {!compact && c.seatOn ? (
        <div
          className="absolute flex items-center justify-center px-2"
          dir={dir}
          style={{
            left: seatLeft,
            right: seatRight,
            top: seatTop,
            height: SEAT_H,
            background: t.seatBg || '#fde68a',
            border: `1px solid ${t.seatBorder || '#d97706'}`,
            borderRadius: 4,
          }}
          title={props.seatText}
        >
          <p
            className="truncate text-center font-bold leading-none"
            style={{
              color: t.seatColor || '#92400e',
              fontSize: Math.round(9.5 * z * 10) / 10,
            }}
          >
            {layoutText('seatTitle', lang)} — {props.seatText}
          </p>
        </div>
      ) : null}

      {/* ------------------------------------------------ QR ও স্বাক্ষর */}
        <div
          className="absolute"
          style={{ left: footLeft, right: footRight, top: footTop, height: FOOT_H }}
        >
          {/* QR — মাঝ বরাবর; qrOffsetY / qrOffsetX দিয়ে উপর-নিচ, বাম-ডান সরানো যায় */}
          {c.qrValue ? (
            <div
              className="flex justify-center"
              style={{
                transform:
                  qrOffsetY || qrOffsetX
                    ? `translate(${qrOffsetX}px, ${qrOffsetY}px)`
                    : undefined,
              }}
            >
              <QRCode
                value={c.qrValue}
                size={t.qrSize || 34}
                level="M"
                bgColor="#ffffff"
                fgColor={t.qrColor || '#111827'}
                viewBox="0 0 256 256"
                style={{
                  width: (t.qrSize || 34) * z,
                  height: (t.qrSize || 34) * z,
                  display: 'block',
                }}
              />
            </div>
          ) : null}

          {/* স্বাক্ষরের রেখা — QR এর ঠিক নিচে দুই পাশে */}
          <div
            className="mt-1 flex items-end justify-between"
            style={{
              transform: signShiftY ? `translateY(${signShiftY}px)` : undefined,
            }}
          >
            {[
              {
                img: c.najemSignature,
                on: c.najemSignOn,
                nameOn: c.najemNameOn,
                dateOn: c.najemDateOn,
                name: props.student?.NajemName || getAdmitText('najem', lang),
              },
              {
                img: c.principalSignature,
                on: c.principalSignOn,
                nameOn: c.principalNameOn,
                dateOn: c.principalDateOn,
                name: props.student?.PrincipalName || getAdmitText('principal', lang),
              },
            ].map((s, i) => (
              <div
                key={i}
                className="w-[136px] text-center"
                style={{
                  transform: z !== 1 ? `scale(${z})` : undefined,
                  transformOrigin: i === 0 ? 'bottom left' : 'bottom right',
                }}
              >
                {s.on ? (
                  <div className="flex h-[16px] items-end justify-center">
                    {s.img ? (
                      <img src={s.img} alt="" className="max-h-[35px] object-contain" />
                    ) : null}
                  </div>
                ) : null}
                {s.nameOn ? (
                  <p
                    className="pt-[2px] leading-tight"
                    style={{
                      borderTop: `1px solid ${t.signLineColor || primary}`,
                      color: t.labelColor || '#374151',
                      fontSize: 10,
                    }}
                  >
                    {s.name}
                  </p>
                ) : null}

                {/* তারিখ — সেটিংয়ের "তারিখ" ঘরে টিক থাকলেই দেখাবে।
                    নামের ঘর বন্ধ থাকলেও তারিখটা একা দেখাতে পারে, তাই
                    নামের রেখাটা তখন এখানেই বসে। */}
                {s.dateOn ? (
                  <p
                    className="pt-[1px] leading-tight"
                    style={{
                      borderTop: s.nameOn
                        ? undefined
                        : `1px solid ${t.signLineColor || primary}`,
                      color: t.dateColor || t.labelColor || '#64748b',
                      fontSize: signDateSize,
                    }}
                  >
                    {getAdmitText('dateLabel', lang)} : {c.stampDate}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// কোন `layout` এর জন্য কোন কম্পোনেন্ট।
// নতুন ডিজাইন যোগ করলে কেবল এখানে একটা লাইন বাড়বে।
// ---------------------------------------------------------------------------
export const LAYOUT_FACES = {
  navy: NavyAdmitFace,
  classic: ClassicAdmitFace,
  modern: ModernAdmitFace,
  profile: ProfileAdmitFace,
  royal: RoyalAdmitFace,
  mihrab: MihrabAdmitFace,
  bgimage: ImageAdmitFace,
};

/** চেনা না হলে null — তখন AdmitCardFace আগের নিয়মেই আঁকে */
export const getLayoutFace = (layout) => LAYOUT_FACES[String(layout || '')] || null;

export default LAYOUT_FACES;
