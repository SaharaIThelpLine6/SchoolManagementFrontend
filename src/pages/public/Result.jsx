import React, { useEffect } from 'react';
import { getPublicData } from '../../utils/read/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResult } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import ResultTable from '../../components/ResultTable';
import Marksheet from '../../components/Document/Marksheet';

const Result = () => {
    const { schoolid, seassonid, examid, classid, userid } = useParams();
    const { resultStatus, resultError, studentResult } = useSelector((state) => state.studentResultPublicView)

    const dispatch = useDispatch()
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(fetchResult(`/${schoolid}/students/${seassonid}/${examid}/${classid}/${userid}`))
    }, [dispatch])
    if (resultStatus === 'failed') {
        navigate(`/${schoolid}/student_result?sessionid=${seassonid}&examid=${examid}&classid=${classid}&usercode=${userid}`);
    }

    return (
        <div>
           <ResultTable />
           <div className='print_canvas'>
            <Marksheet />
           </div>
        </div>
    );
};

export default Result;