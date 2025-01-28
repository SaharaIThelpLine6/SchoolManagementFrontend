import { useEffect, useState } from "react";
const Loading = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress((prev) => (prev < 100 ? prev + 2 : 100));
        }, 18);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="absolute w-[100px] h-[100px] flex items-center justify-center rounded-full bg-slate-300">
                {/* Logo */}
                <div className="absolute z-40 w-[80px] h-[80px] flex items-center justify-center rounded-full">
                    <div className=" absolute border-[15px] border-slate-50 rounded-full">
                        <img src="/saharaIt.svg" alt="Logo" width={40} height={40} className="" />
                    </div>
                </div>
                {/* Loading Effect */}
                <div
                    className="absolute w-[100px] h-[100px] rounded-full "
                    style={{
                        background: `conic-gradient(rgb(255,0,0,${loadingProgress / 100}) ${loadingProgress}%, transparent ${loadingProgress}%)`,
                    }}
                ></div>
            </div>
        </div>
    )
}
export default Loading;