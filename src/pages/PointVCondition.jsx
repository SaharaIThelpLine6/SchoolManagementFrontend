import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import ResultsCondition from "../view/exam/average-condition/ResultsCondition";
import Button from "../components/Button/Button";
import PointCondition from "../view/exam/point-condition/PointCondition";
import useTranslate from "../utils/Translate";

const PointVCondition = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [activeTab, setActiveTab] = useState("subject");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const tabs = [
    {
      id: "subject",
      label: "Subject and Pass Number",
      component: <PointCondition title="Subject and Pass Number" />,
    },

    {
      id: "results",
      label: "Results Condition",
      component: <ResultsCondition title="Results Condition" />,
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab.id
                ? "text-white bg-blue-500" // active style (you can adjust)
                : "bg-gray-400 text-black hover:text-white hover:bg-gray-500"
            }`}
          >
            {translate(tab.label)}
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      {/* <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div> */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PointVCondition;
