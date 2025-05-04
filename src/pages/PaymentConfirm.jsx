import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useExecutePaymentRequestMutation, useGetUserInfoQuery } from '../features/payment/paymentSlice';
import { toast } from 'react-toastify';
import LoadingComponent from '../components/LoadingComponent';
import toBengaliWords from '../utils/numberToBanglaWords';

const PaymentConfirm = () => {
    const { schoolid, service, size } = useParams();
    const location = useLocation();
    const [executePaymentRequest, { isLoading, isError, isSuccess, error, data }] = useExecutePaymentRequestMutation();
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate()
    const status = queryParams.get('status');
    const paymentID = queryParams.get('paymentID');
    const signature = queryParams.get('signature');
    const apiVersion = queryParams.get('apiVersion');
    const requestSent = useRef(false);
    const [paymentStatus, setPaymentStatus] = useState(status)
    const { refetch } = useGetUserInfoQuery();

    useEffect(() => {
        if (status === 'success' && !requestSent.current) {
            requestSent.current = true;
            executePaymentRequest({ schoolid, service, size, paymentID, signature, apiVersion }).unwrap().then((payload) => {
                console.log(payload);
                refetch();

            }).catch((error) => { setPaymentStatus(error.data?.error ? error.data.error : "Failed") });
        }
    }, [status, schoolid, service, size, paymentID, signature, apiVersion, executePaymentRequest]);

    const handleCopy = () => {
        const textToCopy = `
        Payment Done! ✅
    
        🧾 Invoice No: ${data?.InvoiceNumber}
        🏫 Institution Code: ${schoolid}
        💳 Payment ID: ${paymentID}
        📌 Status: ${status}
        🔄 Intent: ${data?.Intent}
    
        Thank you for your payment! 🎉
        `;

        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Copied to clipboard! ✅"))
            .catch(err => console.error("Failed to copy: ", err));
    };
    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return <LoadingComponent />
    }
    const PaymentDetails = () => {
        return (
            <>
                {isSuccess ? (
                    <>
                        <div className="flex w-full items-center justify-center font-lato">
                            <div className="w-[400px] rounded bg-gray-50 px-6 pt-8">
                                <img src="/saharait.png" alt="Sahara IT" className="mx-auto w-16 py-4" />
                                <div className="flex flex-col justify-center items-center gap-1">
                                    <h4 className="font-semibold">SAHARA IT</h4>
                                    <p className="text-[14px]">Vangapress, Jatrabari, Dhaka-1236</p>
                                </div>
                                <div className="flex flex-col gap-3 border-b pt-6 pb-2 text-xs">
                                    <p className="flex justify-between text-[14px]">
                                        <span className="text-gray-900 text-[14px]">Invoice No:</span>
                                        <span>{data?.InvoiceNumber}</span>
                                    </p>
                                    <p className="flex justify-between text-[14px]">
                                        <span className="text-gray-900 text-[14px]">Order Type:</span>
                                        <span className='capitalize'>{data?.Intent}</span>
                                    </p>
                                    <p className="flex justify-between text-[14px]">
                                        <span className="text-gray-900 text-[14px]">Institution Code:</span>
                                        <span>{schoolid}</span>
                                    </p>
                                    <p className="flex justify-between text-[14px] flex-col gap-2">
                                        <span className="text-gray-900">Institution Name:</span>
                                        <span>{data?.InstituteName}</span>
                                        <span className='text-[13px]'>{data?.PoliceStationName}, {data?.DistrictName}, {data?.DivisionName}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 pb-6 pt-1 text-xs">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="flex">
                                                <th className="w-full py-2 text-[14px]">Service</th>
                                                <th className="min-w-[60px] py-2 text-[14px]">QTY</th>
                                                <th className="min-w-[44px] py-2 text-[14px]">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="flex">
                                                <td className="flex-1 py-1 text-[14px]">{data?.Intent}</td>
                                                <td className="min-w-[44px] text-[14px]">{data?.size}</td>
                                                <td className="min-w-[44px] text-[14px]">{data?.PayAmount}Tk.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className=" border-b border border-dashed"></div>
                                    <p className='text-[14px] text-left'>কথায়: {data?.PayAmount ? toBengaliWords(data.PayAmount): null} টাকা।</p>
                                </div>
                            </div>
                        </div>

                    </>
                ) : isError ? null : <LoadingComponent />}


                {
                    isSuccess ? (<div className="btn-group flex items-start gap-[20px] mt-5 w-[380px] mx-auto hidden_in_print">
                        <button className='copy-btn' type='button' onClick={handleCopy}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-copy"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>
                        </button>
                        <button className='print' type='button' onClick={handlePrint}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                        </button>
                    </div>) : null
                }
            </>
        );
    };


    return (
        <div className="bg-white h-screen">
            <div className="bg-white p-6  md:mx-auto">
                {
                    paymentStatus === 'success' ? (
                        <svg viewBox="0 0 24 24" className="text-green-600 w-16 h-16 mx-auto my-0 hidden_in_print">
                            <path
                                fill="currentColor"
                                d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                            ></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-x text-rose-600 mx-auto hidden_in_print"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" /><path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" /><path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" /><path d="M8.56 20.31a9 9 0 0 0 3.44 .69" /><path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" /><path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" /><path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" /><path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" /><path d="M14 14l-4 -4" /><path d="M10 14l4 -4" /></svg>
                    )
                }

                <div className="text-center">
                    <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center hidden_in_print">
                        Payment {paymentStatus === 'success' ? 'Done' : 'Failed'}!
                    </h3>
                    <p className="text-gray-600 my-2 hidden_in_print">
                        {paymentStatus === 'success' ? 'Thank you for completing your secure online payment.' : 'There was an issue with your payment.'}
                    </p>
                    {
                        paymentStatus === 'success' ? <p className='hidden_in_print'> Have a great day!</p> : <p> {paymentStatus}!</p>
                    }
                    <p className='print_canvas'>Payment Details</p>
                    {
                        paymentStatus === 'success' ? <PaymentDetails /> : null
                    }

                    <div className="py-10 text-center hidden_in_print">
                        <a href="/" className={`px-12 text-white font-semibold py-3 ${paymentStatus === 'success' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                            GO BACK
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirm;