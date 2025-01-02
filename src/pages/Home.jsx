import { useEffect } from "react";
import { useDispatch } from "react-redux";

import TableOne from "../components/Tables/TableOne"
import AddStudentForm from "../components/Forms/AddStudentForm";

const Home = ({pageTitle}) =>{
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
    return(
        <div>
            <AddStudentForm />
            <TableOne />
        </div>
    )
}
export default Home