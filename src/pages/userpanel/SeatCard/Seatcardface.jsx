// =============================================================================
// একটা সিট কার্ড
//
// ⭐ কার্ডের চেহারাটা এই এক জায়গাতেই — ছাপার কাগজ (BSeatNoWhite) আর
//    সেটিংসের নমুনা (SeatCardSettingsModal), দুইটাই এখান থেকেই আঁকে।
//
// আলাদা করার কারণ: নমুনাটা আলাদা করে লিখলে দুই জায়গার চেহারা আস্তে
// আস্তে আলাদা হয়ে যেত — সেটিংসে এক রকম দেখাত, কাগজে আরেক রকম ছাপা হত।
// এখন যা দেখছেন ঠিক তাই ছাপা হবে।
//
// দুইটা জিনিস রপ্তানি হয়:
//   seatCardFaceCss   → CSS, একবারই <style> এ বসাতে হয়
//   <SeatCardFace />  → একটা কার্ড
//
// CSS টা কম্পোনেন্টের ভিতরে রাখিনি ইচ্ছে করেই — তাহলে প্রতিটা কার্ডের
// সাথে একটা করে <style> যেত, এক পাতায় আটটা কার্ড মানে আটবার একই CSS।
//
// src/pages/userpanel/SeatCard/SeatCardFace.jsx
// =============================================================================

import SeatCardWatermark from './SeatCardWatermark';
import {
  borderStyleValue,
  hasValue,
  toBn,
  visibleFieldsOfSection,
} from '../../../Data/seatCardFields';
import {
  boxLayout,
  clampWatermarkOpacity,
  cssVars,
  detailAlign,
  detailFill,
  getSeatTemplate,
  hasSignRow,
  headLogoSide,
  titleStyle,
} from '../../../Data/seatCardTemplates';

// ঘর ফাঁকা থাকলে যা বসবে
const DASH = '-';

export const seatCardFaceCss = `
  /* ---- কার্ড ----
     সব মাপ ও রঙ var(--sc-…) থেকে, তাই টেমপ্লেট বদলালে এই CSS এ
     কিছু বদলাতে হয় না */
  .seat-card {
    box-sizing: border-box;
    position: relative;
    border: var(--sc-frame);
    border-radius: var(--sc-radius);
    padding: 2.5mm 3.5mm;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* ⭐ ছড়িয়ে বসবে নাকি উপর থেকে — "অনেক ফাঁকা" লাগার মূল চাবি */
    justify-content: var(--sc-justify);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ⭐ জলছাপ লেখার নিচে থাকবে।
     জলছাপের z-index ১, তাই কার্ডের বাকি অংশকে ২ দিতে হয় — নইলে
     ঘনত্ব বাড়ালে লোগোটা লেখার উপরে এসে পড়ত। */
  .seat-card > *:not(.seat-card-watermark) { position: relative; z-index: 2; }

  /* ---- মাথা ---- */
  .sc-head {
    display: flex;
    align-items: center;
    gap: 2mm;
    background: var(--sc-head-bg);
    color: var(--sc-head-color);
    border-bottom: var(--sc-head-divider);
    /* রঙিন পট্টি হলে কার্ডের কিনারা পর্যন্ত যায়, নইলে প্যাডিং লাগে না */
    margin: -2.5mm -3.5mm 1mm;
    padding: 1.2mm 3.5mm;
  }
  .sc-head-txt { flex: 1 1 auto; min-width: 0; text-align: center; }
  .sc-head-txt .sc-h-0 {
    font-size: var(--sc-name); font-weight: 700; line-height: 1.2;
  }
  .sc-head-txt .sc-h-n { font-size: var(--sc-sub); line-height: 1.35; }

  .sc-head-logo {
    flex: 0 0 auto;
    width: 11mm; height: 11mm;
    object-fit: contain;
  }

  /* ---- শিরোনামের পট্টি ---- */
  .sc-title { text-align: center; margin-bottom: 1mm; }
  .sc-title > span {
    display: inline-block;
    font-size: var(--sc-title); font-weight: 700; line-height: 1.2;
    padding: 0.6mm 3mm;
    border: 0.3mm solid currentColor;
  }
  .sc-title-pill > span { border-radius: 99mm; }
  .sc-title-box > span { border-radius: 0.5mm; }

  /* ---- মাঝের অংশ: ডান পাশে ঘর থাকলে পাশাপাশি ---- */
  .sc-body { display: flex; align-items: stretch; gap: 2.5mm; min-width: 0; }
  .sc-body > .sc-details { flex: 1 1 auto; min-width: 0; }

  /* ---- বড় ঘর ----
     ⭐ এই ঘরগুলোর লেখা "লেখার আকার" স্লাইডারে ছোট-বড় হয় না, সব
     জায়গায় একই মাপ। আগে হত, তাতে ১২৫% এ গিয়ে "বেঞ্চ নং" এর মান
     ঘরে আঁটত না, কেটে "…" হয়ে যেত। */
  .sc-boxes { display: flex; width: 100%; margin: 1.5mm 0; }
  .sc-boxes > div {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    padding: 0.8mm 1mm 1.2mm;
  }
  .sc-boxes .sc-b-lbl { font-size: var(--sc-box-lbl); line-height: 1.1; }
  .sc-boxes .sc-b-val {
    font-size: var(--sc-box-val); font-weight: 700; line-height: 1.15;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  /* মানটা সংখ্যা না হয়ে লেখা হলে ("কলাম ৩") অনেক লম্বা, তাই ছোট মাপে */
  .sc-boxes .sc-b-val.sc-b-txt { font-size: var(--sc-box-txt); line-height: 1.25; }

  /* একসাথে বাঁধানো — একটাই রেখা, ভিতরে ভাগ */
  .sc-boxes-joined { border: 0.4mm solid #000000; }
  .sc-boxes-joined > div + div { border-left: 0.4mm solid #000000; }

  /* আলাদা আলাদা — প্রতিটার নিজের রেখা */
  .sc-boxes-separate { gap: 1.5mm; }
  .sc-boxes-separate > div { border: 0.4mm solid #000000; }

  /* ডান পাশে খাড়া — তথ্যের লাইনের পাশে */
  .sc-boxes-right {
    flex: 0 0 auto;
    width: auto;
    margin: 0;
    flex-direction: column;
    justify-content: center;
    gap: 1.2mm;
  }
  .sc-boxes-right > div {
    flex: 0 0 auto;
    min-width: 17mm;
    border: 0.4mm solid #000000;
  }

  /* ---- নিচের তথ্য ---- */
  .sc-details { text-align: left; }
  .sc-details.sc-center { text-align: center; }

  .sc-d-row {
    font-size: var(--sc-detail); line-height: 1.45;
    display: flex; align-items: baseline; gap: 1mm;
    min-width: 0;
  }
  .sc-center .sc-d-row { justify-content: center; }
  .sc-d-lbl { flex: 0 0 auto; }
  .sc-d-val {
    font-weight: 700;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ফাঁকা জায়গা ভরা — বিন্দু বা টানা রেখা, ডেমো ফরমের মতো */
  .sc-d-fill { flex: 1 1 auto; min-width: 3mm; }
  .sc-fill-dots .sc-d-fill { border-bottom: 0.3mm dotted #000000; }
  .sc-fill-line .sc-d-fill { border-bottom: 0.3mm solid #000000; }

  /* ছড়িয়ে বসা — বড় ঘর না থাকলে লেখা কম, তাই লাইনে একটু হাওয়া */
  .sc-airy .sc-d-row { line-height: 1.95; }

  /* ---- স্বাক্ষর ---- */
  .sc-sign { display: flex; gap: 4mm; margin-top: 2mm; }
  .sc-sign > div {
    flex: 1 1 0; min-width: 0;
    text-align: center;
    font-size: var(--sc-sign); line-height: 1.2;
    border-top: 0.3mm solid #000000;
    padding-top: 0.6mm;
  }

  .sc-clamp {
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
`;

/**
 * একটা সিট কার্ড।
 *
 *   row      → সাজানো সারি (BSeatNoWhite এর normalize যা বানায়)
 *   settings → সিট কার্ড সেটিংস
 *   logo     → জলছাপ ও মাথার লোগো
 *   withSeat → আসন নং সহ কি না (false হলে বড় ঘরগুলো বসে না)
 */
const SeatCardFace = ({ row, settings, logo = '', withSeat = true }) => {
  /* ---- সেটিংস অনুযায়ী কোন ঘরগুলো বসবে */
  const headerFields = visibleFieldsOfSection(settings, 'header');
  const boxFields = withSeat ? visibleFieldsOfSection(settings, 'box') : [];
  const detailFields = visibleFieldsOfSection(settings, 'detail');

  /* ---- সেটিংস অনুযায়ী চেহারা */
  const template = getSeatTemplate(settings?.templateId);
  const boxes = boxLayout(template.id);
  const fill = detailFill(template.id);
  const titleBand = titleStyle(template.id);
  const logoSide = headLogoSide(template.id);
  const centered = detailAlign(template.id) === 'center';
  const signRow = hasSignRow(template.id);

  /**
   * ⭐ বাইরের রেখা — টেমপ্লেট আর সেটিংস, দুইটাই মানা হয়।
   *
   * রেখার রঙ ও কোনা টেমপ্লেটের, কিন্তু কাটা না টানা সেটা ব্যবহারকারীর
   * নিজের বাছাই (আগের "কার্ডের দাগ" সেটিংস) — ওটা কেড়ে নিলে পুরোনো
   * সেটিংসটা অকেজো হয়ে যেত। শুধু টেমপ্লেটে দুই রেখা বা রেখা-নেই বলা
   * থাকলে টেমপ্লেটই শেষ কথা, কারণ ওই দুইটা কাটা/টানা দিয়ে বোঝানোর
   * উপায় নেই।
   */
  const frameStyle = template.frame?.style;
  const frameOverride =
    frameStyle === 'none'
      ? 'none'
      : frameStyle === 'double'
      ? `1mm double ${template.frame?.color || '#000000'}`
      : `0.4mm ${borderStyleValue(settings?.borderStyle)} ${
          template.frame?.color || '#000000'
        }`;

  // টেমপ্লেটের মানগুলো CSS ভেরিয়েবল হয়ে কার্ডে বসে
  const cardVars = {
    ...cssVars(template.id, settings?.fontScale),
    '--sc-frame': frameOverride,
  };

  /**
   * শিরোনামের পট্টিতে কোন লেখাটা বসবে।
   *
   * নতুন কোনো লেখা বানানো হয় না — মাথার শেষ ঘরটাই (সাধারণত পরীক্ষার
   * নাম) পট্টিতে ওঠে, ডেমো ডিজাইনে যেভাবে আছে। মাথায় একটাই ঘর থাকলে
   * পট্টি বসে না, নইলে প্রতিষ্ঠানের নামটাই পট্টিতে উঠে যেত।
   */
  const bandField =
    titleBand !== 'none' && headerFields.length > 1
      ? headerFields[headerFields.length - 1]
      : null;
  const topFields = bandField ? headerFields.slice(0, -1) : headerFields;

  /** বড় ঘরের মান — সংখ্যা হলে বাংলা অঙ্কে, দরকারে দুই ঘরে (৩ → ০৩) */
  const boxValue = (field) => {
    const raw = row?.[field.key];
    if (!hasValue(raw)) return DASH;

    const n = Number(String(raw).trim());
    if (!Number.isFinite(n)) return raw;      // "কলাম ২" এর মতো লেখা হলে যেমন আছে

    return toBn(field.pad && n < 10 ? `0${n}` : n);
  };

  /**
   * মানটা ঘরে আঁটার মতো ছোট কি না।
   *
   * ⭐ "সংখ্যা কি না" দিয়ে বিচার করা যায় না — ডেটাবেজে আসন নং বাংলা
   * অঙ্কেও থাকতে পারে ('০১'), আর Number('০১') হয় NaN। তখন আসল আসন
   * নম্বরটাই ছোট মাপে বসে যেত, অথচ ওটাই কার্ডের সবচেয়ে জরুরি জিনিস।
   *
   * তাই লম্বা-ছোট দেখেই ঠিক করি: চার অক্ষর পর্যন্ত বড় মাপে ('০১', '১০৫',
   * '1234'), তার বেশি হলে ছোট মাপে ('কলাম ৩') — নইলে ঘরে আঁটে না, কেটে
   * "…" হয়ে যায়। ঘরটার চওড়া তো বাড়ে না, কার্ডের তিন ভাগের এক ভাগই থাকে।
   */
  const isShort = (field) => {
    const raw = row?.[field.key];
    return !hasValue(raw) || String(raw).trim().length <= 4;
  };

  /** নিচের লাইনের মান — আইডির মতো সংখ্যাগুলো বাংলা অঙ্কে */
  const detailValue = (field) => {
    const raw = row?.[field.key];
    if (!hasValue(raw)) return '';
    return field.key === 'UserCode' ? toBn(raw) : raw;
  };

  /**
   * নিচে কোন কোন লাইন বসবে।
   *
   * টেমপ্লেটে "বড় ঘর নেই" (boxes: 'none') বলা থাকলে কলাম/বেঞ্চ/আসনও
   * এখানেই নেমে আসে — ⭐ এতেই কথাটা রক্ষা হয়: ডিজাইন বদলালে তথ্য হারায় না।
   */
  const lineFields = boxes === 'none' ? [...detailFields, ...boxFields] : detailFields;

  // বড় ঘর না থাকলে কার্ডে লেখা কম, তাই লাইনগুলো একটু ছড়িয়ে বসে
  const airy = boxFields.length === 0 || boxes === 'none';

  /** বড় ঘরগুলো — একসাথে বাঁধানো, আলাদা আলাদা, বা ডান পাশে খাড়া */
  const renderBoxes = () => {
    if (boxFields.length === 0 || boxes === 'none') return null;

    return (
      <div className={`sc-boxes sc-boxes-${boxes}`}>
        {boxFields.map((f) => (
          <div key={f.key}>
            <div className="sc-b-lbl">{f.label}</div>
            <div className={isShort(f) ? 'sc-b-val' : 'sc-b-val sc-b-txt'}>
              {boxValue(f)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`seat-card ${airy ? 'sc-airy' : ''} ${
        fill === 'none' ? '' : `sc-fill-${fill}`
      }`}
      style={cardVars}
    >
      {/* জলছাপ — সেটিংসে চালু থাকলে আর লোগোটা হাতে থাকলেই বসে।
          ⭐ ঘনত্বটা এখন সেটিংস থেকে — আগে কোডে ০.০৫ বাঁধা ছিল, তাই
          কাগজে প্রায় কিছুই বোঝা যেত না। */}
      {settings?.showWatermark !== false && logo && (
        <SeatCardWatermark
          documentLogo={logo}
          logoIsActive
          opacity={clampWatermarkOpacity(settings?.watermarkOpacity) / 100}
        />
      )}

      {/* ---- মাথা ---- */}
      {(topFields.length > 0 || (logoSide !== 'none' && logo)) && (
        <div className="sc-head">
          {logoSide === 'left' && logo && (
            <img className="sc-head-logo" src={logo} alt="" />
          )}

          <div className="sc-head-txt">
            {topFields.map((f, i) => (
              <p key={f.key} className={`${i === 0 ? 'sc-h-0' : 'sc-h-n'} sc-clamp`}>
                {row?.[f.key]}
              </p>
            ))}
          </div>

          {logoSide === 'right' && logo && (
            <img className="sc-head-logo" src={logo} alt="" />
          )}
        </div>
      )}

      {/* ---- শিরোনামের পট্টি ---- */}
      {bandField && hasValue(row?.[bandField.key]) && (
        <div className={`sc-title sc-title-${titleBand}`}>
          <span>{row[bandField.key]}</span>
        </div>
      )}

      {/* ---- বড় ঘর: ডান পাশে না হলে এখানেই ---- */}
      {boxes !== 'right' && renderBoxes()}

      {/* ---- নিচের তথ্য (আর ডান পাশের ঘর) ---- */}
      {(lineFields.length > 0 || boxes === 'right') && (
        <div className="sc-body">
          <div className={`sc-details ${centered ? 'sc-center' : ''}`}>
            {lineFields.map((f) => (
              <p key={f.key} className="sc-d-row">
                <span className="sc-d-lbl">{f.label}:</span>
                <span className="sc-d-val">{detailValue(f) || DASH}</span>
                {fill !== 'none' && <span className="sc-d-fill" />}
              </p>
            ))}
          </div>

          {boxes === 'right' && renderBoxes()}
        </div>
      )}

      {/* ---- স্বাক্ষর ---- */}
      {signRow && (
        <div className="sc-sign">
          <div>পরীক্ষার্থীর স্বাক্ষর</div>
          <div>কর্তৃপক্ষের স্বাক্ষর</div>
        </div>
      )}
    </div>
  );
};

export default SeatCardFace;
