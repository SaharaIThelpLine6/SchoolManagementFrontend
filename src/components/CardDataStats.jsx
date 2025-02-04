import React from 'react';

const CardDataStats = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="rounded-[6px] border border-stroke bg-white py-3 px-3 shadow-default flex items-center gap-4">

      <div className="w-[64px] h-[64px] flex items-center justify-center bg-meta-2">
        {children}
      </div>

      <div className=" flex items-end justify-between font-lato">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {total}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>

    </div>
  );
};

export default CardDataStats;
