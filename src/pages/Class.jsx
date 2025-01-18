import { useDispatch, useSelector } from "react-redux";
import { fetchClassData } from "../features/class/classSlice";
import { useEffect, useState } from "react";
import InputTable2 from "../components/InputTable/InputTable2";

const Class = () => {
    const title = "Add Class"
    const field = "Class"
    const tableTitleHeaders = ["Serial", "Class", "Sections", "Bangla", "Arabic"];
    const [filteredClassList, setFilteredClassList] = useState([]);
    const { classList, status, error } = useSelector((state) => state.class);
    const dispatch = useDispatch();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchClassData());
        }

        if (status === 'succeeded') {

            const transformedData = classList.map((item) => ({
                id: item.ClassID.toString(),
                Serial: item.Serial,
                Class: item.EnglishClass,
                Sections: item.ClassGroup.map(group => group.SubClass).join(", "),
                Bangla: item.ClassName, 
                Arabic: item.ArabicClass,
            }));
            setFilteredClassList(transformedData);
            
        }
    }, [status, dispatch]);

    return (
        <div>
            <InputTable2
                tableTitle={title}
                field={field}
                tableRows={filteredClassList}
                tableHeader={tableTitleHeaders}
            />
        </div>
    )
};

export default Class;
