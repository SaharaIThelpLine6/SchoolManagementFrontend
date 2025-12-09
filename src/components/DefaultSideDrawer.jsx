import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import useTranslate from '../utils/Translate';
import ClickOutside from './ClickOutside';
import AdmissionForm from './Forms/AdmissionForm';

const DefaultSideDrawer = ({ direction = 'right' }) => {
  const { isOpen, title, modalType, id } = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const translate = useTranslate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <ClickOutside
        className="max-w-screen-lg w-full overflow-hidden"
        onClick={() => dispatch(closeModal())}
      >
        {/* SLIDE ANIMATION */}
        <div
          className={`
            w-full transform transition-all duration-300 ease-out
            ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0'}
            ${direction === 'right' ? 'translate-x-full' : ''}
            ${direction === 'left' ? '-translate-x-full' : ''}
          `}
        >
          <div className="bg-white rounded-lg shadow-lg relative w-full max-h-[90vh] overflow-y-auto">
            <div className="header pl-3 pr-2 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              {title && <h2 className="text-[18px] font-bold">{translate(title)}</h2>}

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
                {modalType === 'ADD_STUDENT' && <AdmissionForm userId={id} />}
              </div>
            )}
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default DefaultSideDrawer;
