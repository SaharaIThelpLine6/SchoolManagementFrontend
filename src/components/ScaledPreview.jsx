import { useLayoutEffect, useRef, useState } from "react";

// export default function ScaledPreview({ children, designWidth = 750 }) {
//   const containerRef = useRef(null);
//   const [scale, setScale] = useState(1);

//   useLayoutEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     const update = () => {
//       const screenWidth = el.clientWidth;
//       const availableWidth = el.getBoundingClientRect().width;

//       if (!screenWidth) return;

//       // If screen/container is smaller than design width,
//       // scale the design to fit the screen.
//       const s = Math.min(1, screenWidth / designWidth);

//       setScale(s);

//       console.log({
//         designWidth,
//         screenWidth,
//         scale: s,
//       });
//     };

//     update();

//     const ro = new ResizeObserver(update);
//     ro.observe(el);

//     return () => ro.disconnect();
//   }, [designWidth]);

//   return (
//     <div
//       ref={containerRef}
//       className="w-full min-w-0 overflow-hidden"
//     >
//       <div
//        className="mx-auto"
//         style={{
//           width: `${designWidth}px`,
//           transform: `scale(${scale})`,
//           transformOrigin: "top left",
//           boxSizing: "border-box",
//           marginBottom: `${-(1 - scale) * 100}%`,
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }



export default function ScaledPreview({ children, designWidth = 750 }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [contentWidth, setContentWidth] = useState(designWidth);

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => {
            const availableWidth =
                window.innerWidth > 1000
                    ? designWidth
                    : window.innerWidth;

            const content = el.firstElementChild;
            if (!availableWidth || !content) return;

            const measuredWidth = Math.max(designWidth, content.scrollWidth);
            const s = Math.min(1, availableWidth / measuredWidth);

            setContentWidth(measuredWidth);
            setScale(s);
        };

        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);

        if (el.firstElementChild) {
            ro.observe(el.firstElementChild);
        }

        window.addEventListener("resize", update);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
        };
    }, [designWidth]);

    return (
        <div ref={containerRef} className="w-full min-w-0 overflow-hidden">
            <div
                className="mx-auto"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: designWidth,
                    boxSizing: "border-box",
                }}
            >
                {children}
            </div>
        </div>
    );
}