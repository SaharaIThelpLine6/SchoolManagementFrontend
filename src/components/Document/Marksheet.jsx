import { useSelector } from "react-redux";
import bnBijoy2Unicode from "../../utils/conveter";
import { useEffect, useState } from "react";
import { Buffer } from 'buffer';
import StudentResultPointPrintView from "../../view/PublicResult/StudentResulltPointPrintView";
import StudentResultAvgPrintView from "../../view/PublicResult/StudentResultAvgPrintView";

const Marksheet = () => {
    const { resultStatus, resultError, studentResult, resultSubGroupInfo } = useSelector((state) => state.studentResultPublicView)
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)
    const [najem, setNajem] = useState(null)

    useEffect(() => {
        if (studentResult?.Logo?.data) {
            if (studentResult?.Logo?.data) {
                const buffer = Buffer.from(studentResult.Logo.data);
                const base64String = buffer.toString('base64');
                const imageSrc = `data:image/png;base64,${base64String}`;
                setLogo(imageSrc)
            }
        }
    }, [studentResult])
    return (
        <div className="portrait-page">
            <div className=" w-full h-[1000px] relative bg-white ">
                <div className="pt-4 pb-1 px-8 bg-white">
                    {/*Logo and Heading start*/}
                    {
                        resultSubGroupInfo?.ExamStatus == 2 ? ( <StudentResultPointPrintView studentResult={studentResult} /> ) : <StudentResultAvgPrintView studentResult={studentResult} />
                    }
                </div>
            </div>
        </div>
    )
}

export default Marksheet;