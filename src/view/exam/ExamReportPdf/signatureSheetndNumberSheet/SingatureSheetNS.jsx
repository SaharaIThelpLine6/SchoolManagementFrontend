import { useMemo } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";

/**
 * স্বাক্ষরপত্র ও নম্বরপত্র (রিপোর্ট ৮) — A4 পোর্ট্রেট।
 *
 * /exam_report?report_id=8 থেকে আসা ExamReports_View এর ডেটা বসে।
 *
 * ভর্তি সিরিয়াল অনুযায়ী সাজানো:
 *   AdmissionSerial সংখ্যায় তুলনা করা হয়। কলামটা কোথাও স্ট্রিং হিসেবে
 *   থাকে ('007'), তাই Number() এ এনে মেলানো হয় — নাহলে '10' আসত '9' এর
 *   আগে। সিরিয়াল না থাকলে UserCode ধরে সাজে।
 *
 * উপরের অংশ:
 *   লোগো বাঁ পাশে absolute বসে, আর নাম-ঠিকানার ব্লকটা পাতার মাঝে।
 *   flex gap দিয়ে পাশাপাশি বসালে লোগোর চওড়া অনুযায়ী নামটা ডানে সরে
 *   যেত — পাতার মাঝে থাকত না। absolute রাখায় লোগো থাকুক বা না থাকুক,
 *   নামটা সবসময় ঠিক মাঝখানে।
 *
 *   লোগোটা প্রতিষ্ঠানের নিজের লোগো — institutionInfo.Logo, প্রবেশপত্রের
 *   কার্ডে যেটা ব্যবহার হয়। Document Settings এর ওয়াটারমার্ক লোগো
 *   (documentLogo) এখানে ব্যবহার হয় না; ওটা আলাদা জিনিস।
 *
 * পরীক্ষার নাম / জামাত / কিতাব:
 *   তিনটাই এক গড়নের — লেবেলের পাশে শুধু নিচে দাগ, কোনো বক্স নয়।
 *
 * পাতার হিসাব:
 *   প্রতি পাতায় ROWS_PER_PAGE টা সারি, আর প্রতি পাতায় লোগো-নাম সহ পুরো
 *   হেডারটাই আবার বসে। পাতার উচ্চতা স্থির (২৯৭mm) আর মার্জিনটা পাতার
 *   নিজের padding, তাই Chrome এর Margins ড্রপডাউনে Default থাকুক বা
 *   None — কাগজে এক জিনিসই বসে।
 */

const ROWS_PER_PAGE = 25;

const PAGE = { width: 210, height: 297, pad: 10 };

const API_URL = import.meta.env.VITE_SERVER_URL;

/**
 * প্রতিষ্ঠানের লোগো → <img src>।
 *
 * institutionInfo.Logo ডাটাবেজের image কলাম, তাই স্ট্রিং নয় — Buffer
 * হয়ে আসে ({ type: 'Buffer', data: [...] })। প্রবেশপত্রের
 * AdmitCardGenerate এ toImageSrc() ঠিক এভাবেই base64 বানায়, এখানেও
 * সেটাই করা হচ্ছে।
 *
 * কোনো প্রতিষ্ঠানে ফিল্ডটা ফাইলের পথ হিসেবেও থাকতে পারে, তাই স্ট্রিং
 * এলে সামনে সার্ভারের ঠিকানা বসিয়ে দেওয়া হয়।
 */
const toLogoSrc = (value) => {
  if (!value) return "";

  if (typeof value === "object" && Array.isArray(value?.data)) {
    return `data:image/png;base64,${Buffer.from(value.data).toString("base64")}`;
  }

  if (typeof value !== "string") return "";
  const path = value.trim();
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(API_URL || "").replace(/\/+$/, "");
  return `${base}/public/${path.replace(/^\/+/, "")}`;
};

const SingatureSheetNS = ({
  reportData,
  queryParams,
  documentLogo,
  logoIsActive,
}) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  // API টা { success, total, data: [...] } পাঠায়, কিন্তু অন্য রিপোর্টে
  // সরাসরি অ্যারেও আসে — দুটোই সামলানো হচ্ছে
  const rows = useMemo(() => {
    const list = Array.isArray(reportData) ? reportData : reportData?.data;
    if (!Array.isArray(list)) return [];

    const toNum = (v) => {
      const n = Number(String(v ?? "").trim());
      return Number.isFinite(n) ? n : null;
    };

    return [...list].sort((a, b) => {
      const sa = toNum(a?.AdmissionSerial);
      const sb = toNum(b?.AdmissionSerial);
      if (sa !== null && sb !== null && sa !== sb) return sa - sb;
      if (sa !== null && sb === null) return -1;
      if (sa === null && sb !== null) return 1;

      const ca = toNum(a?.UserCode);
      const cb = toNum(b?.UserCode);
      if (ca !== null && cb !== null && ca !== cb) return ca - cb;

      return 0;
    });
  }, [reportData]);

  const first = rows[0] || {};

  const institutionName =
    institutionInfo?.InstitutionName || first?.InstitutionName || "";
  const institutionAddress =
    institutionInfo?.Address || first?.Address || "";
  const examName = first?.ExamName || "";
  const sessionName = first?.SessionName || "";
  const subClassName = first?.SubClass || "";

  // প্রবেশপত্র যেখান থেকে লোগোটা নেয়, এখানেও ঠিক সেখান থেকেই
  const logoSrc = useMemo(
    () => toLogoSrc(institutionInfo?.Logo),
    [institutionInfo]
  );

  const pages = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
    pages.push(rows.slice(i, i + ROWS_PER_PAGE));
  }

  if (!rows.length) {
    return (
      <div className="print:hidden text-center text-gray-500 py-10">
        কোনো শিক্ষার্থী পাওয়া যায়নি — শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি ও অবস্থান
        বাছাই করে আবার দেখুন।
      </div>
    );
  }

  return (
    <div className="ssns-wrap bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        .ssns-page {
          box-sizing: border-box;
          width: ${PAGE.width}mm;
          height: ${PAGE.height}mm;
          padding: ${PAGE.pad}mm;
          background: #ffffff;
          color: #000000;
          overflow: hidden;
        }

        /* ---- উপরের অংশ: লোগো বাঁয়ে, নাম পাতার মাঝে ---- */
        .ssns-head {
          position: relative;
          text-align: center;
          border-bottom: 0.4mm solid #000000;
          padding-bottom: 2mm;
          min-height: 18mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ssns-head .ssns-logo {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 16mm;
          width: auto;
          max-width: 30mm;
          object-fit: contain;
        }
        .ssns-head .ssns-inst  { font-size: 17pt; font-weight: 700; line-height: 1.2; }
        .ssns-head .ssns-addr  { font-size: 10pt; line-height: 1.3; }

        .ssns-title {
          text-align: center;
          font-size: 13pt;
          font-weight: 600;
          margin-top: 3mm;
        }

        /* ---- পরীক্ষার নাম / জামাত / কিতাব — সবগুলোই নিচে দাগ, বক্স নয় ---- */
        .ssns-meta {
          display: flex;
          align-items: flex-end;
          gap: 6mm;
          font-size: 10pt;
          margin-top: 4mm;
        }
        .ssns-field {
          display: flex;
          align-items: flex-end;
          gap: 1.5mm;
          min-width: 0;          /* লেখা লম্বা হলে ঘরটা যেন অন্যটাকে ঠেলে না দেয় */
        }
        .ssns-field .ssns-label { white-space: nowrap; }
        .ssns-field .ssns-line {
          flex: 1;
          min-width: 0;
          border-bottom: 0.3mm solid #000000;
          padding: 0 1mm 0.5mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ssns-field-exam  { flex: 1.5; }
        .ssns-field-class { flex: 1.2; }
        .ssns-field-kitab { flex: 1; }

        /* ---- তালিকা ---- */
        .ssns-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          margin-top: 3mm;
          table-layout: fixed;
        }
        .ssns-table th,
        .ssns-table td {
          border: 0.3mm solid #000000;
          padding: 1mm 1.5mm;
          line-height: 1.2;
        }
        .ssns-table th { font-weight: 600; text-align: center; }
        .ssns-table td { height: 8mm; }
        .ssns-table .c-sl     { width: 11mm; text-align: center; }
        .ssns-table .c-serial { width: 17mm; text-align: center; }
        .ssns-table .c-id     { width: 19mm; text-align: center; }
        .ssns-table .c-sign   { width: 28mm; }
        .ssns-table .c-num    { width: 19mm; }
        /* নাম লম্বা হলেও সারি দুই লাইন হয়ে পাতার হিসাব নষ্ট করবে না */
        .ssns-table .c-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ssns-foot {
          display: flex;
          justify-content: flex-end;
          font-size: 9pt;
          margin-top: 2mm;
        }

        @media screen {
          .ssns-page {
            margin: 6mm auto;
            box-shadow: 0 1mm 4mm rgba(0, 0, 0, 0.18);
          }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }

          .ssns-wrap { background: transparent !important; }

          .ssns-page {
            margin: 0 !important;
            box-shadow: none !important;
            break-after: page;
            page-break-after: always;
          }

          /* শেষ পাতার পর বাড়তি ফাঁকা পাতা যেন না আসে */
          .ssns-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .ssns-page, .ssns-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageRows, pageIndex) => (
        <div key={pageIndex} className="ssns-page">
          {/* লোগো বাঁ পাশে, মাদরাসার নাম পাতার মাঝে — প্রতি পাতায় */}
          <div className="ssns-head">
            {logoSrc && <img className="ssns-logo" src={logoSrc} alt="" />}
            <div className="ssns-inst">{institutionName}</div>
            {institutionAddress && (
              <div className="ssns-addr">{institutionAddress}</div>
            )}
          </div>

          <div className="ssns-title">স্বাক্ষরপত্র ও নম্বরপত্র ;</div>

          <div className="ssns-meta">
            <div className="ssns-field ssns-field-exam">
              <span className="ssns-label">পরীক্ষার নাম :</span>
              <span className="ssns-line">
                {examName}
                {sessionName ? ` - ${sessionName}` : ""}
              </span>
            </div>

            <div className="ssns-field ssns-field-class">
              <span className="ssns-label">জামাত/শ্রেণী :</span>
              <span className="ssns-line">{subClassName}</span>
            </div>

            <div className="ssns-field ssns-field-kitab">
              <span className="ssns-label">কিতাব :</span>
              <span className="ssns-line">&nbsp;</span>
            </div>
          </div>

          <table className="ssns-table">
            <thead>
              <tr>
                <th className="c-sl">ক্র.নং</th>
                <th className="c-serial">ভর্তি সিরিয়ান</th>
                <th className="c-id">আইডি নং</th>
                <th>শিক্ষার্থীর নাম</th>
                <th className="c-sign">স্বাক্ষর</th>
                <th className="c-num">প্রাপ্ত নম্বর</th>
                <th className="c-num">মাসিক নম্বর</th>
                <th className="c-num">মোট নম্বর</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row?.ID ?? row?.UserID ?? `${pageIndex}-${i}`}>
                  <td className="c-sl">{pageIndex * ROWS_PER_PAGE + i + 1}</td>
                  <td className="c-serial">{row?.AdmissionSerial ?? ""}</td>
                  <td className="c-id">{row?.UserCode ?? ""}</td>
                  <td className="c-name">{row?.UserName ?? ""}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ssns-foot">
            পাতা {pageIndex + 1} / {pages.length} — মোট শিক্ষার্থী : {rows.length}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SingatureSheetNS;
