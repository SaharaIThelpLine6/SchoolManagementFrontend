import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
  useCreatePaymentRequestMutation,
  useGetUserInfoQuery,
} from '../../features/payment/paymentSlice';
import DefaultSelect from '../Forms/DefaultSelect';

import BkashLogo from '/banking/BKash.png';
import CelfinLogo from '/banking/CellFin.png';
import NagadLogo from '/banking/nagad-removebg-preview.png';
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const PaymentModal = () => {
  const methods = useForm();
  const { user } = useSelector((state) => state.auth);
  const { data: userPayInfo } = useGetUserInfoQuery();
  const [createPaymentRequest, { isLoading }] =
    useCreatePaymentRequestMutation();
  const [req, setReq] = useState(true);

  const { service, size } = methods.watch();

  // 🔹 Price Calculation Function
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

  useEffect(() => {
    methods.reset({
      size: '',
      service: '',
    });
  }, []);

  // 🧾 Unified Payment Function
  const handlePayment = async (method) => {
    const data = methods.getValues();

    if (!data.service || !data.size) {
      alert('Please select service and size before payment.');
      return;
    }

    const paymentRequest = {
      ...data,
      method, // 🔹 identifies which gateway is used
      callbackURL: `${BASE_URL}/payment_confirm/${user.schoolId}/${data.service}/${data.size}`,
      schoolId: user.schoolId,
    };

    if (!req) return;

    try {
      setReq(false);
      const payload = await createPaymentRequest(paymentRequest).unwrap();
      sessionStorage.clear();
      setReq(true);

      // 🔹 Redirect Based on Gateway
      const redirectMap = {
        bkash: payload.bkashURL,
        nagad: payload.nagadURL,
        cellfin: payload.redirectUrl,
      };

      if (redirectMap[method]) {
        if(method == "cellfin" && payload.token){
          Cookies.set("CELLFIN_TOKEN", payload.token, { expires: 7 });
          Cookies.set("CORRELATION_ID", payload.correlationId, { expires: 7 });
          Cookies.set("TYPE", data.service, { expires: 7 });
          Cookies.set("SIZE", data.size, { expires: 7 });
        }
        window.location.href = redirectMap[method];
      } else {
        console.error('Unknown payment method:', method);
        toast.error(`Unknown payment method: ${method}`)
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setReq(true);
    }
  };

  const years = [
    { id: 1, name: '১ বছর' },
    { id: 2, name: '২ বছর' },
    { id: 3, name: '৩ বছর' },
  ];

  const quota = [
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

  if (isLoading) {
    return <p className="text-center text-gray-600">Processing Payment...</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Make a Payment
        </h2>

        <FormProvider {...methods}>
          <form className="space-y-5">
            {/* 🔹 Choose Service */}
            <DefaultSelect
              label="সার্ভিস নির্বাচন করুন"
              registerKey="service"
              options={[
                { id: 1, name: 'রিনিউ' },
                { id: 2, name: 'কোটা' },
              ]}
              type="number"
              valueField="id"
              nameField="name"
              require="Select Payment Service"
            />

            {/* 🔹 Choose Size */}
            <DefaultSelect
              label={service == 1 ? "বছর নির্বাচন করুন" : "কোটা সংখ্যা নির্বাচন করুন"}
              registerKey="size"
              options={service == 1 ? years : quota}
              type="number"
              valueField="id"
              nameField="name"
              require="Select Payment Size"
            />

            {/* 🔹 Payment Amount */}
            {service && size && (
              <div className="bg-green-50 border border-green-200 rounded-xl py-3 text-center">
                <p className="text-lg font-bold text-green-700">
                  {service === 1
                    ? `${size * 3000} ৳`
                    : `${calculateServicePlanPrice(
                        userPayInfo?.BalanceDr || 0,
                        size
                      )} ৳`}
                </p>
              </div>
            )}

            {/* 🔹 Payment Options */}
            <div>
              <p className="text-center text-gray-600 font-medium mb-3">
                Choose Payment Method
              </p>

              <div className="grid grid-cols-3 gap-4">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => handlePayment('bkash')}
                  className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <img
                    src={BkashLogo}
                    alt="bKash"
                    className="h-10 w-auto object-contain mb-1"
                  />
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => handlePayment('nagad')}
                  className="flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <img
                    src={NagadLogo}
                    alt="Nagad"
                    className="h-10 w-auto object-contain mb-1"
                  />
                </button>

                {/* CellFin */}
                <button
                  type="button"
                  onClick={() => handlePayment('cellfin')}
                  className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <img
                    src={CelfinLogo}
                    alt="CellFin"
                    className="h-10 w-auto object-contain mb-1"
                  />
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default PaymentModal;

// import React, { useEffect, useState } from 'react';
// import DefaultSelect from '../Forms/DefaultSelect';
// import { FormProvider, useForm, useFormContext } from 'react-hook-form';
// import { useCreatePaymentRequestMutation, useGetUserInfoQuery } from '../../features/payment/paymentSlice';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// const BASE_URL = import.meta.env.VITE_BASE_URL;
// const PaymentModal = () => {
//     const [amount, setAmount] = useState('');
//     const [createPaymentRequest, { isLoading, isError, isSuccess, data: paymentMethodData }] = useCreatePaymentRequestMutation();
//     const { data: userPayInfo } = useGetUserInfoQuery();
//     const [req, setReq] = useState(true)
//     // const {
//     //     watch,
//     //     handleSubmit,
//     //     setValue,
//     //     reset
//     // } = useForm();
//     const methods = useForm()

//     const { user } = useSelector((state) => state.auth);
//     const navigate = useNavigate()
//     const { service, size } = methods.watch()
//     function calculateServicePlanPrice(oldQuota, newQuota) {
//         const pricingTiers = [
//             { limit: 100, price: 10000 },
//             { limit: 100, price: 5000 },
//             { limit: 100, price: 4000 },
//             { limit: 100, price: 3000 },
//             { limit: 100, price: 2000 },
//             { limit: 100, price: 1000 }
//         ];
//         const defaultPrice = 1000;
//         let totalCost = 0;
//         let remainingQuota = newQuota;
//         let currentTier = Math.floor(oldQuota / 100);

//         while (remainingQuota > 0) {
//             if (currentTier < pricingTiers.length) {
//                 const tier = pricingTiers[currentTier];
//                 const quotaInTier = Math.min(tier.limit, remainingQuota);
//                 totalCost += quotaInTier * (tier.price / tier.limit);
//                 remainingQuota -= quotaInTier;
//                 currentTier++;
//             } else {
//                 totalCost += remainingQuota * (defaultPrice / 100);
//                 remainingQuota = 0;
//             }
//         }

//         return totalCost;
//     }
//     useEffect(()=>{
//         methods.reset({
//             size: "",
//             service: ""
//           })
//     }, [])
//     // useEffect(() => {
//     //     setValue("size", 0)
//     // }, [service]);

//     const handlePayNow = () => {
//         alert(`Paying ${amount}`);
//     };

//     const onSubmit = async (data) => {
//         // console.log(user.schoolId);

//         const paymentRequest = {
//             ...data,
//             // mode: "0011",
//             // payerReference: "01770618575",
//             callbackURL: `${BASE_URL}/payment_confirm/${user.schoolId}/${data.service}/${data.size}`,
//             schoolId: user.schoolId
//             // merchantAssociationInfo: "MI05MID54RF09123456One",
//             // amount: "500",
//             // currency: "BDT",
//             // intent: "sale",
//             // merchantInvoiceNumber: "0124456491098",
//             // merchantAssociationInfo: "MI01"
//         }
//         // console.log(paymentRequest);
//         if(req){
//             setReq(false)
//             await createPaymentRequest(paymentRequest).unwrap().then((payload) => {
//                 sessionStorage.clear();
//                 setReq(true)
//                 window.location.href = payload.bkashURL;

//             }).catch((error) => { setPaymentStatus(error.data?.error ? error.data.error : "Failed"); setReq(true) });
//         }

//     };

//     // console.log(service);
//     const years = [
//         {
//             id: 1,
//             name: "1"
//         },
//         {
//             id: 2,
//             name: "2"
//         },
//         {
//             id: 3,
//             name: "3"
//         },
//     ]
//     const quota = [
//         {
//             id: 100,
//             name: "100"
//         },
//         {
//             id: 200,
//             name: "200"
//         },
//         {
//             id: 300,
//             name: "300"
//         },
//         {
//             id: 400,
//             name: "400"
//         },
//         {
//             id: 500,
//             name: "500"
//         },
//         {
//             id: 600,
//             name: "600"
//         },
//         {
//             id: 700,
//             name: "700"
//         },
//         {
//             id: 800,
//             name: "800"
//         },
//         {
//             id: 900,
//             name: "900"
//         },
//         {
//             id: 1000,
//             name: "1000"
//         },
//     ]
//     // if (isSuccess) {
//     //     sessionStorage.clear();
//     //     console.log("session clear");
//     //     setTimeout(() => {
//     //         window.location.href = paymentMethodData.bkashURL;
//     //     }, 100);

//     //     // window.location.href = paymentMethodData.bkashURL;
//     // }
//     if(isLoading){
//         return <p>Loading...</p>
//     }

//     return (
//         <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', width: '300px', margin: '0 auto' }}>
//             {/* <h2>Payment Modal</h2> */}
//             <FormProvider {...methods}>
//                 <form onSubmit={methods.handleSubmit(onSubmit)}>
//                     <div className='mb-4'>
//                         <DefaultSelect label={"Choose Service"} registerKey={"service"} options={[{ id: 1, name: "Renew" }, { id: 2, name: "Quota" }]} type={"number"} valueField={"id"} nameField={"name"} require={"Select Payment Service"} />
//                     </div>
//                     <div className='mb-4'>
//                         <DefaultSelect label={"Choose Size"} registerKey={"size"} options={service == 1 ? years : quota} type={"number"} valueField={"id"} nameField={"name"} require={"Select Payment Service"} />
//                     </div>
//                     {
//                         service && size ? <p className='text-center mb-4'>{service === 1 && size ? size * 3000 : service === 2 ? calculateServicePlanPrice(userPayInfo.BalanceDr ? userPayInfo.BalanceDr : 0, size ? size : 0): null}</p> : null
//                     }

//                     <button type='submit' style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
//                         Pay Now
//                     </button>
//                 </form>
//             </FormProvider>
//         </div>
//     );
// };

// export default PaymentModal;
