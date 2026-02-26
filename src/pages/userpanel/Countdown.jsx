import { useEffect, useState } from "react";

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      minutes: Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      ),
      seconds: Math.floor(
        (difference % (1000 * 60)) / 1000
      ),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-red-600 font-bold text-lg">
        Time's Up!
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-center mt-4">
      <div>
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-sm text-gray-500">Days</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm text-gray-500">Hours</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm text-gray-500">Minutes</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm text-gray-500">Seconds</div>
      </div>
    </div>
  );
};

export default Countdown;
