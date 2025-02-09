import { useDispatch, useSelector } from "react-redux";
import ClickOutside from "./ClickOutside";
import { motion } from "framer-motion";
import { closeModal } from "../features/modal/modalSlice";
import AdmissionForm from "./Forms/AdmissionForm";

const DefaultModal = () => {
  const { isOpen, title, modalType, id } = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <ClickOutside className="max-w-screen-lg w-full overflow-hidden " onClick={() => dispatch(closeModal())}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, scale: { type: "spring", bounce: 0.2 } }}
          className="w-full"
        >
          <div className="bg-white rounded-lg shadow-lg relative w-full max-h-[90vh] overflow-y-auto">
            <div className="header pl-3 pr-2 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              {title && <h2 className="text-[18px] font-bold">{title}</h2>}

              <button onClick={() => dispatch(closeModal())} className="text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
              </button>
            </div>

            {
                modalType && <div className="body p-3">{modalType === 'ADD_STUDENT' && <AdmissionForm userId={id}/>}</div>
            }
          </div>
        </motion.div>
      </ClickOutside>
    </div>
  );
};

export default DefaultModal;
