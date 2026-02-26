import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

import Button from '../Button/Button';
import DefaultSelect from './DefaultSelect';
import Textarea from './Textarea';

import {
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import {
  useGetHomeWorkQuery,
  useGetStudentsBySubClassIDQuery,
  usePostHomeWorkMutation,
  usePutHomeWorkMutation,
} from '../../features/student/studentQuerySlice';
import {
  useGetLoginTeacherInfoQuery,
  useGetTeachersInfoQuery,
} from '../../features/teachers/teachersSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SearchableMultiStudentSelect from './SearchableMultiStudentSelect';

const HomeWorkCreateUpdateForm = ({ id }) => {
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: '',
      SubClassID: '',
      SubjectID: '',
      UserID: '',
      ClassWork: '',
      HomeWork: '',
      notDoneStudents: [],
    },
  });

  const { reset, watch, setValue } = methods;
  const SubClassID = Number(watch('SubClassID'));
  const SessionID = Number(watch('SessionID'));
  const SubjectID = Number(watch('SubjectID'));

  const initializedRef = useRef(false);

  const { data: homeWorks } = useGetHomeWorkQuery(id, { skip: !id });
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const { data: teacherData = [] } = useGetTeachersInfoQuery();
  const { data: loginTeacherData = [] } = useGetLoginTeacherInfoQuery();

  const { data: academicSubjectsData = [] } = useGetAcademicSubjectsQuery();
  const { data: studentsBySubClassID = [] } = useGetStudentsBySubClassIDQuery(
    { SessionID, SubClassID },
    { skip: !SubClassID || !SessionID }
  );

  const studentOptions = useMemo(() => {
    return (studentsBySubClassID || []).map((item) => ({
      UserID: item.UserID,
      StudentName: item.User?.UserName + '-' + item.User?.UserCode,
    }));
  }, [studentsBySubClassID]);

  const [createHomeWork, { isLoading: isCreating }] = usePostHomeWorkMutation();
  const [updateHomeWork, { isLoading: isUpdating }] = usePutHomeWorkMutation();

  /* -------------------- SUBJECT OPTIONS -------------------- */
  const subjectOptions = useMemo(() => {
    if (!SubClassID) return [];

    return academicSubjectsData
      .filter((s) => Number(s.SubClassID) === SubClassID && SubClassID > 0)
      .map((s) => ({
        SubjectID: s.SubjectID,
        SubjectName: s.SubjectName,
      }));
  }, [academicSubjectsData, SubClassID]);

  /* -------------------- TEACHER OPTIONS & INITIAL VALUES -------------------- */
  useEffect(() => {
    if (activeSession?.SessionID) {
      setValue('SessionID', activeSession.SessionID);
    }
    if (loginTeacherData?.[0]?.UserID) {
      setValue('UserID', loginTeacherData[0].UserID);
    }
  }, [activeSession?.SessionID, loginTeacherData?.[0]?.UserID, setValue]);

  /* -------------------- EDIT MODE INIT -------------------- */
  useEffect(() => {
    if (!id || !homeWorks || initializedRef.current) return;

    // Check if all required data is available
    if (
      homeWorks.SessionID &&
      homeWorks.SubClassID &&
      homeWorks.UserID &&
      homeWorks.SubjectID
    ) {
      // Set initial values
      setValue('SessionID', homeWorks.SessionID);
      setValue('SubClassID', homeWorks.SubClassID);
      setValue('UserID', homeWorks.UserID);

      // Use a timeout to ensure subjectOptions are calculated
      const timeoutId = setTimeout(() => {
        setValue('SubjectID', homeWorks.SubjectID);
        setValue('ClassWork', homeWorks.ClassWork || '');
        setValue('HomeWork', homeWorks.HomeWork || '');
        setValue('notDoneStudents', homeWorks.notDoneStudents || []);

        initializedRef.current = true;
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [
    id,
    homeWorks?.SessionID,
    homeWorks?.SubClassID,
    homeWorks?.UserID,
    homeWorks?.SubjectID,
    homeWorks?.ClassWork,
    homeWorks?.HomeWork,
    homeWorks?.notDoneStudents,
    setValue,
  ]);

  /* -------------------- RESET FORM WHEN ID CHANGES -------------------- */
  useEffect(() => {
    if (!id) {
      reset({
        SessionID: activeSession?.SessionID || '',
        SubClassID: '',
        SubjectID: '',
        UserID: loginTeacherData?.[0]?.UserID || '',
        ClassWork: '',
        HomeWork: '',
        notDoneStudents: [],
      });
      initializedRef.current = false;
    }
  }, [id, activeSession?.SessionID, loginTeacherData?.[0]?.UserID, reset]);

  /* -------------------- HANDLE SUBJECT CHANGE WHEN SUBCLASS CHANGES IN EDIT MODE -------------------- */
  useEffect(() => {
    if (id && homeWorks && SubClassID && SubClassID !== homeWorks.SubClassID) {
      // If SubClassID changed in edit mode, reset SubjectID
      setValue('SubjectID', '');
    }
  }, [SubClassID, id, homeWorks?.SubClassID, setValue]);

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = useCallback(
    async (data) => {
      try {
        // Prepare the data with proper structure
        const submissionData = {
          ...data,
          SessionID: Number(data.SessionID),
          SubClassID: Number(data.SubClassID),
          SubjectID: Number(data.SubjectID),
          UserID: Number(data.UserID),
          notDoneStudents: Array.isArray(data.notDoneStudents)
            ? data.notDoneStudents.map((id) => Number(id))
            : [],
        };

        if (id) {
          await updateHomeWork({ id, ...submissionData }).unwrap();
          Swal.fire({
            icon: 'success',
            title: translate('Updated successfully'),
          });
        } else {
          await createHomeWork(submissionData).unwrap();
          Swal.fire({
            icon: 'success',
            title: translate('Created successfully'),
          });
        }
        hideModal();
      } catch (error) {
        let message = translate('Something went wrong');
        if (error?.data?.error) {
          message = error.data.error;
        } else if (error?.message) {
          message = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: message,
        });
      }
    },
    [id, updateHomeWork, createHomeWork, translate]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DefaultSelect
            label="Session"
            registerKey="SessionID"
            options={sessionData ?? []}
            valueField="SessionID"
            nameField="SessionName"
          />

          <DefaultSelect
            label="SubClass"
            registerKey="SubClassID"
            options={subClassData ?? []}
            valueField="SubClassID"
            nameField="SubClass"
            disabled={id ? true : false}
          />

          <DefaultSelect
            label="Subject"
            registerKey="SubjectID"
            options={subjectOptions ?? []}
            valueField="SubjectID"
            nameField="SubjectName"
            disabled={!SubClassID}
          />

          <DefaultSelect
            label="Teacher"
            registerKey="UserID"
            options={teacherData ?? []}
            valueField="UserID"
            nameField="UserName"
          />

          <Textarea registerKey="ClassWork" label="Class Work" />

          <Textarea registerKey="HomeWork" label="Home Work" />

          {!id && (
            <div className="sm:col-span-2">
              <SearchableMultiStudentSelect
                label="যে শিক্ষার্থীর পড়া হয়নি:"
                registerKey="notDoneStudents"
                options={studentOptions}
                valueField="UserID"
                nameField="StudentName"
                unicode
                disabled={!SubClassID || !SessionID}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          loading={isCreating || isUpdating}
          className="mt-4 bg-blue-500 text-white"
        >
          {id ? translate('Update') : translate('Create')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default HomeWorkCreateUpdateForm;
