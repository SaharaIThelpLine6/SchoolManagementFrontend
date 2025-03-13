import { useSelector } from "react-redux";
import bnBijoy2Unicode from "../../utils/conveter";
import { Buffer } from 'buffer';

const MarksheetClassWise = ({ schoolData, classResult, resultStatices }) => {
    // console.log(schoolData, classResult);
    const bufferConveter = (bufferData) => {
        const buffer = Buffer.from(bufferData);
        const base64String = buffer.toString('base64');
        const imageSrc = `data:image/png;base64,${base64String}`;
        return imageSrc
    }

    const divisionKeys = Object.keys(resultStatices).filter(key => key.startsWith("DC"));
    return (
        <div >
            {classResult?.length > 0 ? (
                <div className="w-[1076px] h-[750px] mx-auto relative bg-white font-SolaimanLipi landscape-page">
                    <div className="pb-1 px-2 bg-white">
                        {/*Heading part start*/}
                        <div className="flex justify-around">
                            {/*Total Student Table start*/}
                            <div className="text-[14px] pt-1">
                                <h1 className="bg-[#a8a6a6] text-white text-center text-[14px]">মোট পরীক্ষার্থী = {bnBijoy2Unicode(String(classResult.length))}</h1>
                                <table className="w-[180px]">
                                    <tbody className=" border border-black w-full">
                                        {
                                            divisionKeys.map((division, index) => {
                                                const divisionValue = resultStatices[`Division${index + 1}`];
                                                const dcValue = resultStatices[`DC${index + 1}`];
                                                if (divisionValue == undefined || dcValue == undefined || divisionValue == '') return null;
                                                return (
                                                    <tr key={`division_${division}`}>
                                                        <td className="text-start pl-2">{bnBijoy2Unicode(String(divisionValue))}</td>
                                                        <td className="w-12 text-end">=</td>
                                                        <td className="px-3">{bnBijoy2Unicode(String(dcValue))}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {/*Total Student Table end*/}
                            {/*Heading Title Start*/}
                            <div className="mx-auto text-center">
                                <h2 className="text-[22px] font-medium">      {bnBijoy2Unicode(schoolData?.InstitutionName)}</h2>
                                <h3 className="">{bnBijoy2Unicode(schoolData?.Address)}</h3>
                                <h3 className="">{bnBijoy2Unicode(classResult[0]?.ExamName)} - {bnBijoy2Unicode(classResult[0]?.SessionName)}</h3>
                                <h3 className="font-semibold border-2 border-black rounded-md p-1 w-fit mx-auto">ফলাফল(নম্বরপত্র)</h3>
                                <h3 className="">শ্রেনী/জামাত : {bnBijoy2Unicode(classResult[0]?.SubClass)}</h3>
                            </div>
                            {/*Heading Title End*/}
                            {/*Grade Determination Start*/}
                            <div className="text-[14px] pt-1">
                                <p className="bg-[#a8a6a6] text-white text-center text-[14px]">মোট বিষয় {bnBijoy2Unicode(String(classResult[0]?.SubSonkha))} টি - পূর্ণমান {bnBijoy2Unicode(String(classResult[0]?.DivisionTopNumber))}* = {bnBijoy2Unicode(String(classResult[0]?.DivisionTopNumber * classResult[0]?.SubSonkha))}</p>
                                <table className="w-[220px]">
                                    <tbody className="border border-black w-full">
                                        {Array.from({ length: classResult[0].SubSonkha }).map((_, index) => {
                                            const division = classResult[0][`Division${index + 1}`];
                                            const divisionNumber = classResult[0][`DivisionNumber${index + 1}`];
                                            const subSonkha = classResult[0]?.SubSonkha;

                                            if (division == undefined || divisionNumber == undefined || subSonkha == undefined || division == '') {
                                                return null;
                                            }

                                            return (
                                                <tr key={index}>
                                                    <td className="text-start pl-2">{bnBijoy2Unicode(division)}</td>
                                                    <td className="">:</td>
                                                    <td className="pl-3">{bnBijoy2Unicode(String(divisionNumber))} X</td>
                                                    <td className="pr-1">
                                                        {bnBijoy2Unicode(String(subSonkha))} = {bnBijoy2Unicode(String(subSonkha * divisionNumber))}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>
                            {/*Grade Determination End*/}
                        </div>
                        {/*Heading part end*/}
                        {/*Marksheet Body Start*/}
                        <div className="pt-1">
                            <table className="w-full text-center text-[14px]">
                                <thead className="border border-black">
                                    <tr>
                                        <td className="border border-black px-1">ক্র:</td>
                                        <td className="border border-black">আইডি নং</td>
                                        <td className="border border-black w-52">শিক্ষার্থীর নাম</td>
                                        {
                                            Array.from({ length: classResult[0].SubSonkha }).map((_, index) => (<td className="border border-black [writing-mode:vertical-rl] py-2 max-h-[100px]" key={index}>{bnBijoy2Unicode(classResult[0][`Subject${index + 1}`])}</td>))

                                        }

                                        <td className="border border-black">মোট</td>
                                        <td className="border border-black">গড়</td>
                                        <td className="border border-black">বিভাগ</td>
                                        <td className="border border-black">স্থান</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        classResult.map((studentResult, index) => {
                                            return (
                                                <tr key={`user_${String(studentResult?.UserCode)}`}>
                                                    <td className="border border-black">{bnBijoy2Unicode(String(index + 1))}</td>
                                                    <td className="border border-black">{bnBijoy2Unicode(String(studentResult.UserCode))}</td>
                                                    <td className="border border-black text-left pl-1">{bnBijoy2Unicode(studentResult.UserName)}</td>

                                                    {
                                                        Array.from({ length: studentResult.SubSonkha }).map((_, index) => (<td key={`subject_${index}`} className="border border-black">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>))

                                                    }

                                                    <td className="border border-black">{bnBijoy2Unicode(String(studentResult?.Total))}</td>
                                                    <td className="border border-black">{bnBijoy2Unicode(String(studentResult?.Average))}</td>
                                                    <td className="border border-black">{bnBijoy2Unicode(String(studentResult?.Division))}</td>
                                                    <td className="border border-black">{bnBijoy2Unicode(String(studentResult?.Positions))}</td>
                                                </tr>
                                            )
                                        })}



                                </tbody>

                                <tfoot>
                                    <tr>
                                        <td className="text-start" colSpan={11} height={150}>
                                            {/* <div className="text-center">
                                                 <p>.....................................</p>
                                                 <p>মুহতামিম</p>
                                                 <p>তারিখ : </p>
                                             </div> */}
                                            <div className="relative h-full">
                                                <div className="absolute text-center w-auto left-0 top-0 pt-5">
                                                    {
                                                        schoolData?.SignaturePrincipal?.data ? <img className="w-[60px]" src={bufferConveter(schoolData.SignaturePrincipal.data)} alt="principal Image" /> : null
                                                    }

                                                    <p>.....................................</p>
                                                    <p>মুহতামিম</p>
                                                    <p>তারিখ : </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="" height={150} colSpan={11}>
                                            <div className="relative h-full">
                                                <div className="absolute text-center w-auto right-0 top-0 pt-5">
                                                    {
                                                        schoolData?.SignatureNajem?.data ? <img className="w-[60px]" src={bufferConveter(schoolData.SignatureNajem.data)} alt="" /> : null
                                                    }

                                                    <p>.....................................</p>
                                                    <p>নাযেম</p>
                                                    <p>তারিখ : </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            {/* <table className="w-full">
                                 
                             </table> */}
                        </div>
                        {/*Marksheet Body End*/}
                        {/*Signature part start*/}
                        {/* <div className="flex absolute bottom-0 w-full  justify-around text-[14px] pt-[60px]">
     
     
                         </div> */}
                        {/*Signature part end*/}
                    </div>
                </div>
            ) : null}

        </div>
    )
}

export default MarksheetClassWise;