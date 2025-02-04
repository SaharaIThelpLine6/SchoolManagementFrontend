import React from 'react';
import AddStudentForm from '../components/Forms/AddStudentForm';
import TableOne from '../components/Tables/TableOne';

const User = ({ pageTitle }) => {
    return (
        <div>
           <AddStudentForm />
           <TableOne />
        </div>
    );
};

export default User;