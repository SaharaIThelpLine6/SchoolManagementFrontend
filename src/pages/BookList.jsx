import { FaEdit, FaTrash } from 'react-icons/fa';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Fourdots from '../images/brand/four-dots-square.svg';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import DefaultInput from '../components/Forms/DefaultInput';

import DefaultGray from '../components/Button/DefaultGray';


const BookList = () => {
    const [submitData, setSubmitData] = useState([]);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useFormContext();

    const onSubmit = (data) => {
        setSubmitData([...submitData, data]);
        console.log(data);
    }

    const saveButton = "Save";
    return (
        <div className="grid grid-cols-2 px-5 py-0 gap-5">
            {/*Form Column Start*/}
            <form action='' onSubmit={handleSubmit(onSubmit)} className="">
                <h1 className="font-semibold text-lg text-slate-800">Book List</h1>
                <div className="mb-2 text-[14px] text-slate-600">
                    <div className="">
                        <DefaultInput
                            label={
                                <p className="text-slate-700">
                                    ID {" "}
                                    <span className="text-red-700">*</span>
                                </p>
                            }
                            type={'text'}
                            placeholder={""}
                            registerKey={"id"}
                        />
                    </div>

                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-700">
                                    Class {" "}
                                    <span className="text-red-700">*</span>
                                </p>
                            }
                            options={[
                                { id: '1', value: "Play", },
                                { id: '2', value: "Nursary" },
                                { id: '3', value: "First Class" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>


                    <div className="">
                        <DefaultInput
                            label={
                                <p className="text-slate-700">
                                    Book Name {" "}
                                    <span className="text-red-700">*</span>
                                </p>
                            }
                            type={'text'}
                            placeholder={""}
                            registerKey={"bookName"}
                        />
                    </div>
                    {/* <div className="">
                        <DefaultInput label={"Book Name "} type={'text'} placeholder={""} registerKey={"email"} />
                    </div> */}
                    <div className="">
                        <DefaultInput
                            label={
                                <p className="text-slate-700">
                                    Book Name Arabic
                                </p>
                            }
                            type={'text'}
                            placeholder={""}
                            registerKey={"bookArabic"}
                        />
                    </div>
                </div>
                {/*Button start*/}
                <div className="flex gap-3">
                    <DefaultGray submitButton={saveButton} />
                </div>
                {/*Button end*/}
            </form>
            {/*Form Column End*/}

            {/*Table Column Start*/}
            <div className="">
                <table className='w-full'>
                    <thead className="text-left h-8">
                        <tr className=" text-[14px] text-slate-600 bg-[#EDEDED]">
                            <th className='w-[5%]'><img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" /></th>
                            <th className='w-[5%]'><img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" /></th>
                            <th className='w-[20%] font-semibold'>Marhala/Class</th>
                            <th className='font-semibold'>ID</th>
                            <th className='font-semibold'>Bangla</th>
                            <th className='font-semibold'>Arabic</th>
                        </tr>
                    </thead>
                    <tbody className='text-left'>
                        {submitData.map((item, index) => (
                            <tr key={index} className="font-normal text-sm text-slate-500">
                                <td><FaEdit /></td>
                                <td><FaTrash /></td>
                                <td>{item.class}</td>
                                <td>{item.id}</td>
                                <td>{item.bookName}</td>
                                <td> {item.bookArabic}</td>

                            </tr>
                        ))}
                        <tr className="font-normal text-sm text-slate-600 ">
                            <td><FaEdit /></td>
                            <td><FaTrash /></td>
                            <td>Class 2</td>
                            <td>102</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/*Table Column End*/}


            {/*Error message*/}
            <div className='my-5'>
                <div className='
                    flex
                    text-[14px] 
                    font-SolaimanLipi
                    bg-[#323232] 
                    text-[rgba(255,255,255,.7)]                 
                    justify-between                 
                    items-center
                    py-2
                    px-2
                    rounded-[4px]
                    font-normal
                    '
                    style={{ boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)' }}>
                    দুঃখিত, কোন তথ্য পাওয়া যায়নি!
                    <button className='bg-transparent text-[#ff4dcb] -translate-x-3'>Close</button>
                </div>
            </div>


        </div>
    );
};

export default BookList;