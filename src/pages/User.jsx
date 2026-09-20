import React from 'react';
import AddStudentForm from '../components/Forms/AddStudentForm';
import StudentInfo from '../components/Tables/StudentInfo';
import TableOne from '../components/Tables/TableOne';
// import TableOne from '../components/Tables/newDesignTableOne';

const User = ({ pageTitle }) => {
    return (
        <div>
            <AddStudentForm />
            <TableOne />
            {/* <StudentInfo /> */}
        </div>
    );
};

export default User;