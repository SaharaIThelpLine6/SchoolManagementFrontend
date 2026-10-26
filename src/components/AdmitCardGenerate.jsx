import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import QRCode from 'react-qr-code';

// নিজের লেআউটওয়ালা নকশাগুলো — টেমপ্লেটে `layout` থাকলে কেবল তখনই
import { getLayoutFace } from './AdmitCardLayouts';
import {
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_LANG,
  WATERMARK_DEFAULTS,
  buildAdmitQrValue,
  buildPrintCss,
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
 * @param templateObj      টেমপ্লেট অবজেক্ট — দিলে আইডি দিয়ে আর খোঁজা হয় না
 *                         (আপলোড করা ডিজাইনের জন্য এটাই পথ)
 * @param fields           নির্বাচিত ফিল্ডের আইডি অ্যারে (ক্রম বজায় থাকে)
 * @param data             normalizeAdmitRow() দিয়ে ফ্ল্যাট করা শিক্ষার্থীর তালিকা
 * @param reportType       1 = A5 এ ১টি, 2 = A4 এ ২টি, 3 = A4 ল্যান্ডস্কেপে ৪টি
 * @param lang             'bn' | 'en' | 'ar'
 * @param grayscale        সাদা-কালা প্রিন্ট
 * @param inName           প্রতিষ্ঠানের নাম
 * @param inAddress        প্রতিষ্ঠানের ঠিকানা
 * @param inLogo           প্রতিষ্ঠানের লোগো (হেডারের বাম পাশে)
 * @param inWatermark      কার্ডের মাঝের ওয়াটারমার্ক লোগো — আলাদা উৎস
 * @param institutionCode  QR এর ভেরিফিকেশন URL বানাতে
 * @param showQR           QR দেখাবে কি না; না দিলে টেমপ্লেটের সেটিং
 * @param showWatermark    মাঝের ওয়াটারমার্ক দেখাবে কি না; না দিলে দেখাবে
 * @param showPhoto        শিক্ষার্থীর ছবির ঘর দেখাবে কি না
 * @param showSign         স্বাক্ষরের ছবি দেখাবে কি না
 * @param showSignName     স্বাক্ষরের নাম ও রেখা দেখাবে কি না
 * @param showSignDate     স্বাক্ষরের নিচের তারিখ দেখাবে কি না
 * @param zoom             মাস্টার কন্ট্রোল — তথ্যের ঘর, বাঁ স্বাক্ষর, QR ও ডান
 *                         স্বাক্ষর চারটাই একসাথে ছোট-বড় হয়। ১ = আগের মাপ।
 * @param seatOffsetY      আসনের পট্টি কতটা উপরে/নিচে (px)। মাইনাস = উপরে।
 */
const AdmitCardGenerate = ({
  templateId,
  // আপলোড করা ডিজাইন ADMIT_TEMPLATES তালিকায় থাকে না (সার্ভার থেকে আসে),
  // তাই আইডি দিয়ে খুঁজে পাওয়া যায় না — getTemplate() তখন চুপচাপ প্রথম
  // বিল্ট-ইন ডিজাইনটা ফেরত দিত, আর ছাপা হতো ডিফল্ট নকশায়।
  // পেজ তাই অবজেক্টটাই পাঠিয়ে দেয়; সেটা থাকলে সেটাই চূড়ান্ত।
  templateObj = null,
  fields = [],
  data = [],
  reportType = 1,
  lang = DEFAULT_ADMIT_LANG,
  grayscale = false,
  inName,
  inAddress,
  inLogo,
  inWatermark,
  institutionCode,
  showQR,
  showWatermark,
  showPhoto,
  showSign,
  showSignName,
  showSignDate,
  seats = null,
  zoom = 1,
  seatOffsetY = 0,
}) => {
  const template = templateObj || getTemplate(templateId);
  const layout = getPrintLayout(reportType);
  const rows = Array.isArray(data) ? data : [];

  const pages = useMemo(() => chunk(rows, layout.perPage), [rows, layout.perPage]);

  // সব কার্ডে একই তারিখ — প্রতি কার্ডে নতুন Date() বানালে
  // মধ্যরাতে বড় ব্যাচ প্রিন্ট করলে কিছু কার্ডে আলাদা তারিখ পড়তে পারত
  const printDate = useMemo(() => getPrintDate(new Date(), lang), [lang]);

  if (!rows.length) return null;

  return (
    <div className="admit-print-root font-SolaimanLipi">
      <style>{buildPrintCss({
        layout,
        cardW: CARD_W,
        cardH: CARD_H,
        grayscale,
        prefix: 'admit',
      })}</style>

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
                  inWatermark={inWatermark}
                  institutionCode={institutionCode}
                  showQR={showQR}
                  showWatermark={showWatermark}
                  showPhoto={showPhoto}
                  showSign={showSign}
                  showSignName={showSignName}
                  showSignDate={showSignDate}
                  zoom={zoom}
                  seatOffsetY={seatOffsetY}
                  seatText={
                    seats?.get?.(
                      String(student.AdmissionID ?? student.UserID ?? student.StudentCode)
                    ) || ''
                  }
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
          top: (t.examTop ?? t.headerHeight) + (t.examHeight ?? 0) + (t.headerDividerGap ?? 10),
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
 *
 * zoom দিলে পুরো ব্লকটা scale হয়, কিন্তু *লেআউট* বদলায় না — transform
 * জায়গা দখল করে না, তাই justify-between এর হিসাব আগের মতোই থাকে আর
 * মাঝের QR নিজের জায়গা থেকে এক পিক্সেলও সরে না।
 *
 * origin দিয়ে কোন দিক ধরে বড় হবে তা ঠিক হয় — বাঁ ব্লক বাঁ কিনারা ধরে,
 * ডান ব্লক ডান কিনারা ধরে। নইলে বড় করলে ব্লকটা কার্ডের বাইরে বেরিয়ে
 * যেত আর অর্ধেক কেটে যেত।
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
  zoom = 1,
  origin = 'bottom center',
}) => (
  <div
    className="text-center w-[120px] shrink-0"
    style={
      zoom !== 1
        ? { transform: `scale(${zoom})`, transformOrigin: origin }
        : undefined
    }
  >
    {showImage ? (
      // 👇 ১. h-[32px] এর জায়গায় h-[40px] বা h-[45px] দিন (যতটা উপরে তুলতে চান)
      <div className="h-[40px] flex items-end justify-center overflow-visible">
        {image ? (
          <img
            src={image}
            alt=""
            // 👇 ২. max-h-[40px] থেকে বাড়িয়ে max-h-[55px] বা max-h-[60px] করুন
            // 👇 ৩. -mb-[2px] (নেগেটিভ মার্জিন) দিলে ছবিটা লাইনের আরও কাছে চলে যাবে
            className="max-h-[55px] object-contain mb-[1px]"
          />
        ) : null}
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
  inWatermark,
  institutionCode,
  showQR,
  showWatermark,
  showPhoto,
  // নতুন — বাঁ (নায়েম) ও ডান (মুহতামিম) সম্পূর্ণ আলাদা
  najemShowSign,
  najemShowName,
  najemShowDate,
  principalShowSign,
  principalShowName,
  principalShowDate,
  // পুরোনো — দুই পাশেই প্রয়োগ হতো। নতুন প্রপ না দিলে এটাই ফলব্যাক।
  showSign,
  showSignName,
  showSignDate,
  // আসনের লাইন — স্বাক্ষর ও QR এর ঠিক উপরে এক পট্টিতে।
  // ফাঁকা দিলে (বা না দিলে) কিছুই আঁকা হয় না, কার্ড আগের মতোই থাকে।
  seatText = '',
  seatStyle = null,
  // আসনের পট্টিটা কতটা উপরে/নিচে বসবে (px)। মাইনাস = উপরে, প্লাস = নিচে।
  // ০ দিলে আগের জায়গাতেই — স্বাক্ষরের সারির ঠিক উপরে।
  seatOffsetY = 0,
  // মাস্টার কন্ট্রোল — একটা মানেই চারটা অংশ (তথ্যের ঘর, বাঁ স্বাক্ষর,
  // QR, ডান স্বাক্ষর) একসাথে ছোট-বড় হয়। ১ = আগের মাপ, তাই প্রপটা না
  // দিলে কার্ডের চেহারা একটুও বদলায় না।
  zoom = 1,
  printDate,
  labelOverrides = {},
  cardHeight,
  bodyEnd,
}) => {
  // ---------------------------------------------------------------------
  // নিজের লেআউট আছে এমন নকশা।
  //
  // শর্তটা সবার আগে, কারণ নিচের পুরো হিসাবটা (জোন, ফ্রেম, দুই কলামের ঘর)
  // পুরোনো নকশাগুলোর জন্য — ওই নকশাগুলো নিজের মতো করেই আঁকে।
  // `layout` না থাকলে (বা নামটা অচেনা হলে) ক্লজটা বসেই না, তাই বাকি সব
  // কার্ড হুবহু আগের মতোই ছাপে।
  // ---------------------------------------------------------------------
  const LayoutFace = template?.layout ? getLayoutFace(template.layout) : null;

  if (LayoutFace) {
    return (
      <LayoutFace
        template={template}
        fields={fields}
        student={student}
        lang={lang}
        inName={inName}
        inAddress={inAddress}
        inLogo={inLogo}
        inWatermark={inWatermark}
        institutionCode={institutionCode}
        showQR={showQR}
        showWatermark={showWatermark}
        showPhoto={showPhoto}
        najemShowSign={najemShowSign}
        najemShowName={najemShowName}
        principalShowSign={principalShowSign}
        principalShowName={principalShowName}
        showSign={showSign}
        showSignName={showSignName}
        seatText={seatText}
        seatOffsetY={seatOffsetY}
        zoom={zoom}
        printDate={printDate}
        labelOverrides={labelOverrides}
        cardHeight={cardHeight}
        bodyEnd={bodyEnd}
      />
    );
  }

  const t = template;
  const dir = getAdmitDir(lang);

  // শূন্য বা উল্টোপাল্টা মান এলে আগের মাপেই ফিরি — নইলে কার্ডটা
  // একদম মিইয়ে যেতে পারত
  const z = Number(zoom) > 0 ? Number(zoom) : 1;

  // কার্ডের উচ্চতা — না দিলে আগের মতোই CARD_H (৪১০)।
  // রুটিনসহ টেমপ্লেটে ৭৪০ দেওয়া হয়, তখন ফ্রেম, ব্যাকগ্রাউন্ড ও স্বাক্ষরের
  // সারি পুরো পৃষ্ঠা জুড়েই বসে — রুটিন তখন এই একই বাক্সের ভিতরে পড়ে।
  const cardH = cardHeight || CARD_H;
  const isTall = cardH > CARD_H;

  const nameColor = student.admit_name_color || t.nameColor;
  const nameSize = student.admit_name_size || t.nameSize;
  const addressColor = student.admit_address_color || t.addressColor;
  const addressSize = student.admit_address_size || t.addressSize;
  const examColorVal = student.admit_exam_color || t.examNameColor || t.labelColor;
  const examSize = student.admit_exam_size || t.examNameSize || 13;

  const photo = toImageSrc(student.UserImage);
  const najemSignature = toImageSrc(student.SignatureNajem || student.signatureNajem);
  const principalSignature = toImageSrc(
    student.SignaturePrincipal || student.signaturePrincipal
  );
  // হেডারের বাম পাশের প্রতিষ্ঠানের লোগো
  const logo = toImageSrc(
    student.Logo || student.logo || student.InstituteLogo || inLogo
  );

  // কার্ডের মাঝের ওয়াটারমার্ক — সম্পূর্ণ আলাদা উৎস (WebsiteSettings.documentLogo)।
  // এটা বন্ধ করলেও উপরের হেডার লোগোতে কোনো প্রভাব পড়ে না।
  // prop না দিলে ডিফল্টে দেখাবে; ছবি না থাকলে এমনিতেই কিছু বসে না।
  const watermarkOn = showWatermark === undefined ? true : Boolean(showWatermark);
  const watermark = watermarkOn
    ? toImageSrc(student.Watermark || student.DocumentLogo || inWatermark)
    : '';

  // prop না পেলে নিজেই আজকের তারিখ বানায় (এডিটরের প্রিভিউ এই পথে আসে)
  const stampDate = printDate || getPrintDate(new Date(), lang);

  // prop দিলে সেটাই চূড়ান্ত, না দিলে টেমপ্লেটের ডিফল্ট
  const qrEnabled = showQR === undefined ? Boolean(t.showQR) : Boolean(showQR);
  const photoEnabled = showPhoto === undefined ? Boolean(t.showPhoto) : Boolean(showPhoto);

  // স্বাক্ষরের তিনটি অংশ — বাঁ (নায়েম) ও ডান (মুহতামিম) প্রতিটার জন্য।
  // অগ্রাধিকার: নতুন প্রপ > পুরোনো প্রপ > টেমপ্লেট ডিফল্ট।
  const resolveOn = (newProp, oldProp, tplDefault) => {
    if (newProp !== undefined) return Boolean(newProp);
    if (oldProp !== undefined) return Boolean(oldProp);
    return Boolean(tplDefault);
  };

  const najemSignOn = resolveOn(najemShowSign, showSign, t.showSignature);
  const najemNameOn = resolveOn(najemShowName, showSignName, t.showSignature);
  const najemDateOn = resolveOn(
    najemShowDate,
    showSignDate,
    t.showSignDate !== false
  );

  const principalSignOn = resolveOn(principalShowSign, showSign, t.showSignature);
  const principalNameOn = resolveOn(principalShowName, showSignName, t.showSignature);
  const principalDateOn = resolveOn(
    principalShowDate,
    showSignDate,
    t.showSignDate !== false
  );

  // দুই পাশের কোনো একটা অংশ থাকলেই নিচের সারি আঁকা হয়
  const anySignPart =
    najemSignOn || najemNameOn || najemDateOn ||
    principalSignOn || principalNameOn || principalDateOn;

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

  // ---- ছাপা কাগজের উপর ছাপা
  // প্রেস থেকে ছাপানো প্রবেশপত্রের কাগজে নকশা, লোগো, প্রতিষ্ঠানের নাম ও
  // "প্রবেশপত্র" লেখাটা আগে থেকেই আছে। তাই ওই অংশগুলো আমরা আর ছাপি না —
  // ছাপলে এক লেখার উপর আরেক লেখা পড়ত।
  //
  // লুকানোটা হয় কেবল @media print এ (ক্লাসের নিয়মটা buildPrintCss এ), তাই
  // পর্দায় ডিজাইনটা দেখা যায় আর ঘরগুলো মিলিয়ে নেওয়া যায়।
  //
  // overlay না থাকলে ক্লাসটা বসেই না — তাই বাকি সব কার্ড হুবহু আগের মতোই।
  const overlay = Boolean(t.overlay);
  const paperOnly = overlay ? ' admit-paper-only' : '';

  // "প্রবেশপত্র" ব্যাজটা বাদ গেলে ওই জায়গাটা খালি পড়ে থাকত, তাই পরীক্ষার
  // নামের স্ট্রিপটা ঠিক ওখানেই নেমে আসে — কাগজের ছাপা ব্যাজের নিচে।
  const examStripTop = overlay ? ribbonTop : examTop;
  const examStripHeight = overlay ? Math.max(ribbonHeight, examHeight) : examHeight;

  // ---- চারটি ঘরের উপর-নিচ
  // আপলোড করা ডিজাইনে প্রতিষ্ঠানভেদে ব্যানারের উচ্চতা আলাদা হয়, তাই
  // ঘরগুলোকে একটু সরানোর দরকার পড়ে। সরানো হয় translateY দিয়ে — ঘরের
  // উচ্চতা, ভিতরের সাজ, কিছুই বদলায় না, পুরো ঘরটা যেমন আছে তেমনই সরে।
  // মাইনাস = উপরে, প্লাস = নিচে। টেমপ্লেটে না থাকলে ০, মানে আগের মতোই,
  // তাই বিল্ট-ইন ডিজাইনগুলোর চেহারা এতে একটুও বদলায় না।
  const shiftY = (n) => (n ? { transform: `translateY(${n}px)` } : null);
  const headerShift = shiftY(t.headerOffsetY ?? 0);
  const ribbonShift = shiftY(t.ribbonOffsetY ?? 0);
  const bodyShift = shiftY(t.bodyOffsetY ?? 0);
  const signShift = shiftY(t.signOffsetY ?? 0);

  // আসনের পট্টির নিজের সরণ — স্বাক্ষরের সারির সাথেই চলে (টেমপ্লেটের
  // signOffsetY), তার উপরে পেজ থেকে আসা seatOffsetY যোগ হয়। তাই
  // পট্টিটা স্বাক্ষর-QR কে না ছুঁয়েই আলাদা করে উপর-নিচ করা যায়।
  const seatShift = shiftY((t.signOffsetY ?? 0) + (Number(seatOffsetY) || 0));

  // ভাষা অনুযায়ী স্ট্রিপের মাপ — না থাকলে টেমপ্লেটের ডিফল্ট
  const langKey = lang === 'en' ? 'en' : lang === 'ar' ? 'ar' : 'bn';
  const ribbonCoverCfg =
    t.ribbonCoverByLang?.[langKey] ?? t.ribbonCover ?? null;

  // আসনের পট্টি — A4 রুটিন কার্ডে যেমন, A5 এও হুবহু তেমন, শুধু জায়গাটা
  // স্বাক্ষর ও QR এর সারির ঠিক উপরে।
  const seatOn = Boolean(String(seatText || '').trim());
  const SEAT_H = 18;
  const SEAT_GAP = 4;
  const seatBottom = (t.bodyBottom || 28) + (t.signatureHeight || 60) + SEAT_GAP;
  const seatSkin = {
    bg: seatStyle?.bg ?? '#f9fafb',
    border: seatStyle?.border ?? (t.signLineColor || t.labelColor || '#9ca3af'),
    color: seatStyle?.color ?? (t.valueColor || '#111827'),
  };

  // তথ্য ব্লকের নিচের সীমা — স্বাক্ষরের জোনের ঠিক উপরে।
  // আসনের পট্টি বসলে ততটুকু জায়গা ছেড়ে দিতে হয়, নইলে শেষ সারিটার
  // উপর পট্টিটা চেপে বসত।
  const bodyBottomEdge =
    (t.bodyBottom || 28) +
    (t.signatureHeight || 60) +
    (seatOn ? SEAT_H + SEAT_GAP : 0);

  // যতটুকু জায়গা আছে তার মধ্যেই ফিল্ডগুলো ফিট করানো হয়
  // ফিল্ডগুলো দুই কলামে পাশাপাশি বসে, তাই সারির সংখ্যা অর্ধেক
  //
  // bodyEnd না দিলে আগের নিয়মই — স্বাক্ষরের জোনের ঠিক উপরে শেষ।
  // রুটিনসহ কার্ডে bodyEnd দেওয়া হয়, তাই তথ্যগুলো উপরের দিকেই থাকে
  // আর নিচের জায়গাটা রুটিনের জন্য খালি থাকে।
  const visibleFields = fields.filter(Boolean);
  const bodyEndY = bodyEnd || cardH - bodyBottomEdge;
  const bodyHeight = bodyEndY - t.bodyTop;
  const rowCount = Math.max(Math.ceil(visibleFields.length / 2), 1);
  const baseLineH = Math.max(15, Math.min(26, Math.floor(bodyHeight / rowCount)));
  const baseFont = Math.max(11, Math.min(15, baseLineH - 9));

  // মাস্টার কন্ট্রোল তথ্যের ঘরে ফন্টের মাপ ধরে কাজ করে (transform নয়) —
  // তাতে দুই কলামের প্রস্থ অটুট থাকে, শুধু লেখাটাই বড়-ছোট হয়।
  // সারির উচ্চতা তখনই বাড়ে যখন ফন্ট সত্যিই বড় হয়ে যায়, নইলে আগের
  // মাপেই থাকে — তাই ছোট করলে ঘরটা হঠাৎ ফাঁকা দেখায় না।
  const fontSize = Math.round(baseFont * z * 10) / 10;
  const lineH = Math.max(baseLineH, Math.round(fontSize + 4));

  // বেজোড় সংখ্যক ফিল্ড হলে শেষেরটা পুরো প্রস্থ জুড়ে বসবে
  const lastFieldSpansFull = visibleFields.length % 2 === 1;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: CARD_W, height: cardH, background: '#ffffff' }}
    >
      {/* নকশার স্তর — ছবি বা আঁকা ফ্রেম। overlay হলে ছাপায় বাদ। */}
      <div className={`absolute inset-0${paperOnly}`}>
      {t.variant === 'image' ? (
        isTall && !t.imageFull ? (
          <>
            {/* বিল্ট-ইন রুটিন টেমপ্লেটগুলোর PNG ৫২০×৪১০ মাপে আঁকা — A5 এর
                ছবিটাই ওরা ব্যবহার করে। কার্ড লম্বা হলে ওটাকে টেনে লম্বা
                করলে কোনার নকশা বিকৃত হতো, তাই ছবিটা উপরের অংশেই থাকে আর
                পুরো কার্ড ঘিরে একটা পাতলা ফ্রেম বসে।

                আপলোড করা A4 ডিজাইনে এটা খাটে না — ওই ছবিটা পুরো পৃষ্ঠার
                মাপেই (৫২০×৭৪০, অর্থাৎ ১৫৬০×২২২০) আঁকা। তাই সেখানে
                `imageFull` থাকে আর ছবিটা পুরো কার্ড জুড়েই বসে, নইলে
                উপরে A5 এর নকশা আর নিচে খালি সাদা দেখা যেত। */}
            <img
              src={t.image}
              alt=""
              className="absolute left-0 top-0 w-full object-fill"
              style={{ height: CARD_H }}
            />
            <div
              className="absolute"
              style={{ inset: 6, border: `1.5px solid ${t.accent || t.frameColor}` }}
            />
          </>
        ) : (
          <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-fill" />
        )
      ) : (
        <PaintedChrome t={t} />
      )}
      </div>

      {/* ---------------------------------------------- মাঝের লোগো ওয়াটারমার্ক
          ব্যাকগ্রাউন্ডের ঠিক পরে, কিন্তু বাকি সব লেখার আগে — তাই লেখাগুলো
          লোগোর উপরে পড়ে, নিচে চাপা পড়ে না। pointer-events-none দেওয়া আছে
          যাতে কার্ডের উপর কোনো ক্লিক আটকে না যায়। */}
      {watermark ? (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none${paperOnly}`}
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

      {/* ------------------------- হেডার: লোগো | নাম ও ঠিকানা | শিক্ষার্থীর ছবি */}
      <div
        className={`absolute left-0 top-0 w-full${paperOnly}`}
        style={{ height: t.headerHeight, ...headerShift }}
      >
        {logo ? (
          <img
            src={logo}
            alt=""
            className="absolute top-2/3 -translate-y-1/2 h-[64px] w-[64px] object-contain"
            style={{ 
              left: t.logoInset ?? 36, 
              top: t.logoTop ?? '66%', 
              transform: `translateY(calc(-50% + ${t.logoOffsetY ?? 0}px))`, 
            }}
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
              transform: `translateY(calc(-50% + ${t.photoOffsetY ?? 0}px))`,
            }}
          >
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : null}
          </div>
        ) : null}

        <div
          className="h-full flex flex-col justify-center items-center text-center"
          dir={dir}
          style={{
            paddingLeft: headerSideReserve,
            paddingRight: headerSideReserve,
            paddingTop: 8,
            paddingBottom: 8,
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
          style={{ top: examStripTop, height: examStripHeight, ...headerShift }}
        >
          <p
            className="text-center whitespace-nowrap"
            style={{
              color: examColorVal,
              fontSize: `${examSize}px`,
              lineHeight: 1.5,
            }}
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
          className={`absolute left-0 w-full flex items-center justify-center${paperOnly}`}
          style={{ top: ribbonTop, height: ribbonHeight, ...ribbonShift }}
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
          className={`absolute left-0 w-full flex items-center justify-center${paperOnly}`}
          style={{
            top: ribbonCoverCfg?.top ?? ribbonTop,
            height: ribbonCoverCfg?.height ?? ribbonHeight,
            ...ribbonShift,
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
          // bodyEnd দিলে bottom এর বদলে height — তাই কার্ড লম্বা হলেও
          // তথ্যের ঘরটা নিচে ছড়িয়ে পড়ে না, নিজের জোনেই থাকে।
          // না দিলে আগের নিয়মই অক্ষুণ্ন।
          ...(bodyEnd ? { height: bodyHeight } : { bottom: bodyBottomEdge }),
          paddingLeft: 40,
          paddingRight: 40,
          ...bodyShift,
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
              {/* লেবেল — মানের মতোই রঙ ও ওজন, যাতে দুইটা একসাথে ভালো দেখায় */}
              <span
                className="shrink-0"
                style={{ color: t.valueColor, fontWeight: 700 }}
              >
                {label}
              </span>

              <span
                className="shrink-0"
                style={{ color: t.valueColor, fontWeight: 700 }}
              >:</span>

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

      {/* ------------------------------- আসন — হল, কলাম, সারি, আসন নম্বর */}
      {seatOn ? (
        <div
          className="absolute flex items-center justify-center rounded-[4px]"
          style={{
            left: t.signPadX ?? 150,
            right: t.signPadX ?? 150,
            bottom: seatBottom,
            height: SEAT_H,
            ...seatShift,
            background: seatSkin.bg,
            border: `1px solid ${seatSkin.border}`,
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <FitText
            baseSize={11}
            minSize={8}
            lineHeight={SEAT_H - 4}
            className="font-bold text-center"
            style={{ color: seatSkin.color }}
          >
            {seatText}
          </FitText>
        </div>
      ) : null}

      {/* ------------------- নায়েম | QR | মুহতামিম */}
      {showBottomRow ? (
        <div
          className="absolute left-0 right-0 flex items-end justify-between"
          style={{
            bottom: t.bodyBottom,
            height: t.signatureHeight,
            paddingLeft: t.signPadX ?? 34,
            paddingRight: t.signPadX ?? 34,
            ...signShift,
          }}
        >
          <SignatureBlock
            t={t}
            image={najemSignature}
            name={student.NajemName || getAdmitText('najem', lang)}
            printDate={stampDate}
            dateLabel={getAdmitText('dateLabel', lang)}
            showImage={najemSignOn}
            showName={najemNameOn}
            showDate={najemDateOn}
            zoom={z}
            origin={dir === 'rtl' ? 'bottom right' : 'bottom left'}
          />

          {qrValue ? (
            <div
              className="shrink-0"
              style={
                z !== 1
                  ? { transform: `scale(${z})`, transformOrigin: 'bottom center' }
                  : undefined
              }
            >
              <div
                className="rounded-[3px] flex flex-col items-center justify-center" // flex যোগ করা হয়েছে
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

                {/* 👇 এখানে নিচের লেখাটি যোগ করা হয়েছে */}
                <p
                  className="mt-1 text-center font-bold"
                  style={{
                    fontSize: '5px',       // লেখার সাইজ (প্রয়োজন অনুযায়ী বাড়াতে/কমাতে পারেন)
                    lineHeight: '12px',    // লাইন হাইট ঠিক করা হয়েছে যেন QR এর সাথে লেগে না যায়
                    color: t.labelColor || '#111827', // টেমপ্লেটের রঙ অথবা কালো
                    whiteSpace: 'nowrap'
                  }}
                >
                  ফলাফল দেখতে QR Codeটি স্ক্যান করুন
                </p>
              </div>
            </div>
          ) : null}

          <SignatureBlock
            t={t}
            image={principalSignature}
            name={student.PrincipalName || getAdmitText('principal', lang)}
            printDate={stampDate}
            dateLabel={getAdmitText('dateLabel', lang)}
            showImage={principalSignOn}
            showName={principalNameOn}
            showDate={principalDateOn}
            zoom={z}
            origin={dir === 'rtl' ? 'bottom left' : 'bottom right'}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AdmitCardGenerate;
