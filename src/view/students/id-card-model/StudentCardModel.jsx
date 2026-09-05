import { useNavigate } from "react-router-dom";
import { closeModal } from "../../../features/modal/modalSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import useTranslate from "../../../utils/Translate";

const StudentCardModel = () => {
  const navigate = useNavigate();
  const translate = useTranslate();
  const dispatch = useDispatch();
  const [selectedLayout, setSelectedLayout] = useState(null);

  const layouts = [
    { id: "2", image: "/idcard/template_preview_2.jpg" },
    { id: "3", image: "/idcard/template_preview_3.jpg" },
    { id: "4", image: "/idcard/template_preview_4.jpg" },
    { id: "5", image: "/idcard/template_preview_5.jpg" },
    { id: "6", image: "/idcard/template_preview_6.jpg" },
    { id: "7", image: "/idcard/template_preview_7.jpg" },
    { id: "8", image: "/idcard/template_preview_8.jpg" },
  ];

 

  const handleSubmitSelection = (id) => {
    if (!id) return;
    setSelectedLayout(id)
    dispatch(closeModal());
    navigate("students/student-id-card", {
      state: {
        layoutId: id,
      },
    });
  };

  return (
    <div className="bg-white w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => handleSubmitSelection(layout.id)}
            className={`border rounded-xl p-2 ${selectedLayout === layout.id ? "border-blue-500" : "border-transparent"}`}
          >
            <img src={layout.image} alt="layout" className="object-cover" />
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default StudentCardModel;
