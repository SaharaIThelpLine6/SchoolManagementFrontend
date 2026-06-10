import bnBijoy2Unicode from "../../../../utils/conveter";

const WithoutExamRoutine = ({ reportData, queryParams }) => {



  return (
    <div className=" mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px]">
          পরীক্ষার্থী দপ্তর/শিক্ষণপত্র
        </h2>
      </div>

      {/* Class info */}
      <div className="mb-2">
        <p className="font-semibold text-end">
          শিক্ষাবর্ষ:____________
        </p>
      </div>
      {/* Signature Section */}
      <table className="w-full border border-black border-collapse mt-2 text-center">
        <tbody>
          <tr className="border border-black">
            <td className="border border-black w-[20%]">
              তারিখ ------&gt;&gt;
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black w-[20%]">
              বার --------&gt;&gt;
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
        </tbody>
      </table>
      {/* Signature Section */}


      {reportData?.studentList?.length > 0 && (
        <table className="w-full border border-black border-collapse mt-2 text-center">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black w-[6%] bg-white font-bold p-1 text-[18px]">ক্রমিক</th>
              <th className="border border-black w-[10%] bg-white font-bold p-1 text-[18px]">আইডি</th>
              <th className="border border-black w-[25%] bg-white font-bold p-1 text-[18px]">পরীক্ষার্থীর নাম</th>
              {reportData.routine.map((item, i) => (<th key={i} className="border border-black p-1">{item?.subject.SubjectName}</th>))}
            </tr>
          </thead>
          <tbody>
            {reportData.studentList.map((student, index) => (<tr key={student.ID}>
              <td className="border border-black bg-white font-bold p-1 text-[16px]">
                {bnBijoy2Unicode(String(index + 1))}
              </td>
              <td className="border border-black bg-white font-bold p-1 text-[16px]">
                {bnBijoy2Unicode(String(student.User?.UserCode))}
              </td>
              <td className="border border-black text-left bg-white p-2 text-[16px]">
                {student.User?.UserName}
              </td>
              {reportData.routine.map((_, i) => (<th key={i} className="border border-black"></th>))} </tr>))}
          </tbody>
        </table>
      )}



      {/* <table className="w-full border border-black border-collapse mt-2 text-center">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black w-[6%] ">ক্রমিক</th>
            <th className="border border-black w-[7%] ">আইডি</th>
            <th className="border border-black w-[7%] ">পরীক্ষার্থীর নাম</th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
            <th className="border border-black "></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr key={i}>
              <td className="border border-black ">{i + 1}</td>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
              <th className="border border-black "></th>
            </tr>
          ))}
        </tbody>
      </table> */}
      {/* Signature Section */}
      <table className="w-full border border-black border-collapse mt-2 text-center">
        <tbody>
          <tr className="border border-black">
            <td className="border border-black text-end w-[20%]">
              পরীক্ষকের স্বাক্ষর
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black text-end w-[20%]">অনুপস্থিত</td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black text-end w-[20%]">
              নেগারান দারার স্বাক্ষর
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
          <tr className="border border-black">
            <td className="border border-black text-end w-[20%]">
              পরীক্ষকের স্বাক্ষর
            </td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
            <td className="border border-black"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};



export default WithoutExamRoutine
