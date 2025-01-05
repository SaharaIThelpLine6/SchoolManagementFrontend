import { useEffect } from "react";

import TableOne from "../components/Tables/TableOne"
import AddStudentForm from "../components/Forms/AddStudentForm";

const Home = ({pageTitle}) =>{

    return(
        <div>
            <AddStudentForm />
            <TableOne />
        </div>
    )
}
export default Home