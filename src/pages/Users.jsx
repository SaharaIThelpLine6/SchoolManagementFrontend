import { useState } from "react";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Fourdots from '../images/brand/four-dots-square.svg';
import "../App.css"
import DefaultGreen from "../components/Button/DefaultGreen";


const Users = () => {
    // password visibility start
    const [visible, setVisible] = useState(false);
    const [icon, setIcon] = useState(true);
    const handleToggle = () => {
        setVisible(!visible);

    }
    // password visibility end

    return (
        <div>
            {/*Form Start*/}
            <form action="">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 px-5 items-center">

                    <div className="">
                        <DefaultInput
                            label={"ব্যবহারকারীর নাম"}
                            type={'text'}
                            placeholder={""}
                            registerKey={"student_email"}
                        />
                    </div>

                    <div className="">
                        <DefaultSelect
                            label={
                                <span className="">
                                    User Type
                                </span>
                            }
                            options={[
                                { id: '1', value: "Reseller" },
                                { id: '2', value: "Users Admin" },
                                { id: '2', value: "Users" },
                            ]}
                            registerKey={"user_type"}
                        />
                    </div>


                    <div className="">
                        <DefaultInput label={"Login Name"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>

                    <div className="flex">
                        <DefaultInput
                            label={"Password"}
                            type={visible ? 'text' : 'password'}
                            placeholder={""}
                            registerKey={"password"}
                        />
                    </div>


                    <div className="">
                        <DefaultInput
                            label={"Confirm Password"}
                            type={visible ? 'text' : 'password'}
                            placeholder={""}
                            registerKey={"student_email"}
                        />
                    </div>

                    <button
                        type="button"
                        className="items-center pl-2 pt-6"
                        onClick={handleToggle}
                    >
                        {icon ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    <div className="items-center lg:pt-6">
                        <DefaultGreen submitButtonGreen={"Save"} />
                    </div>
                </div>
            </form>
            {/*Form End*/}

            {/*Table start*/}
            <table className="my-2 w-full">
                <thead className='bg-[#3F4885] text-white h-fit w-full'>
                    <tr className="text-center text-[12px]">
                        {[

                            'আইডি', 'কোড', 'লগ ইন', 'নাম', 'ধরণ', 'লগইন টাইপ', 'অবস্থা',
                            <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" />,
                        ].map((header, index) => (
                            <th key={index} className="px-4 py-0 font-medium border border-white">
                                {typeof header === 'string' ? header : <div className="flex justify-center">{header}</div>}
                            </th>
                        ))}
                    </tr>
                    {/* <tr className="px-4 py-0 font-medium border border-white justify-center">
                        <th>আইডি</th>
                        <th>কোড</th>
                        <th>লগ ইন</th>
                        <th>নাম</th>
                        <th>ধরণ</th>
                        <th>লগইন টাইপ</th>
                        <th>অবস্থা</th>
                        <th>  <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" /></th>
                    </tr> */}
                </thead>
                <tbody className="justify-center text-center">

                    <tr>
                        <td>1</td>
                        <td>101</td>
                        <td>Log in</td>
                        <td>Name</td>
                        <td>type</td>
                        <td>Login type</td>
                        <td>status</td>
                        <td>5</td>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>101</td>
                        <td>Log in</td>
                        <td>Name</td>
                        <td>type</td>
                        <td>Login type</td>
                        <td>status</td>
                        <td>5</td>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>101</td>
                        <td>Log in</td>
                        <td>Name</td>
                        <td>type</td>
                        <td>Login type</td>
                        <td>status</td>
                        <td>5</td>
                    </tr>
                </tbody>
            </table>
            {/*Table End*/}

        </div>
    )
}

export default Users;