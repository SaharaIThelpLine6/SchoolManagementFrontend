import { useLocation, useNavigate } from "react-router-dom";
import { closeModal } from "../../../features/modal/modalSlice";
import { useDispatch } from "react-redux";

const StudentCardModel = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch()
  const handleButtonClick = () => {
     dispatch(closeModal())
    navigate("/students/student-id-card-print?id=1")
  }

  return (
    <div className="bg-white gap-6 rounded-2xl shadow-md w-full">
      <div className="grid grid-cols-4">
        <button id="1" onClick={handleButtonClick}>
          <img src="/student_id_image.png" alt="" />
        </button>
      </div>
    </div>
  );
};

export default StudentCardModel;
