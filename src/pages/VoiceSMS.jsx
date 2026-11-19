import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import ParentsAndAllUserTable from '../view/general-information/sms/ParentsAndAllUserTable';
import OthersTable from '../view/general-information/sms/OthersTable';
import AllUsersData from '../view/general-information/sms/AllUsersData';
import {
  useCheckVoicePaymentMutation,
  useGetVoiceAccountQuery,
  useGetVoicePackagesQuery,
  useGetVoicePaymentsQuery,
  useSendVoiceSMSMutation,
  useStartVoiceDepositMutation,
} from '../features/sms/smsSlice';
import { clearAllUsersData, clearParentsData } from '../features/student/studentSlice';
import { setPageName } from '../features/auth/authSlice';
import VoiceRecording from '../components/VoiceRecording';

// voice_sms_README.md 4.6: "Send voice call — Coming soon".
// API এ পাঠানোর endpoint চালু হলে true করুন এবং backend routes/voiceSms.js এর /send এ API কল যোগ করুন।
const VOICE_SEND_AVAILABLE = false;

const recipientOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Parents', value: 'guardian' },
  { label: 'All Users', value: 'all_users' },
  { label: 'Others', value: 'others' },
];

const PAYMENT_STATUS = {
  success: { label: 'সফল', className: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'অপেক্ষমাণ', className: 'bg-amber-100 text-amber-800' },
  cancelled: { label: 'অসম্পূর্ণ', className: 'bg-slate-100 text-slate-700' },
  failed: { label: 'ব্যর্থ', className: 'bg-red-100 text-red-700' },
};

const isValidMobile = (number) => /^01[3-9]\d{8}$/.test(String(number || '').trim());
const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;
const formatTaka = (value) => `৳${Number(value || 0).toLocaleString('bn-BD')}`;
const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
};

const SectionCard = ({ title, action, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-base md:text-lg font-bold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

SectionCard.propTypes = {
  title: PropTypes.node.isRequired,
  action: PropTypes.node,
  children: PropTypes.node,
};

const VoiceSMS = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { allUsers, parentsData } = useSelector((state) => state.student);
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------- account / balance ----------
  const {
    data: accountData,
    isLoading: isAccountLoading,
    isFetching: isAccountFetching,
    error: accountError,
    refetch: refetchAccount,
  } = useGetVoiceAccountQuery();
  const account = accountData?.account || null;
  const balance = accountData?.balance || null;
  const isConfigured = accountData?.configured !== false;

  // ---------- packages / payments ----------
  // প্যাকেজ তালিকা অ্যাকাউন্ট ছাড়াও দেখা যায়; কেনার জন্য অ্যাকাউন্ট লাগে (admin প্যানেল থেকে খোলা হয়)
  const {
    data: packages = [],
    isFetching: isPackagesLoading,
    error: packagesError,
  } = useGetVoicePackagesQuery(undefined, { skip: !isConfigured });
  const { data: payments = [] } = useGetVoicePaymentsQuery(undefined, { skip: !account });
  const [startVoiceDeposit, { isLoading: isStartingPayment }] = useStartVoiceDepositMutation();
  const [checkVoicePayment] = useCheckVoicePaymentMutation();
  const [buyingPackageId, setBuyingPackageId] = useState(null);
  const [checkingTx, setCheckingTx] = useState(null);

  // ---------- send ----------
  const [sendVoiceSMS, { isLoading: isSending }] = useSendVoiceSMSMutation();
  const [selectedRecipient, setSelectedRecipient] = useState('single');
  const [mobileNumbers, setMobileNumbers] = useState(['']);
  const [othersMobileNumbers, setOthersMobileNumbers] = useState(['']);
  const [mobileError, setMobileError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ---------- payment check (button and return from EPS) ----------
  const confirmPayment = async (transactionId, { quiet = false } = {}) => {
    setCheckingTx(transactionId);
    try {
      const payment = await checkVoicePayment(transactionId).unwrap();
      if (payment.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'পেমেন্ট সফল',
          text: `${payment.balance_added_text || ''} টক টাইম আপনার ব্যালেন্সে যোগ হয়েছে।`,
        });
      } else if (!quiet) {
        await Swal.fire({
          icon: 'info',
          title: 'পেমেন্ট এখনো সম্পন্ন হয়নি',
          text: 'পেমেন্ট শেষ করে থাকলে কিছুক্ষণ পরে আবার যাচাই করুন।',
        });
      } else {
        await Swal.fire({ icon: 'warning', title: 'পেমেন্ট সম্পন্ন হয়নি' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'যাচাই করা যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    } finally {
      setCheckingTx(null);
    }
  };

  // EPS থেকে ফেরার পর URL এ ?status=..&transaction_id=.. থাকে।
  // URL এর status বিশ্বাস না করে API থেকে যাচাই করা হয় (README section 6)।
  useEffect(() => {
    const transactionId = searchParams.get('transaction_id');
    if (!transactionId || !account) return;
    const next = new URLSearchParams(searchParams);
    next.delete('transaction_id');
    next.delete('status');
    setSearchParams(next, { replace: true });
    confirmPayment(transactionId, { quiet: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, account]);
  // 

  // ---------- handlers ----------
  const handleBuy = async (pkg) => {
    if (!account) {
      Swal.fire({
        icon: 'info',
        title: 'Voice SMS অ্যাকাউন্ট খোলা হয়নি',
        text: 'প্যাকেজ কিনতে আগে অ্যাকাউন্ট খুলতে হবে। অ্যাকাউন্ট খোলার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।',
      });
      return;
    }
    const confirmation = await Swal.fire({
      icon: 'question',
      title: `${pkg.package_name} প্যাকেজ কিনবেন?`,
      html: `মূল্য <b>${formatTaka(pkg.price)}</b> · টক টাইম <b>${pkg.balance_text}</b><br/><span style="font-size:13px;color:#64748b">bKash, Nagad, কার্ড বা ইন্টারনেট ব্যাংকিং দিয়ে পেমেন্ট পেজে নিয়ে যাওয়া হবে।</span>`,
      showCancelButton: true,
      confirmButtonText: 'পেমেন্ট করুন',
      cancelButtonText: translate('Cancel'),
    });
    if (!confirmation.isConfirmed) return;

    setBuyingPackageId(pkg.package_id);
    try {
      const result = await startVoiceDeposit({
        package_id: pkg.package_id,
        // পেমেন্ট শেষে এই পেজেই ফিরে আসবে
        return_url: `${window.location.origin}${window.location.pathname}`,
      }).unwrap();
      window.location.assign(result.payment_url);
    } catch (error) {
      setBuyingPackageId(null);
      Swal.fire({ icon: 'error', title: 'পেমেন্ট শুরু করা যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    }
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').substring(0, 11);
    setMobileNumbers([value]);
    setMobileError(value && !isValidMobile(value) ? translate('Invalid mobile number. Must start with 013, 014, 015, 016, 017, 018, or 019') : '');
  };

  const handleChangeRecipient = (value) => {
    setSelectedRecipient(value);
    setMobileNumbers(['']);
    setMobileError('');
    dispatch(clearParentsData());
    dispatch(clearAllUsersData());
  };

  const getReceivers = () => {
    if (selectedRecipient === 'single') return mobileNumbers;
    if (selectedRecipient === 'guardian') return parentsData.map((student) => student.Mobile1);
    if (selectedRecipient === 'all_users') return allUsers.map((user) => user.Mobile1);
    return othersMobileNumbers;
  };

  const handleSend = async () => {
    const receivers = [...new Set(getReceivers().filter(isValidMobile))];
    if (!audioUrl) {
      Swal.fire({ icon: 'warning', title: 'আগে ভয়েস রেকর্ড করে সেভ করুন' });
      return;
    }
    if (receivers.length === 0) {
      Swal.fire({ icon: 'warning', title: 'অন্তত একটি সঠিক মোবাইল নম্বর দিন' });
      return;
    }
    try {
      await sendVoiceSMS({ audio_url: audioUrl, receivers }).unwrap();
      Swal.fire({ icon: 'success', title: 'Voice SMS পাঠানো হয়েছে' });
    } catch (error) {
      Swal.fire({ icon: 'info', title: 'পাঠানো যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    }
  };


  // ---------- render ----------
  const renderBalance = () => {
    if (!account) return null;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2">
        <div>
          <p className="text-xs font-medium text-emerald-700">অবশিষ্ট টক টাইম</p>
          <p className="text-lg font-bold text-emerald-900 tabular-nums">
            {balance?.balance_text ?? (accountData?.balanceError ? 'দেখা যাচ্ছে না' : '...')}
          </p>
        </div>
        <button
          type="button"
          onClick={refetchAccount}
          disabled={isAccountFetching}
          className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
        >
          {isAccountFetching ? '...' : 'রিফ্রেশ'}
        </button>
      </div>
    );
  };

  const renderPackages = () => (
    <SectionCard title="প্যাকেজের তালিকা">
      {!account && !isAccountLoading && (
        <p role="status" className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          এই প্রতিষ্ঠানের Voice SMS অ্যাকাউন্ট এখনো খোলা হয়নি, তাই প্যাকেজ কেনা যাবে না।
          অ্যাকাউন্ট খোলার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      )}
      {isPackagesLoading && <p className="text-sm text-gray-500">প্যাকেজ লোড হচ্ছে...</p>}
      {packagesError && (
        <p className="text-sm text-red-600">{errorText(packagesError, 'প্যাকেজ তালিকা আনা যায়নি।')}</p>
      )}
      {!isPackagesLoading && !packagesError && packages.length === 0 && (
        <p className="text-sm text-gray-500">কোনো প্যাকেজ পাওয়া যায়নি।</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.package_id}
            className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-indigo-700">{pkg.package_name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatTaka(pkg.price)}</p>
              <p className="mt-1 text-sm text-gray-600">
                টক টাইম: <span className="font-semibold text-gray-800">{pkg.balance_text}</span>
              </p>
            </div>
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => handleBuy(pkg)}
              loading={buyingPackageId === pkg.package_id}
              disabled={isStartingPayment || !account}
            >
              কিনুন
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderPayments = () => (
    <SectionCard title="সাম্প্রতিক পেমেন্ট">
      {payments.length === 0 ? (
        <p className="text-sm text-gray-500">এখনো কোনো পেমেন্ট নেই।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 font-semibold">তারিখ</th>
                <th className="px-3 py-2 font-semibold">প্যাকেজ</th>
                <th className="px-3 py-2 font-semibold">মূল্য</th>
                <th className="px-3 py-2 font-semibold">অবস্থা</th>
                <th className="px-3 py-2 font-semibold">ট্রানজেকশন</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => {
                const status = PAYMENT_STATUS[payment.Status] || PAYMENT_STATUS.pending;
                return (
                  <tr key={payment.ID}>
                    <td className="px-3 py-2 text-gray-700">{formatDate(payment.PaidAt || payment.CreateAt)}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-800">{payment.PackageName || '-'}</span>
                      {payment.BalanceText && <span className="block text-xs text-gray-500">{payment.BalanceText}</span>}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{formatTaka(payment.Amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{payment.TransactionID}</td>
                    <td className="px-3 py-2 text-right">
                      {payment.Status !== 'success' && (
                        <button
                          type="button"
                          onClick={() => confirmPayment(payment.TransactionID)}
                          disabled={checkingTx === payment.TransactionID}
                          className="rounded-md border border-indigo-200 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                        >
                          {checkingTx === payment.TransactionID ? 'যাচাই হচ্ছে...' : 'আবার যাচাই'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );

  const renderSend = () => (
    <SectionCard
      title="Voice SMS পাঠান"
      action={
        !VOICE_SEND_AVAILABLE && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">শীঘ্রই আসছে</span>
        )
      }
    >
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {recipientOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center p-2 space-x-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300"
          >
            <input
              type="radio"
              name="messageRecipient"
              value={option.value}
              checked={selectedRecipient === option.value}
              onChange={() => handleChangeRecipient(option.value)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm 2xl:text-base font-semibold 2xl:font-bold text-gray-700">
              {translate(option.label)}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 space-y-4">
        <Input
          label="Mobile Number"
          placeholder={translate('Enter mobile number')}
          type="tel"
          name="mobile"
          value={mobileNumbers[0] || ''}
          onChange={handleMobileChange}
          disabled={selectedRecipient !== 'single'}
          error={mobileError}
          helperText={mobileError}
        />
        <VoiceRecording onSaved={setAudioUrl} />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSend}
            loading={isSending}
            disabled={!VOICE_SEND_AVAILABLE || !account || isSending}
          >
            Voice SMS পাঠান
          </Button>
          {!VOICE_SEND_AVAILABLE && (
            <p className="text-sm text-gray-600">
              Voice SMS API তে কল পাঠানোর সুবিধা এখনো চালু হয়নি। চালু হলে এখান থেকেই পাঠানো যাবে।
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );

  return (
    <div className="sm:gap-3 font-default bg-white p-3 md:p-4 rounded-xl shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Voice SMS</h2>
          {account && <p className="text-xs text-gray-500">অ্যাকাউন্ট: {account.username}</p>}
        </div>
        {renderBalance()}
      </div>

      {!isConfigured && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          সার্ভারে Voice SMS API সেট করা নেই। backend এর <code>.env</code> এ <code>VOICE_API_URL</code> ও{' '}
          <code>VOICE_API_KEY</code> দিয়ে সার্ভার রিস্টার্ট করুন।
        </div>
      )}
      {accountError && (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorText(accountError, 'Voice SMS অ্যাকাউন্টের তথ্য আনা যায়নি।')}
        </div>
      )}
      {account && accountData?.balanceError && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          ব্যালেন্স আনা যায়নি: {accountData.balanceError}
        </div>
      )}

      {isAccountLoading ? (
        <p className="p-6 text-center text-sm text-gray-500">লোড হচ্ছে...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-4 xl:grid-cols-2">
          <div className="space-y-6">
            {isConfigured && renderPackages()}
            {account && renderPayments()}
            {renderSend()}
          </div>

          <div>
            {selectedRecipient === 'guardian' && (
              <ParentsAndAllUserTable pageTitle={pageTitle} checkedValue={selectedRecipient} />
            )}
            {selectedRecipient === 'all_users' && <AllUsersData pageTitle={pageTitle} />}
            {selectedRecipient === 'others' && (
              <OthersTable
                pageTitle={pageTitle}
                setMobileNumbers={setOthersMobileNumbers}
                mobileNumbers={othersMobileNumbers}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

VoiceSMS.propTypes = {
  pageTitle: PropTypes.string,
};

export default VoiceSMS;
