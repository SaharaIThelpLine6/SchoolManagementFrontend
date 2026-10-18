import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGetAllExamRoutineQuery } from '../features/exam/examQuerySlice';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import ExamRoutineDocument from '../view/exam/ExamRouting/ExamRoutineDocument';
import './ExamRoutinePrint.css';

// Mount page rules only while this preview is open, so other reports keep their paper settings.
const PRINT_CSS = `
@page { size: A4 portrait; margin: 8mm; }
@media print {
  body.exam-routine-print-active > *:not(#exam-routine-print-preview) { display: none !important; }
  body.exam-routine-print-active { margin: 0 !important; padding: 0 !important; overflow: visible; }
}`;

const ExamRoutinePrint = ({ sessionID, examID, subClassID, onClose }) => {
  const printed = useRef(false);
  const previewRef = useRef(null);
  const closeRef = useRef(null);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const { data: details, isFetching: loadingRoutine, isError: routineError } = useGetAllExamRoutineQuery({
    sessionID,
    examID,
    subClassId: subClassID,
  }, { refetchOnMountOrArgChange: true });
  const { data: institution, isLoading: loadingInstitution } = useGetInstitutionInfoQuery();
  const loading = loadingRoutine || loadingInstitution;
  const rows = Array.isArray(details?.routine) ? details.routine : [];
  const hasRows = rows.some((row) => {
    const hidden = row.hidden === true || Number(row.hidden ?? row.IsHidden) === 1;
    return !hidden || String(row.message ?? row.Message ?? '').trim();
  });
  const examName = details?.examName?.ExamName ?? '';
  const className = details?.classGroup?.SubClass ?? '';

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add('exam-routine-print-active');
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove('exam-routine-print-active');
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = [examName, className, 'Exam Routine'].filter(Boolean).join(' - ');
    return () => { document.title = previousTitle; };
  }, [examName, className]);

  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('afterprint', onClose);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('afterprint', onClose);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    setReadyToPrint(false);
    if (loading || routineError || !hasRows) return;
    let cancelled = false;
    const preparePrint = async () => {
      // Include signatures, and only wait on actual images (the logo fallback is a div).
      await document.fonts.load('14px ExamRoutineBangla').catch(() => {});
      await document.fonts.ready;
      await Promise.all(Array.from(previewRef.current?.querySelectorAll('img') ?? []).map(
        (image) => image.decode().catch(() => {})
      ));
      if (!cancelled) setReadyToPrint(true);
    };
    preparePrint();
    return () => { cancelled = true; };
  }, [loading, routineError, hasRows, details, institution]);

  useEffect(() => {
    if (!readyToPrint || printed.current) return;
    printed.current = true;
    window.print();
  }, [readyToPrint]);

  return createPortal(
    <main
      ref={previewRef}
      id="exam-routine-print-preview"
      className="exam-routine-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Exam routine print preview"
    >
      <style>{PRINT_CSS}</style>
      <div className="exam-routine-preview__toolbar">
        <span>Exam routine preview · A4</span>
        <div>
          <button type="button" onClick={() => window.print()} disabled={!readyToPrint}>
            Print / Save as PDF
          </button>
          <button ref={closeRef} type="button" onClick={onClose}>Close</button>
        </div>
      </div>
      {loading ? (
        <p className="exam-routine-preview__status" role="status">Preparing exam routine…</p>
      ) : routineError || !hasRows ? (
        <p className="exam-routine-preview__status" role="alert">The exam routine could not be loaded. Please close this preview and try again.</p>
      ) : (
        <ExamRoutineDocument details={details} institution={institution} />
      )}
    </main>,
    document.body
  );
};

export default ExamRoutinePrint;
