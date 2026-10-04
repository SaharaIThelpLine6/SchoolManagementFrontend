import useTranslate from '../utils/Translate';
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import SortableTable from '../components/Tables/SortableTable';
import EditButton from '../components/Button/EditButton';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/Button/Button';
import SvgIcon from '../components/icons/SvgIcon';


const ExamHallList = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const { data: examHallList } = useGetExamHallListQuery();

    const handleHallEdit = (hall) => {
        navigate(`/dashboard/exam/exam-halledit/${hall.HallID}`, {
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

        <div className="font-default bg-white p-6 md:p-4 rounded-xl shadow-lg">
            <div className="block w-full overflow-x-auto">
                <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between mb-0">
                    <h3 className="font-default text-[20px] font-bold">
                        {translate('Exam Hall List')}
                    </h3>
                    <div className='mb-4 text-end gap-4 flex'>
                        <Link className='py-2 px-2 bg-blue-500 text-white rounded-[4px] mb-2 flex gap-2' to='/dashboard/exam/exam-hallsetup'> <SvgIcon name={"HomePlus"} size={22} />  {translate("Add Exam Hall")} </Link>
                        <Link className='py-2 px-2 bg-blue-500 text-white rounded-[4px] mb-2 flex gap-2' to='/dashboard/exam/exam-setplan'> <SvgIcon name="TableShortcut" size={22} /> {translate("Exam Seat plan")} </Link>
                    </div>
                </div>
                <SortableTable
                    columns={columns}
                    data={examHallList}
                    isFilterColumn={false}
                />
            </div>
        </div>

    );
};

export default ExamHallList;