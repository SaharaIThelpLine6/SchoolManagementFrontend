import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchResultFieldData } from '../features/studentResultPublicView/studentResultPublicViewSlice';
import bnBijoy2Unicode from '../utils/conveter';

const Quota = ({ type }) => {
    const { register, handleSubmit } = useFormContext();
    // const { payfor } = useParams();
    const { schoolData } = useSelector((state) => state.studentResultPublicView)
    const { user } = useSelector((state) => state.auth)
    const [renewYear, setRenewYear] = useState(0)
    const dispatch = useDispatch()
    useEffect(() => {
        if (user?.schoolId) {
            dispatch(fetchResultFieldData(user.schoolId))
        }
      
    }, [dispatch, user])

    const onSubmit = (data) => {
        console.log(data);
    };
    const renewFee =  3000
const optionsArray = {
    renew: [1, 2, 3],
    quota: [100, 200, 300],
}
    return (
        <div className="h-screen overflow-hidden font-SolaimanLipi">
            <h1 className='text-[40px] text-center mb-4'>{bnBijoy2Unicode(schoolData.InstitutionName)}</h1>
            <h2 className='text-center text-[20px] mb-4'>বাৎসরিক সার্ভার রিনিউ সম্পন্ন করুন</h2>
            {/* <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto"> */}
                <div className="mb-[40px] max-w-sm mx-auto">
                    <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900">
                        যত বছরের জন্য রিনিউ করবেন তা উল্লেখ করুন
                    </label>
                    <select
                        onChange={(e)=>{
                            setRenewYear(e.target.value)
                            // console.log(e.target.value);
                            

                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        defaultValue={renewYear}
                    >
                        <option value={0}></option>
                        {optionsArray[type].map(value => <option value={value}>{value}</option>)}
                    
                        {/* <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option> */}
                    </select>
                </div>
                {/* <div className="mb-5">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                        Your password
                    </label>
                    <input
                        type="text"
                        id="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                    />
                </div> */}

                <div className="text-center">
                    <a href={`https://shop.bkash.com/sahara-itrm53871/pay/bdt${renewFee * renewYear}/lMYr6r`} target='_blank' type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                        Pay Now
                    </a>

                </div>

            {/* </form> */}
        </div>
    );
};

export default Quota;