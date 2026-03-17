import { useEffect, useState } from "react";
import { calculateTimeLeft } from "../../utils/calculateTimeLeft";

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-red-600 font-bold text-center text-lg sm:text-xl mt-4">
        Time's Up!
      </div>
    );
  }

  const boxStyle =
    "flex flex-col items-center justify-center bg-gray-100 rounded-xl shadow p-3 sm:p-4 w-16 sm:w-20 md:w-24";

  const numberStyle =
    "text-lg sm:text-xl md:text-2xl font-bold";

  const labelStyle =
    "text-[10px] sm:text-xs md:text-sm text-gray-500";

  return (
    <div className="flex justify-center gap-2 sm:gap-4 md:gap-6 mt-4 flex-wrap">
      <div className={boxStyle}>
        <span className={numberStyle}>{timeLeft.days}</span>
        <span className={labelStyle}>Days</span>
      </div>

      <div className={boxStyle}>
        <span className={numberStyle}>{timeLeft.hours}</span>
        <span className={labelStyle}>Hours</span>
      </div>

      <div className={boxStyle}>
        <span className={numberStyle}>{timeLeft.minutes}</span>
        <span className={labelStyle}>Minutes</span>
      </div>

      <div className={boxStyle}>
        <span className={numberStyle}>{timeLeft.seconds}</span>
        <span className={labelStyle}>Seconds</span>
      </div>
    </div>
  );
};

export default Countdown;