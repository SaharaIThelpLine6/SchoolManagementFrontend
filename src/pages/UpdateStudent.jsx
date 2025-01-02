import { useEffect } from "react";
import { useDispatch } from "react-redux";

const UpdateStudent = ({pageTitle}) =>{
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
    return(
        <>{pageTitle}</>
    )
}
export default UpdateStudent