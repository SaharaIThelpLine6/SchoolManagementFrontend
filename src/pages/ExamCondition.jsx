import { useEffect } from 'react';
import Loading from '../components/Loading/Loading';
import { useGetSettingsQuery } from '../features/settings/settingsQuerySlice';
import AverageVCondition from './AverageVCondition';
import PointVCondition from './PointVCondition';

const ExamCondition = () => {
  // const { data, error, isLoading } = useGetExamConditionsSettingsQuery();
  const { data: response, isLoading, error, refetch } = useGetSettingsQuery();
  const data = response?.data.find((item) => item.ID == 20);

  useEffect(() => {
    if (data) {
      console.log('Exam Condition Data:', data);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
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
          <div className="text-gray-500 text-center">
            No valid exam condition found.
          </div>
        )
      ) : (
        <div className="text-gray-500 text-center">No data available.</div>
      )}
    </div>
  );
};

export default ExamCondition;
