import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import FilterSelectGroup from "../components/Forms/SelectGroup/FilterSelectGroup";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import {
  useGetTeacherInfoNotRegisteredQuery,
  useGetTeacherInfoQuery,
} from "../features/teachers/teachersSlice";
import { useNavigate } from "react-router-dom";

const AddTeacher = ({ pageTitle }) => {
  const translate = useTranslate();
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const {
    data: teacherList,
    isLoading: teacherInfoLoading,
    isError: teacherInfoError,
  } = useGetTeacherInfoQuery();
  console.log(teacherList);

  const {
    data: teacherInfoNR,
    isLoading: teacherInfoNRLoading,
    isError: teacherInfoNRError,
  } = useGetTeacherInfoNotRegisteredQuery();
  console.log(teacherInfoNR);

  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get("filter");
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleOpenModal = useCallback((id) => {
    showModal("Employee Details", "ADD_TEACHER", id);
  }, []);
  const handleFeeCollectionModal = useCallback((id) => {
    showModal("Fee Collection", "FEE_COLLECTION", id);
  }, []);

  useEffect(() => {
    dispatch(setPageName(pageTitle));
  }, [dispatch, location]);

  const columnsAdmitedStudent = [
    { title: translate("User ID"), field: "UserID", hozAlign: "center" },
    {
      title: translate("Teacher Code"),
      field: "TeacherCode",
      hozAlign: "center",
      type: "text",
      // filterable: true,
      render: (row) => {
        return <p>{row.User?.UserCode}</p>;
      },
    },
    {
      title: translate("Serial"),
      field: "Serial",
      hozAlign: "center",
    },
    {
      title: translate("Name"),
      field: "UserName",
      hozAlign: "center",
      render: (row) => {
        return <p>{row.User?.UserName}</p>;
      },
    },
    {
      title: translate("Father Name"),
      field: "FatherName",
      hozAlign: "center",
      render: (row) => {
        return <p>{row.User?.FatherName}</p>;
      },
    },
    {
      title: translate("Mobile1"),
      field: "Mobile1",
      hozAlign: "center",
      render: (row) => {
        return <p>{row.User?.Mobile1}</p>;
      },
    },
    {
      title: translate("Date of join"),
      field: "CreateAt",
      hozAlign: "center",
      type: "range",
      // filterable: true,
      render: (row) => {
        return new Date(row.JoiningDate).toLocaleDateString("en-GB");
      },
    },
  ];
  const columnsNotAdmitedStudent = [
    { title: translate("User ID"), field: "UserID", hozAlign: "center" },
    { title: translate("Teacher Code"), field: "UserCode", hozAlign: "center" },
    { title: translate("Name"), field: "UserName" },
    {
      title: translate("Gender"),
      field: "GenderID",
      hozAlign: "center",
      render: (row) => {
        const genderMap = {
          1: "Male",
          2: "Female",
          3: "Other",
        };
        return genderMap[row.GenderID] || "N/A";
      },
    },
    {
      title: translate("Date of join"),
      field: "CreateAt",
      hozAlign: "center",
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString("en-GB");
      },
    },
    {
      title: translate("Action"),
      field: "SessionSerial",
      hozAlign: "center",
      render: (row) => (
        <button
          onClick={() => {
            handleOpenModal(row.UserID);
          }}
          className="px-4 py-2 bg-rose-500 text-white rounded"
        >
          {translate("Register")}
        </button>
      ),
    },
  ];
  // console.log(userOnlyStudents);
  return (
    <div className="-translate-y-4 font-lato">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b  border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold ">
            {filter == 2
              ? translate("Not Admitted Teacher List")
              : translate("Admitted Teacher List")}
          </h3>
          <div className="flex items-center space-x-5">
            <div className="filter relative">
              {/* <SelectGroupTwo /> */}
              <FilterSelectGroup
                defaultSelect={filter}
                options={[
                  { id: 0, value: translate("Admitted Teacher List") },
                  { id: 2, value: translate("Not Admitted Teacher List") },
                ]}
                nameField={"value"}
                valueField={"id"}
              />
            </div>
          </div>
        </div>

        <SortableTable
          columns={
            filter == 2 ? columnsNotAdmitedStudent : columnsAdmitedStudent
          }
          data={(filter == 2 ? teacherInfoNR : teacherList) || []}
        />
      </div>
    </div>
  );
};

export default AddTeacher;
