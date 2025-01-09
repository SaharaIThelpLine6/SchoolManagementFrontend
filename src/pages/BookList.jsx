import { FaEdit, FaTrash } from 'react-icons/fa';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Fourdots from '../images/brand/four-dots-square.svg';


const BookList = () => {
    return (
        <div className="grid grid-cols-3 px-5 py-2 gap-2">
            {/*First Column Start*/}
            <div className="col-span-1 border-b border-slate-200 p-2">
                <h1 className="font-semibold text-lg text-slate-500">Book List</h1>
                <div className="mb-2">
                    <label>
                        <p className="text-slate-500 pb-1">
                            ID {" "}
                            <span className="text-red-700">*</span>
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-300 w-full"
                        />
                    </label>

                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-500">
                                    Class {" "}
                                    <span className="text-red-700">*</span>
                                </p>
                            }
                            options={[
                                { id: '1', value: "Play" },
                                { id: '2', value: "Nursary" },
                                { id: '3', value: "First Class" },
                            ]}
                            registerKey={"user_type"}
                        />
                    </div>

                    <label>
                        <p className="text-slate-500 pb-1">
                            Book Name {" "}
                            <span className="text-red-700">*</span>
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-300 w-full"
                        />
                    </label>
                    <label>
                        <p className="text-slate-500 pb-1">
                            Book name arabic
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-300 w-full"
                        />
                    </label>
                </div>

                {/*Button start*/}
                <div className="flex gap-3">
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
                                            me-2 mb-2 mt-4
                                            w-24
                                            h-8
                                "
                        type="submit">
                        Save
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
                                                me-2 mb-2 mt-4
                                                w-24
                                                h-8
                                    "
                        type="submit">
                        New
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
                                                    me-2 mb-2 mt-4
                                                    w-24
                                                    h-8
                                        "
                        type="submit">
                        Close
                    </button>
                </div>
                {/*Button end*/}
            </div>
            {/*First Column End*/}

            {/*Second Column Start*/}
            <div className="col-span-2 border-b border-slate-200 p-2">

                <table className='w-full mt-5'>
                    <thead className="text-left">
                        <tr className="font-normal text-sm text-slate-500 bg-slate-200">
                            <th className='w-[5%]'><img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" /></th>
                            <th className='w-[5%]'><img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" /></th>
                            <th className='w-[20%]'>Marhala/Class</th>
                            <th>ID</th>
                            <th>Bangla</th>
                            <th>Arabic</th>
                        </tr>
                    </thead>
                    <tbody className='text-left'>
                        <tr className="font-normal text-sm text-slate-500">
                            <td><FaEdit /></td>
                            <td><FaTrash /></td>
                            <td>Class 1</td>
                            <td>101</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>

                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td><FaEdit /></td>
                            <td><FaTrash /></td>
                            <td>Class 2</td>
                            <td>102</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>

                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td><FaEdit /></td>
                            <td><FaTrash /></td>
                            <td>Class 3</td>
                            <td>103</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>

                        </tr>

                    </tbody>
                </table>

            </div>
            {/*Second Column End*/}
        </div>
    )
}

export default BookList;