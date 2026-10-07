import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import QRCode from 'react-qr-code';
import {
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_LANG,
  buildAdmitQrValue,
  formatAdmitValue,
  getAdmitDir,
  getAdmitText,
  getFieldValue,
  getPrintDate,
  getPrintLayout,
  getTemplate,
  toLangDigit,
} from '../Data/admitCardConfig';

const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// mm ভ্যালু ছোট করে লিখি, নাহলে CSS এ 149.80769230769232mm এর মতো আসে
const mm = (v) => `${Math.round(v * 1000) / 1000}mm`;

/**
 * এক লাইনে ফিট করে — লিখা ঘরের চেয়ে লম্বা হলে ফন্ট সাইজ আস্তে আস্তে কমে।
 * minSize এর নিচে নামবে না, তবু না ফিটলে ডান দিক কেটে যাবে (ellipsis নয়)।
 */
const FitText = ({ children, baseSize, minSize = 7, lineHeight, className, style }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    const fit = () => {
      if (cancelled || !el) return;
      let s = baseSize;
      el.style.fontSize = `${s}px`;

      // strict `>` — +1 tolerance বাদ, 0px পার্থক্য থাকলেই ছোট হবে
      let guard = 200;
      while (guard-- > 0 && s > minSize && el.scrollWidth > el.clientWidth) {
        s -= 0.25;
        el.style.fontSize = `${s}px`;
      }
    };

    fit();

    // SolaimanLipi / আরবি ফন্ট দেরিতে লোড হলে আবার মাপো
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }

    // প্রিভিউ ↔ প্রিন্ট প্যারেন্ট সাইজ বদলালেও re-fit
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  });

  return (
    <p
      ref={ref}
      className={className}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'clip',
        lineHeight: `${lineHeight}px`,
        margin: 0,
        paddingRight: 1,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

/**
 * প্রিন্ট ভিউ — এডিটরে যা সাজানো হয়েছে হুবহু তাই রেন্ডার করে।
 *
 * @param templateId       নির্বাচিত টেমপ্লেট আইডি
 * @param fields           নির্বাচিত ফিল্ডের আইডি অ্যারে (ক্রম বজায় থাকে)
 * @param data             normalizeAdmitRow() দিয়ে ফ্ল্যাট করা শিক্ষার্থীর তালিকা
 * @param reportType       1 = A5 এ ১টি, 2 = A4 এ ২টি, 3 = A4 ল্যান্ডস্কেপে ৪টি
 * @param lang             'bn' | 'en' | 'ar'
 * @param grayscale        সাদা-কালা প্রিন্ট
 * @param inName           প্রতিষ্ঠানের নাম
 * @param inAddress        প্রতিষ্ঠানের ঠিকানা
 * @param inLogo           প্রতিষ্ঠানের লোগো
 * @param institutionCode  QR এর ভেরিফিকেশন URL বানাতে
 * @param showQR           QR দেখাবে কি না; না দিলে টেমপ্লেটের সেটিং
 * @param showPhoto        শিক্ষার্থীর ছবির ঘর দেখাবে কি না
 * @param showSign         স্বাক্ষরের ছবি দেখাবে কি না
 * @param showSignName     স্বাক্ষরের নাম ও রেখা দেখাবে কি না
 * @param showSignDate     স্বাক্ষরের নিচের তারিখ দেখাবে কি না
 */
const AdmitCardGenerate = ({
  templateId,
  fields = [],
  data = [],
  reportType = 1,
  lang = DEFAULT_ADMIT_LANG,
  grayscale = false,
  inName,
  inAddress,
  inLogo,
  institutionCode,
  showQR,
  showPhoto,
  showSign,
  showSignName,
  showSignDate,
}) => {
  const template = getTemplate(templateId);
  const layout = getPrintLayout(reportType);
  const rows = Array.isArray(data) ? data : [];

  const pages = useMemo(() => chunk(rows, layout.perPage), [rows, layout.perPage]);

  // সব কার্ডে একই তারিখ — প্রতি কার্ডে নতুন Date() বানালে
  // মধ্যরাতে বড় ব্যাচ প্রিন্ট করলে কিছু কার্ডে আলাদা তারিখ পড়তে পারত
  const printDate = useMemo(() => getPrintDate(new Date(), lang), [lang]);

  if (!rows.length) return null;

  return (
    <div className="admit-print-root font-SolaimanLipi">
      <style>{`
        .admit-print-root {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .admit-page {
          display: grid;
          grid-template-columns: repeat(${layout.cols}, ${mm(layout.cellW)});
          grid-template-rows: repeat(${layout.rows}, ${mm(layout.cellH)});
          gap: ${mm(layout.gap)};
          width: ${mm(layout.contentW)};
          justify-content: center;
          align-content: start;
          margin: 0 auto;
        }
        .admit-cell {
          width: ${mm(layout.cellW)};
          height: ${mm(layout.cellH)};
          overflow: hidden;
          position: relative;
          ${grayscale ? 'filter: grayscale(1);' : ''}
        }
        .admit-scale {
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          transform: scale(${layout.scale});
          transform-origin: top left;
        }

        /* স্ক্রিনে পেজগুলোর মাঝে ফাঁক, প্রিন্টে এটা থাকবে না */
        @media screen {
          .admit-page + .admit-page { margin-top: 10mm; }
        }

        @media print {
          @page {
            size: ${layout.page};
            margin: ${mm(layout.margin)};
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .admit-print-root { width: 100%; margin: 0; padding: 0; }
          .admit-page {
            break-after: page;
            page-break-after: always;
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 auto;
          }
          .admit-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .admit-cell {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .admit-scale img { max-width: none !important; }
        }
      `}</style>

      {pages.map((page, pageIndex) => (
        <div className="admit-page" key={`admit-page-${pageIndex}`}>
          {page.map((student, i) => (
            <div className="admit-cell" key={student.AdmissionID ?? `${pageIndex}-${i}`}>
              <div className="admit-scale">
                <AdmitCardFace
                  template={template}
                  fields={fields}
                  student={student}
                  lang={lang}
                  inName={inName}
                  inAddress={inAddress}
                  inLogo={inLogo}
                  institutionCode={institutionCode}
                  showQR={showQR}
                  showPhoto={showPhoto}
                  showSign={showSign}
                  showSignName={showSignName}
                  showSignDate={showSignDate}
                  printDate={printDate}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/** painted টেমপ্লেটের ফ্রেম, হেডার ব্যান্ড ও রেখা */
const PaintedChrome = ({ t }) => (
  <>
    <div className="absolute inset-0" style={{ background: t.cardBg || '#ffffff' }} />

    {t.frameStyle === 'hairline' ? (
      <div className="absolute" style={{ inset: 10, border: `1px solid ${t.frameColor}` }} />
    ) : null}

    {t.frameStyle === 'double' ? (
      <>
        <div className="absolute" style={{ inset: 8, border: `3px solid ${t.frameColor}` }} />
        <div className="absolute" style={{ inset: 17, border: `1px solid ${t.frameColor}` }} />
      </>
    ) : null}

    {t.frameStyle === 'edgebars' ? (
      <>
        <div
          className="absolute left-0 right-0 top-0"
          style={{ height: 12, background: t.frameColor }}
        />
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 12, background: t.frameColor }}
        />
      </>
    ) : null}

    {/* ✅ সলিড হেডার ব্যান্ড এখন পরীক্ষার নামের স্ট্রিপের শুরুতে শেষ হয় —
        তাই সবুজের উপর লেখা আর অর্ধেক ঢাকা পড়ে না */}
    {t.headerFill === 'solid' ? (
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: (t.examTop ?? t.headerHeight) - 4,
          background: t.headerBg,
        }}
      />
    ) : null}

    {/* ✅ ডিভাইডার রেখা এখন পরীক্ষার নামের স্ট্রিপের নিচে বসে —
        তাই টেক্সটের মাঝখান দিয়ে আর যায় না */}
    {t.headerDivider ? (
      <div
        className="absolute"
        style={{
          top: (t.examTop ?? t.headerHeight) + (t.examHeight ?? 0) + 10,  // ← +10 যোগ
          left: 30,
          right: 30,
          height: t.headerDivider,
          background: t.accent,
        }}
      />
    ) : null}
  </>
);

/**
 * একপাশের স্বাক্ষর ব্লক — ছবি, রেখা, নাম, তারিখ।
 * তিনটি অংশ আলাদাভাবে বন্ধ করা যায়; ঘরের প্রস্থ একই থাকে যাতে
 * মাঝের QR কোড জায়গা থেকে সরে না যায়।
 */
const SignatureBlock = ({
  t,
  image,
  name,
  printDate,
  dateLabel,
  showImage,
  showName,
  showDate,
}) => (
  <div className="text-center w-[120px] shrink-0">
    {showImage ? (
      <div className="h-[22px] flex items-end justify-center">
        {image ? <img src={image} alt="" className="max-h-[22px] object-contain" /> : null}
      </div>
    ) : null}

    {showName ? (
      <p
        className="text-[11px] leading-[15px] pt-[2px]"
        style={{
          color: t.labelColor,
          borderTop: `1px solid ${t.signLineColor || t.labelColor}`,
        }}
      >
        {name}
      </p>
    ) : null}

    {showDate && printDate ? (
      <p className="text-[10px] leading-[14px]" style={{ color: t.labelColor }}>
        {dateLabel} : {printDate}
      </p>
    ) : null}
  </div>
);

/** একটি কার্ডের ভিজ্যুয়াল — এডিটরের প্রিভিউও এই কম্পোনেন্টই ব্যবহার করে */
export const AdmitCardFace = ({
  template,
  fields = [],
  student = {},
  lang = DEFAULT_ADMIT_LANG,
  inName,
  inAddress,
  inLogo,
  institutionCode,
  showQR,
  showPhoto,
  showSign,
  showSignName,
  showSignDate,
  printDate,
  labelOverrides = {},
}) => {
  const t = template;
  const dir = getAdmitDir(lang);

  const nameColor = student.admit_name_color || t.nameColor;
  const nameSize = student.admit_name_size || t.nameSize;
  const addressColor = student.admit_address_color || t.addressColor;
  const addressSize = student.admit_address_size || t.addressSize;

  const photo = toImageSrc(student.UserImage);
  const najemSignature = toImageSrc(student.SignatureNajem || student.signatureNajem);
  const principalSignature = toImageSrc(
    student.SignaturePrincipal || student.signaturePrincipal
  );
  const logo = toImageSrc(
    student.Logo || student.logo || student.InstituteLogo || inLogo
  );

  // prop না পেলে নিজেই আজকের তারিখ বানায় (এডিটরের প্রিভিউ এই পথে আসে)
  const stampDate = printDate || getPrintDate(new Date(), lang);

  // prop দিলে সেটাই চূড়ান্ত, না দিলে টেমপ্লেটের ডিফল্ট
  const qrEnabled = showQR === undefined ? Boolean(t.showQR) : Boolean(showQR);
  const photoEnabled = showPhoto === undefined ? Boolean(t.showPhoto) : Boolean(showPhoto);

  // স্বাক্ষরের তিনটি অংশ আলাদাভাবে নিয়ন্ত্রণযোগ্য
  const signImageEnabled =
    showSign === undefined ? Boolean(t.showSignature) : Boolean(showSign);
  const signNameEnabled =
    showSignName === undefined ? Boolean(t.showSignature) : Boolean(showSignName);
  const signDateEnabled =
    showSignDate === undefined ? t.showSignDate !== false : Boolean(showSignDate);

  const anySignPart = signImageEnabled || signNameEnabled || signDateEnabled;

  const qrValue = qrEnabled ? buildAdmitQrValue(student, institutionCode) : '';
  // QR স্বাক্ষরের জোনে বসে, তাই ওই উচ্চতার বেশি হতে পারে না
  const qrSize = Math.min(t.qrSize || 56, (t.signatureHeight || 60) - 4);

  // নিচের সারি তখনই আঁকা হয় যখন স্বাক্ষরের কোনো অংশ বা QR আছে
  const showBottomRow = Boolean(anySignPart || qrValue);

  const photoW = t.photoW || 58;
  const photoH = t.photoH || 74;

  // ছবি দেখানো হোক বা না হোক — দুই পাশে একই জায়গা ছাড়া হয়,
  // নইলে ছবি বন্ধ করলে নাম-ঠিকানা ডানে সরে যেত
  const logoInset = t.logoInset ?? 36;
  const photoInset = t.photoInset ?? 36;

  const headerSideReserve = Math.max(
    (logo ? 64 + logoInset + 4 : 40),
    photoW + photoInset + 4
  );

  const examNameValue = getFieldValue(student, 'ExamName', lang);
  const sessionValue = getFieldValue(student, 'SessionName', lang);
  const examLine = examNameValue
    ? `${examNameValue}${sessionValue ? ` — ${toLangDigit(sessionValue, lang)}` : ''}`
    : '';

  // পরীক্ষার নামের স্ট্রিপ — "প্রবেশপত্র" ব্যাজের উপরে
  const examTop = t.examTop ?? t.headerHeight;
  const examHeight = t.examHeight ?? 22;

  // ব্যাজের জোন — স্ট্রিপের নিচ থেকে bodyTop পর্যন্ত (painted টেমপ্লেটে)
  const ribbonTop = Math.max(examTop + examHeight, t.headerHeight);
  const ribbonHeight = Math.max(t.bodyTop - ribbonTop, 0);

  // ভাষা অনুযায়ী স্ট্রিপের মাপ — না থাকলে টেমপ্লেটের ডিফল্ট
  const langKey = lang === 'en' ? 'en' : lang === 'ar' ? 'ar' : 'bn';
  const ribbonCoverCfg =
    t.ribbonCoverByLang?.[langKey] ?? t.ribbonCover ?? null;

  // তথ্য ব্লকের নিচের সীমা — স্বাক্ষরের জোনের ঠিক উপরে
  const bodyBottomEdge = (t.bodyBottom || 28) + (t.signatureHeight || 60);

  // যতটুকু জায়গা আছে তার মধ্যেই ফিল্ডগুলো ফিট করানো হয়
  // ফিল্ডগুলো দুই কলামে পাশাপাশি বসে, তাই সারির সংখ্যা অর্ধেক
  const visibleFields = fields.filter(Boolean);
  const bodyHeight = CARD_H - t.bodyTop - bodyBottomEdge;
  const rowCount = Math.max(Math.ceil(visibleFields.length / 2), 1);
  const lineH = Math.max(15, Math.min(26, Math.floor(bodyHeight / rowCount)));
  const fontSize = Math.max(11, Math.min(15, lineH - 9));

  // বেজোড় সংখ্যক ফিল্ড হলে শেষেরটা পুরো প্রস্থ জুড়ে বসবে
  const lastFieldSpansFull = visibleFields.length % 2 === 1;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: CARD_H, background: '#ffffff' }}
    >
      {t.variant === 'image' ? (
        <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-fill" />
      ) : (
        <PaintedChrome t={t} />
      )}

      {/* ------------------------- হেডার: লোগো | নাম ও ঠিকানা | শিক্ষার্থীর ছবি */}
      <div className="absolute left-0 top-0 w-full" style={{ height: t.headerHeight }}>
        {/* {logo ? (
          <img
            src={logo}
            alt=""
            className="absolute left-9 top-2/3 -translate-y-1/2 h-[64px] w-[64px] object-contain"
          />
        ) : null}

        {photoEnabled ? (
          <div
            className="absolute right-9 top-2/3 -translate-y-1/2 overflow-hidden rounded-[3px] bg-white"
            style={{
              width: photoW,
              height: photoH,
              border: `1px solid ${t.photoBorder || '#9ca3af'}`,
            }}
          >
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        ) : null} */}

        {logo ? (
          <img
            src={logo}
            alt=""
            className="absolute top-2/3 -translate-y-1/2 h-[64px] w-[64px] object-contain"
            style={{ left: t.logoInset ?? 36, top: t.logoTop ?? '66%' }}
          />
        ) : null}

        {photoEnabled ? (
          <div
            className="absolute top-2/3 -translate-y-1/2 overflow-hidden rounded-[3px] bg-white"
            style={{
              right: t.photoInset ?? 36,
              top: t.photoTop ?? '66%',
              width: photoW,
              height: photoH,
              border: `1px solid ${t.photoBorder || '#9ca3af'}`,
            }}
          >
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : null}
          </div>
        ) : null}

        <div
          className="h-full flex flex-col justify-end text-center"
          dir={dir}
          style={{
            paddingLeft: headerSideReserve,
            paddingRight: headerSideReserve,
            paddingBottom: 25,
          }}
        >
          <h2
            className="font-bold leading-tight"
            style={{ color: nameColor, fontSize: `${nameSize}px` }}
          >
            {student.institute_name || inName}
          </h2>
          <p
            className="leading-snug"
            style={{ color: addressColor, fontSize: `${addressSize}px` }}
          >
            {student.institute_address || inAddress}
          </p>
        </div>
      </div>

      {/* ------------------------- পরীক্ষার নাম — "প্রবেশপত্র" ব্যাজের উপরে */}
      {examLine ? (
        <div
          className="absolute left-0 w-full flex items-center justify-center px-8"
          dir={dir}
          style={{ top: examTop, height: examHeight }}
        >
          <p
            className="text-center text-[13px] whitespace-nowrap"
            style={{ color: t.examNameColor || t.labelColor, lineHeight: 1.5 }}
          >
            {examLine}
          </p>
        </div>
      ) : null}

      {/* প্রবেশপত্র ব্যাজ
      image ভ্যারিয়েন্টে PNG এর নিজের ব্যাজ আছে, কিন্তু সেটা বাংলায় —
      তাই অন্য ভাষায় উপরে সাদা পট্টি দিয়ে ঢেকে নতুন লেখা বসে */}
      {t.ribbonStyle && t.ribbonStyle !== 'none' ? (
        <div
          className="absolute left-0 w-full flex items-center justify-center"
          style={{ top: ribbonTop, height: ribbonHeight }}
        >
          <div
            className="rounded-full px-5 py-[2px]"
            style={{
              border:
                t.ribbonStyle === 'outline' ? `1.5px solid ${t.ribbonColor}` : 'none',
              background: t.ribbonStyle === 'solid' ? t.ribbonBg : 'transparent',
            }}
          >
            <span
              className="font-bold text-[17px] leading-none"
              style={{ color: t.ribbonColor }}
            >
              {getAdmitText('ribbon', lang)}
            </span>
          </div>
        </div>
      ) : lang !== 'bn' && t.ribbonCoverBg ? (
        <div
          className="absolute left-0 w-full flex items-center justify-center"
          style={{
            top: ribbonCoverCfg?.top ?? ribbonTop,
            height: ribbonCoverCfg?.height ?? ribbonHeight,
          }}
        >
          <div
            className="flex items-center justify-center rounded-[4px]"
            style={{
              background: t.ribbonCoverBg,
              width: ribbonCoverCfg?.width ?? 240,
              height: '100%',
            }}
          >
            <span
              className="font-bold text-[17px] leading-none whitespace-nowrap"
              style={{ 
                color: t.ribbonColor || t.accent, 
                fontSize: `${ribbonCoverCfg?.fontSize ?? 17}px`,
              }}
            >
              {getAdmitText('ribbon', lang)}
            </span>
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------- শিক্ষার্থীর তথ্য (দুই কলাম) */}
      <div
        className="absolute left-0 w-full overflow-hidden grid grid-cols-2 gap-x-5 content-start"
        dir={dir}
        style={{
          top: t.bodyTop,
          bottom: bodyBottomEdge,
          paddingLeft: 40,
          paddingRight: 40,
        }}
      >
        {visibleFields.map((fieldName, index) => {
          const label =
            labelOverrides[fieldName] || student[`fieldkey_${fieldName}`] || fieldName;
          const value = getFieldValue(student, fieldName, lang);
          const valueText = formatAdmitValue(fieldName, value, lang);
          const isLast = index === visibleFields.length - 1;

          return (
            /* flex + dir=rtl হলেই label ডানে, value বামে — আরবিতে ঠিকভাবে বসে */
            <div
              key={fieldName}
              className={`flex items-baseline min-w-0 gap-1 ${
                isLast && lastFieldSpansFull ? 'col-span-2' : ''
              }`}
              dir={dir}
              style={{
                color: t.valueColor,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineH}px`,
              }}
            >
              {/* লেবেল — কখনো ছোট হবে না */}
              <span className="shrink-0" style={{ color: t.labelColor }}>
                {label}
              </span>

              <span className="shrink-0">:</span>

              {/* মান — জায়গা কমলে ফন্ট ছোট হবে, কাটবে না */}
              <FitText
                baseSize={fontSize}
                minSize={8}
                lineHeight={lineH}
                className="flex-1 min-w-0"
                style={{ color: t.valueColor }}
              >
                {valueText}
              </FitText>
            </div>
          );
        })}
      </div>

      {/* ------------------- নায়েম | QR | মুহতামিম */}
      {showBottomRow ? (
        <div
          className="absolute left-0 right-0 flex items-end justify-between"
          style={{
            bottom: t.bodyBottom,
            height: t.signatureHeight,
            paddingLeft: t.signPadX ?? 34,
            paddingRight: t.signPadX ?? 34,
          }}
        >
          <SignatureBlock
            t={t}
            image={najemSignature}
            name={student.NajemName || getAdmitText('najem', lang)}
            printDate={stampDate}
            dateLabel={getAdmitText('dateLabel', lang)}
            showImage={signImageEnabled}
            showName={signNameEnabled}
            showDate={signDateEnabled}
          />

          {qrValue ? (
            <div
              className="rounded-[3px] shrink-0"
              style={{
                background: t.qrPad || 'transparent',
                padding: t.qrPad && t.qrPad !== 'transparent' ? 3 : 0,
                lineHeight: 0,
              }}
            >
              <QRCode
                value={qrValue}
                size={qrSize}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
                viewBox="0 0 256 256"
                style={{ width: qrSize, height: qrSize, display: 'block' }}
              />
            </div>
          ) : null}

          <SignatureBlock
            t={t}
            image={principalSignature}
            name={student.PrincipalName || getAdmitText('principal', lang)}
            printDate={stampDate}
            dateLabel={getAdmitText('dateLabel', lang)}
            showImage={signImageEnabled}
            showName={signNameEnabled}
            showDate={signDateEnabled}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AdmitCardGenerate;
