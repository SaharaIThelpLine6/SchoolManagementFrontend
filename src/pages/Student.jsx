import PropTypes from 'prop-types';
import { useEffect } from "react";

const Student = ({ pageTitle }) => {


  return (
    <div>
      <h1>{pageTitle}</h1>
    </div>
  );
};

Student.propTypes = {
  pageTitle: PropTypes.string.isRequired,
};

export default Student;
