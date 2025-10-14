import React, { useEffect } from 'react';
import { getPublicData } from '../../utils/read/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaritResult, fetchResult } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import ResultTable from '../../components/ResultTable';
import Marksheet from '../../components/Document/Marksheet';
import MaritListResultTable from '../../components/MaritListResultTable';
import MaritListResultPrint from '../../components/Document/MaritListResultPrint';

const MaritListResult = () => {
    const { schoolid, seassonid, examid } = useParams();
    const { maritList, schoolData, resultError, studentResult, status: resultStatus } = useSelector((state) => state.studentResultPublicView)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {

        dispatch(fetchMaritResult({
            schoolId: schoolid,
            resultUrl: `${seassonid}/${examid}`
        }));

    }, [dispatch])

    if (resultStatus === 'failed') {
        navigate(`/${schoolid}/maritlist_request?sessionid=${seassonid}&examid=${examid}`);
    }


    return (
        <div>
            <MaritListResultTable />
            <div className='print_canvas'>
                <MaritListResultPrint />
            </div>
        </div>
    );
};

export default MaritListResult;