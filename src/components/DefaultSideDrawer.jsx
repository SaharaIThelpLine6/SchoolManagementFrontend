import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import useTranslate from '../utils/Translate';
import ClickOutside from './ClickOutside';
import AdmissionForm from './Forms/AdmissionForm';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileMenu from '../view/UserPanel/Profilemenu';

const DefaultSideDrawer = ({ direction = 'right' }) => {
  const { isDrawers, title, modalType, id } = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isDrawers) {
      setIsMounted(true);
    } else {
      setTimeout(() => setIsMounted(false), 300); // animation duration
    }
  }, [isDrawers]);
  const sidebarVariants = {
    open: { width: 280, opacity: 1 },
    closed: { width: 280, opacity: 0.8 },
  };
  const drawerVariants = {
    hidden: {
      x: direction === 'right' ? 280 : -280,
      opacity: 0,
    },
  };
  if (!isMounted) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999]">
      <ClickOutside
        className="max-w-screen-lg w-full overflow-hidden h-full"
        onClick={() => {console.log("close window");
        }}
      >
        {/* SLIDE ANIMATION */}
        <AnimatePresence>
          <motion.div
            className="sidebar h-full"
            initial={{ opacity: 1, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 1, x: -300 }}
          >
            <div className="bg-white rounded-t-r-lg shadow-lg relative w-full max-w-[280px] min-h-[100svh] overflow-y-auto">
              <div className="header pl-3 pr-2 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[18px] font-bold">{title && translate(title || "")}</h2>

                <button
                  onClick={() => dispatch(closeModal())}
                  className="text-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType && (
                <div className="body p-3">
                  {modalType === 'USER_PANEL_PROFILE_VIEW' && <ProfileMenu/>}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </ClickOutside>
    </div>
  );
};

export default DefaultSideDrawer;
