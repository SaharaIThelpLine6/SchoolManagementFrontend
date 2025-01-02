import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Home = ({pageTitle}) =>{
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
    return(
        <>{pageTitle}</>
    )
}
export default Home