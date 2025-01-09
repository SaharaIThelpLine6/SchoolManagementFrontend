import { useState } from 'react'
import { useForm } from "react-hook-form";

const FromP = () => {
    const [submittedData, setSubmittedData] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        setSubmittedData([...submittedData, data]);
        console.log(data);
    }



    return (
        <div>
            <form
                action=""
                className=" space-y-5"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="gap-5">
                    <label htmlFor="">
                        First Name :
                        <input type="text" id=""
                            className="border border-slate-200"
                            {...register("fname", { required: 'empty not allow' })}
                        />
                    </label>
                    {errors.fname && <span>{errors.fname.message}</span>}

                    <label htmlFor="">
                        Last Name :
                        <input type="text" id=""
                            className="border border-slate-200"
                            defaultValue="Khan"
                            {...register("lname", { required: true })}
                        />
                    </label>
                    {errors.lname && <span>This field is required</span>}

                    <label htmlFor="">
                        phone :
                        <input type="number" id=""
                            className="border border-slate-200"
                            {...register("phone", { required: true })}
                        />
                    </label>
                    {errors.phone && <span>This field is required</span>}


                    <label htmlFor="">
                        <p>Gender</p>
                        Male :
                        <input type="radio" id="" value="male"
                            className="border border-slate-200"
                            {...register("gender")}
                        />
                        Female
                        <input type="radio" id="" value="female"
                            className="border border-slate-200"
                            {...register("gender")}
                        />
                    </label>
                    <div>
                        <input type="checkbox" id="" value="car"
                            {...register("vehicles")}
                        />
                        <label htmlFor="">Car</label>

                        <input type="checkbox" id="" value="bike"
                            {...register("vehicles")}
                        />
                        <label htmlFor="">Bike</label>
                    </div>
                    <div>
                        <label htmlFor="">Choose a mobile</label>
                        <select id="" className="border border-slate-200" {...register("mobile")}>
                            <option value="samsung" >samsung</option>
                            <option value="vivo">vivo</option>
                            <option value="iphone">iphone</option>
                        </select>
                    </div>

                </div>
                <input type="submit" className="bg-slate-200 p-2 cursor-pointer" />
            </form>

            <table>
                <thead className="">
                    <tr className="flex gap-5">
                        <th>ID:</th>
                        <th>fName</th>
                        <th>lName</th>
                        <th>phone</th>
                        <th>gender</th>
                        <th>vehicles</th>
                    </tr>
                </thead>
                <tbody>
                    {submittedData.map((item, index) => (
                        <tr key={index} className="flex gap-5">
                            <td>{index + 1}</td>
                            <td>{item.fname}</td>
                            <td>{item.lname}</td>
                            <td>{item.phone}</td>
                            <td>{item.gender}</td>
                            <td>{item.vehicles?.join(", ")}</td>
                            <td>{item.mobile}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default FromP;