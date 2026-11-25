import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LABELS } from '../../helper/labels';

export const TeacherSelect = ({
  teachers,
  value,
  onChange,
  allowAll = false,
  allLabel = LABELS.reportsPage.filterAllTeachers,
  placeholder = LABELS.common.selectTeacher,
  className = '',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.userId === value),
    [teachers, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.userCode.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q)
    );
  }, [teachers, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [open]);

  const displayText = selectedTeacher
    ? `${selectedTeacher.name} (${selectedTeacher.userCode})`
    : allowAll && value === ''
      ? allLabel
      : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full h-10 px-3 flex items-center justify-between gap-2 text-sm bg-white border border-slate-300 rounded-lg text-left hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors"
      >
        <span className={`truncate ${selectedTeacher || allowAll ? 'text-slate-900' : 'text-slate-400'}`}>
          {displayText}
        </span>
        <svg
          className="w-4 h-4 text-slate-400 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full min-w-[260px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0 ml-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={LABELS.common.searchTeacherPlaceholder}
              className="w-full text-sm py-1 outline-none text-slate-900 placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {allowAll && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 ${value === '' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                    }`}
                >
                  <span>{allLabel}</span>
                </button>
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-500">
                {LABELS.common.noTeacherFound}
              </li>
            ) : (
              filtered.map((t) => {
                const isSelected = t.userId === value;
                return (
                  <li key={t.userId}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(t.userId);
                        setOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-slate-50 ${isSelected ? 'bg-teal-50 text-teal-800 font-medium' : 'text-slate-800'
                        }`}
                    >
                      <span className="truncate">{t.name}</span>
                      <span className="text-xs text-slate-500 shrink-0">
                        {t.userCode} · {t.designation}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};