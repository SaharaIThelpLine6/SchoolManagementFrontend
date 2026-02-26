import React, { useEffect, useState } from "react";
import useTranslate from "../../utils/Translate";
import Button from "../../components/Button/Button";
import { useForm, useFormContext } from "react-hook-form";
import { hideModal } from "../../utils/ModalControlar";
import { useDispatch } from "react-redux";

export default function ReportHeaderModal({ id }) {
    const translate = useTranslate();
    const dispatch = useDispatch();
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const temDetails = [
        {
            id: 1,
            image: "/reaport-heading-template/1.jpg",
        },
        {
            id: 2,
            image: "/reaport-heading-template/2.jpg",
        },
    ];
    const handleSave = () => {
        dispatch(hideModal());
    };

    useEffect(() => {
        id.templateHandler(selectedTemplate)
    }, [selectedTemplate])

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                {temDetails.map((item) => (
                    <label key={item.id} className={`relative cursor-pointer overflow-hidden border p-2 rounded-[5px] transition ${selectedTemplate === item.id ? "border-primary ring-2 ring-primary" : "border-default-strong"}`}>
                        <img src={item.image} alt={`Report Header ${item.id}`} className="w-full h-32 object-cover" />
                        <input
                            type="radio"
                            name="reportHeader"
                            value={item.id}
                            checked={selectedTemplate === item.id}
                            onChange={() => { setSelectedTemplate(item.id); }}
                            className="absolute top-2 right-2 accent-primary"
                        />
                        {selectedTemplate === item.id && (
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                        )}
                    </label>
                ))}
            </div>


            <div className="mt-3">
                <Button type="button" onClick={handleSave}>
                    {translate("Save")}
                </Button>
            </div>
        </div>
    );
}



// export default function ReportHeaderModal({ id }) {
//   const dispatch = useDispatch();
// //   const { setValue } = useFormContext();
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   const temDetails = [
//     { id: 1, image: "/reaport-heading-template/1.jpg" },
//     { id: 2, image: "/reaport-heading-template/2.jpg" },
//   ];

//   const handleSave = () => {
//     if (id?.setValue && selectedTemplate) {
//       id.setValue("ActiveReportVil", selectedTemplate);
//     }

//     dispatch(hideModal());
//   };

//   return (
//     <>
//       <div className="grid grid-cols-2 gap-4">
//         {temDetails.map((item) => (
//           <label
//             key={item.id}
//             onClick={() => setSelectedTemplate(item.id)}
//             className={`cursor-pointer border p-2 rounded ${
//               selectedTemplate === item.id ? "border-primary" : ""
//             }`}
//           >
//             <img src={item.image} className="h-32 w-full object-cover" />
//           </label>
//         ))}
//       </div>

//       <Button onClick={handleSave}>Save</Button>
//     </>
//   );
// }
