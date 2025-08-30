import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import Loading from "../components/Loading/Loading";
import { Buffer } from "buffer";
import Button from "../components/Button/Button";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultImageUpload from "../components/Forms/DefaultImageUpload";
import FilterButton from "../components/Filter/FilterButton";
import { useCallback } from "react";
import { showModal } from "../utils/ModalControlar";
import {
  useGetAllUserWithImageQuery,
  usePostUserSingleImageUploadMutation,
} from "../features/dashboard/dashboardQuerySlice";
import bnBijoy2Unicode from "../utils/conveter";
import Swal from "sweetalert2";
const PAGE_SIZE = 10;

const UserImage = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [previewImg, setPreviewImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const methods = useForm();
  const { reset } = methods;
  const { filteredStudent } = useSelector((state) => state.student);

  const {
    data: userResponse = { data: [], totalUsers: 0, totalPages: 0 },
    isError,
    isLoading,
  } = useGetAllUserWithImageQuery({ page: currentPage, limit: PAGE_SIZE });
  console.log(userResponse, "userResponse")

  const users = userResponse?.data ?? [];

  const filterData = users.find(
    (i) => i.UserID === filteredStudent?.UserID
  );

  const [
    postUserInage,
    { isLoading: uploadLoading, isError: uploadError, isSuccess },
  ] = usePostUserSingleImageUploadMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = userResponse?.totalPages ?? 0;

  useEffect(() => {
    if (filterData) {
      const imageBuffer = filterData?.UserImage?.[0]?.Image;
      if (imageBuffer) {
        const base64String = Buffer.from(imageBuffer).toString("base64");
        const src = `data:image/png;base64,${base64String}`;
        setPreviewImg(src);
      } else {
        setPreviewImg(null);
      }
    } else {
      setPreviewImg(null);
    }

    reset({
      ID: filterData?.UserID || "",
      UserCode: filterData?.UserCode || "",
      UserName: filterData?.UserName || "",
    });
  }, [filterData, reset]);

  const handleEditOpenModal = (row) => {
    setPreviewUrl(null);
    const imageBuffer = row?.UserImage?.[0]?.Image;
    if (imageBuffer) {
      const base64String = Buffer.from(imageBuffer).toString("base64");
      const src = `data:image/png;base64,${base64String}`;
      setPreviewImg(src);
    } else {
      setPreviewImg(null);
    }
    reset({
      ID: row.UserID || "",
      UserCode: row.UserCode || "",
      UserName: row.UserName || "",
    });
  };

  const columns = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row)} />
        </div>
      ),
    },
    {
      title: translate("User Code"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.UserCode}</p>,
    },
    {
      title: translate("User Name"),
      field: "UserName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row.UserName)}</p>,
    },
    {
      title: translate("Image"),
      field: "UserImage",
      hozAlign: "center",
      render: (row) => {
        if (!row.UserImage || row.UserImage.length === 0) return <span>-</span>;

        // ধরছি শুধু প্রথম image দেখাব
        const imageBuffer = row.UserImage[0].Image; // Buffer
        if (!imageBuffer) return <span>-</span>;

        // Convert buffer to base64
        const base64String = Buffer.from(imageBuffer).toString("base64");
        const src = `data:image/png;base64,${base64String}`;

        return (
          <div className="flex justify-center items-center">
            <img
              src={src}
              alt="User"
              className="w-16 h-16 object-cover rounded-md"
            />
          </div>
        );
      },
    },
  ];

  const handleOpenModal = useCallback((id) => {
    showModal("Filter Student", "STUDENT_FILTER");
  }, []);

  const onSubmit = async (data) => {
    // single image field থেকে file
    const file = data.singleImage?.[0];
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please select an image before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await postUserInage(formData).unwrap();

      Swal.fire({
        icon: "success",
        title: "Uploaded Successfully",
        text: "User image has been uploaded.",
      });

      reset({ ID: "", UserCode: "", UserName: "", singleImage: null });
      setPreviewImg(null);
      setPreviewUrl(null);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.data?.error || "Something went wrong!",
      });
    }
  };

  const handleReset = () => {
    reset({ ID: "", UserCode: "", UserName: "", singleImage: null });
    setPreviewImg(null);
    setPreviewUrl(null);
  };

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <FormProvider {...methods}>
          <div className="filter_header flex items-center justify-between sm:px-5 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate("User Image")}
            </h3>
          </div>
          <div className="mb-5">
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="font-lato space-y-6 p-4 sm:p-6 border rounded-lg"
            >
              {/* Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Single Image Upload + Filter */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
                  {/* Image Upload */}
                  <DefaultImageUpload
                    label="Upload Profile Image"
                    registerKey="singleImage"
                    require={true}
                    multiple={true}
                    image={previewImg}
                    setPreviewUrl={setPreviewUrl}
                    previewUrl={previewUrl}
                  />

                  {/* Filter Button + optional mobile label */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto sm:mb-4">
                    {/* Mobile only label */}
                    <label className="sm:hidden text-gray-700 font-medium mb-1">
                      Filter User :
                    </label>

                    {/* Button */}
                    <FilterButton
                      onClick={handleOpenModal}
                      className="w-full sm:w-auto"
                    />
                  </div>
                </div>

                {/* Input fields */}
                <div className="space-y-4">
                  <DefaultInput
                    registerKey="ID"
                    require={translate("ID is required")}
                    type="text"
                    placeholder={translate("Enter type of id") + " ..."}
                    label={translate("ID") + " :"}
                    disable
                  />
                  <DefaultInput
                    registerKey="UserCode"
                    require={translate("UserCode is required")}
                    type="text"
                    placeholder={translate("Enter type of userCode") + " ..."}
                    label={translate("Code") + " :"}
                    disable
                  />
                  <DefaultInput
                    registerKey="UserName"
                    require={translate("UserName is required")}
                    type="text"
                    placeholder={translate("Enter type of userName") + " ..."}
                    label={translate("Name") + " :"}
                    disable
                    unicode={true}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md w-full sm:w-auto"
                  type="submit"
                >
                  Upload
                </Button>

                <Button
                  className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md w-full sm:w-auto"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
          {isLoading ? (
            // Loading State
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          ) : isError ? (
            // Error State
            <div className="text-center text-red-500 py-10">
              {translate("Failed to load user image type data")}
            </div>
          ) : users.length === 0 ? (
            // No Data State
            <div className="text-center text-gray-500 py-10">
              {translate("No user data found")}
            </div>
          ) : (
            // Table + Pagination
            <>
              <SortableTable columns={columns} data={users} />

              <div className="flex justify-center mt-4">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default UserImage;