import React from 'react';
import AddOnlineStudentForm from '../../components/Forms/AddOnlineStudentForm';
import { useParams } from 'react-router-dom';

const OnlineAdmission = () => {
    const { schoolid } = useParams();
    return (
        <div>
            <AddOnlineStudentForm schoolid={schoolid} />
        </div>
    );
};

export default OnlineAdmission;