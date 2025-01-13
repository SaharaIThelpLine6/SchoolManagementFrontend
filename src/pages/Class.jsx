import InputTable from "../components/InputTable/InputTable";

const Class = () => {
    const title = "Add Class"
    const field = "Class"
    const tableTitleHeaders = ["Class", "Sections", "Bangla","Arabic", "Action"]
    const tableRow = ["Class","A", "Ibrahim", "إبراهيم"]
    return(
        <div>
            <InputTable 
            tableTitle={title}
            field={field}
            tableHeaders={tableTitleHeaders}
            tableRows={tableRow}
            />
        </div>
    )
};

export default Class;
