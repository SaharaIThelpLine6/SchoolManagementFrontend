import React, { useEffect } from 'react';
import { getPublicData } from '../../utils/read/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResult } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import ResultTable from '../../components/ResultTable';

const Result = () => {
    const { schoolid, seassonid, examid, classid, userid } = useParams();
    const { resultStatus, resultError, studentResult } = useSelector((state) => state.studentResultPublicView)

    const results = [
        { id: 1, name: 'John Doe', grade: 'A' },
        { id: 2, name: 'Jane Smith', grade: 'B' },
        { id: 3, name: 'Sam Johnson', grade: 'A' },
    ];
    const dispatch = useDispatch()
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(fetchResult(`/${schoolid}/students/${seassonid}/${examid}/${classid}/${userid}`))
    }, [dispatch])
    if (resultStatus === 'failed') {
        console.log(resultError);
        // navigate(`/${schoolid}/page_not_found`);
    }

    return (
        <div>
           {/* <h5>
           {JSON.stringify(studentResult)}
           </h5> */}
           <ResultTable />
            {/* <h1>Student Results</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(result => (
                        <tr key={result.id}>
                            <td>{result.id}</td>
                            <td>{result.name}</td>
                            <td>{result.grade}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
        </div>
    );
};

export default Result;