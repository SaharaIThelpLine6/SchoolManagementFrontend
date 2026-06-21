import useTranslate from '../utils/Translate';
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import SortableTable from '../components/Tables/SortableTable';
import EditButton from '../components/Button/EditButton';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/Button/Button';


const ExamHallList = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const { data: examHallList } = useGetExamHallListQuery();

    const handleHallEdit = (hall) => {
        navigate(`/exam/exam-halledit/${hall.HallID}`, {
            state: { hall },
        });
    };
    const methods = useForm()
    const columns = [
        {
            title: translate('Action'),
            hozAlign: 'center',
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    <EditButton onClick={() => handleHallEdit(row)} />
                </div>
            ),
        },
        {
            title: translate('ID'),
            hozAlign: 'center',
            render: (row, index) => (
                <div className="flex justify-center items-center gap-2">
                    {index + 1}
                </div>
            ),
        },
        {
            title: translate('Hall Name'),
            field: 'HallName',
            hozAlign: 'center'
        },
        {
            title: translate('Number of sets'),
            field: 'TotalSeats',
            hozAlign: 'center'
        },

    ];

    const { handleSubmit, control, reset } = methods;


    return (
        <div className="p-7 font-SolaimanLipi">
            <div className='mb-4 text-end'>
                <Link className='py-2 px-2 bg-blue-500 text-white rounded-[4px] mb-2' to='/exam/exam-hallsetup'>Add Exam Hall</Link>
            </div>
            <SortableTable
                columns={columns}
                data={examHallList}
                isFilterColumn={false}
            />
        </div>
    );
};

export default ExamHallList;