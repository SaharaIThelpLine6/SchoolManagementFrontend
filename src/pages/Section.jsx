import { FaEdit, FaTrash } from 'react-icons/fa';
import InputTable from '../components/InputTable/InputTable';

const Section = () => {
    const title = "Add Section"
    const field = "Section"
    const tableTitleHeaders = ["Sections", "Bangla", "Arabic", "Action"]
    const tableRow = ["A", "Ibrahim", "إبراهيم"]
    return (
        <div>               
            <div className='mt-10'>
                <InputTable 
                tableTitle={title}
                field={field}
                tableHeaders={tableTitleHeaders}
                tableRows={tableRow}
                />
            </div>
        </div>
    )
}

export default Section