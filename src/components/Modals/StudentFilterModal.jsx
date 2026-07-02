import React, { useEffect, useRef, useState } from "react";
import DefaultSelect from "../Forms/DefaultSelect";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import DefaultInput from "../Forms/DefaultInput";
import { fetchClassData } from "../../features/class/classSlice";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import useTranslate from "../../utils/Translate";
import { useGetStudentBySearchQuery } from "../../features/student/studentQuerySlice";
import LoadingComponent from "../LoadingComponent";
import SortableTable from "../Tables/SortableTable";
import { setFilteredStudent } from "../../features/student/studentSlice";
import { hideModal } from "../../utils/ModalControlar";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const StudentFilterModal = () => {
  const methods = useForm();
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = methods;
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const scrollRef = useRef(null);

  const { academicSession, status: settingsStatus } = useSelector(
    (state) => state.settings
  );
  const { classList, status: classStatus } = useSelector(
    (state) => state.class
  );

  useEffect(() => {
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    if (!classList.length) {
      dispatch(fetchClassData());
    }
  }, [dispatch]);

  const usercode = watch("usercode");
  const ClassID = watch("ClassID");
  const SessionID = watch("SessionID");

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    ClassID: "",
    SessionID: "",
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search: usercode,
        ClassID,
        SessionID,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [usercode, ClassID, SessionID]);

  // Call search query

  useEffect(() => {
    setPage(1);
  }, [usercode, ClassID, SessionID]);
  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: studentInfoLoading,
    isFetching,
  } = useGetStudentBySearchQuery(
    { ...debouncedFilters, page, limit },
    {
      skip:
        !debouncedFilters.search &&
        !debouncedFilters.ClassID &&
        !debouncedFilters.SessionID,
      refetchOnFocus: false,
    }
  );
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const handleScroll = () => {
      console.log("scroll working");

      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 40;

      const hasNextPage =
        searchStudentInfo?.pagination?.hasNextPage;

      if (nearBottom && hasNextPage && !isFetching) {
        setPage((prev) => prev + 1);
      }
    };

    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, [searchStudentInfo, isFetching]);
  const handleAddToForm = (userDetails) => {
    dispatch(setFilteredStudent(userDetails));
    hideModal();
  };


  const columns = [
    {
      title: "Action",
      render: (row) => {
        return (
          <button
            onClick={() => {
              handleAddToForm(row);
            }}
            className=" text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-adjustments-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M6 4v4" />
              <path d="M6 12v8" />
              <path d="M13.958 15.592a2 2 0 1 0 -1.958 2.408" />
              <path d="M12 4v10" />
              <path d="M12 18v2" />
              <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M18 4v1" />
              <path d="M18 9v3" />
              <path d="M16 19h6" />
              <path d="M19 16v6" />
            </svg>
          </button>
        );
      },
    },
    { title: "User Code", hozAlign: "center",
      render: (row) => {
        return (
          <React.Fragment>
            {row?.User?.UserCode}

          </React.Fragment>
        )
      }
     },
    {
      title: "User Name",
      hozAlign: "left",
      render: (row) => {
        return (
          <React.Fragment>
            {row?.User?.UserName}

          </React.Fragment>
        )
      }
    },
    {
      title: "Father Name",
      hozAlign: "left",
      render: (row) => {
        return (
          <React.Fragment>
            {row?.User?.FatherName}

          </React.Fragment>
        )
      }
    },
    {
      title: "Class Name",
      field: "ClassName",
      hozAlign: "left",
      render: (row) => {
        return (
          <React.Fragment>
            {row?.Class?.ClassName}

          </React.Fragment>
        )
      }
    },
    {
      title: "Residential",
      field: "ResidentialStatusId",
      hozAlign: "left",
      unicode: false,
    },
  ];



  return (
    <div>
      <FormProvider {...methods}>
        <div
          className="w-full"
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            margin: "0 auto",
          }}
        >
          <div className="flex flex-col md:flex-row gap-2">
            <DefaultInput
              label={""}
              placeholder={"User Code"}
              registerKey={"usercode"}
              type={"number"}
              key={"usercode"}
            />
            <DefaultSelect
              options={classList}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              unicode={true}
            />
            <DefaultSelect
              options={academicSession}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
            />
          </div>
        </div>
        {studentInfoLoading ? (
          <LoadingComponent />
        ) : searchStudentError ? (
          <li className="text-black mt-4">No Students Found.</li>
        ) : searchStudentInfo && searchStudentInfo?.data.length > 0 ? (
          <div className="relative overflow-y-auto max-h-96" ref={scrollRef}>
            <SortableTable columns={columns} data={searchStudentInfo?.data || []} />
          </div>
        ) : (
          <li className="py-2 px-4">No students found</li>
        )}
      </FormProvider>
    </div>
  );
};

export default StudentFilterModal;
