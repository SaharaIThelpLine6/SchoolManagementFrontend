import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { setPageName } from '../../features/auth/authSlice';
import useTranslate from '../../utils/Translate';

const API_URL = import.meta.env.VITE_SERVER_URL;

/* ---------------------------------------------------------------------------
   Notice board

   The full history lives here; whatever is marked active also shows on the
   website — the home page strip takes the newest three.
--------------------------------------------------------------------------- */
const emptyForm = { ID: null, Title: '', Description: '', NoticeDate: '', IsActive: 1 };

const NoticeBoard = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const isEditing = Boolean(form.ID);

  useEffect(() => {
    dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/notice_board`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('request failed');
      const result = await response.json();
      setNotices(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Failed to load notices:', err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!form.Title.trim()) {
      Swal.fire({ icon: 'warning', title: 'শিরোনাম লিখুন', confirmButtonText: 'ঠিক আছে' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        isEditing
          ? `${API_URL}/api/settings/notice_board/${form.ID}`
          : `${API_URL}/api/settings/notice_board`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            Title: form.Title,
            Description: form.Description,
            NoticeDate: form.NoticeDate,
            IsActive: form.IsActive,
          }),
        }
      );

      if (!response.ok) throw new Error('request failed');

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: isEditing ? 'নোটিশ আপডেট হয়েছে।' : 'নোটিশ যোগ করা হয়েছে।',
        timer: 1800,
        showConfirmButton: false,
      });

      resetForm();
      loadNotices();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notice) => {
    setForm({
      ID: notice.ID,
      Title: notice.Title || '',
      Description: notice.Description || '',
      NoticeDate: (notice.NoticeDate || '').slice(0, 10),
      IsActive: Number(notice.IsActive) === 0 ? 0 : 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (notice) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'নোটিশটি মুছে ফেলবেন?',
      text: notice.Title,
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/settings/notice_board/${notice.ID}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('request failed');

      if (form.ID === notice.ID) resetForm();
      loadNotices();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'নোটিশ মুছতে সমস্যা হয়েছে।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  // Publish / unpublish without opening the form
  const toggleActive = async (notice) => {
    try {
      const response = await fetch(`${API_URL}/api/settings/notice_board/${notice.ID}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ IsActive: Number(notice.IsActive) === 1 ? 0 : 1 }),
      });
      if (!response.ok) throw new Error('request failed');
      loadNotices();
    } catch (err) {
      console.error('Failed to change notice status:', err);
    }
  };

  const visibleNotices = notices.filter((notice) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      String(notice.Title || '').toLowerCase().includes(term) ||
      String(notice.Description || '').toLowerCase().includes(term)
    );
  });

  const activeCount = notices.filter((notice) => Number(notice.IsActive) === 1).length;

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${date.getFullYear()}`;
  };

  return (
    <div className="font-default space-y-4">

      {/* ═══ Form card ═══════════════════════════════ */}
      <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight">
                {isEditing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}
              </h1>
              <p className="text-white/80 text-xs mt-0.5">
                সক্রিয় নোটিশগুলো ওয়েবসাইটে দেখা যাবে, সর্বশেষ ৩টি হোম পেজে স্ক্রল করবে
              </p>
            </div>

            <span className="ml-auto hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              সক্রিয়: {activeCount} / {notices.length}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                নোটিশের শিরোনাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.Title}
                onChange={(event) => changeField('Title', event.target.value)}
                placeholder="যেমন: বার্ষিক পরীক্ষার রুটিন প্রকাশ"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ</label>
              <input
                type="date"
                value={form.NoticeDate}
                onChange={(event) => changeField('NoticeDate', event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বিস্তারিত</label>
            <textarea
              rows={4}
              value={form.Description}
              onChange={(event) => changeField('Description', event.target.value)}
              placeholder="নোটিশের বিস্তারিত লিখুন (ঐচ্ছিক)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                className="h-[15px] w-[15px] accent-emerald-600"
                checked={Number(form.IsActive) === 1}
                onChange={(event) => changeField('IsActive', event.target.checked ? 1 : 0)}
              />
              <span className="text-[13px] font-medium text-slate-700">ওয়েবসাইটে দেখাও</span>
            </label>

            <div className="ml-auto flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-60"
              >
                {saving ? 'সংরক্ষণ হচ্ছে…' : isEditing ? 'আপডেট করুন' : 'নোটিশ যোগ করুন'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ═══ History ═════════════════════════════════ */}
      <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">নোটিশের তালিকা</h2>

          <div className="ml-auto relative">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="খুঁজুন…"
              className="w-56 rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center">
            <div className="inline-block h-8 w-8 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm mt-3">তালিকা আনা হচ্ছে…</p>
          </div>
        ) : visibleNotices.length === 0 ? (
          <div className="py-14 text-center text-slate-500">
            {search ? 'এই শব্দে কোনো নোটিশ পাওয়া যায়নি।' : 'এখনো কোনো নোটিশ যোগ করা হয়নি।'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleNotices.map((notice, index) => (
              <div key={notice.ID} className="flex flex-wrap items-start gap-3 px-5 py-4 hover:bg-slate-50/70 transition">
                <span className="mt-1 text-xs font-semibold text-slate-400 w-6 shrink-0">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800 text-[15px]">{notice.Title}</h3>

                    {Number(notice.IsActive) === 1 ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        নিষ্ক্রিয়
                      </span>
                    )}

                    {notice.NoticeDate && (
                      <span className="text-[12px] text-slate-500">{formatDate(notice.NoticeDate)}</span>
                    )}
                  </div>

                  {notice.Description && (
                    <p className="text-[13px] text-slate-600 mt-1 whitespace-pre-line line-clamp-3">
                      {notice.Description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActive(notice)}
                    title={Number(notice.IsActive) === 1 ? 'ওয়েবসাইট থেকে সরান' : 'ওয়েবসাইটে দেখান'}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 transition"
                  >
                    {Number(notice.IsActive) === 1 ? 'লুকান' : 'দেখান'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(notice)}
                    className="h-9 px-3 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition"
                  >
                    সম্পাদনা
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(notice)}
                    className="h-9 px-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
                  >
                    মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;