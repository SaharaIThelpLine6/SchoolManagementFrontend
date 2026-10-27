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
// তথ্যের ঘরের নিচের জায়গাটায় আগে ছয়টা নির্দেশ বসত। ওগুলো কোডে লেখা
// স্থির লেখা ছিল — ডাটাবেজ থেকে আসত না, প্রতিষ্ঠানভেদে বদলানোও যেত না।
// তাই ওটা বাদ দিয়ে ঐ জায়গায় এখন শিক্ষার্থীর আসনের তথ্য বসে, যেটা
// সত্যিকারের ডাটা (Exam_SitAllocation থেকে)।
//
// দুই মাপেই চলে:
//   A5 (৪১০px)  → হেডার, তথ্যের ঘর, আসনের ঘর, স্বাক্ষর
//   A4 (৭৪০px)  → `bodyEnd` দেওয়া থাকে, তাই তথ্যের ঘর ওখানেই শেষ হয় আর
//                 নিচের খালি জায়গাটা রুটিনের জন্য ছেড়ে দেওয়া হয়।
//                 আসনের ঘরটা তখন আঁকা হয় না — রুটিনের ব্লকেই আসনের
//                 পট্টিটা আগের মতো বসে, দুইবার দেখানোর দরকার নেই।
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
// সাধারণ লেখা, আর এই কয়টা কেবল এই নকশাটারই।
// ---------------------------------------------------------------------------
export const NAVY_TEXTS = {
  bn: {
    subTitle: 'প্রবেশপত্র',
    academicYear: 'শিক্ষাবর্ষ',
    seatTitle: 'পরীক্ষার্থীর আসন',
  },
  en: {
    subTitle: 'Admission letter',
    academicYear: 'Academic year',
    seatTitle: "Candidate's seat",
  },
  ar: {
    subTitle: 'بطاقة الدخول',
    academicYear: 'العام الدراسي',
    seatTitle: 'مقعد الممتحن',
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
  // স্বাক্ষরের সারি ও QR এর উপর-নিচ সরণ — সেটিংয়ের দুইটা স্লাইডার থেকে।
  // translate দিয়ে সরে, জায়গা দখল করে না; তাই একটা নাড়ালেও অন্যটা
  // নিজের জায়গাতেই থাকে। ০ মানে আগের জায়গা।
  signOffsetY = 0,
  qrOffsetY = 0,
  zoom = 1,
  printDate,
  labelOverrides = {},
  cardHeight,
  bodyEnd,
}) => {
  // ⚠️ সেটিংয়ের স্লাইডার ও রঙের ঘরগুলোর মান সারির সাথে আসে
  // (admit_name_size, admit_name_color, …)। আগে সরাসরি টেমপ্লেটের মান
  // পড়া হতো, তাই "প্রতিষ্ঠানের নাম / ঠিকানা / পরীক্ষার নাম" এর মাপ-রঙ
  // নাড়লে এই ডিজাইনে কিছুই হতো না। সারির মান থাকলে সেটাই জেতে।
  const tpl = template || {};
  const t = {
    ...tpl,
    nameSize: student.admit_name_size || tpl.nameSize,
    nameColor: student.admit_name_color || tpl.nameColor,
    addressSize: student.admit_address_size || tpl.addressSize,
    addressColor: student.admit_address_color || tpl.addressColor,
    examNameSize: student.admit_exam_size || tpl.examNameSize,
    examNameColor: student.admit_exam_color || tpl.examNameColor,
  };

  const dir = getAdmitDir(lang);
  const z = Number(zoom) > 0 ? Number(zoom) : 1;

  const cardH = cardHeight || CARD_H;
  // bodyEnd দেওয়া মানে নিচের জায়গাটা অন্য কিছুর (রুটিনের) — আসনের ঘরটা
  // তখন আঁকা হয় না, রুটিনের ব্লকেই ওটা বসে
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

  // স্বাক্ষরের ছবি ও নাম — তারিখটা এই নকশায় নেই, ওটা নিচের কোনায়
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
  const FOOT_H = 54;       // QR ও স্বাক্ষরের সারি

  const visibleFields = fields.filter(Boolean);
  const rows = pairUp(visibleFields);

  const infoTop = PAD + HEADER_H + EXAM_H + 6;
  const tableH = Math.max(rows.length * ROW_H, ROW_H);
  const infoH = Math.max(tableH, photoEnabled ? PHOTO_H : 0);

  const footTop = cardH - PAD - FOOT_H;

  // আসনের ঘর — তথ্যের ঘরের নিচে, স্বাক্ষরের সারির উপরে।
  // ঘরটা পুরো জায়গাটা টেনে নেয় না; একটা মাপ নিয়ে উপরের দিকে বসে, তাই
  // ফিল্ড কম হলেও ঘরটা হাস্যকর রকম লম্বা হয়ে যায় না।
  const seatOn = Boolean(String(seatText || '').trim());
  const seatTop = infoTop + infoH + 8 + (Number(seatOffsetY) || 0);
  const seatRoom = Math.max(footTop - 6 - seatTop, 0);
  const seatH = Math.min(seatRoom, 56);

  // ফন্টের মাপ মাস্টার কন্ট্রোলে বড়-ছোট হয়, আগের কার্ডগুলোর মতোই
  const labelFont = Math.round(9.5 * z * 10) / 10;
  const valueFont = Math.round(10.5 * z * 10) / 10;

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

      {/* -------------------------------------------------- বাঁ পাশ: ছবি */}
      {photoEnabled ? (
        <div
          className="absolute overflow-hidden bg-slate-100"
          style={{
            left: PAD + 4,
            top: infoTop,
            width: PHOTO_W,
            height: PHOTO_H,
            border: `1px solid ${t.photoBorder || grid}`,
          }}
        >
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : null}
        </div>
      ) : null}

      {/* ------------------------------------------- তথ্যের ঘর — বর্ডার দেওয়া সারি */}
      <div
        className="absolute overflow-hidden"
        dir={dir}
        style={{
          left: PAD + (photoEnabled ? PHOTO_W + 10 : 4),
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

      {/* ------------------------------------------------ আসনের ঘর (শুধু A5)

          আগে এখানে ছয়টা নির্দেশ বসত, কিন্তু ওগুলো কোডে লেখা স্থির লেখা —
          ডাটাবেজ থেকে আসত না। তাই ওই জায়গাটা এখন আসল ডাটারই: শিক্ষার্থী
          কোন হলে, কোন কলামে, কোন সারিতে, কত নম্বর আসনে।

          লেখাটা পেজ থেকেই তৈরি হয়ে আসে (formatSeatLine), তাই ভাষা ও
          অঙ্ক আগের মতোই ঠিক থাকে। সিট প্ল্যান না থাকলে ঐ বার্তাটাই বসে —
          তখন ঘরটা হলুদ আভায়, যাতে কাগজ হাতে নিয়েই চোখে পড়ে। */}
      {!compact && seatOn && seatH > 28 ? (
        <div
          className="absolute overflow-hidden"
          dir={dir}
          style={{
            left: PAD + 4,
            right: PAD + 4,
            top: seatTop,
            height: seatH,
            border: `1px solid ${grid}`,
            background: '#f8fafc',
          }}
        >
          {/* শিরোনামের পট্টি */}
          <div
            className="flex items-center px-2"
            style={{ height: 17, background: navy }}
          >
            <p className="font-bold leading-none" style={{ color: gold, fontSize: 9 }}>
              {navyText('seatTitle', lang)}
            </p>
          </div>

          <div
            className="flex items-center justify-center px-2"
            style={{ height: seatH - 17 }}
          >
            <p
              className="truncate text-center font-bold"
              style={{ color: navy, fontSize: Math.round(12 * z * 10) / 10 }}
              title={seatText}
            >
              {seatText}
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
          <div
            className="flex justify-center"
            style={{
              transform: qrOffsetY ? `translateY(${Number(qrOffsetY)}px)` : undefined,
            }}
          >
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

        <div
          className="absolute bottom-0 left-0 right-0 flex items-end justify-between"
          style={{
            transform: signOffsetY ? `translateY(${Number(signOffsetY)}px)` : undefined,
          }}
        >
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
