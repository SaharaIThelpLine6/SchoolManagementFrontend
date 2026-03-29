import React, { useRef, useState } from 'react';
import Button from '../../components/Button/Button';
import AdmissionDynamicFormWithResult from '../students/reports/result-reports/AdmissionDynamicFormWithResult';
import useTranslate from '../../utils/Translate';
import Swal from 'sweetalert2';
import { usePostResultReportSettingsMutation } from '../../features/userReports/userReportsSlice';

const AdmissionFormContentEditModal = () => {

    const formRef = useRef();
      const [
        updateResultReport,
        { isLoading: resultReportUpdating, isError: resultReportUpdatingError, isSuccess: resultReportUpdateSuccess, data: resultReportUpdatingResponse },
      ] = usePostResultReportSettingsMutation();
    const handelFromEdit = async () => {
        console.log("start");
        
        const content = formRef.current?.getEditorContent();

        // console.log(content);

        try {

            const formData = new FormData();
            formData.append("Description1", content.Description1 || "");
            formData.append("Description2", content.Description2 || "");

            // Only append if it's an actual File object
            if (content.reportPadImage instanceof File) {
                formData.append("ReportPadImage", content.reportPadImage);
            } else if (content.templatePath) {
                formData.append("TemplatePath", content.templatePath);
            }


            console.log(formData);
            

            await updateResultReport(formData).unwrap();
            Swal.fire({
                icon: 'success',
                title: 'Auto-saved successfully',
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (err) {
            // Revert formData on error

            Swal.fire({
                icon: 'error',
                title: 'Auto-save failed',
                text: err?.data?.message || err?.message || 'Something went wrong!',
            });
        }
    };
    const translate  = useTranslate()
    return (
        <div className="modal-overlay">
            <AdmissionDynamicFormWithResult query={{
                report_id: 6,
                session_id: 4,
                subclass_id: 1,
                exam_id: 5
            }} ref={formRef} />
            <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                <Button onClick={handelFromEdit}>
                    {translate("Save")}
                </Button>
            </div>
        </div>
    );
};

export default AdmissionFormContentEditModal;