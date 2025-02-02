import React, { useState, useEffect } from "react";
import Fourdots from '../images/brand/four-dots-square.svg';
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGreen from "../components/Button/DefaultGreen";
import { FaTrash } from "react-icons/fa";
import DefaultGray from "../components/Button/DefaultGray";

const StudentsResult = () => {
  
    const [rows, setRows] = useState([
      ["100034", "Md Ibrahim Khan", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 50, 2, 30, 5, "A", 40, 102],
      ["100034", "Md Ibrahim Khan", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 50, 2, 30, 5, "A", 40, 102],
    ]);
  
    const handleInputChange = (rowIndex, colIndex, value) => {
      const updatedRows = rows.map((row, rIdx) =>
        rIdx === rowIndex
          ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
          : row
      );
      setRows(updatedRows);
      setIsHidden(true);
    };

    const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="-mt-6 font-SolaimanLipi text-[14px] xl:text-[16px]">
      <div className="w-full shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px]">
        <div className="bg-green-600 font-medium text-center">
          <h1 className="text-white text-2xl py-1 ">ফলাফল প্রাপ্ত নাম্বার এন্ট্রি</h1>
        </div>
      </div>
      {/*Form Start*/}
      <div className="px-2 gap-5 md:grid md:grid-cols-2 text-[16px] pt-1">
        {/* 1st form start*/}
        <form action="" className="mb-3 md:mb-0">
          <div className="lg:gap-2 lg:grid lg:grid-cols-2 2xl:grid-cols-3">
            <div className="">
              <DefaultSelect
                label={
                  <span className="text-slate-800">
                    সেশন:
                  </span>
                }
                options={[
                  { id: '1', value: "শিক্ষাবর্ষ নাম", },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"session"}
              />
            </div>
            <div className="">
              <DefaultSelect
                label={
                  <span className="text-slate-800">
                    পরীক্ষার নাম:

                  </span>
                }
                options={[
                  { id: '1', value: "Play", },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"examName"}
              />
            </div>
            <div className="">
              <DefaultSelect
                label={
                  <span className="text-slate-800">
                    শ্রেণি/জামাত:

                  </span>
                }
                options={[
                  { id: '1', value: "Play", },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"classJamayat"}
              />
            </div>
            <div className="">
              <DefaultSelect
                label={
                  <span className="text-slate-800">
                    রেসিডেনশিয়াল:

                  </span>
                }
                options={[
                  { id: '1', value: "উভয়", },
                  { id: '2', value: "আবাসিক" },
                  { id: '3', value: "অনাবাসিক" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"residential"}
              />
            </div>
            <div className="">
              <DefaultSelect
                label={
                  <span className="text-slate-800">
                    কিতাব:

                  </span>
                }
                options={[
                  { id: '1', value: "Play", },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"kitab"}
              />
            </div>
          </div>
          {/*Button start*/}
          <div className="mt-2">
            <DefaultGreen submitButtonGreen={"Select Data"} />
          </div>
          {/*Button end*/}
        </form>
        {/* 1st form end*/}

        {/* 2nd form start*/}
        <form action="">
          <div className=" lg:gap-2 lg:grid lg:grid-cols-2 2xl:grid-cols-3">
            <div className="">
              <DefaultInput
                label={
                  <p className="text-slate-700">
                    আইডি {" "}
                  </p>
                }
                type={'text'}
                placeholder={""}
                registerKey={"studentId"}
              />
            </div>
            <div className="">
              <DefaultInput
                label={
                  <p className="text-slate-700">
                    দাখেলা {" "}
                  </p>
                }
                type={'text'}
                placeholder={""}
                registerKey={"dekhela"}
              />
            </div>
            <div className="">
              <DefaultInput
                label={
                  <p className="text-slate-700">
                    শিক্ষার্থীর নাম {" "}
                  </p>
                }
                type={'text'}
                placeholder={""}
                registerKey={"studentName"}
              />
            </div>
            <div className="">
              <DefaultInput
                label={
                  <p className="text-slate-700">
                    প্রাপ্ত নাম্বার {" "}
                  </p>
                }
                type={'text'}
                placeholder={""}
                registerKey={"getNumber"}
              />
            </div>
          </div>
          {/*Button start*/}
          <div className="mt-2 flex gap-3">
            <DefaultGreen submitButtonGreen={"Show Data"} />
            <DefaultGreen submitButtonGreen={"Close"} />
          </div>
          {/*Button end*/}
        </form>
        {/* 2nd form end*/}
      </div>
      {/*Form End*/}


      {/* Table Start */}
      <div className="mt-2 overflow-x-scroll text-[14px]">
        {/*Find Information*/}
        <div className="bg-green-600 text-center min-w-[1394px] pb-1">
          <div className="flex gap-2 px-2">
            <div className="flex items-center gap-1 min-w-[200px]">
              <span className="text-white">
                শিক্ষাবর্ষ:</span>
              <DefaultSelect
                options={[
                  { id: '1', value: "শিক্ষাবর্ষ নাম" },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"academicYear"}
              />
            </div>
            <div className="flex items-center gap-1 min-w-[210px]">
              <span className="text-white min-w-[70px]">পরীক্ষার নাম:</span>
              <DefaultSelect
                options={[
                  { id: '1', value: "পরীক্ষার নাম" },
                  { id: '2', value: "বার্ষিক" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"examName"}
              />
            </div>
            <div className="flex items-center gap-1 min-w-[210px]">
              <span className="text-white min-w-[70px]">ক্লাস/জামাত:</span>
              <DefaultSelect
                options={[
                  { id: '1', value: "ক্লাস/জামাত" },
                  { id: '2', value: "Nursery" },
                  { id: '3', value: "Nurani" },
                ]}
                valueField={"id"}
                nameField={"value"}
                registerKey={"classJamat"}
              />
            </div>
            <div className="flex items-center gap-1 min-w-[100px]">
              <span className="text-white">মোট বিষয়:</span>
            </div>
            {isHidden && <DefaultGray submitButton={"Save"} />}
            <div className="flex items-center gap-1 max-w-[100px]">
              <span className="text-white min-w-[45px]">গড় হবে:</span>
              <DefaultInput
                type={'text'}
                placeholder={""}
                registerKey={"Average"}
              />
            </div>
          </div>
        </div>
        <table className="w-full table-auto border-collapse">
          <thead className="bg-[#3F4885] text-white text-center">
            <tr>

              <td className=" flex justify-center px-4 py-[8px] ">
                <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4 absolute" />
              </td>
              <td className="border border-white min-w-[80px] py-1">দাখেলা</td>
              <td className="border border-white min-w-[190px]">নাম</td>
              <td className="border border-white px-2">খালি1</td>
              <td className="border border-white px-2">খালি2</td>
              <td className="border border-white px-2">খালি3</td>
              <td className="border border-white px-2">খালি4</td>
              <td className="border border-white px-2">খালি5</td>
              <td className="border border-white px-2">খালি6</td>
              <td className="border border-white px-2">খালি7</td>
              <td className="border border-white px-2">খালি8</td>
              <td className="border border-white px-2">খালি9</td>
              <td className="border border-white px-2">খালি10</td>
              <td className="border border-white px-2">খালি11</td>
              <td className="border border-white px-2">খালি12</td>
              <td className="border border-white px-2">খালি13</td>
              <td className="border border-white px-2">মোট</td>
              <td className="border border-white px-2">ডিভিশন</td>
              <td className="border border-white px-2 min-w-[80px]">আরবী ডিভি</td>
              <td className="border border-white px-2 min-w-[80px]">মেধা ক্রমিক</td>
              <td className="border border-white px-2 min-w-[80px]">মেধা গ্রুপ</td>
              <td className="border border-white px-2">টংবৎও</td>
              <td className="border border-white px-2">ওউ</td>

            </tr>
          </thead>
          <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="border border-slate-500 pl-2 hover:bg-red-300">
              <FaTrash />
            </td>
            {row.map((cell, colIndex) => (
              <td className="border border-slate-500" key={colIndex}>
                {colIndex === 0 ? (
                  cell
                ) : (
                  <input
                    className="w-full p-1 focus:outline-none focus:bg-green-200"
                    type="text"
                    value={cell}
                    onChange={(e) =>
                      handleInputChange(rowIndex, colIndex, e.target.value)
                    }
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
        </table>
      </div>
      {/* Table End */}





    </div>
  );
};

export default StudentsResult;
