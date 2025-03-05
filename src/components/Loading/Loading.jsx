import { useEffect, useState } from "react";
const Loading = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress((prev) => (prev < 100 ? prev + 2 : 100));
        }, 25);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="absolute w-[100px] h-[100px] flex items-center justify-center rounded-full bg-slate-300">
                {/* Logo */}
                <div className="absolute z-40 w-[80px] h-[80px] flex items-center justify-center rounded-full">
                    <div className=" absolute flex items-center justify-center w-[70px] h-[70px] overflow-hidden bg-white border-slate-50 rounded-full">
                        <img src="/QMMSoftIcon.svg" alt="Logo" width={40} height={40} className="" />
                    </div>
                </div>
                {/* Loading Effect */}
                <div
                    className="absolute w-[100px] h-[100px] rounded-full "
                    style={{
                        background: `conic-gradient(rgb(11,126,211,${loadingProgress / 100}) ${loadingProgress}%, transparent ${loadingProgress}%)`,
                    }}
                ></div>
            </div>
        </div>
        // <div className="loading-screen-container">
        //     <div className="circle-wrap">
        //         <div className="circle">
        //             <div className="mask full">
        //                 <div className="fill"></div>
        //             </div>
        //             <div className="mask half">
        //                 <div className="fill"></div>
        //             </div>
        //             <div className="inside-circle">
        //                 <img id="logo" src="/logo.png" alt="logo" />
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}
export default Loading;