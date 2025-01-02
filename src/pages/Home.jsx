import { useEffect } from "react";
import { useDispatch } from "react-redux";

import TableOne from "../components/Tables/TableOne"

const Home = ({pageTitle}) =>{
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
    return(
        <div>
            <TableOne />
        </div>
    )
}
export default Home