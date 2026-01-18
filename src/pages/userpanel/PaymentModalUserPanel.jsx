import { useState } from 'react';

const paymentMethods = {
  mobile: [
    { name: 'bKash', img: '/banking/BKash.png' },
    { name: 'Nagad', img: '/banking/Nagad.png' },
    { name: 'Rocket', img: '/banking/Rocket.jpg' },
    // { name: 'Upay', img: '/banking/Upay.png' },
    // { name: 'SureCash', img: '/banking/SureCash.png' },
    // { name: 'OK Wallet', img: '/banking/OKWallet.png' },
    // { name: 'AB Bank', img: '/banking/abbank.png' },
    // { name: 't-cash', img: '/banking/tcash.png' },
    // { name: 'Dmoney', img: '/banking/dmoney.png' },
  ],
};

const tabs = [
  { key: 'cards', label: 'Cards' },
  { key: 'mobile', label: 'Mobile Banking' },
  { key: 'net', label: 'Net Banking' },
];

const PaymentModalUserPanel = () => {
  const [activeTab, setActiveTab] = useState('mobile');
  const [selected, setSelected] = useState(null);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md p-4">
      {/* Tabs */}
      <div className="flex border rounded-lg overflow-hidden mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium transition
              ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment Grid */}
      {activeTab === 'mobile' && (
        <div className="grid grid-cols-3 gap-4">
          {paymentMethods.mobile.map((item) => (
            <div
              key={item.name}
              onClick={() => setSelected(item.name)}
              className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center
                transition hover:shadow-md
                ${
                  selected === item.name
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200'
                }`}
            >
              <img
                src={item.img}
                alt={item.name}
                className="h-8 object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {selected && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Pay with {selected}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentModalUserPanel;
