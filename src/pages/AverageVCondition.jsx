import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import AverageDetermination from "../view/exam/average-condition/AverageDetermination";
import SubjectPassNumber from "../view/exam/average-condition/SubjectPassNumber";
import Button from "../components/Button/Button";
import ResultsCondition from "../view/exam/average-condition/ResultsCondition";
import useTranslate from "../utils/Translate";

const AverageVCondition = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [activeTab, setActiveTab] = useState("average");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const tabs = [
    {
      id: "average",
      label: "Average Determination",
      component: <AverageDetermination title="Average Determination" />
    },
    {
      id: "subject",
      label: "Subject Pass Number",
      component: <SubjectPassNumber title="Subject Pass Number" />
    },
    {
      id: "results",
      label: "Results Condition",
      component: <ResultsCondition title="Results Condition" colorOption={true} />
    }
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md ${activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 !text-black "
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

export default AverageVCondition;
