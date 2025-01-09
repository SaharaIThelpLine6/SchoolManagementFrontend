import { useState } from "react";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Fourdots from '../images/brand/four-dots-square.svg';
import "../App.css"


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
                <div className="flex gap-1 px-5">

                    <div className="">
                        <DefaultInput
                            label={"ব্যবহারকারীর নাম"}
                            type={'text'}
                            placeholder={""}
                            registerKey={"student_email"}
                        />
                    </div>

                    <div>

                        <div className="">
                            <DefaultSelect
                                label={
                                    <span className="">
                                        User Power
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
                        className="items-center pl-2 pt-8"
                        onClick={handleToggle}
                    >
                        {icon ? <FaEye /> : <FaEyeSlash />}
                    </button>

                    <button
                        className="
          mega-button positive
           text-white 
           bg-gradient-to-r
          from-green-400
             via-green-500
              to-green-600
               hover:bg-gradient-to-br
                focus:ring-4
                 focus:outline-none
                  focus:ring-green-300
                   font-medium
                    rounded-lg
                     text-sm
                      px-0 py-0
                       text-center
                         mb-2 mt-8 ml-2
                        w-16
                        h-8
              "
                        type="submit">
                        Save
                    </button>
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