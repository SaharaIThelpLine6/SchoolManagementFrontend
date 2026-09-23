import { useEffect } from 'react';
import Loading from '../components/Loading/Loading';
import { useGetSettingsQuery } from '../features/settings/settingsQuerySlice';
import AverageVReport from './AverageVReport';
import PointVReport from './PointVReport';
import useTranslate from '../utils/Translate';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

const ResultReport = () => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { data: response, isLoading, error, refetch } = useGetSettingsQuery();
  const methods = useForm();
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
    <div className="">
      
    </div>
  );
};

export default ResultReport;
