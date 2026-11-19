// Admin: প্রতিষ্ঠানের Voice SMS অ্যাকাউন্ট খোলা (voice_sms_README.md 4.1)
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { setPageName } from '../../features/auth/authSlice';
import { useGetAllMadrasahQuery } from '../../features/userType/userTypeSlice';
import {
  useCreateAdminVoiceAccountMutation,
  useGetAdminVoiceAccountQuery,
  useGetAdminVoiceAccountsQuery,
} from '../../features/sms/smsSlice';

const PAGE_SIZE = 15;
const isValidMobile = (number) => /^01[3-9]\d{8}$/.test(String(number || '').trim());
const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;

const AccountPanel = ({ school }) => {
  const databaseName = school.DatabaseName;
  const { data, isFetching, error, refetch } = useGetAdminVoiceAccountQuery(databaseName);
  const [createAccount, { isLoading: isCreating }] = useCreateAdminVoiceAccountMutation();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  // নতুন প্রতিষ্ঠান নির্বাচন করলে ফর্মে তার তথ্য বসবে
  useEffect(() => {
    if (!data?.suggestion) return;
    setForm({
      name: data.suggestion.name || school.InstituteName || '',
      phone: data.suggestion.phone || '',
      email: data.suggestion.email || '',
    });
  }, [data, school.InstituteName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'প্রতিষ্ঠানের নাম দিন' });
      return;
    }
    if (!isValidMobile(form.phone)) {
      Swal.fire({ icon: 'warning', title: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' });
      return;
    }
    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Voice SMS অ্যাকাউন্ট খুলবেন?',
      html: `<b>${school.InstituteName || databaseName}</b><br/>মোবাইল: ${form.phone}<br/><span style="font-size:13px;color:#64748b">একটি মোবাইল নম্বর দিয়ে একটিই অ্যাকাউন্ট খোলা যায়, পরে বদলানো যাবে না।</span>`,
      showCancelButton: true,
      confirmButtonText: 'অ্যাকাউন্ট খুলুন',
      cancelButtonText: 'বাতিল',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await createAccount({
        databaseName,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      }).unwrap();
      Swal.fire({ icon: 'success', title: 'অ্যাকাউন্ট খোলা হয়েছে' });
    } catch (createError) {
      Swal.fire({ icon: 'error', title: 'অ্যাকাউন্ট খোলা যায়নি', text: errorText(createError, 'আবার চেষ্টা করুন।') });
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 border-b border-gray-100 pb-3">
        <h3 className="text-base md:text-lg font-bold text-gray-800">{school.InstituteName || databaseName}</h3>
        <p className="text-xs text-gray-500">
          কোড: {school.UserCode || '-'} · ডাটাবেস: <span className="font-mono">{databaseName}</span>
        </p>
      </div>

      {isFetching && <p className="text-sm text-gray-500">লোড হচ্ছে...</p>}

      {!isFetching && error && (
        <div role="alert" className="space-y-2">
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText(error, 'তথ্য আনা যায়নি।')}
          </p>
          <Button type="button" onClick={refetch}>আবার চেষ্টা</Button>
        </div>
      )}

      {!isFetching && data && data.configured === false && (
        <p role="alert" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          সার্ভারে Voice SMS API সেট করা নেই (<code>VOICE_API_URL</code>, <code>VOICE_API_KEY</code>)।
        </p>
      )}

      {!isFetching && data?.account && (
        <div className="space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            অ্যাকাউন্ট খোলা আছে
          </span>
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">Username</dt>
            <dd className="font-mono text-gray-800">{data.account.username}</dd>
            <dt className="text-gray-500">নাম</dt>
            <dd className="text-gray-800">{data.account.name}</dd>
            <dt className="text-gray-500">মোবাইল</dt>
            <dd className="text-gray-800">{data.account.phone}</dd>
            <dt className="text-gray-500">ইমেইল</dt>
            <dd className="text-gray-800">{data.account.email || '-'}</dd>
            <dt className="text-gray-500">টক টাইম</dt>
            <dd className="font-semibold text-gray-900">
              {data.balance?.balance_text ?? (data.balanceError ? `দেখা যাচ্ছে না (${data.balanceError})` : '-')}
            </dd>
          </dl>
        </div>
      )}

      {!isFetching && data && !data.account && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-gray-600">
            এই প্রতিষ্ঠানের Voice SMS অ্যাকাউন্ট এখনো খোলা হয়নি। অ্যাকাউন্ট খুললে প্রতিষ্ঠান নিজের Voice SMS পেজ থেকে
            টক টাইম কিনতে পারবে।
          </p>
          <Input
            label="প্রতিষ্ঠানের নাম"
            name="voice-name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
          />
          <Input
            label="মোবাইল নম্বর"
            name="voice-phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value.replace(/\D/g, '').slice(0, 11) }))}
          />
          <Input
            label="ইমেইল (ঐচ্ছিক)"
            name="voice-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
          />
          <Button type="submit" loading={isCreating} disabled={isCreating || data.configured === false}>
            অ্যাকাউন্ট খুলুন
          </Button>
        </form>
      )}
    </section>
  );
};

AccountPanel.propTypes = {
  school: PropTypes.shape({
    DatabaseName: PropTypes.string.isRequired,
    InstituteName: PropTypes.string,
    UserCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

const AdminVoiceSms = () => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(setPageName('Voice SMS অ্যাকাউন্ট'));
  }, [dispatch]);

  // টাইপ থামার পর খোঁজ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isFetching, isError } = useGetAllMadrasahQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const schools = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // খোলা অ্যাকাউন্টগুলো (SAHARAIT), DatabaseName অনুযায়ী
  const { data: voiceAccounts = [], isError: isAccountsError } = useGetAdminVoiceAccountsQuery();
  const accountByDb = new Map(voiceAccounts.map((account) => [account.DatabaseName, account]));

  return (
    <div className="font-default space-y-4 p-3 md:p-4">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Voice SMS অ্যাকাউন্ট</h2>
        <p className="text-sm text-gray-600">
          প্রতিষ্ঠান নির্বাচন করে তার Voice SMS অ্যাকাউন্ট খুলুন বা দেখুন।
          {!isAccountsError && <span className="ml-1 font-semibold text-gray-800">মোট খোলা অ্যাকাউন্ট: {voiceAccounts.length}</span>}
        </p>
        {isAccountsError && (
          <p role="alert" className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">
            অ্যাকাউন্টের অবস্থা আনা যায়নি। master ডাটাবেসে (SAHARAIT) Voice SMS migration চালানো হয়েছে কি না দেখুন।
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {/* Input এর ভেতরে h-full আছে; আলাদা div ছাড়া সেটা পুরো কার্ডের উচ্চতা নিয়ে তালিকাকে নিচে ঠেলে দেয় */}
          <div>
            <Input
              label="প্রতিষ্ঠান খুঁজুন"
              name="voice-school-search"
              placeholder="কোড বা নাম"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">কোড</th>
                  <th className="px-3 py-2 font-semibold">প্রতিষ্ঠান</th>
                  <th className="px-3 py-2 font-semibold">ডাটাবেস</th>
                  <th className="px-3 py-2 font-semibold">Voice SMS</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isFetching && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">লোড হচ্ছে...</td></tr>
                )}
                {!isFetching && isError && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-red-600">তালিকা আনা যায়নি।</td></tr>
                )}
                {!isFetching && !isError && schools.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">কোনো প্রতিষ্ঠান পাওয়া যায়নি।</td></tr>
                )}
                {!isFetching && schools.map((school) => {
                  const isSelected = selected?.DatabaseName === school.DatabaseName;
                  const voiceAccount = accountByDb.get(school.DatabaseName);
                  return (
                    <tr key={school.ID ?? school.DatabaseName} className={isSelected ? 'bg-indigo-50' : ''}>
                      <td className="px-3 py-2 tabular-nums">{school.UserCode}</td>
                      <td className="px-3 py-2 text-gray-800">{school.InstituteName}</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">{school.DatabaseName}</td>
                      <td className="px-3 py-2">
                        {isAccountsError ? (
                          <span className="text-xs text-gray-400">-</span>
                        ) : voiceAccount ? (
                          <div>
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                              খোলা আছে
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500">{voiceAccount.Phone}</span>
                          </div>
                        ) : (
                          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            খোলা হয়নি
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(school)}
                          className={`rounded-md border px-3 py-1 text-xs font-semibold ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-600 text-white'
                              : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                          }`}
                        >
                          {isSelected ? 'নির্বাচিত' : voiceAccount ? 'বিস্তারিত' : 'অ্যাকাউন্ট খুলুন'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              আগের
            </button>
            <span className="text-gray-600">পৃষ্ঠা {page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              পরের
            </button>
          </div>
        </section>

        <div>
          {selected ? (
            <AccountPanel key={selected.DatabaseName} school={selected} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              বাম পাশের তালিকা থেকে একটি প্রতিষ্ঠান নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVoiceSms;
