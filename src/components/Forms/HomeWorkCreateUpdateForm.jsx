import { useEffect, useMemo, useRef } from 'react';
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
import { useGetTeacherInfoQuery } from '../../features/teachers/teachersSlice';

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
      TIID: '',
      ClassWork: '',
      HomeWork: '',
    },
  });

  const { reset, watch, setValue } = methods;
  const SubClassID = Number(watch('SubClassID'));
  const SessionID = Number(watch('SessionID'));

  const initializedRef = useRef(false);

  const { data: homeWorks } = useGetHomeWorkQuery(id, { skip: !id });
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const { data: teacherData = [] } = useGetTeacherInfoQuery();

  console.log(teacherData, 'teacherData');
  const { data: academicSubjectsData = [] } = useGetAcademicSubjectsQuery();
  const { data: studentsBySubClassID = [] } = useGetStudentsBySubClassIDQuery(
    { SessionID, SubClassID },
    { skip: !SubClassID }
  );
  console.log(studentsBySubClassID, '');
  const studentOptions = (studentsBySubClassID || []).map((item) => ({
    UserID: item.UserID,
    StudentName: item.User?.UserName + '-' + item.User?.UserCode,
  }));

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

  /* -------------------- TEACHER OPTIONS -------------------- */
  const teacherOptions = useMemo(
    () =>
      teacherData.map((t) => ({
        TIID: t.TIID,
        TeacherName: t.User?.UserName,
      })),
    [teacherData]
  );
  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);
  /* -------------------- EDIT MODE INIT -------------------- */
  useEffect(() => {
    if (!id || !homeWorks || initializedRef.current) return;

    // Check if all required data is available
    if (
      homeWorks.SessionID &&
      homeWorks.SubClassID &&
      homeWorks.TIID &&
      homeWorks.SubjectID
    ) {
      // First set SessionID, SubClassID, and TIID
      setValue('SessionID', homeWorks.SessionID);
      setValue('SubClassID', homeWorks.SubClassID);
      setValue('TIID', homeWorks.TIID);

      // Now we need to wait for subjectOptions to be ready
      // We'll use a timeout to allow React to update the state
      const timeoutId = setTimeout(() => {
        // Check if subjectOptions has the current subject
        const currentSubjectExists = subjectOptions.some(
          (subject) => Number(subject.SubjectID) === Number(homeWorks.SubjectID)
        );

        if (currentSubjectExists) {
          setValue('SubjectID', homeWorks.SubjectID);
        } else {
          // If subject not found, set to empty and show error
          setValue('SubjectID', '');
          console.warn('Subject not found in current SubClass');
        }

        // Set textareas
        setValue('ClassWork', homeWorks.ClassWork || '');
        setValue('HomeWork', homeWorks.HomeWork || '');

        initializedRef.current = true;
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [id, homeWorks, setValue, subjectOptions]);

  /* -------------------- EFFECT TO DEBUG -------------------- */
  // useEffect(() => {
  //   console.log('Current SubClassID:', SubClassID);
  //   console.log('Subject Options:', subjectOptions);
  //   console.log('Homeworks data:', homeWorks);
  // }, [SubClassID, subjectOptions, homeWorks]);

  /* -------------------- SUBMIT -------------------- */
const onSubmit = async (data) => {
  try {
    if (id) {
      await updateHomeWork({ id, ...data }).unwrap();
      Swal.fire({
        icon: 'success',
        title: translate('Updated successfully'),
      });
    } else {
      const res = await createHomeWork(data).unwrap();
      console.log(data, 'data');
      console.log(res, 'res');
      Swal.fire({
        icon: 'success',
        title: translate('Created successfully'),
      });
    }
    hideModal();
  } catch (error) {
    // Check if error has a data.message from backend
    let message = translate('Something went wrong'); // default
    if (error?.data?.error) {
      message = error.data.error; // use backend message
    } else if (error?.message) {
      message = error.message; // fallback
    }

    Swal.fire({
      icon: 'error',
      title: message,
    });
  }
};


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
            registerKey="TIID"
            options={teacherOptions ?? []}
            valueField="TIID"
            nameField="TeacherName"
          />


          <Textarea
            registerKey="ClassWork"
            label="Class Work"
            defaultValue={homeWorks?.ClassWork ?? ''}
          />
          <Textarea
            registerKey="HomeWork"
            label="Home Work"
            defaultValue={homeWorks?.HomeWork ?? ''}
          />

          <SearchableMultiStudentSelect
            label="যে শিক্ষার্থীর পড়া হয়নি:"
            registerKey="notDoneStudents"
            options={studentOptions} // full student list
            valueField="UserID"
            nameField="StudentName"
            unicode
          />
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
