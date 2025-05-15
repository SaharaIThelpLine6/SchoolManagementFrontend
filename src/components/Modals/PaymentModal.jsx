import React, { useEffect, useState } from 'react';
import DefaultSelect from '../Forms/DefaultSelect';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useCreatePaymentRequestMutation, useGetUserInfoQuery } from '../../features/payment/paymentSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const PaymentModal = () => {
    const [amount, setAmount] = useState('');
    const [createPaymentRequest, { isLoading, isError, isSuccess, data: paymentMethodData }] = useCreatePaymentRequestMutation();
    const { data: userPayInfo } = useGetUserInfoQuery();
    const [req, setReq] = useState(true)
    // const {
    //     watch,
    //     handleSubmit,
    //     setValue,
    //     reset
    // } = useForm();
    const methods = useForm()

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate()
    const { service, size } = methods.watch()
    function calculateServicePlanPrice(oldQuota, newQuota) {
        const pricingTiers = [
            { limit: 100, price: 10000 },
            { limit: 100, price: 5000 },
            { limit: 100, price: 4000 },
            { limit: 100, price: 3000 },
            { limit: 100, price: 2000 },
            { limit: 100, price: 1000 }
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
    useEffect(()=>{
        methods.reset({
            size: "",
            service: ""
          })
    }, [])
    // useEffect(() => {
    //     setValue("size", 0)
    // }, [service]);


    const handlePayNow = () => {
        alert(`Paying ${amount}`);
    };

    const onSubmit = async (data) => {
        // console.log(user.schoolId);

        const paymentRequest = {
            ...data,
            // mode: "0011",
            // payerReference: "01770618575",
            callbackURL: `${BASE_URL}/payment_confirm/${user.schoolId}/${data.service}/${data.size}`,
            schoolId: user.schoolId
            // merchantAssociationInfo: "MI05MID54RF09123456One",
            // amount: "500",
            // currency: "BDT",
            // intent: "sale",
            // merchantInvoiceNumber: "0124456491098",
            // merchantAssociationInfo: "MI01"
        }
        // console.log(paymentRequest);
        if(req){
            setReq(false)
            await createPaymentRequest(paymentRequest).unwrap().then((payload) => {
                sessionStorage.clear();
                setReq(true)
                window.location.href = payload.bkashURL;

            }).catch((error) => { setPaymentStatus(error.data?.error ? error.data.error : "Failed"); setReq(true) });
        }

       
    };


    // console.log(service);
    const years = [
        {
            id: 1,
            name: "1"
        },
        {
            id: 2,
            name: "2"
        },
        {
            id: 3,
            name: "3"
        },
    ]
    const quota = [
        {
            id: 100,
            name: "100"
        },
        {
            id: 200,
            name: "200"
        },
        {
            id: 300,
            name: "300"
        },
        {
            id: 400,
            name: "400"
        },
        {
            id: 500,
            name: "500"
        },
        {
            id: 600,
            name: "600"
        },
        {
            id: 700,
            name: "700"
        },
        {
            id: 800,
            name: "800"
        },
        {
            id: 900,
            name: "900"
        },
        {
            id: 1000,
            name: "1000"
        },
    ]
    // if (isSuccess) {
    //     sessionStorage.clear();
    //     console.log("session clear");
    //     setTimeout(() => {
    //         window.location.href = paymentMethodData.bkashURL;
    //     }, 100);
        
    //     // window.location.href = paymentMethodData.bkashURL;
    // }
    if(isLoading){
        return <p>Loading...</p>
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', width: '300px', margin: '0 auto' }}>
            {/* <h2>Payment Modal</h2> */}
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className='mb-4'>
                        <DefaultSelect label={"Choose Service"} registerKey={"service"} options={[{ id: 1, name: "Renew" }, { id: 2, name: "Quota" }]} type={"number"} valueField={"id"} nameField={"name"} require={"Select Payment Service"} />
                    </div>
                    <div className='mb-4'>
                        <DefaultSelect label={"Choose Size"} registerKey={"size"} options={service == 1 ? years : quota} type={"number"} valueField={"id"} nameField={"name"} require={"Select Payment Service"} />
                    </div>
                    {
                        service && size ? <p className='text-center mb-4'>{service === 1 && size ? size * 3000 : service === 2 ? calculateServicePlanPrice(userPayInfo.BalanceDr ? userPayInfo.BalanceDr : 0, size ? size : 0): null}</p> : null
                    }
                    
                    <button type='submit' style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Pay Now
                    </button>
                </form>
            </FormProvider>
        </div>
    );
};

export default PaymentModal;