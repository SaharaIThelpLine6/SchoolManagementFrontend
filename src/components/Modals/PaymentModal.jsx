import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useCreatePaymentRequestMutation,
  useGetUserInfoQuery,
} from '../../features/payment/paymentSlice';

import BkashLogo from '/banking/BKash.png';
import CelfinLogo from '/banking/CellFin.png';
import NagadLogo from '/banking/nagad-removebg-preview.png';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useGetSMSBundleQuery, useGetSMSpurchaseLinkMutation } from '../../features/sms/smsSlice';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─── Pricing ────────────────────────────────────────────────────────────────

function calculateServicePlanPrice(oldQuota, newQuota) {
  const pricingTiers = [
    { limit: 100, price: 10000 },
    { limit: 100, price: 5000 },
    { limit: 100, price: 4000 },
    { limit: 100, price: 3000 },
    { limit: 100, price: 2000 },
    { limit: 100, price: 1000 },
  ];
  const defaultPrice = 1000;
  let totalCost = 0;
  let remainingQuota = newQuota;
  let currentTier = Math.floor(oldQuota / 100);


  

  while (remainingQuota > 0) {
    if (currentTier < pricingTiers.length) {
      const tier = pricingTiers[currentTier];
      const quotaInTier = Math.min(tier.limit, remainingQuota);
      totalCost += quotaInTier * (tier.price / tier.limit);
      remainingQuota -= quotaInTier;
      currentTier++;
    } else {
      totalCost += remainingQuota * (defaultPrice / 100);
      remainingQuota = 0;
    }
  }
  return totalCost;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: 1,
    key: 'renewal',
    label: 'সফটওয়্যার রিনিউ',
    sublabel: 'Software renewal',
    icon: '/images/renewal.png',
    color: 'green',
  },
  {
    id: 2,
    key: 'quota',
    label: 'শিক্ষার্থী কোটা',
    sublabel: 'Student quota',
    icon: '/images/quota.png',
    color: 'blue',
  },
  {
    id: 3,
    key: 'sms',
    label: 'এস এম এস',
    sublabel: 'SMS package',
    icon: '/images/sms.png',
    color: 'pink',
  },
];

const YEARS = [
  { id: 1, name: '১ বছর' },
  { id: 2, name: '২ বছর' },
  { id: 3, name: '৩ বছর' },
];

const QUOTA = [
  { id: 100, name: '১০০ কোটা' },
  { id: 200, name: '২০০ কোটা' },
  { id: 300, name: '৩০০ কোটা' },
  { id: 400, name: '৪০০ কোটা' },
  { id: 500, name: '৫০০ কোটা' },
  { id: 600, name: '৬০০ কোটা' },
  { id: 700, name: '৭০০ কোটা' },
  { id: 800, name: '৮০০ কোটা' },
  { id: 900, name: '৯০০ কোটা' },
  { id: 1000, name: '১০০০ কোটা' },
];

// ─── Color Maps ──────────────────────────────────────────────────────────────

const cardColors = {
  green: {
    base: 'bg-[#E1F5EE] border-[#9FE1CB] hover:bg-[#c5f0e2] hover:border-[#1D9E75]',
    label: 'text-[#0F6E56]',
    sub: 'text-[#1D9E75]',
  },
  blue: {
    base: 'bg-[#E6F1FB] border-[#B5D4F4] hover:bg-[#cce3f8] hover:border-[#378ADD]',
    label: 'text-[#0C447C]',
    sub: 'text-[#185FA5]',
  },
  pink: {
    base: 'bg-[#FBEAF0] border-[#F4C0D1] hover:bg-[#f7d5e3] hover:border-[#D4537E]',
    label: 'text-[#72243E]',
    sub: 'text-[#993556]',
  },
};

const gatewayStyles = {
  bkash: {
    card: 'bg-[#FBEAF0] border-[#F4C0D1] hover:bg-[#f7d5e3] hover:border-[#D4537E]',
    label: 'text-[#72243E]',
    sub: 'text-[#993556]',
  },
  nagad: {
    card: 'bg-[#FAEEDA] border-[#FAC775] hover:bg-[#f5dfa3] hover:border-[#BA7517]',
    label: 'text-[#633806]',
    sub: 'text-[#854F0B]',
  },
  cellfin: {
    card: 'bg-[#E6F1FB] border-[#B5D4F4] hover:bg-[#cce3f8] hover:border-[#378ADD]',
    label: 'text-[#0C447C]',
    sub: 'text-[#185FA5]',
  },
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-200 ${
            i < current
              ? 'w-2 bg-[#1D9E75]'
              : i === current
              ? 'w-5 bg-[#378ADD]'
              : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PaymentModal = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: userPayInfo } = useGetUserInfoQuery();
  const [createPaymentRequest, { isLoading }] = useCreatePaymentRequestMutation();
  const [getSMSpurchaseLink, { isLoading: smsPurchaseLoading }] = useGetSMSpurchaseLinkMutation();
  const {data: smsBundle} = useGetSMSBundleQuery();
  const [step, setStep] = useState(0);           // 0=service, 1=size, 2=payment
  const [service, setService] = useState(null);  // full service object
  const [size, setSize] = useState(null);        // selected size item
  const [reqLock, setReqLock] = useState(true);
  const smsBundleOptions = smsBundle?.data ?? [];

  const sizeOptions = service?.id === 1 ? YEARS : service?.id === 2 ? QUOTA : smsBundleOptions;

  const computedPrice =
    service && size
      ? service.id === 1
        ? size.id * 3000
        : service.id === 3
        ? Number(size.price || 0)
        : calculateServicePlanPrice(userPayInfo?.BalanceDr || 0, size.id)
      : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function pickService(svc) {
    setService(svc);
    setSize(null);
    setStep(1);
  }

  function pickSize(item) {
    setSize(item);
  }

  async function handleSmsPurchase() {
    if (!size || !reqLock) return;

    try {
      setReqLock(false);
      const payload = await getSMSpurchaseLink({ bundle_id: size.id }).unwrap();
      const purchaseUrl = payload?.data?.url;

      if (purchaseUrl) {
        window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Purchase link not found.');
      }
    } catch (err) {
      console.error('SMS purchase link failed:', err);
      toast.error('Unable to create SMS purchase link.');
    } finally {
      setReqLock(true);
    }
  }

  function goBack() {
    if (step === 1) { setService(null); setSize(null); setStep(0); }
    if (step === 2) { setStep(1); }
  }

  async function handlePayment(method) {
    if (!service || !size) {
      toast.error('Please select service and size.');
      return;
    }

    if (!reqLock) return;

    const paymentRequest = {
      service: service.id,
      size: size.id,
      method,
      callbackURL: `${BASE_URL}/payment_confirm/${user.schoolId}/${service.id}/${size.id}`,
      schoolId: user.schoolId,
    };

    try {
      setReqLock(false);
      const payload = await createPaymentRequest(paymentRequest).unwrap();
      sessionStorage.clear();
      setReqLock(true);

      const redirectMap = {
        bkash: payload.bkashURL,
        nagad: payload.nagadURL,
        cellfin: payload.redirectUrl,
      };

      if (redirectMap[method]) {
        if (method === 'cellfin' && payload.token) {
          Cookies.set('CELLFIN_TOKEN', payload.token, { expires: 7 });
          Cookies.set('CORRELATION_ID', payload.correlationId, { expires: 7 });
          Cookies.set('TYPE', service.id, { expires: 7 });
          Cookies.set('SIZE', size.id, { expires: 7 });
        }
        window.location.href = redirectMap[method];
      } else {
        toast.error(`Unknown payment method: ${method}`);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      toast.error('Payment failed. Please try again.');
      setReqLock(true);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Processing payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl border border-gray-100">

        <StepDots current={step} total={3} />

        {/* ── Step 0: Service selection ─────────────────────────────────── */}
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Make a payment</h2>
            <p className="text-sm text-gray-400 mb-6">What would you like to pay for?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SERVICES.map((svc) => {
                const c = cardColors[svc.color];
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => pickService(svc)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 cursor-pointer text-center ${c.base}`}
                  >
                    <img src={svc.icon} alt={svc.label} className="w-16 h-16 object-contain mb-3" />
                    <span className={`text-[15px] font-semibold leading-snug ${c.label}`}>{svc.label}</span>
                    <span className={`text-xs mt-1 ${c.sub}`}>{svc.sublabel}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Step 1: Size selection ────────────────────────────────────── */}
        {step === 1 && service && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
              <span className="text-base font-semibold text-gray-800">
                {service.id === 1 ? 'Select renewal period' : service.id === 2 ? 'Select quota size' : 'Select SMS package'}
              </span>
            </div>

            <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg mb-4 border ${cardColors[service.color].base} ${cardColors[service.color].label}`}>
              ✓ {service.label}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {sizeOptions.map((item) => {
                const price =
                  service.id === 1
                    ? item.id * 3000
                    : service.id === 3
                    ? Number(item.price || 0)
                    : calculateServicePlanPrice(userPayInfo?.BalanceDr || 0, item.id);
                const selected = size?.id === item.id;
                const bundleQty = Number(item.non_masked_sms_qty || 0) + Number(item.masked_sms_qty || 0);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickSize(item)}
                    className={`rounded-xl border p-3 text-center transition-all duration-150 cursor-pointer ${
                      selected
                        ? 'border-2 border-blue-400 bg-blue-50'
                        : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-[15px] font-semibold ${selected ? 'text-blue-800' : 'text-gray-800'}`}>
                      {item.name}
                    </div>
                    {service.id == 3 ? (
                      <div className={`mt-1 space-y-0.5 text-[15px] font-bold ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
                        <div>Qty: {bundleQty.toLocaleString()}</div>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div>
              <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl px-5 py-4 flex items-center justify-between mb-6">
                <span className="text-sm text-[#0F6E56]">Total amount</span>
                <span className="text-2xl font-bold text-[#0F6E56]">৳ {computedPrice.toLocaleString()}</span>
              </div>
            </div>


            {service.id !== 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {[
                  { key: 'bkash', logo: BkashLogo, label: 'bKash', sub: 'Mobile banking' },
                  // { key: 'nagad', logo: NagadLogo, label: 'Nagad', sub: 'Mobile banking' },
                  // { key: 'cellfin', logo: CelfinLogo, label: 'CellFin', sub: 'Digital wallet' },
                ].map((gw) => {
                  const gs = gatewayStyles[gw.key];
                  return (
                    <button
                      key={gw.key}
                      type="button"
                      onClick={() => handlePayment(gw.key)}
                      disabled={!reqLock}
                      className={`flex flex-col items-center justify-center rounded-xl border p-1 transition-all duration-200 cursor-pointer ${gs.card} ${!reqLock ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    >
                      <img src={gw.logo} alt={gw.label} className="h-10 w-auto object-contain mb-2" />
                      {/* <span className={`text-sm font-semibold ${gs.label}`}>{gw.label}</span>
                      <span className={`text-[11px] mt-0.5 ${gs.sub}`}>{gw.sub}</span> */}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={handleSmsPurchase}
                  disabled={!size || !reqLock || smsPurchaseLoading}
                  className={`flex flex-col items-center justify-center rounded-xl border p-1 transition-all duration-200 cursor-pointer ${gatewayStyles.bkash.card} ${!size || !reqLock || smsPurchaseLoading ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  <img src={BkashLogo} alt="bKash" className="h-10 w-auto object-contain mb-2" />
                </button>
              </div>
            )}



            

            {/* <button
              type="button"
              onClick={() => size && setStep(2)}
              disabled={!size}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                size
                  ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to payment →
            </button> */}
          </>
        )}

        {/* ── Step 2: Payment method ────────────────────────────────────── */}
        {/* {step === 2 && service && size && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
              <span className="text-base font-semibold text-gray-800">Choose payment method</span>
            </div>

         

            
          </>
        )} */}

      </div>
    </div>
  );
};

export default PaymentModal;





// import { useEffect, useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { useSelector } from 'react-redux';
// import {
//   useCreatePaymentRequestMutation,
//   useGetUserInfoQuery,
// } from '../../features/payment/paymentSlice';
// import DefaultSelect from '../Forms/DefaultSelect';

// import BkashLogo from '/banking/BKash.png';
// import CelfinLogo from '/banking/CellFin.png';
// import NagadLogo from '/banking/nagad-removebg-preview.png';
// import Cookies from "js-cookie";
// import { toast } from 'react-toastify';
// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const PaymentModal = () => {
//   const methods = useForm();
//   const { user } = useSelector((state) => state.auth);
//   const { data: userPayInfo } = useGetUserInfoQuery();
//   const [createPaymentRequest, { isLoading }] =
//     useCreatePaymentRequestMutation();
//   const [req, setReq] = useState(true);

//   const { service, size } = methods.watch();

//   // 🔹 Price Calculation Function
//   function calculateServicePlanPrice(oldQuota, newQuota) {
//     const pricingTiers = [
//       { limit: 100, price: 10000 },
//       { limit: 100, price: 5000 },
//       { limit: 100, price: 4000 },
//       { limit: 100, price: 3000 },
//       { limit: 100, price: 2000 },
//       { limit: 100, price: 1000 },
//     ];
//     const defaultPrice = 1000;
//     let totalCost = 0;
//     let remainingQuota = newQuota;
//     let currentTier = Math.floor(oldQuota / 100);

//     while (remainingQuota > 0) {
//       if (currentTier < pricingTiers.length) {
//         const tier = pricingTiers[currentTier];
//         const quotaInTier = Math.min(tier.limit, remainingQuota);
//         totalCost += quotaInTier * (tier.price / tier.limit);
//         remainingQuota -= quotaInTier;
//         currentTier++;
//       } else {
//         totalCost += remainingQuota * (defaultPrice / 100);
//         remainingQuota = 0;
//       }
//     }

//     return totalCost;
//   }

//   useEffect(() => {
//     methods.reset({
//       size: '',
//       service: '',
//     });
//   }, []);

//   // 🧾 Unified Payment Function
//   const handlePayment = async (method) => {
//     const data = methods.getValues();

//     if (!data.service || !data.size) {
//       alert('Please select service and size before payment.');
//       return;
//     }

//     const paymentRequest = {
//       ...data,
//       method, // 🔹 identifies which gateway is used
//       callbackURL: `${BASE_URL}/payment_confirm/${user.schoolId}/${data.service}/${data.size}`,
//       schoolId: user.schoolId,
//     };

//     if (!req) return;

//     try {
//       setReq(false);
//       const payload = await createPaymentRequest(paymentRequest).unwrap();
//       sessionStorage.clear();
//       setReq(true);

//       // 🔹 Redirect Based on Gateway
//       const redirectMap = {
//         bkash: payload.bkashURL,
//         nagad: payload.nagadURL,
//         cellfin: payload.redirectUrl,
//       };

//       if (redirectMap[method]) {
//         if(method == "cellfin" && payload.token){
//           Cookies.set("CELLFIN_TOKEN", payload.token, { expires: 7 });
//           Cookies.set("CORRELATION_ID", payload.correlationId, { expires: 7 });
//           Cookies.set("TYPE", data.service, { expires: 7 });
//           Cookies.set("SIZE", data.size, { expires: 7 });
//         }
//         window.location.href = redirectMap[method];
//       } else {
//         console.error('Unknown payment method:', method);
//         toast.error(`Unknown payment method: ${method}`)
//       }
//     } catch (error) {
//       console.error('Payment failed:', error);
//       setReq(true);
//     }
//   };

//   const years = [
//     { id: 1, name: '১ বছর' },
//     { id: 2, name: '২ বছর' },
//     { id: 3, name: '৩ বছর' },
//   ];

//   const quota = [
//     { id: 100, name: '১০০ কোটা' },
//     { id: 200, name: '২০০ কোটা' },
//     { id: 300, name: '৩০০ কোটা' },
//     { id: 400, name: '৪০০ কোটা' },
//     { id: 500, name: '৫০০ কোটা' },
//     { id: 600, name: '৬০০ কোটা' },
//     { id: 700, name: '৭০০ কোটা' },
//     { id: 800, name: '৮০০ কোটা' },
//     { id: 900, name: '৯০০ কোটা' },
//     { id: 1000, name: '১০০০ কোটা' },
//   ];

//   if (isLoading) {
//     return <p className="text-center text-gray-600">Processing Payment...</p>;
//   }

//   return (
//     <div className="flex justify-center items-center min-h-[70vh]">
//       <div className="bg-white shadow-lg rounded-2xl p-6 w-full border border-gray-200">
//         <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
//           Make a Payment
//         </h2>

//         <div className='flex justify-center flex-wrap gap-4'>
//           <div className="quota w-[250px] h-auto px-4 flex flex-col items-center justify-center bg-[#f2fdf2] hover:bg-[#e7fcf3] border border-[#cffbe1] rounded-xl p-2 transition-all duration-200 shadow-sm hover:shadow-md gap-2 font-normal text-[26px]">
//             <img src="/images/renewal.png" alt="renewal.png" className='w-[100px] h-auto' />
//             সফটওয়্যার রিনিউ
//           </div>
//           <div className="quota w-[250px] h-auto px-4 flex flex-col items-center justify-center bg-[#edf5ff] hover:bg-[#d5e8ff] border border-[#aaccfe] rounded-xl p-2 transition-all duration-200 shadow-sm hover:shadow-md gap-2 font-normal text-[26px]">
//             <img src="/images/quota.png" alt="renewal.png" className='w-[100px] h-auto' />
//             শিক্ষার্থী কোটা
//           </div>
//           <div className="quota w-[250px] h-auto px-4 flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl p-2 transition-all duration-200 shadow-sm hover:shadow-md gap-2 font-normal text-[26px]">
//             <img src="/images/sms.png" alt="renewal.png" className='w-[100px] h-auto' />
//             এস এম এস
//           </div>
//         </div>

//         <div className='max-w-md'>

//         <FormProvider {...methods}>
//           <form className="space-y-5">
//             <DefaultSelect
//               label="সার্ভিস নির্বাচন করুন"
//               registerKey="service"
//               options={[
//                 { id: 1, name: 'রিনিউ' },
//                 { id: 2, name: 'কোটা' },
//               ]}
//               type="number"
//               valueField="id"
//               nameField="name"
//               require="Select Payment Service"
//             />

//             <DefaultSelect
//               label={service == 1 ? "বছর নির্বাচন করুন" : "কোটা সংখ্যা নির্বাচন করুন"}
//               registerKey="size"
//               options={service == 1 ? years : quota}
//               type="number"
//               valueField="id"
//               nameField="name"
//               require="Select Payment Size"
//             />

//             {service && size && (
//               <div className="bg-green-50 border border-green-200 rounded-xl py-3 text-center">
//                 <p className="text-lg font-bold text-green-700">
//                   {service === 1
//                     ? `${size * 3000} ৳`
//                     : `${calculateServicePlanPrice(
//                         userPayInfo?.BalanceDr || 0,
//                         size
//                       )} ৳`}
//                 </p>
//               </div>
//             )}

//             <div>
//               <p className="text-center text-gray-600 font-medium mb-3">
//                 Choose Payment Method
//               </p>

//               <div className="grid grid-cols-3 gap-4">
        
//                 <button
//                   type="button"
//                   onClick={() => handlePayment('bkash')}
//                   className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
//                 >
//                   <img
//                     src={BkashLogo}
//                     alt="bKash"
//                     className="h-10 w-auto object-contain mb-1"
//                   />
//                 </button>

     
//                 <button
//                   type="button"
//                   onClick={() => handlePayment('nagad')}
//                   className="flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
//                 >
//                   <img
//                     src={NagadLogo}
//                     alt="Nagad"
//                     className="h-10 w-auto object-contain mb-1"
//                   />
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handlePayment('cellfin')}
//                   className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
//                 >
//                   <img
//                     src={CelfinLogo}
//                     alt="CellFin"
//                     className="h-10 w-auto object-contain mb-1"
//                   />
//                 </button>
//               </div>
//             </div>
//           </form>
//         </FormProvider>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentModal;