import { useEffect } from "react";
import { useGetExamConditionsSettingsQuery } from "../features/settings/settingsQuerySlice";
import AverageVCondition from "./AverageVCondition";
import PointVCondition from "./PointVCondition";

const ExamCondition = () => {
  const { data, error, isLoading } = useGetExamConditionsSettingsQuery();

  useEffect(() => {
    if (data) {
      console.log("Exam Condition Data:", data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md text-center">
        Loading exam conditions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center">
        Failed to load exam conditions.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      {data ? (
        data.Action === 1 ? (
          <AverageVCondition pageTitle="Average Fee Condition" />
        ) : data.Action === 2 ? (
          <PointVCondition pageTitle="Pointwise Fee Condition" />
        ) : (
          <div className="text-gray-500 text-center">No valid exam condition found.</div>
        )
      ) : (
        <div className="text-gray-500 text-center">No data available.</div>
      )}
    </div>
  );
};

export default ExamCondition;

