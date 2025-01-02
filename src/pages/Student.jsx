import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Student = ({pageTitle}) =>{
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
    return(
      <div>
        {pageTitle}
      </div>
    )
}
export default Student