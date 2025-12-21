import { useEffect, useRef, useState } from "react";

function Counter({ end, duration = 1000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const startCounter = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      let start = 0;
      const startTime = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.floor(progress * end);
        setCount(value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounter();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="text-[46px] font-bold text-theme-color ">
      {count}
    </span>
  );
}

export default Counter;
