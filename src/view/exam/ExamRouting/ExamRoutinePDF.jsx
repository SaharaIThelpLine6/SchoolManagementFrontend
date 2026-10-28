import {
  buildTimeNote,
  getCellText,
  getClassText,
  getDateText,
  getDayText,
  getExamText,
  getInstituteAddress,
  getInstituteName,
  getRRDir,
  getRRText,
  getRoomText,
  getSessionText,
  getShiftText,
  getSubClassText,
  getTimeText,
  toLangDigit,
} from '../../../Data/Examroutinereportconfig';

const PAPER_CSS = `
  @media print {
    @page { size: A4 landscape; margin: 8mm; }

    .routine-paper {
      border: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
    }
    .routine-scroll { overflow: visible !important; }
    .routine-table { page-break-inside: auto; }
    .routine-table tr { page-break-inside: avoid; page-break-after: auto; }
    .routine-table thead { display: table-header-group; }
  }

  .routine-table { border-collapse: collapse; width: 100%; }
  .routine-table th,
  .routine-table td {
    border: 1px solid #334155;
    padding: 3px 4px;
    text-align: center;
    vertical-align: middle;
    line-height: 1.25;
  }
  .routine-table thead th { background: #f8fafc; font-weight: 700; }
  .routine-table td.routine-rowhead {
    font-weight: 700;
    white-space: nowrap;
    background: #f8fafc;
  }
`;

const ExamRoutinePDF = ({
  reportData,
  lang = 'bn',
  instituteLogo = '',
  showWatermark = true,
  hideEmptyRows = false,
  hideEmptyShift = false,
  showClassCol = false,
  showRoom = false,
  showTime = true,
  scheduleNote = '',
}) => {
  const ui = (key) => getRRText(key, lang);
  const dir = getRRDir(lang);

  const header = reportData?.header;
  const columns = reportData?.columns ?? [];
  const allRows = reportData?.rows ?? [];
  const shifts = reportData?.shifts ?? ['morning'];

  const rows = hideEmptyRows ? allRows.filter((r) => r.hasAny) : allRows;

  const shiftsOf = (col) =>
    hideEmptyShift
      ? shifts.filter((s) => (col.shiftsUsed || []).includes(s))
      : shifts;

  const timeNote = buildTimeNote(reportData?.times, lang);
  const notices = reportData?.messages ?? [];
  // বি:দ্র: — আগে সময়ের লাইন, তারপর রুটিনে লেখা নোটিশগুলো
  // const noteLines = [timeNote, ...notices].filter(Boolean);
  const noteLines = []

  const instName = getInstituteName(header, lang);
  const instAddress = getInstituteAddress(header, lang);

  const titleLine = header
    ? ui('routineOf')(getExamText(header, lang), getSessionText(header, lang)).trim()
    : ui('routineTitle');

  const hasScheduleNote = Boolean(scheduleNote && scheduleNote.trim());

  if (!columns.length || !rows.length) {
    return (
      <p className="print:hidden mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-12 text-center text-[15px] text-amber-700">
        {ui('noRoutine')}
      </p>
    );
  }

  return (
    <>
      <style>{PAPER_CSS}</style>

      <div className="routine-scroll max-w-full overflow-x-auto overscroll-x-contain">
        <div
          className="routine-paper relative mx-auto min-w-[900px] bg-white p-5 shadow-lg print:shadow-none"
          dir={dir}
        >

          {showWatermark && instituteLogo ? (
            <img
              src={instituteLogo}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
              style={{
                width: '46%',
                opacity: 0.07,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            />
          ) : null}


          <div className="relative mb-3 flex items-start gap-3">
            <div className="w-[70px] shrink-0">
              {instituteLogo ? (
                <img src={instituteLogo} alt="" className="h-[62px] w-[62px] object-contain" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-[22px] font-bold leading-tight text-gray-900">{instName}</h1>
              {instAddress ? <p className="text-[13px] text-gray-700">{instAddress}</p> : null}
              <p className="mt-0.5 text-[15px] font-semibold text-gray-800">{titleLine}</p>
            </div>


            <div className="w-[70px] shrink-0" />
          </div>


          <table className="routine-table relative text-[12px]">
            <thead>

              <tr>
                {showClassCol ? (
                  <th rowSpan={2} style={{ minWidth: 86 }}>
                    {ui('mainClass')}
                  </th>
                ) : null}
                <th rowSpan={2} style={{ minWidth: 92 }}>
                  {ui('date')}
                </th>

                {columns.map((col) => (
                  <th key={col.key} colSpan={shiftsOf(col).length} style={{ minWidth: 86 }}>
                    <span className="block">{getDateText(col, lang)}</span>
                    {getDayText(col, lang) ? (
                      <span className="block font-normal">{getDayText(col, lang)}</span>
                    ) : null}
                  </th>
                ))}
              </tr>

              <tr>
                {columns.map((col) =>
                  shiftsOf(col).map((shift) => (
                    <th key={`${col.key}-${shift}`} className="font-normal">
                      {getShiftText(shift, lang)}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.SubClassID}>
                  {showClassCol ? (
                    <td className="routine-rowhead">{getClassText(row, lang) || ''}</td>
                  ) : null}

                  <td className="routine-rowhead">
                    {getSubClassText(row, lang) || row.SubClassID}
                  </td>

                  {columns.map((col) =>
                    shiftsOf(col).map((shift) => {
                      const list = row.cells?.[`${col.key}__${shift}`] || [];
                      const names = getCellText(list, lang);

                      return (
                        <td key={`${row.SubClassID}-${col.key}-${shift}`}>
                          {names.length ? (

                            list.map((item, i) => {
                              const time = showTime ? getTimeText(item, lang) : '';
                              const room = showRoom ? getRoomText(item, lang) : '';
                              return (
                                <span key={`${item.SubID ?? i}-${i}`} className="block">
                                  {names[i]}
                                  {time ? (
                                    <span className="block text-[10px] text-gray-600" dir="ltr">
                                      {time}
                                    </span>
                                  ) : null}
                                  {room ? (
                                    <span className="block text-[10px] text-gray-500">{room}</span>
                                  ) : null}
                                </span>
                              );
                            })
                          ) : (
                            // ✅ এখানে আগে <span className="text-gray-400">-</span> ছিল, সেটি রিমুভ করে ফাঁকা করে দেওয়া হয়েছে
                            null
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>


          <div className="relative mt-3 flex items-end justify-between gap-6 text-[12px]">
            {/* ✅ বাম দিকে: সময়সূচী নোট + বি:দ্র */}
            <div className="min-w-0 text-gray-800">
              {hasScheduleNote ? (
                <div className="mb-2px-3 py-1.5 text-left">

                  <p className="mt-0.5 text-[12px] text-black whitespace-pre-wrap">
                    {scheduleNote.trim()}
                  </p>
                </div>
              ) : null}

              {noteLines.map((line, i) => (
                <p key={`${i}-${line.slice(0, 12)}`}>
                  {i === 0 ? <span className="font-semibold">{ui('note')} </span> : null}
                  {toLangDigit(i + 1, lang)}। {line}
                </p>
              ))}
            </div>

            <p className="shrink-0 font-semibold text-gray-900">
              {header?.PrincipalName
                ? `${header.PrincipalName} — ${ui('principal')}`
                : ui('principal')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamRoutinePDF;