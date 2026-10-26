import React from 'react';
import { Buffer } from 'buffer';
import QRCode from 'react-qr-code';

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
// নেভি ও সোনালী — সম্পূর্ণ নতুন একটা কার্ডের নকশা।
//
// পুরোনো কোনো কিছুতে হাত পড়েনি। AdmitCardFace নিজে আঁকা বন্ধ করে কেবল
// তখনই এই ফাইলটাকে ডাকে যখন টেমপ্লেটে `layout: 'navy'` লেখা থাকে — তাই
// বাকি সব ডিজাইন অক্ষরে অক্ষরে আগের মতোই ছাপে।
//
// আগের ডিজাইনগুলোতে তথ্যগুলো দুই কলামে "নাম : মান" ধরনে বসত। এখানে
// বসে বর্ডার দেওয়া ঘরে — বাঁ ঘরে ধূসর পটে লেবেল, ডান ঘরে সাদা পটে মান,
// এক সারিতে দুইটা করে। ফিল্ড বাছাই, লেবেল বদলানো, ভাষা — সব আগের মতোই
// কাজ করে, কেবল চেহারাটা আলাদা।
//
// দুই মাপেই চলে:
//   A5 (৪১০px)  → হেডার, তথ্যের ঘর, নির্দেশাবলী, সতর্কবার্তা, স্বাক্ষর
//   A4 (৭৪০px)  → `bodyEnd` দেওয়া থাকে, তাই তথ্যের ঘর ওখানেই শেষ হয় আর
//                 নিচের খালি জায়গাটা রুটিনের জন্য ছেড়ে দেওয়া হয়।
//                 নির্দেশাবলী ও সতর্কবার্তা তখন বাদ যায় — ওই জায়গাটা
//                 রুটিনের, নইলে দুইটা একটার উপর আরেকটা পড়ত।
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

// ---------------------------------------------------------------------------
// এই নকশার নিজের লেখা।
//
// admitCardConfig.js এর ADMIT_TEXTS/ADMIT_UI তে রাখিনি — ওগুলো সব ডিজাইনের
// সাধারণ লেখা, আর এই ছয়টা নির্দেশ কেবল এই নকশাটারই।
// ---------------------------------------------------------------------------
export const NAVY_TEXTS = {
  bn: {
    subTitle: 'প্রবেশপত্র',
    academicYear: 'শিক্ষাবর্ষ',
    seatNo: 'আসন নং',
    instructions: 'পরীক্ষার্থীদের জন্য নির্দেশাবলী',
    rules: [
      'সকল পরীক্ষার্থীকে প্রবেশপত্রসহ পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে কেন্দ্রে উপস্থিত হতে হবে।',
      'পরীক্ষার হলে মোবাইল ফোন, স্মার্ট ঘড়ি ও ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।',
      'প্রবেশপত্র ব্যতীত পরীক্ষার হলে প্রবেশ করা যাবে না।',
      'প্রতিটি পরীক্ষা শেষে প্রশ্নপত্র জমা দিতে হবে।',
      'পরীক্ষার হলে নীরবতা বজায় রাখতে হবে, অন্যদের বিঘ্ন ঘটানো যাবে না।',
      'যেকোনো ধরনের অসদুপায় অবলম্বন করলে তাৎক্ষণিকভাবে বহিষ্কার করা হবে।',
    ],
    warning: 'অনুপস্থিত কোনো পরীক্ষা নেওয়া হবে না, পরীক্ষার ফলাফল বাতিল হবে।',
  },
  en: {
    subTitle: 'Admission letter',
    academicYear: 'Academic year',
    seatNo: 'Seat No.',
    instructions: 'Instructions for candidates',
    rules: [
      'All candidates must arrive at the center (with admit card) at least 30 minutes before the start of the exam.',
      'Mobile phones, smart watches and electronic devices are completely prohibited in the examination hall.',
      'You will not be allowed to enter the examination hall without an admit card.',
      'Question papers must be submitted at the end of each exam.',
      'Silence must be maintained in the examination hall and no disruptions to others may be caused.',
      'Any type of misconduct will result in immediate expulsion of the candidate.',
    ],
    warning: 'No absentee exams will be taken, and exam results will be canceled.',
  },
  ar: {
    subTitle: 'بطاقة الدخول',
    academicYear: 'العام الدراسي',
    seatNo: 'رقم المقعد',
    instructions: 'تعليمات للممتحنين',
    rules: [
      'على جميع الممتحنين الحضور إلى المركز ومعهم بطاقة الدخول قبل بدء الامتحان بثلاثين دقيقة على الأقل.',
      'تُمنع الهواتف المحمولة والساعات الذكية والأجهزة الإلكترونية منعًا باتًا داخل القاعة.',
      'لا يُسمح بدخول القاعة بدون بطاقة الدخول.',
      'يجب تسليم ورقة الأسئلة عند انتهاء كل امتحان.',
      'يجب الحفاظ على الهدوء داخل القاعة وعدم إزعاج الآخرين.',
      'أي سلوك مخالف يؤدي إلى إخراج الممتحن فورًا.',
    ],
    warning: 'لا تُعاد الامتحانات للغائبين، وتُلغى نتيجة الامتحان.',
  },
};

const navyText = (key, lang) =>
  NAVY_TEXTS[lang]?.[key] ?? NAVY_TEXTS.bn[key];

/**
 * নেভি ও সোনালী কার্ডের ভিজ্যুয়াল।
 *
 * প্রপগুলো হুবহু AdmitCardFace এর মতোই — তাই প্রিভিউ, প্রিন্ট ও থাম্বনেইল
 * তিন জায়গাতেই কোনো বাড়তি কাজ ছাড়া বসে যায়।
 */
export const NavyAdmitFace = ({
  template,
  fields = [],
  student = {},
  lang = DEFAULT_ADMIT_LANG,
  inName,
  inAddress,
  inLogo,
  inWatermark,
  institutionCode,
  showQR,
  showWatermark,
  showPhoto,
  najemShowSign,
  najemShowName,
  principalShowSign,
  principalShowName,
  showSign,
  showSignName,
  seatText = '',
  seatOffsetY = 0,
  zoom = 1,
  printDate,
  labelOverrides = {},
  cardHeight,
  bodyEnd,
}) => {
  const t = template || {};
  const dir = getAdmitDir(lang);
  const z = Number(zoom) > 0 ? Number(zoom) : 1;

  const cardH = cardHeight || CARD_H;
  // bodyEnd দেওয়া মানে নিচের জায়গাটা অন্য কিছুর (রুটিনের) — তাই
  // নির্দেশাবলী ও সতর্কবার্তা তখন আঁকা হয় না
  const compact = Boolean(bodyEnd);

  const navy = t.navy || t.accent || '#15294d';
  const gold = t.gold || '#c9a227';
  const grid = t.gridColor || '#cbd5e1';
  const labelBg = t.labelBg || '#f1f5f9';

  const logo = toImageSrc(student.Logo || student.logo || inLogo);
  const photo = toImageSrc(student.UserImage);
  const najemSignature = toImageSrc(student.SignatureNajem || student.signatureNajem);
  const principalSignature = toImageSrc(
    student.SignaturePrincipal || student.signaturePrincipal
  );

  const watermarkOn = showWatermark === undefined ? true : Boolean(showWatermark);
  const watermark = watermarkOn
    ? toImageSrc(student.Watermark || student.DocumentLogo || inWatermark)
    : '';

  const stampDate = printDate || getPrintDate(new Date(), lang);

  const qrEnabled = showQR === undefined ? Boolean(t.showQR) : Boolean(showQR);
  const photoEnabled = showPhoto === undefined ? Boolean(t.showPhoto) : Boolean(showPhoto);
  const qrValue = qrEnabled ? buildAdmitQrValue(student, institutionCode) : '';

  // স্বাক্ষরের ছবি ও নাম — তারিখটা এই নকশায় নেই, ওটা উপরের ঘরে
  // "ইস্যুর তারিখ" হিসেবেই বসে
  const resolveOn = (newProp, oldProp, tplDefault) => {
    if (newProp !== undefined) return Boolean(newProp);
    if (oldProp !== undefined) return Boolean(oldProp);
    return Boolean(tplDefault);
  };
  const najemSignOn = resolveOn(najemShowSign, showSign, t.showSignature);
  const najemNameOn = resolveOn(najemShowName, showSignName, t.showSignature);
  const principalSignOn = resolveOn(principalShowSign, showSign, t.showSignature);
  const principalNameOn = resolveOn(principalShowName, showSignName, t.showSignature);

  const examLine = (() => {
    const exam = getFieldValue(student, 'ExamName', lang);
    const session = getFieldValue(student, 'SessionName', lang);
    if (!exam) return '';
    return session
      ? `${exam}  •  ${navyText('academicYear', lang)}: ${toLangDigit(session, lang)}`
      : exam;
  })();

  // ------------------------------------------------------------------ মাপ
  const PAD = 10;          // ফ্রেম থেকে ভিতরের দিকে
  const HEADER_H = 62;     // নেভি ব্যান্ড
  const EXAM_H = 20;       // পরীক্ষার নামের লাইন
  const ROW_H = 20;        // তথ্যের ঘরের এক সারি
  const PHOTO_W = 60;
  const PHOTO_H = 70;
  const SEAT_H = 34;
  const FOOT_H = 54;       // QR ও স্বাক্ষরের সারি

  const visibleFields = fields.filter(Boolean);
  const rows = pairUp(visibleFields);

  const infoTop = PAD + HEADER_H + EXAM_H + 6;
  const tableH = Math.max(rows.length * ROW_H, ROW_H);
  const leftColH = (photoEnabled ? PHOTO_H + 4 : 0) + (seatText ? SEAT_H : 0);
  const infoH = Math.max(tableH, leftColH);

  const footTop = cardH - PAD - FOOT_H;
  const rulesTop = infoTop + infoH + 8;
  const rulesH = Math.max(footTop - 6 - rulesTop, 0);

  // ফন্টের মাপ মাস্টার কন্ট্রোলে বড়-ছোট হয়, আগের কার্ডগুলোর মতোই
  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

  const rules = navyText('rules', lang);
  const half = Math.ceil(rules.length / 2);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: t.cardBg || '#ffffff' }}
    >
      {/* ------------------------------------------------ ফ্রেম ও কোনার নকশা */}
      <div className="absolute" style={{ inset: 4, border: `1px solid ${navy}` }} />
      {[
        { top: 8, left: 8, borderTop: 1, borderLeft: 1 },
        { top: 8, right: 8, borderTop: 1, borderRight: 1 },
        { bottom: 8, left: 8, borderBottom: 1, borderLeft: 1 },
        { bottom: 8, right: 8, borderBottom: 1, borderRight: 1 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: 26,
            height: 26,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            borderTop: c.borderTop ? `2px solid ${gold}` : 'none',
            borderBottom: c.borderBottom ? `2px solid ${gold}` : 'none',
            borderLeft: c.borderLeft ? `2px solid ${gold}` : 'none',
            borderRight: c.borderRight ? `2px solid ${gold}` : 'none',
          }}
        />
      ))}

      {/* -------------------------------------------------------- ওয়াটারমার্ক */}
      {watermark ? (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: t.watermarkOpacity ?? WATERMARK_DEFAULTS.opacity }}
        >
          <img
            src={watermark}
            alt=""
            style={{
              width: t.watermarkSize ?? WATERMARK_DEFAULTS.size,
              height: t.watermarkSize ?? WATERMARK_DEFAULTS.size,
              objectFit: 'contain',
            }}
          />
        </div>
      ) : null}

      {/* ------------------------------------------- নেভি ব্যান্ড: লোগো | নাম | ব্যাজ */}
      <div
        className="absolute flex items-center gap-2"
        style={{
          left: PAD,
          right: PAD,
          top: PAD,
          height: HEADER_H,
          background: navy,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt=""
            className="h-[44px] w-[44px] shrink-0 rounded-full bg-white object-contain"
          />
        ) : null}

        <div className="min-w-0 flex-1 text-center" dir={dir}>
          <p
            className="truncate font-bold leading-tight"
            style={{ color: t.nameColor || '#ffffff', fontSize: `${t.nameSize || 17}px` }}
          >
            {student.institute_name || inName}
          </p>
          <p
            className="truncate leading-tight"
            style={{
              color: t.addressColor || '#cbd5e1',
              fontSize: `${t.addressSize || 9}px`,
            }}
          >
            {student.institute_address || inAddress}
          </p>
        </div>

        {/* সোনালী ব্যাজ — ছাপা কাগজেও এই অংশটাই চোখে পড়ে আগে */}
        <div
          className="shrink-0 px-2 py-[3px] text-center"
          style={{ border: `1px solid ${gold}` }}
        >
          <p className="font-bold leading-tight" style={{ color: gold, fontSize: 11 }}>
            {getAdmitText('ribbon', lang)}
          </p>
          <p className="leading-tight" style={{ color: '#e2e8f0', fontSize: 7.5 }}>
            {navyText('subTitle', lang)}
          </p>
        </div>
      </div>

      {/* -------------------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ */}
      {examLine ? (
        <div
          className="absolute flex items-center justify-center"
          dir={dir}
          style={{
            left: PAD,
            right: PAD,
            top: PAD + HEADER_H,
            height: EXAM_H,
            borderBottom: `1px solid ${gold}`,
          }}
        >
          <p
            className="truncate text-center font-bold"
            style={{
              color: t.examNameColor || navy,
              fontSize: `${t.examNameSize || 12}px`,
            }}
          >
            {examLine}
          </p>
        </div>
      ) : null}

      {/* ---------------------------------------- বাঁ পাশ: ছবি ও আসন নম্বর */}
      <div
        className="absolute"
        style={{ left: PAD + 4, top: infoTop, width: PHOTO_W }}
      >
        {photoEnabled ? (
          <div
            className="overflow-hidden bg-slate-100"
            style={{
              width: PHOTO_W,
              height: PHOTO_H,
              border: `1px solid ${t.photoBorder || grid}`,
            }}
          >
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        ) : null}

        {seatText ? (
          <div
            className="mt-1 px-1 py-[2px] text-center"
            style={{
              background: navy,
              height: SEAT_H,
              transform: seatOffsetY ? `translateY(${seatOffsetY}px)` : undefined,
            }}
          >
            <p className="leading-tight" style={{ color: gold, fontSize: 7.5 }}>
              {navyText('seatNo', lang)}
            </p>
            <p
              className="truncate font-bold leading-tight"
              style={{ color: '#ffffff', fontSize: 8.5 }}
              title={seatText}
            >
              {seatText}
            </p>
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------- তথ্যের ঘর — বর্ডার দেওয়া সারি */}
      <div
        className="absolute overflow-hidden"
        dir={dir}
        style={{
          left: PAD + PHOTO_W + 10,
          right: PAD + 4,
          top: infoTop,
          height: infoH,
          border: `1px solid ${grid}`,
        }}
      >
        {rows.map((pair, i) => (
          <div
            key={`r-${i}`}
            className="flex"
            style={{
              height: ROW_H,
              borderBottom: i < rows.length - 1 ? `1px solid ${grid}` : 'none',
            }}
          >
            {pair.map((fieldName, j) => {
              const label =
                labelOverrides[fieldName] ||
                student[`fieldkey_${fieldName}`] ||
                fieldName;
              const value = formatAdmitValue(
                fieldName,
                getFieldValue(student, fieldName, lang),
                lang
              );
              const lastCell = j === pair.length - 1;

              return (
                <React.Fragment key={fieldName}>
                  <div
                    className="flex shrink-0 items-center overflow-hidden px-[5px]"
                    style={{
                      width: 86,
                      background: labelBg,
                      borderRight: `1px solid ${grid}`,
                      color: t.labelColor || '#374151',
                      fontSize: `${labelFont}px`,
                    }}
                  >
                    <span className="truncate">{label}</span>
                  </div>
                  <div
                    className="flex min-w-0 flex-1 items-center overflow-hidden px-[5px]"
                    style={{
                      borderRight: lastCell ? 'none' : `1px solid ${grid}`,
                      color: t.valueColor || '#111827',
                      fontSize: `${valueFont}px`,
                      fontWeight: 600,
                    }}
                  >
                    <span className="truncate">{value}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>

      {/* ------------------------------------- নির্দেশাবলী ও সতর্কবার্তা (শুধু A5) */}
      {!compact && rulesH > 40 ? (
        <div
          className="absolute overflow-hidden"
          dir={dir}
          style={{ left: PAD + 4, right: PAD + 4, top: rulesTop, height: rulesH }}
        >
          <div className="flex items-center" style={{ gap: 5 }}>
            <span style={{ width: 3, height: 11, background: navy }} />
            <p className="font-bold" style={{ color: navy, fontSize: 9.5 }}>
              {navyText('instructions', lang)}
            </p>
          </div>

          {/* ছয়টা নির্দেশ দুই কলামে — ১,২,৩ বাঁয়ে আর ৪,৫,৬ ডানে, ছাপা
              কাগজে ঠিক এভাবেই পড়তে সুবিধা */}
          <div className="mt-[3px] flex gap-3">
            {[rules.slice(0, half), rules.slice(half)].map((col, ci) => (
              <ol key={ci} className="min-w-0 flex-1">
                {col.map((line, li) => (
                  <li
                    key={li}
                    className="flex gap-1 leading-[11px]"
                    style={{ color: t.valueColor || '#1f2937', fontSize: 7.5 }}
                  >
                    <span className="shrink-0" style={{ color: navy }}>
                      {toLangDigit(ci * half + li + 1, lang)}.
                    </span>
                    <span className="min-w-0">{line}</span>
                  </li>
                ))}
              </ol>
            ))}
          </div>

          <div
            className="mt-[4px] flex items-center justify-center px-2 py-[3px]"
            style={{ background: '#fef2f2', border: `1px dashed #fca5a5` }}
          >
            <p
              className="text-center font-bold leading-tight"
              style={{ color: '#b91c1c', fontSize: 8 }}
            >
              {navyText('warning', lang)}
            </p>
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------- নিচের সারি: QR ও স্বাক্ষর */}
      <div
        className="absolute"
        style={{ left: PAD + 4, right: PAD + 4, top: footTop, height: FOOT_H }}
      >
        {qrValue ? (
          <div className="flex justify-center">
            <QRCode
              value={qrValue}
              size={t.qrSize || 40}
              level="M"
              bgColor="#ffffff"
              fgColor={navy}
              viewBox="0 0 256 256"
              style={{
                width: (t.qrSize || 40) * z,
                height: (t.qrSize || 40) * z,
                display: 'block',
              }}
            />
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between">
          {[
            {
              img: najemSignature,
              on: najemSignOn,
              nameOn: najemNameOn,
              name: student.NajemName || getAdmitText('najem', lang),
            },
            {
              img: principalSignature,
              on: principalSignOn,
              nameOn: principalNameOn,
              name: student.PrincipalName || getAdmitText('principal', lang),
            },
          ].map((s, i) => (
            <div
              key={i}
              className="w-[140px] text-center"
              style={{ transform: z !== 1 ? `scale(${z})` : undefined, transformOrigin: i === 0 ? 'bottom left' : 'bottom right' }}
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
                    borderTop: `1px solid ${t.signLineColor || navy}`,
                    color: t.labelColor || '#374151',
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

      {/* ইস্যুর তারিখ — ডান কোনায় ছোট করে, নকশার সাথে মিলিয়ে */}
      {stampDate ? (
        <p
          className="absolute"
          style={{
            right: PAD + 6,
            top: footTop - 12,
            color: t.labelColor || '#64748b',
            fontSize: 7.5,
          }}
        >
          {getAdmitText('dateLabel', lang)} : {stampDate}
        </p>
      ) : null}
    </div>
  );
};

export default NavyAdmitFace;
