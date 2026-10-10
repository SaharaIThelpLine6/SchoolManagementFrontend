import React, { useLayoutEffect, useMemo, useRef } from 'react';

import { AdmitCardFace } from './AdmitCardGenerate';
import {
  DEFAULT_ADMIT_LANG,
  buildAdmitQrValue,
  buildPrintCss,
  getAdmitDir,
  getPrintDate,
  getTemplate,
  toLangDigit,
} from '../Data/admitCardConfig';
import {
  DEFAULT_ROUTINE_COLUMNS,
  ROUTINE_CARD_H,
  ROUTINE_CARD_W,
  formatSeatLine,
  getRoutineBodyMetrics,
  getRoutineCell,
  getRoutineColumnLabel,
  getRoutineLayout,
  getRoutineTemplate,
  getRoutineUIText,
  getRoutineZones,
  orderRoutineColumns,
} from '../Data/admitCardRoutineconfig';

// স্বাক্ষর, QR, ছবি, ওয়াটারমার্ক — সবই AdmitCardFace নিজে আঁকে, তাই
// এখানে আর ছবির রূপান্তর বা QR এর কোড লাগে না

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * রুটিনসহ প্রবেশপত্রের প্রিন্ট ভিউ।
 *
 * কার্ডের উপরের ৪১০px হুবহু সাধারণ প্রবেশপত্র — AdmitCardFace ই আঁকে, তাই
 * আগের সব ডাটা, টেমপ্লেট, লোগো, ওয়াটারমার্ক, ছবি সব অপরিবর্তিত।
 * নিচে যোগ হয় পরীক্ষার রুটিন এবং হলের কলাম/সারি থেকে বানানো আসন ছক।
 *
 * @param templateId       প্রবেশপত্রের টেমপ্লেট (আগের মতোই)
 * @param routineTemplateId রুটিং টেমপ্লেট — 'r1'..'r5'
 * @param routine          normalizeRoutineRows() দিয়ে বানানো সারি
 * @param hallGrid         buildHallGrid() দিয়ে বানানো আসন ছক
 * @param seats            Map — AdmissionID → { columnLabel, rowLabel, seatNo }
 * @param routineColumns   রুটিনের টেবিলে কোন কলামগুলো থাকবে
 * @param showSeatLine     কার্ডে শিক্ষার্থীর আসনের লাইন
 * @param showSeatMap      হলের আসন বিন্যাসের ছক
 * @param reportType       1 = A4 পোর্ট্রেটে ১টি, 2 = A4 ল্যান্ডস্কেপে ২টি
 */
const AdmitCardRoutinegenerate = ({
  templateId,
  routineTemplateId,
  fields = [],
  data = [],
  routine = [],
  hallGrid = null,
  seats = null,
  routineColumns = DEFAULT_ROUTINE_COLUMNS,
  showSeatLine = true,
  showSeatMap = false,
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
  // পুরোনো প্রপ — ব্যাকওয়ার্ড কম্প্যাট
  showSign,
  showSignName,
  showSignDate,
  // নতুন — বাঁ (নায়েম) ও ডান (মুহতামিম) আলাদা
  najemShowSign,
  najemShowName,
  najemShowDate,
  principalShowSign,
  principalShowName,
  principalShowDate,
}) => {
  const template = getTemplate(templateId);
  const routeTemplate = getRoutineTemplate(routineTemplateId);
  const layout = getRoutineLayout(reportType);
  const rows = Array.isArray(data) ? data : [];

  const pages = useMemo(() => chunk(rows, layout.perPage), [rows, layout.perPage]);

  const printDate = useMemo(() => getPrintDate(new Date(), lang), [lang]);

  if (!rows.length) return null;

  return (
    <div className="admit-print-root font-SolaimanLipi">
      <style>{buildPrintCss({
        layout,
        cardW: ROUTINE_CARD_W,
        cardH: ROUTINE_CARD_H,
        grayscale,
        prefix: 'routine',
      })}</style>

      {pages.map((page, pageIndex) => (
        <div className="routine-page" key={`routine-page-${pageIndex}`}>
          {page.map((student, i) => (
            <div className="routine-cell" key={student.AdmissionID ?? `${pageIndex}-${i}`}>
              <div className="routine-scale">
                <RoutineCardFace
                  template={template}
                  routeTemplate={routeTemplate}
                  fields={fields}
                  student={student}
                  routine={routine}
                  hallGrid={hallGrid}
                  seat={
                    seats?.get?.(
                      String(student.AdmissionID ?? student.UserID ?? student.StudentCode)
                    ) || null
                  }
                  routineColumns={routineColumns}
                  showSeatLine={showSeatLine}
                  showSeatMap={showSeatMap}
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
                  najemShowSign={najemShowSign}
                  najemShowName={najemShowName}
                  najemShowDate={najemShowDate}
                  principalShowSign={principalShowSign}
                  principalShowName={principalShowName}
                  principalShowDate={principalShowDate}
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

/** হলের আসন বিন্যাস — কলাম পাশে পাশে, প্রতি কলামে তার সারিগুলো */
const SeatMap = ({ grid, rt, lang, title, rowWord, seatWord, maxHeight }) => {
  const columns = Array.isArray(grid?.columns) ? grid.columns : [];
  if (!columns.length) return null;

  return (
    <div style={{ marginTop: 6, maxHeight, overflow: 'hidden' }}>
      <p className="text-[10px] font-bold mb-[3px]" style={{ color: rt.titleColor }}>
        {title}
        {grid.hallName ? ` — ${grid.hallName}` : ''}
      </p>
      <div className="flex flex-wrap gap-[4px]">
        {columns.map((col) => (
          <div
            key={col.columnId ?? col.index}
            className="rounded-[3px] px-[5px] py-[3px]"
            style={{
              border: `1px solid ${rt.gridColor}`,
              background: rt.seatBg,
              minWidth: 74,
            }}
          >
            <p
              className="text-[9px] font-bold leading-[12px]"
              style={{ color: rt.seatColor }}
            >
              {col.label || toLangDigit(col.index, lang)}
            </p>
            {col.rows.map((r) => (
              <p
                key={r.rowId ?? r.index}
                className="text-[9px] leading-[12px] whitespace-nowrap"
                style={{ color: rt.seatColor }}
              >
                {rowWord} {toLangDigit(r.label || r.index, lang)} —{' '}
                {toLangDigit(r.seats, lang)} {seatWord}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * রুটিনসহ একটা কার্ডের ভিজ্যুয়াল — এডিটরের প্রিভিউও এটাই ব্যবহার করে।
 *
 * পুরোটা একটাই বাক্স। AdmitCardFace কে cardHeight দিয়ে বলা হয় সে যেন
 * ৭৪০px জুড়েই আঁকে — তাতে ফ্রেম, ব্যাকগ্রাউন্ড, ওয়াটারমার্ক আর স্বাক্ষরের
 * সারি পুরো পৃষ্ঠা ঘিরে থাকে। bodyEnd দিয়ে বলা হয় তথ্যের ঘরটা কোথায় শেষ
 * হবে, আর ঠিক তার নিচের খালি জায়গাতেই রুটিন ও আসন ছক বসে।
 *
 * ফলে রুটিন ডিজাইনের বাইরে ঝোলে না — প্রবেশপত্রের ফ্রেমের ভিতরেই পড়ে।
 */
export const RoutineCardFace = ({
  template,
  routeTemplate,
  fields = [],
  student = {},
  routine = [],
  hallGrid = null,
  seat = null,
  routineColumns = DEFAULT_ROUTINE_COLUMNS,
  showSeatLine = true,
  showSeatMap = false,
  lang = DEFAULT_ADMIT_LANG,
  inName,
  inAddress,
  inLogo,
  inWatermark,
  institutionCode,
  showQR,
  showWatermark,
  showPhoto,
  // পুরোনো প্রপ — resolveOn এর দ্বিতীয় আর্গুমেন্ট
  showSign,
  showSignName,
  showSignDate,
  // নতুন — বাঁ ও ডান আলাদা
  najemShowSign,
  najemShowName,
  najemShowDate,
  principalShowSign,
  principalShowName,
  principalShowDate,
  printDate,
  labelOverrides = {},
}) => {
  const t = template;
  const rt = routeTemplate || getRoutineTemplate(null);
  const dir = getAdmitDir(lang);
  const rui = (key) => getRoutineUIText(key, lang);

  // // স্বাক্ষরের সারি আদৌ আঁকা হবে কি না — AdmitCardFace এর নিয়ম হুবহু একই,
  // // কারণ ওই সারিটা কতটুকু জায়গা নেবে তার উপর রুটিনের ঘরের মাপ নির্ভর করে
  // const signImageEnabled =
  //   showSign === undefined ? Boolean(t.showSignature) : Boolean(showSign);
  // const signNameEnabled =
  //   showSignName === undefined ? Boolean(t.showSignature) : Boolean(showSignName);
  // const signDateEnabled =
  //   showSignDate === undefined ? t.showSignDate !== false : Boolean(showSignDate);
  // const qrEnabled = showQR === undefined ? Boolean(t.showQR) : Boolean(showQR);

  // const showSignRow =
  //   signImageEnabled ||
  //   signNameEnabled ||
  //   signDateEnabled ||
  //   Boolean(qrEnabled && buildAdmitQrValue(student, institutionCode));

  // স্বাক্ষরের সারি আদৌ আঁকা হবে কি না — AdmitCardFace এর নিয়ম হুবহু একই,
  // কারণ ওই সারিটা কতটুকু জায়গা নেবে তার উপর রুটিনের ঘরের মাপ নির্ভর করে।
  // এখন বাঁ (নায়েম) ও ডান (মুহতামিম) আলাদা — দুই পাশের যেকোনো একটা অংশ
  // থাকলেই সারিটা আঁকা হয়। অগ্রাধিকার: নতুন প্রপ > পুরোনো প্রপ > ডিফল্ট।
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

  const qrEnabled = showQR === undefined ? Boolean(t.showQR) : Boolean(showQR);

  const showSignRow =
    najemSignOn ||
    najemNameOn ||
    najemDateOn ||
    principalSignOn ||
    principalNameOn ||
    principalDateOn ||
    Boolean(qrEnabled && buildAdmitQrValue(student, institutionCode));

  // ------------------------------------------------------------------ জোন
  const visibleFields = fields.filter(Boolean);
  const zones = useMemo(
    () =>
      getRoutineZones({
        template: t,
        fieldCount: visibleFields.length,
        showSignRow,
      }),
    [t, visibleFields.length, showSignRow]
  );

  // ------------------------------------------------------------ রুটিন টেবিল
  const columns = useMemo(() => {
    const picked = orderRoutineColumns(routineColumns);
    return picked.length ? picked : orderRoutineColumns(DEFAULT_ROUTINE_COLUMNS);
  }, [routineColumns]);

  const routineRows = Array.isArray(routine) ? routine : [];

  const seatText =
    showSeatLine && seat
      ? formatSeatLine(seat, lang, {
          hall: rui('hall'),
          column: rui('column'),
          row: rui('row'),
          seat: rui('seat'),
        })
      : '';

  const mapOn = showSeatMap && Boolean(hallGrid?.columns?.length);

  const m = getRoutineBodyMetrics({
    regionH: zones.height,
    rowCount: routineRows.length,
    hasSeatLine: Boolean(seatText),
    wantMap: mapOn,
  });

  const { titleH, seatLineH, rowH, cellFont, mapH } = m;

  const padX = 34;
  const innerW = ROUTINE_CARD_W - padX * 2;

  const lineStyle = rt.tableStyle === 'lines';

  // ----------------------------------------------------- ঘরের লেখা ফিট করা
  // কলামের প্রস্থ স্থির, কিন্তু লেখার দৈর্ঘ্য নয় — "১২:০০ AM - ১২:০০ AM"
  // সময়ের ঘরের চেয়ে লম্বা হয়ে ডান দিক কেটে যেত। তাই আঁকার পরেই একবার
  // মেপে নিয়ে যে ঘরগুলো উপচে পড়েছে কেবল তাদের ফন্ট ছোট করা হয়।
  //
  // প্রতি ঘরে আলাদা ResizeObserver বসানো হয়নি — এক কার্ডে ৮০+ ঘর হতে পারে,
  // আর প্রিন্টে কার্ডও অনেক। পুরো টেবিলের জন্য একটাই পাস, তাতেই যথেষ্ট।
  const tableRef = useRef(null);

  useLayoutEffect(() => {
    let cancelled = false;

    const fit = () => {
      const root = tableRef.current;
      if (cancelled || !root) return;

      root.querySelectorAll('[data-fit]').forEach((el) => {
        let size = Number(el.dataset.fitBase) || 11;
        el.style.fontSize = `${size}px`;

        let guard = 80;
        while (guard-- > 0 && size > 7 && el.scrollWidth > el.clientWidth) {
          size -= 0.25;
          el.style.fontSize = `${size}px`;
        }
      });
    };

    fit();

    // SolaimanLipi / আরবি ফন্ট দেরিতে লোড হলে মাপটা বদলায় — তাই আবার
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }

    return () => {
      cancelled = true;
    };
  });

  const cellBorder = (isHead) => {
    if (!lineStyle) return `1px solid ${rt.gridColor}`;
    return 'none';
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: ROUTINE_CARD_W,
        height: ROUTINE_CARD_H,
        background: '#ffffff',
      }}
    >
      {/* ---------------------------------------------------------------
          পুরো পৃষ্ঠাটাই একটা প্রবেশপত্র — ফ্রেম, ব্যাকগ্রাউন্ড, ওয়াটারমার্ক,
          হেডার, তথ্য আর স্বাক্ষর সবই এর। cardHeight দেওয়ায় ফ্রেমটা
          নিচ পর্যন্ত নামে, তাই রুটিনও এই ফ্রেমের ভিতরেই পড়ে।
      --------------------------------------------------------------- */}
      <AdmitCardFace
        template={t}
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
        najemShowSign={najemShowSign}
        najemShowName={najemShowName}
        najemShowDate={najemShowDate}
        principalShowSign={principalShowSign}
        principalShowName={principalShowName}
        principalShowDate={principalShowDate}
        printDate={printDate}
        labelOverrides={labelOverrides}
        cardHeight={ROUTINE_CARD_H}
        bodyEnd={zones.bodyEnd}
      />

      {/* --------------------- রুটিন ও আসন ছক — ঐ কার্ডেরই ভিতরের অংশ */}
      <div
        className="absolute"
        dir={dir}
        style={{
          top: zones.top,
          left: padX,
          width: innerW,
          height: zones.height,
          overflow: 'hidden',
        }}
      >
        {/* শিরোনাম */}
        <div
          className="flex items-center justify-center rounded-[4px]"
          style={{
            height: titleH,
            background: rt.titleBg === 'none' ? 'transparent' : rt.titleBg,
            borderBottom:
              rt.titleBg === 'none' ? `1.5px solid ${rt.borderColor}` : 'none',
          }}
        >
          <p
            className="text-[13px] font-bold leading-none"
            style={{ color: rt.titleColor }}
          >
            {rui('routineTitle')}
          </p>
        </div>

        {/* টেবিল */}
        {routineRows.length ? (
          <table
            ref={tableRef}
            className="border-collapse"
            style={{
              marginTop: 6,
              // px এ মাপ দিলে বর্ডার যোগ হয়ে টেবিলটা ঘরের চেয়ে দুই-চার px
              // চওড়া হয়ে যেত, আর ডান পাশের রেখা কেটে যেত। ১০০% দিলে
              // টেবিল কখনোই ঘরের বাইরে যায় না।
              width: '100%',
              tableLayout: 'fixed',
              border: lineStyle ? 'none' : `1px solid ${rt.borderColor}`,
            }}
          >
            <colgroup>
              {/* width না দিলে বাকি জায়গাটা ব্রাউজারই ওই কলামকে দেয় —
                  বিষয়ের নাম তাই যতটা জায়গা আছে পুরোটাই পায় */}
              {columns.map((c) => (
                <col key={c.id} style={c.width ? { width: c.width } : undefined} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ background: lineStyle ? 'transparent' : rt.headBg }}>
                {columns.map((c) => (
                  <th
                    key={c.id}
                    className="font-bold whitespace-nowrap"
                    style={{
                      height: rowH,
                      // td/th এ height শুধু সর্বনিম্ন মাপ — ফন্টের line-height
                      // বড় হলে সারি লম্বা হয়ে কার্ডের বাইরে চলে যেত।
                      // তাই line-height নিজেই বেঁধে দেওয়া হলো।
                      lineHeight: `${Math.max(rowH - 4, 9)}px`,
                      fontSize: cellFont,
                      color: lineStyle ? rt.headColor : rt.headColor,
                      border: cellBorder(true),
                      borderBottom: `1.5px solid ${rt.borderColor}`,
                      padding: '0 4px',
                      boxSizing: 'border-box',
                      textAlign: c.align || (dir === 'rtl' ? 'right' : 'left'),
                    }}
                  >
                    <div
                      data-fit
                      data-fit-base={cellFont}
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'clip',
                      }}
                    >
                      {getRoutineColumnLabel(c.id, lang)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routineRows.map((row, i) => (
                <tr
                  key={row.SubID ?? `${row.serial}-${i}`}
                  style={{
                    background: lineStyle ? 'transparent' : i % 2 ? rt.zebra : '#ffffff',
                  }}
                >
                  {columns.map((c) => (
                    <td
                      key={c.id}
                      className="overflow-hidden whitespace-nowrap"
                      style={{
                        height: rowH,
                        lineHeight: `${Math.max(rowH - 4, 9)}px`,
                        fontSize: cellFont,
                        color: t.valueColor || '#111827',
                        border: cellBorder(false),
                        borderBottom: `1px solid ${rt.gridColor}`,
                        padding: '0 4px',
                        boxSizing: 'border-box',
                        textAlign: c.align || (dir === 'rtl' ? 'right' : 'left'),
                        textOverflow: 'clip',
                      }}
                    >
                      <div
                        data-fit
                        data-fit-base={cellFont}
                        style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'clip',
                        }}
                      >
                        {getRoutineCell(row, c.id, lang)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-[4px]"
            style={{
              marginTop: 6,
              height: m.emptyH,
              border: `1px dashed ${rt.borderColor}`,
              background: rt.zebra,
            }}
          >
            <p className="text-[12px] font-bold" style={{ color: rt.titleColor }}>
              {rui('noRoutine')}
            </p>
            <p className="mt-[2px] text-[10px]" style={{ color: t.labelColor }}>
              {rui('noRoutineHint')}
            </p>
          </div>
        )}

        {/* শিক্ষার্থীর আসন */}
        {seatText ? (
          <div
            className="flex items-center justify-center rounded-[4px]"
            style={{
              marginTop: 6,
              height: seatLineH,
              background: rt.seatBg,
              border: `1px solid ${rt.gridColor}`,
            }}
          >
            <p
              className="text-[11px] font-bold leading-none whitespace-nowrap"
              style={{ color: rt.seatColor }}
            >
              {seatText}
            </p>
          </div>
        ) : null}

        {/* হলের আসন বিন্যাস */}
        {mapOn && mapH ? (
          <SeatMap
            grid={hallGrid}
            rt={rt}
            lang={lang}
            title={rui('seatMapTitle')}
            rowWord={rui('row')}
            seatWord={rui('seats')}
            maxHeight={mapH}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AdmitCardRoutinegenerate;
