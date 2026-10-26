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
  bn: { subTitle: 'প্রবেশপত্র', academicYear: 'শিক্ষাবর্ষ', seatTitle: 'পরীক্ষার্থীর আসন' },
  en: { subTitle: 'Admission letter', academicYear: 'Academic year', seatTitle: "Candidate's seat" },
  ar: { subTitle: 'بطاقة الدخول', academicYear: 'العام الدراسي', seatTitle: 'مقعد الممتحن' },
};

const layoutText = (key, lang) =>
  LAYOUT_TEXTS[lang]?.[key] ?? LAYOUT_TEXTS.bn[key];

// ---------------------------------------------------------------------------
// প্রপগুলো সব ডিজাইনেই এক — তাই একবারেই সব হিসাব করে নেওয়া হয়।
// এটা হুক নয়, সাধারণ ফাংশন; তাই শর্তের ভিতরে ডাকলেও সমস্যা নেই।
// ---------------------------------------------------------------------------
const resolveCard = (p) => {
  const t = p.template || {};
  const lang = p.lang || DEFAULT_ADMIT_LANG;
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
  blocks,
}) => (
  <div className="absolute" style={{ left, right, top, height }}>
    {qrValue ? (
      <div className="flex justify-center">
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

    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between">
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

  const infoTop = panelTop + (arch ? 10 : 0);
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

      {/* ------------------------------------------------ হেডার: লোগো, নাম, ব্যাজ */}
      <div
        className="absolute flex flex-col items-center"
        dir={dir}
        style={{ left: PAD + 10, right: PAD + 10, top: 14 }}
      >
        {c.logo ? (
          <img
            src={c.logo}
            alt=""
            className="rounded-full bg-white object-contain"
            style={{ width: LOGO, height: LOGO }}
          />
        ) : null}

        <p
          className="mt-1 w-full truncate text-center font-bold leading-tight"
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
      </div>

      {/* ------------------------------------- পরীক্ষার নাম ও শিক্ষাবর্ষ */}
      {c.examLine ? (
        <div
          className="absolute flex items-center justify-center px-6"
          dir={dir}
          style={{ left: PAD, right: PAD, top: infoTop - 22, height: 18 }}
        >
          <p
            className="truncate text-center font-bold"
            style={{
              color: arch ? primary : t.examNameColor || primary,
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

      {/* ইস্যুর তারিখ */}
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
// কোন `layout` এর জন্য কোন কম্পোনেন্ট।
// নতুন ডিজাইন যোগ করলে কেবল এখানে একটা লাইন বাড়বে।
// ---------------------------------------------------------------------------
export const LAYOUT_FACES = {
  navy: NavyAdmitFace,
  classic: ClassicAdmitFace,
  modern: ModernAdmitFace,
  profile: ProfileAdmitFace,
};

/** চেনা না হলে null — তখন AdmitCardFace আগের নিয়মেই আঁকে */
export const getLayoutFace = (layout) => LAYOUT_FACES[String(layout || '')] || null;

export default LAYOUT_FACES;
