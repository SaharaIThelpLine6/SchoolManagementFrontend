import { Buffer } from 'buffer';
import PropTypes from 'prop-types';

const bn = (value) => String(value ?? '').replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[digit]);
const isHidden = (row) => row.hidden === true || Number(row.hidden ?? row.IsHidden) === 1;
const formatDate = (value) => {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return bn(match ? `${match[3]}/${match[2]}/${match[1]}` : value) || '—';
};
const formatTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const match = text.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!match) return bn(text);
  let hour = Number(match[1]);
  const period = match[3]?.toLowerCase();
  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  const label = hour < 4 ? 'রাত' : hour < 6 ? 'ভোর' : hour < 12 ? 'সকাল' : hour < 15 ? 'দুপুর' : hour < 18 ? 'বিকাল' : hour < 20 ? 'সন্ধ্যা' : 'রাত';
  return `${label} ${bn(hour % 12 || 12)}:${bn(match[2])}`;
};
const imageSource = (value) => {
  if (typeof value === 'string') return value;
  const bytes = value?.data ?? value;
  return Array.isArray(bytes) && bytes.length ? `data:image/png;base64,${Buffer.from(bytes).toString('base64')}` : '';
};

const ExamRoutineDocument = ({ details = {}, institution = {} }) => {
  // Keep the saved order and each break's own date/day, including multiple breaks.
  const rows = (Array.isArray(details.routine) ? details.routine : []).filter(
    (row) => !isHidden(row) || String(row.message ?? row.Message ?? '').trim()
  );
  const hasRoom = rows.some((row) => !isHidden(row) && (String(row.RoomNo ?? '').trim() || String(row.RoomName ?? '').trim()));
  const density = rows.length > 20 ? 'dense' : rows.length > 12 ? 'compact' : 'normal';
  const logo = imageSource(institution?.Logo);
  const signatures = [
    { label: 'নাযেম', name: institution?.NajemName, image: imageSource(institution?.SignatureNajem) },
    { label: 'মুহতামিম', name: institution?.PrincipalName, image: imageSource(institution?.SignaturePrincipal) },
  ];

  return (
    <article className="routine-document" data-density={density} lang="bn">
      <header className="routine-document__header">
        {logo ? (
          <img className="routine-document__logo" src={logo} alt="প্রতিষ্ঠানের লোগো" />
        ) : (
          <div className="routine-document__monogram" aria-hidden="true">{(institution?.InstitutionName || 'ম').charAt(0)}</div>
        )}
        <div>
          <h1>{institution?.InstitutionName || 'পরীক্ষার রুটিন'}</h1>
          {institution?.Address && <p>{institution.Address}</p>}
          {institution?.ContactNumber && <p>মোবাইল: {bn(institution.ContactNumber)}</p>}
        </div>
      </header>

      <div className="routine-document__title"><h2>পরীক্ষার রুটিন</h2></div>
      <dl className="routine-document__info">
        <div><dt>পরীক্ষার নাম</dt><dd>{details.examName?.ExamName || '—'}</dd></div>
        <div><dt>শিক্ষাবর্ষ</dt><dd>{bn(details.session?.SessionName) || '—'}</dd></div>
        <div><dt>শ্রেণি / জামাত</dt><dd>{details.classGroup?.SubClass || '—'}</dd></div>
      </dl>

      <table className="routine-document__table">
        <caption className="routine-document__sr-only">পরীক্ষার তারিখ, বিষয় ও সময়সূচি</caption>
        <thead>
          <tr>
            <th scope="col" className="routine-document__serial">ক্রম</th>
            <th scope="col" className="routine-document__date">তারিখ</th>
            <th scope="col" className="routine-document__day">বার</th>
            <th scope="col" className="routine-document__subject">বিষয়</th>
            <th scope="col" className="routine-document__time">সময়</th>
            {hasRoom && <th scope="col" className="routine-document__room">কক্ষ</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const hidden = isHidden(row);
            const message = row.message ?? row.Message;
            const start = formatTime(row.StartTime);
            const end = formatTime(row.EndTime);
            return (
              <tr key={row.ERID ?? index} className={hidden ? 'routine-document__break' : undefined}>
                <td className="routine-document__serial">{bn(index + 1)}</td>
                <td className="routine-document__date">
                  <span>{formatDate(row.Date ?? row.ExamDate)}</span>
                  {row.BnExamDate && <small>{bn(row.BnExamDate)}</small>}
                </td>
                <td className="routine-document__day">{row.Day ?? row.ExamDay ?? '—'}</td>
                {hidden ? (
                  <td colSpan={hasRoom ? 3 : 2} className="routine-document__break-message">{message}</td>
                ) : (
                  <>
                    <td className="routine-document__subject">
                      <strong>{row.SubjectName || row.subject?.SubjectName || '—'}</strong>
                      {message && <small>{message}</small>}
                    </td>
                    <td className="routine-document__time">
                      <div className="routine-document__time-range">
                        {start && <span>{start}</span>}
                        {start && end && <span aria-hidden="true">–</span>}
                        {end && <span>{end}</span>}
                        {!start && !end && '—'}
                      </div>
                    </td>
                    {hasRoom && <td className="routine-document__room">
                      {bn(row.RoomNo) || (row.RoomName ? '' : '—')}
                      {row.RoomName && <small>{row.RoomName}</small>}
                    </td>}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <footer className="routine-document__signatures">
        {signatures.map((signature) => (
          <div key={signature.label}>
            <div className="routine-document__signature-image">
              {signature.image && <img src={signature.image} alt={`${signature.label} এর স্বাক্ষর`} />}
            </div>
            {/* <p className="routine-document__signature-label">{signature.label}</p> */}
            {signature.name && <p>{signature.name}</p>}
            {/* <p className="routine-document__signature-date">তারিখ: ........................</p> */}
          </div>
        ))}
      </footer>
    </article>
  );
};

ExamRoutineDocument.propTypes = {
  details: PropTypes.object,
  institution: PropTypes.object,
};

export default ExamRoutineDocument;
