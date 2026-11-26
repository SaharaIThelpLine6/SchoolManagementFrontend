// ব্যক্তিগত রিপোর্টের ইউজার খোঁজা — আইডি, নাম, পিতার নাম, মোবাইল বা শ্রেণী লিখে খুঁজে নির্বাচন।
// কিবোর্ড: ↑ ↓ দিয়ে সরানো, Enter দিয়ে নির্বাচন, Esc দিয়ে বন্ধ।
import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import SvgIcon from '../../components/icons/SvgIcon';
import { toBnDigits } from '../deviceTimeSettings/timeUtils';

const MAX_RESULTS = 50;
const BN = '০১২৩৪৫৬৭৮৯';
// বাংলা অঙ্কে লিখলেও আইডি / মোবাইল মিলবে
const normalize = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[০-৯]/g, (d) => String(BN.indexOf(d)))
    .trim();

const UserSearch = ({ users, value, onChange, disabled }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const index = useMemo(
    () =>
      users.map((u) => ({
        user: u,
        code: normalize(u.UserCode),
        text: normalize([u.UserName, u.FatherName, u.Mobile, u.ClassName, u.Designation].filter(Boolean).join(' ')),
      })),
    [users]
  );
  const selected = users.find((u) => String(u.UserID) === String(value)) || null;

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return index.slice(0, MAX_RESULTS).map((x) => x.user);
    const words = q.split(/\s+/);
    return index
      .filter((x) => words.every((w) => x.code.includes(w) || x.text.includes(w)))
      .sort((a, b) => Number(!a.code.startsWith(q)) - Number(!b.code.startsWith(q))) // আইডির শুরুতে মিল আগে
      .slice(0, MAX_RESULTS)
      .map((x) => x.user);
  }, [index, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // কিবোর্ডে সরালে নির্বাচিত সারি দেখা যাবে
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (u) => {
    onChange(String(u.UserID));
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative font-SolaimanLipi">
      <label htmlFor="report-user-search" className="mb-1 block text-sm font-bold text-black">
        ইউজার খুঁজুন <span className="text-red-500">*</span> :
      </label>

      {selected && !open ? (
        <div className="flex h-11 items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3">
          <SvgIcon name="SubUser" size={16} className="shrink-0 text-blue-600" />
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left text-sm text-slate-800"
            onClick={() => {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            title="অন্য ইউজার খুঁজুন"
          >
            <b>{selected.UserName}</b>
            <span className="text-slate-500">
              {' '}
              · আইডি {toBnDigits(selected.UserCode)}
              {selected.ClassName ? ` · ${selected.ClassName}` : selected.Designation ? ` · ${selected.Designation}` : ''}
            </span>
          </button>
          <button
            type="button"
            aria-label="নির্বাচন মুছুন"
            onClick={() => onChange('')}
            className="shrink-0 rounded p-1 text-slate-400 hover:bg-white hover:text-rose-600"
          >
            <SvgIcon name="FiX" size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FaSearch size={14} />
          </span>
          <input
            id="report-user-search"
            ref={inputRef}
            type="search"
            autoComplete="off"
            disabled={disabled}
            value={query}
            placeholder={disabled ? 'আগে “রিপোর্ট দেখুন” চাপুন' : 'আইডি, নাম, পিতার নাম, মোবাইল বা শ্রেণী লিখুন'}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      )}

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length ? (
            <ul ref={listRef} className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-300">
              {results.map((u, i) => (
                <li key={u.UserID}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(u)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? 'bg-blue-50' : ''} ${
                      String(u.UserID) === String(value) ? 'font-bold' : ''
                    }`}
                  >
                    <span className="w-[70px] shrink-0 text-[13px] text-blue-700">{toBnDigits(u.UserCode)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-800">{u.UserName}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {[u.FatherName && `পিতা: ${u.FatherName}`, u.ClassName || u.Designation || u.UserTypeName].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-center text-sm text-slate-500">কোনো ইউজার পাওয়া যায়নি</p>
          )}
          {users.length > MAX_RESULTS && !query && (
            <p className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500">
              প্রথম {toBnDigits(MAX_RESULTS)} জন দেখানো হচ্ছে — নির্দিষ্ট ইউজারের জন্য লিখে খুঁজুন
            </p>
          )}
        </div>
      )}
    </div>
  );
};

UserSearch.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      UserID: PropTypes.number.isRequired,
      UserCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      UserName: PropTypes.string,
      FatherName: PropTypes.string,
      Mobile: PropTypes.string,
      ClassName: PropTypes.string,
      Designation: PropTypes.string,
      UserTypeName: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default UserSearch;
