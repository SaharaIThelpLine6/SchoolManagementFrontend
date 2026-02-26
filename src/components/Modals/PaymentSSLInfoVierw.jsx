import { useState } from 'react';
import { useGetMaddrasahSSLQuery } from '../../features/payment/paymentSlice';

const PaymentSSLInfoView = ({ id }) => {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(null);

  const { data: viewData } = useGetMaddrasahSSLQuery(id, {
    skip: !id,
  });

  const data = viewData ?? [];

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const Row = ({ label, value, copyKey, hidden }) => (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-mono text-gray-800">{hidden ? '••••••' : value}</p>
      </div>
      <button
        onClick={() => handleCopy(value.toString(), copyKey)}
        className="text-sm px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
      >
        {copied === copyKey ? 'Copied' : 'Copy'}
      </button>
    </div>
  );

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-xl shadow p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          SSL Payment Credentials
        </h2>

        <Row label="School ID" value={data.SchoolID} copyKey="school" />

        <Row label="Store ID" value={data.StoreID} copyKey="store" />

        <div className="flex items-center justify-between border rounded-lg p-3">
          <div>
            <p className="text-sm text-gray-500">Store Password</p>
            <p className="font-mono text-gray-800">
              {showPass ? data.StorePass : '••••••'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPass(!showPass)}
              className="text-sm px-3 py-1 rounded border"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => handleCopy(data.StorePass, 'pass')}
              className="text-sm px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
            >
              {copied === 'pass' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          ⚠ Keep your credentials secure. Do not share publicly.
        </p>
      </div>
    </div>
  );
};

export default PaymentSSLInfoView;
