import React from 'react';
import SvgIcon from '../icons/SvgIcon';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const DefaultPagination = ({ currentPage, totalPages, onPageChange }) => {
  const translate = useTranslate();
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="flex items-center space-x-2">
        <button
          className="border cursor-pointer rounded disabled:opacity-50 flex justify-center items-center w-8 h-8 hover:bg-gray-100 transition-colors"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
          type='button'
        >
          <SvgIcon name="ChevronLeft" size={24} />
        </button>

        <span className="px-2 text-sm font-medium">
          {translate("Page")} { bnBijoy2Unicode(String(currentPage)) } {translate("of")} {bnBijoy2Unicode(String(totalPages))}
        </span>

        <button
          className="border cursor-pointer rounded disabled:opacity-50 flex justify-center items-center w-8 h-8 hover:bg-gray-100 transition-colors"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          type='button'
        >
          <SvgIcon name="ChevronRight" size={24} />
        </button>
      </div>
    </div>
  );
};


export default DefaultPagination