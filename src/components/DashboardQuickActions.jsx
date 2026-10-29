import { useEffect, useRef, useState } from 'react';
import { BsChatDotsFill } from 'react-icons/bs';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight, FiInfo, FiLoader, FiUser, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { permissionsDataList } from '../Data/permissions';
import { useGetAllUserPermissionsQuery } from '../features/permission/permissionSlice';
import { setEditUserID } from '../features/settings/settingsSlice';
import { setEditMode } from '../features/userInfo/userInfoSlice';
import { useLazyGetUserBySearchQuery } from '../features/userType/userTypeSlice';
import './DashboardQuickActions.css';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';

// Defaults to the support number already used on the website's contact page.
const whatsappNumber = (import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER);
const whatsappMessage = import.meta.env.VITE_SUPPORT_WHATSAPP_MESSAGE ||
  'আসসালামু আলাইকুম। আমি Qmmsoft ড্যাশবোর্ড ব্যবহার করছি। আমার কিছু সহায়তা প্রয়োজন।';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const copy = {
  en: {
    open: 'Support & quick actions', close: 'Close quick actions',
    whatsapp: 'Chat on WhatsApp', update: 'User Information',
    subtitle: 'Find a user in your institution', code: 'User code',
    placeholder: 'Enter user code', hint: 'Enter the full code to open the user’s update form.',
    cancel: 'Cancel', submit: 'Submit', searching: 'Searching…',
    required: 'Please enter a user code.', missing: 'No user found with this code. Check the code and try again.',
    failed: 'Unable to find the user. Please try again.',
    duplicate: 'More than one user has this code. Please use User Information to select the correct user.',
  },
  bn: {
    open: 'সহায়তা ও দ্রুত সেবা', close: 'দ্রুত সেবা বন্ধ করুন',
    whatsapp: 'হোয়াটসঅ্যাপে যোগাযোগ', update: 'ইউজার তথ্য',
    subtitle: 'ইউজারের আইডি দিয়ে সকল তথ্য দেখুন', code: 'ইউজার কোড',
    placeholder: 'ইউজার কোড লিখুন', hint: 'ইউজারের তথ্য দেখতে করতে সম্পূর্ণ কোড লিখুন।',
    cancel: 'বাতিল', submit: 'সাবমিট', searching: 'খোঁজা হচ্ছে…',
    required: 'অনুগ্রহ করে ইউজার কোড লিখুন।', missing: 'এই কোডে কোনো ইউজার পাওয়া যায়নি। কোড যাচাই করে আবার চেষ্টা করুন।',
    failed: 'ইউজার খুঁজতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    duplicate: 'এই কোডে একাধিক ইউজার পাওয়া গেছে। ইউজার তথ্য পৃষ্ঠা থেকে সঠিক ইউজার নির্বাচন করুন।',
  },
};

const normalizeCode = (value) => String(value ?? '').trim()
  .replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));

export default function DashboardQuickActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector((state) => state.language.currectLanguage);
  const text = copy[language] || copy.en;
  const { data: permissions } = useGetAllUserPermissionsQuery();
  const canEdit = permissions?.data?.some((permission) =>
    permission.PermissionListID === permissionsDataList.user_entry && permission.PermissionEdit);
  const [searchUsers, { isFetching }] = useLazyGetUserBySearchQuery();
  const [view, setView] = useState('closed');
  const [userCode, setUserCode] = useState('');
  const [error, setError] = useState('');
  const rootRef = useRef(null);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const { data: institutionInfo, isSuccess } = useGetInstitutionInfoQuery();

  const close = (restoreFocus = true) => {
    requestRef.current?.abort();
    requestRef.current = null;
    setView('closed');
    setError('');
    if (restoreFocus) launcherRef.current?.focus();
  };

  useEffect(() => {
    if (view === 'user') inputRef.current?.focus();
    if (view === 'closed') return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [view]);

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit || requestRef.current) return;
    const code = normalizeCode(userCode);
    if (!code) {
      setError('required');
      inputRef.current?.focus();
      return;
    }
    setError('');
    const request = searchUsers({ search: code });
    requestRef.current = request;
    try {
      const users = await request.unwrap();
      if (requestRef.current !== request) return;
      // The search API also returns partial matches and admission joins may repeat users.
      const matches = [...new Map(users
        .filter((user) => normalizeCode(user.UserCode) === code)
        .map((user) => [user.UserID, user])).values()];
      if (matches.length !== 1 || !matches[0].UserID) {
        setError(matches.length > 1 ? 'duplicate' : 'missing');
        return;
      }
      dispatch(setEditMode(1));
      dispatch(setEditUserID(matches[0].UserID));
      requestRef.current = null;
      close();
      setUserCode('');
      navigate('/dashboard/general-info/users-info');
    } catch {
      if (requestRef.current === request) setError('failed');
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  };

  return (
    <div className="dashboard-quick-actions" ref={rootRef}>
      {view === 'user' && canEdit && (
        <section className="dashboard-quick-actions__panel" id="dashboard-quick-actions-panel"
          role="dialog" aria-labelledby="quick-user-title" aria-describedby="quick-user-hint">
          <div className="dashboard-quick-actions__header">
            <span className="dashboard-quick-actions__header-icon"><FiUser size={23} aria-hidden="true" /></span>
            <div>
              <h2 id="quick-user-title">{text.update}</h2>
              <p>{text.subtitle}</p>
            </div>
            <button type="button" className="dashboard-quick-actions__close" onClick={() => close()} aria-label={text.close}>
              <FiX size={20} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate aria-busy={isFetching}>
            <div className="dashboard-quick-actions__body">
              <label htmlFor="quick-user-code">{text.code}</label>
              <div className="dashboard-quick-actions__input-wrap">
                <FiUser size={18} aria-hidden="true" />
                <input ref={inputRef} id="quick-user-code" name="userCode" type="text"
                  autoComplete="off" maxLength={50} value={userCode} disabled={isFetching}
                  placeholder={text.placeholder} aria-invalid={Boolean(error)}
                  aria-describedby={`quick-user-hint${error ? ' quick-user-error' : ''}`}
                  onChange={(event) => { setUserCode(event.target.value); setError(''); }} />
              </div>
              <p className="dashboard-quick-actions__hint" id="quick-user-hint">
                <FiInfo size={14} aria-hidden="true" /><span>{text.hint}</span>
              </p>
              {error && <p className="dashboard-quick-actions__error" id="quick-user-error" role="alert">{text[error]}</p>}
            </div>
            <div className="dashboard-quick-actions__footer">
              <button type="button" className="dashboard-quick-actions__cancel" onClick={() => close()}>{text.cancel}</button>
              <button type="submit" className="dashboard-quick-actions__submit" disabled={isFetching}>
                {isFetching ? <FiLoader className="dashboard-quick-actions__spinner" aria-hidden="true" /> : <FiArrowRight aria-hidden="true" />}
                <span aria-live="polite">{isFetching ? text.searching : text.submit}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {view === 'menu' && (
        <div className="dashboard-quick-actions__menu" id="dashboard-quick-actions-panel" role="group" aria-label={text.open}>
          {/* {canEdit && (
            <button type="button" className="dashboard-quick-actions__action" onClick={() => { setError(''); setView('user'); }}>
              <span className="dashboard-quick-actions__label">{text.update}</span>
              <span className="dashboard-quick-actions__action-icon dashboard-quick-actions__action-icon--user"><FiUser size={23} aria-hidden="true" /></span>
            </button>
          )} */}
          <a className="dashboard-quick-actions__action" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => close()}>
            <span className="dashboard-quick-actions__label">{text.whatsapp}</span>
            <span className="dashboard-quick-actions__action-icon dashboard-quick-actions__action-icon--whatsapp"><FaWhatsapp size={27} aria-hidden="true" /></span>
          </a>
        </div>
      )}

      <button ref={launcherRef} type="button" className="dashboard-quick-actions__launcher"
        aria-label={view === 'closed' ? text.open : text.close} title={view === 'closed' ? text.open : text.close}
        aria-expanded={view !== 'closed'} aria-controls={view !== 'closed' ? 'dashboard-quick-actions-panel' : undefined}
        onClick={() => view === 'closed' ? setView('menu') : close()}>
        {view === 'closed' ? <BsChatDotsFill size={28} aria-hidden="true" /> : <FiX size={29} aria-hidden="true" />}
        {view === 'closed' && <span className="dashboard-quick-actions__status" aria-hidden="true" />}
      </button>
    </div>
  );
}
