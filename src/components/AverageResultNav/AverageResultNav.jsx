import { Link, useLocation } from "react-router-dom";

const AverageResultNav = () => {
    const location = useLocation();

    const defaultRoute = "/result/AverageResult";

    const activePath = ["/result/AverageResult", "/result/PassMarksSubject", "/result/ResultConditions"]
        .includes(location.pathname) ? location.pathname : defaultRoute;
    

    return (
        <div>
            <nav className="bg-green-500 font-medium">
                <ul className="flex text-slate-50">
                    <li className={`border-r border-slate-500 rounded-sm py-1 px-2 -mr-[1px] ${activePath === "/result/AverageResult" ? "bg-slate-800" : ""}`}>
                        <Link to="/result/AverageResult">গড় নির্নয়</Link>
                    </li>
                    <li className={`border-r border-slate-500 rounded-sm py-1 px-2 -mr-[1px] ${activePath === "/result/PassMarksSubject" ? "bg-slate-800" : ""}`}>
                        <Link to="/result/PassMarksSubject">বিষয় ও পাশ নাম্বার</Link>
                    </li>
                    <li className={`border-r border-slate-500 rounded-sm py-1 px-2 -mr-[1px] ${activePath === "/result/ResultConditions" ? "bg-slate-800" : ""}`}>
                        <Link to="/result/ResultConditions">ফলাফল কন্ডিশন</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AverageResultNav;
