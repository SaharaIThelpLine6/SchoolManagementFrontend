import React from 'react';

/**
 * ✅ Buffer-independent base64 conversion
 * { type: 'Buffer', data: [...] } অথবা raw array — দুটোই হ্যান্ডেল করে
 */
const bufferToDataUrl = (bufLike, defaultMime = 'image/png') => {
  if (!bufLike) return null;

  const raw = bufLike?.data ?? bufLike;
  if (!raw || typeof raw.length !== 'number' || raw.length === 0) return null;

  try {
    const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);

    let mime = defaultMime;
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      mime = 'image/jpeg';
    } else if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      mime = 'image/png';
    } else if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      mime = 'image/gif';
    }

    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }

    return `data:${mime};base64,${window.btoa(binary)}`;
  } catch (e) {
    console.error('❌ Image convert failed:', e);
    return null;
  }
};

// A4 (mm)
const A4_W = 210;
const A4_H = 297;
const PAGE_MARGIN = 10; // @page margin (mm) — Book.jsx এর সাথে মিল থাকতে হবে

const FONT = "'SolaimanLipi', 'Noto Sans Bengali', 'Noto Naskh Arabic', Arial, sans-serif";

const BookListPDF = ({
  data = [],
  orientation = 'portrait',
  institution = null,
  classTitle = '', // ফিল্টার করা ক্লাসের নাম (ঐচ্ছিক)
}) => {
  const logo = bufferToDataUrl(institution?.Logo, 'image/png');
  const najem = bufferToDataUrl(institution?.SignatureNajem, 'image/jpeg');
  const principal = bufferToDataUrl(institution?.SignaturePrincipal, 'image/jpeg');

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        style={{
          fontFamily: FONT,
          textAlign: 'center',
          color: '#dc2626',
          fontSize: 20,
          fontWeight: 700,
          padding: 40,
        }}
      >
        কোনো কিতাবের তথ্য পাওয়া যায়নি
      </div>
    );
  }

  const isLandscape = orientation === 'landscape';

  // Orientation অনুযায়ী পেজের উচ্চতা, margin বাদ দিয়ে usable height
  const pageH = isLandscape ? A4_W : A4_H;
  const usableH = pageH - PAGE_MARGIN * 2;

  // Landscape-এ উচ্চতা কম, তাই একটু ছোট font/spacing
  const baseFont = isLandscape ? 13 : 14;
  const titleFont = isLandscape ? 22 : 24;
  const cellPad = isLandscape ? '4px 6px' : '6px 8px';
  const logoSize = isLandscape ? 64 : 80;
  const sigHeight = isLandscape ? 46 : 56;
  const sigWidth = isLandscape ? 220 : 190;

  const th = {
    border: '1px solid #000',
    padding: cellPad,
    background: '#f3f4f6',
    fontWeight: 700,
    textAlign: 'center',
    fontSize: baseFont,
  };

  const td = {
    border: '1px solid #000',
    padding: cellPad,
    fontSize: baseFont,
    verticalAlign: 'middle',
  };

  const SignatureBlock = ({ img, alt, label }) => (
    <div style={{ width: sigWidth, textAlign: 'center' }}>
      <div
        style={{
          height: sigHeight,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {img ? (
          <img
            src={img}
            alt={alt}
            style={{ maxHeight: sigHeight, maxWidth: '100%', objectFit: 'contain' }}
          />
        ) : null}
      </div>
      <div style={{ borderTop: '2px solid #000', marginTop: 2 }} />
      <div style={{ marginTop: 4, fontWeight: 600, fontSize: baseFont }}>{label}: স্বাক্ষর</div>
      <div style={{ marginTop: 4, fontSize: baseFont }}>তারিখ: ..................</div>
    </div>
  );

  return (
    <div
      style={{
        fontFamily: FONT,
        color: '#000',
        background: '#fff',
        width: '100%',
        minHeight: `${usableH}mm`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ============ HEADER ============ */}
      <table
        style={{
          width: '100%',
          border: 'none',
          borderCollapse: 'collapse',
          marginBottom: 12,
        }}
      >
        <tbody>
          <tr>
            {/* Logo */}
            <td
              style={{
                width: logoSize + 10,
                border: 'none',
                padding: 0,
                verticalAlign: 'top',
                textAlign: 'left',
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: logoSize,
                    height: logoSize,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: logoSize,
                    height: logoSize,
                    border: '2px dashed #999',
                    background: '#e5e7eb',
                  }}
                />
              )}
            </td>

            {/* Institution info */}
            <td
              style={{
                border: 'none',
                padding: '0 8px',
                textAlign: 'center',
                verticalAlign: 'top',
              }}
            >
              <div style={{ fontSize: titleFont, fontWeight: 700, marginBottom: 4 }}>
                {institution?.InstitutionName || ''}
              </div>

              {institution?.AraInstitutionName && (
                <div
                  style={{ fontSize: baseFont + 1, fontWeight: 600, marginBottom: 4 }}
                  dir="rtl"
                >
                  {institution.AraInstitutionName}
                </div>
              )}

              <div style={{ fontSize: baseFont, marginBottom: 3 }}>
                {institution?.Address || ''}
                {institution?.District ? `, ${institution.District}` : ''}
              </div>

              {/* <div style={{ fontSize: baseFont, marginBottom: 8 }}>
                {institution?.ContactNumber || ''}
                {institution?.AraContactNumber ? `, ${institution.AraContactNumber}` : ''}
              </div> */}

              <div
                style={{
                  display: 'inline-block',
                  border: '2px solid #000',
                  padding: '3px 36px',
                  fontSize: titleFont - 2,
                  fontWeight: 700,
                }}
              >
                কিতাবের তালিকা{classTitle ? ` - ${classTitle}` : ''}
              </div>
            </td>

            {/* Spacer — logo-র সমান, যাতে title ঠিক মাঝে থাকে */}
            <td style={{ width: logoSize + 10, border: 'none', padding: 0 }} />
          </tr>
        </tbody>
      </table>

      {/* ============ TABLE ============ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '27%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead style={{ display: 'table-header-group' }}>
          <tr>
            <th style={th}>ক্রমিক</th>
            <th style={th}>কিতাবের নাম</th>
            <th style={th}>মারহালা/ক্লাস</th>
            <th style={th}>আরবি নাম</th>
            <th style={th}>ইংরেজি নাম</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.SubjectID ?? idx}
              style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
            >
              <td style={{ ...td, textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ ...td, textAlign: 'left' }}>{(row.SubjectName || '').trim()}</td>
              <td style={{ ...td, textAlign: 'left' }}>
                {(row.ClassGroup?.SubClass || '').trim() || '-'}
              </td>
              <td style={{ ...td, textAlign: 'right' }} dir="rtl">
                {row.ArabicSubject || ''}
              </td>
              <td style={{ ...td, textAlign: 'left' }}>{row.EngSubjectName || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============ FOOTER (signature) ============ */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 48,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 16px',
          }}
        >
          <SignatureBlock
            img={najem}
            alt="Signature Najem"
            label={institution?.NajemName || 'নাযেম'}
          />
          <SignatureBlock
            img={principal}
            alt="Signature Principal"
            label={institution?.PrincipalName || 'মুহতামিম'}
          />
        </div>
      </div>
    </div>
  );
};

export default BookListPDF;