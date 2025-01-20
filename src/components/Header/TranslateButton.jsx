import { useDispatch, useSelector } from "react-redux";
import { setCurrentLanguage } from "../../features/language/languageSlice";

const TranslateButton = () => {

  const dispatch = useDispatch();
  const {currectLanguage} = useSelector((state)=> state.language);

    const handleLanguageChange = (e) => {
      dispatch(setCurrentLanguage(e.target.value));
    };



    return (
        <div>        
              <select
                className="outline-none text-sm text-gray-700 bg-transparent"
                onChange={handleLanguageChange}
                defaultValue="English"

              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>  
              
               
        </div>
    )
}
export default TranslateButton;