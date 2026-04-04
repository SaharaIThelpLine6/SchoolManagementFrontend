import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import {
    examVacationStatus,
    resultReports,
    resultReportSizeStatus,
} from "../Data/userReportsData";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { useGetAverageVReportQuery } from "../features/userReports/userReportsSlice";
import Swal from "sweetalert2";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import ExamRoutingCheckbox from "../components/Checkboxes/ExamRoutingCheckbox";
import DefaultInput from "../components/Forms/DefaultInput";
import { showModal } from "../utils/ModalControlar";
import AdmissionFormWithResult from "../view/students/reports/result-reports/AdmissionFormWithResult";

const AdmissionForm = ({ pageTitle }) => {
    const translate = useTranslate();
    const dispatch = useDispatch();
    const methods = useForm();
    const { status } = useSelector((state) => state.settings);
    const formRef = useRef();
    const { control, handleSubmit } = methods;

    const selectedReportID = useWatch({ control, name: "ReportID" });

    // Define which ReportIDs should show which fields
    const shouldShowFields = (fieldName) => {
        switch (selectedReportID) {
            case 1:
                return [
                    "ReportID",
                    "SessionID",
                    "ExamID",
                    "SubClassID",
                    "UserCode",
                ].includes(fieldName);
            case 2:
                return [
                    "ReportID",
                    "SessionID",
                    "ExamID",
                    "SubClassID",
                ].includes(fieldName);
            default:
                return false;
        }
    };

    const [queryParams, setQueryParams] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const { data, isFetching, isError, error, data: reportData } = useGetAverageVReportQuery(queryParams, {
        skip: !queryParams
    });

    const { data: sessionData } = useGetSessionsQuery();
    const { data: classListData } = useGetClassListQuery();
    const { data: subclassListData } = useGetSubClassListQuery();
    const { data: examNameData } = useGetExamNamesQuery();
    const { data: residentialData } = useGetResidentialQuery();
    // const [
    //   updateResultReport,
    //   { isLoading: resultReportUpdating, isError: resultReportUpdatingError, isSuccess: resultReportUpdateSuccess, data: resultReportUpdatingResponse },
    // ] = usePostResultReportSettingsMutation();
    useEffect(() => {
        dispatch(setPageName(pageTitle));
        if (status === "idle") {
            dispatch(fetchSettingsData());
        }
    }, [status, dispatch, pageTitle]);

    useEffect(() => {
        if (isError && error) {
            setErrorMessage(
                error.status === 403
                    ? translate("You do not have permission to view this report")
                    : error.status === 400
                        ? translate("Missing or invalid data provided")
                        : translate("An error occurred while fetching the report")
            );
        } else if (!isFetching && reportData && Object.keys(reportData).length === 0) {
            // ✅ Handle empty object response
            setErrorMessage(translate("No report data available"));
        } else {
            setErrorMessage(null);
        }
    }, [isError, error, isFetching, reportData, translate]);

    useEffect(() => {
        if (errorMessage) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: errorMessage,
            });
        }
    }, [errorMessage]);

    const onSubmit = (formData) => {
        console.log(formData);

        const params = {
            report_id: 6,
            session_id: formData.SessionID,
            class_id: formData.ClassID,
            subclass_id: formData.SubClassID,
            exam_id: formData.ExamID,
            residential_id: formData.RDID,
            language_id: formData.id,
            is_active: formData.IsActive,
            usercode: formData.UserCode
        };
        Object.keys(params).forEach(
            (key) =>
                (params[key] === undefined || params[key] === "") && delete params[key]
        );

        setQueryParams({ ...params });
    };


    useEffect(() => {
        console.log(data);
    }, [data])
    const handleFormEditOption = (val) => {
        showModal("Edit Admission Report Content", "ADMISSION_CONTENT_SETTINGS")
    }

    return (
        <div className="font-SolaimanLipi">
            <div className="flex flex-col gap-3">
                <div className=" w-full border rounded-lg shadow-sm border-theme-offwhite">
                    <div className="flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden">
                        <h1 className="font-semibold text-lg text-theme-dark font-SolaimanLipi mb-0">
                            {translate(pageTitle)}
                        </h1>
                    </div>


                    <div className="lg:flex gap-4 mt-4 print:mt-0 relative">
                        <div className=" lg:sticky lg:top-0 form lg:w-[40%] p-4 bg-white print:hidden lg:max-h-screen lg:overflow-y-auto">
                            <FormProvider {...methods}>
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="grid grid-cols-1 md:grid-cols-1 gap-4"
                                >
                                    {/* Report Select - Always shown */}
                                    <DefaultSelect
                                        label={translate("Report") + ":"}
                                        nameField="ReportName"
                                        registerKey="ReportID"
                                        valueField="ReportID"
                                        options={[{ ReportID: 1, ReportName: `${translate('Individual')}` }, { ReportID: 2, ReportName: `${translate('All User')}` }]}
                                        type="number"
                                        require="This Field is required"
                                    />

                                    {/* Conditionally shown fields */}
                                    {shouldShowFields("SessionID") && (
                                        <DefaultSelect
                                            label={translate("Session") + " :"}
                                            nameField="SessionName"
                                            registerKey="SessionID"
                                            valueField="SessionID"
                                            options={sessionData ?? []}
                                            require="This Field is required"
                                            defaultSelect={false}
                                            unicode={true}
                                        />
                                    )}

                                    {shouldShowFields("ExamID") && (
                                        <DefaultSelect
                                            label={translate("Exam") + " :"}
                                            nameField="ExamName"
                                            registerKey="ExamID"
                                            valueField="ExamID"
                                            options={examNameData ?? []}
                                            require={"This Field is required"}
                                            unicode={true}
                                        />
                                    )}

                                    {shouldShowFields("ClassID") && (
                                        <DefaultSelect
                                            label={translate("Class") + " :"}
                                            nameField="ClassName"
                                            registerKey="ClassID"
                                            valueField="ClassID"
                                            options={classListData ?? []}
                                            require={"This Field is required"}
                                            unicode={true}
                                        />
                                    )}

                                    {shouldShowFields("SubClassID") && (
                                        <DefaultSelect
                                            label={translate("Sub Class") + " :"}
                                            nameField="SubClass"
                                            registerKey="SubClassID"
                                            valueField="SubClassID"
                                            options={subclassListData ?? []}
                                            require={"This Field is required"}
                                            unicode={true}
                                        />
                                    )}
                                    {/*  */}

                                    {shouldShowFields("RDID") && (
                                        <DefaultSelect
                                            label={translate("Residential") + " :"}
                                            nameField="ResidentialName"
                                            registerKey="RDID"
                                            valueField="RDID"
                                            options={residentialData ?? []}
                                            require={"This Field is required"}
                                            unicode={true}
                                        />
                                    )}

                                    {shouldShowFields("ExamVacationStatus") && (
                                        <div className="col-span-2">
                                            <ExamRoutingCheckbox
                                                label={translate("Exam Routine") + " :"}
                                                options={examVacationStatus}
                                                registerKey="IsActive"
                                                require={
                                                    selectedReportID === 1 || selectedReportID === 2
                                                        ? "This Field is required"
                                                        : false
                                                }
                                            />
                                        </div>
                                    )}
                                    {shouldShowFields("SizeStatus") && (
                                        <div className="">
                                            <ExamRoutingCheckbox
                                                label={translate("Size Status") + " :"}
                                                options={resultReportSizeStatus}
                                                registerKey="IsActive"
                                                require={
                                                    selectedReportID === 1 || selectedReportID === 2
                                                        ? "This Field is required"
                                                        : false
                                                }
                                            />
                                        </div>
                                    )}
                                    {shouldShowFields("UserCode") && (
                                        <div className="flex flex-col md:flex-row gap-4 ">
                                            <DefaultInput
                                                registerKey="UserCode"
                                                label={`${translate("User Code")}: `}
                                            />

                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button type="button" className="text-blue-400 underline" onClick={handleFormEditOption}>{translate("Form Content Settings")}</button>
                                        <Button type="submit" loading={isFetching}>
                                            {translate("Preview")}
                                        </Button>
                                        <Button onClick={() => window.print()} className="bg-yellow-600">
                                            {translate("Print")}
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </div>
                        <div className="w-full text-sm text-black bg-white">
                            {isFetching && (
                                <div className="p-2">{translate("Loading report...")}</div>
                            )}
                            {
                                reportData && Object.keys(reportData).length > 0 && (
                                    <div className="">
                                        <div className="w-full relative max-w-full overflow-x-auto print:hidden pt-5">
                                            <div className="max-w-[750px] mx-auto">
                                                <AdmissionFormWithResult reportData={reportData} query={queryParams} ref={formRef} />
                                            </div>
                                        </div>

                                        <div className="w-full relative max-w-full print_canvas">
                                            <div className="min-w-[750px]  mx-auto">
                                                <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>



                </div>

            </div>

        </div>
    );
};

export default AdmissionForm;
