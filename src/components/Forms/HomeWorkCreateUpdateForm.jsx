import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '../Button/Button';
import DefaultSelect from './DefaultSelect';
import Textarea from './Textarea';

import {
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import {
  useGetHomeWorkGroupsTeacherQuery,
  useGetHomeWorkQuery,
  useGetStudentsBySubClassIDQuery,
  usePostHomeWorkMutation,
  usePutHomeWorkMutation,
  usePostHomeWorkSingleMutation,
} from '../../features/student/studentQuerySlice';
import {
  useGetLoginTeacherInfoQuery,
  useGetTeachersInfoQuery,
} from '../../features/teachers/teachersSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SearchableMultiStudentSelect from './SearchableMultiStudentSelect';
import { toast } from 'react-toastify';

const HomeWorkCreateUpdateForm = ({ id }) => {
  const translate = useTranslate();

  // checked hole -> Session/SubClass/Subject/Teacher (single/alternate mode)
  // unchecked hole -> Group select (default mode)
  const [useSingleMode, setUseSingleMode] = useState(false);

  const methods = useForm({
    defaultValues: {
      GroupID: '',
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
  const GroupID = watch('GroupID');
  const SingleSubClassID = Number(watch('SubClassID'));
  const SingleSessionID = Number(watch('SessionID'));

  const initializedRef = useRef(false);

  const { data: homeWorks } = useGetHomeWorkQuery(id, { skip: !id });

  /* -------------------- GROUP MODE DATA -------------------- */
  const { data: groupsResponse } = useGetHomeWorkGroupsTeacherQuery({
    IsActive: true,
  });

  const groupsData = useMemo(
    () => groupsResponse?.data || groupsResponse || [],
    [groupsResponse]
  );

  const groupOptions = useMemo(
    () =>
      groupsData.map((g) => ({
        GroupID: g.GroupID,
        GroupName: g.GroupName,
      })),
    [groupsData]
  );

  const selectedGroup = useMemo(
    () => groupsData.find((g) => Number(g.GroupID) === Number(GroupID)),
    [groupsData, GroupID]
  );

  /* -------------------- SINGLE MODE DATA -------------------- */
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const { data: teacherData = [] } = useGetTeachersInfoQuery();
  const { data: loginTeacherData = [] } = useGetLoginTeacherInfoQuery();

  const { data: academicSubjectsData = [] } = useGetAcademicSubjectsQuery();

  const subjectOptions = useMemo(() => {
    if (!SingleSubClassID) return [];
    return academicSubjectsData
      .filter((s) => Number(s.SubClassID) === SingleSubClassID)
      .map((s) => ({
        SubjectID: s.SubjectID,
        SubjectName: s.SubjectName,
      }));
  }, [academicSubjectsData, SingleSubClassID]);

  // single mode default value auto set
  useEffect(() => {
    if (!useSingleMode) return;
    if (activeSession?.SessionID) {
      setValue('SessionID', activeSession.SessionID);
    }
    if (loginTeacherData?.[0]?.UserID) {
      setValue('UserID', loginTeacherData[0].UserID);
    }
  }, [useSingleMode, activeSession?.SessionID, loginTeacherData, setValue]);

  /* -------------------- EFFECTIVE SubClass / Session (studentOptions er jonno) -------------------- */
  const SubClassID = useSingleMode ? SingleSubClassID : selectedGroup?.SubClassID;
  const SessionID = useSingleMode ? SingleSessionID : selectedGroup?.SessionID;

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
  const [createHomeWorkSingle, { isLoading: isCreatingSingle }] =
    usePostHomeWorkSingleMutation();
  const [updateHomeWork, { isLoading: isUpdating }] = usePutHomeWorkMutation();

  /* -------------------- EDIT MODE INIT (Group based) -------------------- */
  useEffect(() => {
    if (!id || !homeWorks || !groupsData.length || initializedRef.current) return;

    const matchedGroup = groupsData.find(
      (g) =>
        Number(g.SessionID) === Number(homeWorks.SessionID) &&
        Number(g.SubClassID) === Number(homeWorks.SubClassID) &&
        Number(g.SubjectID) === Number(homeWorks.SubjectID) &&
        Number(g.TeacherID) === Number(homeWorks.UserID)
    );

    if (matchedGroup) {
      setUseSingleMode(false);
      setValue('GroupID', matchedGroup.GroupID);
    } else {
      // group khuje na paile single mode e purono data diye fill hobe
      setUseSingleMode(true);
      setValue('SessionID', homeWorks.SessionID);
      setValue('SubClassID', homeWorks.SubClassID);
      setValue('UserID', homeWorks.UserID);
      setTimeout(() => setValue('SubjectID', homeWorks.SubjectID), 10);
    }

    setValue('ClassWork', homeWorks.ClassWork || '');
    setValue('HomeWork', homeWorks.HomeWork || '');
    setValue('notDoneStudents', homeWorks.notDoneStudents || []);

    initializedRef.current = true;
  }, [id, homeWorks, groupsData, setValue]);

  /* -------------------- RESET FORM WHEN ID CHANGES -------------------- */
  useEffect(() => {
    if (!id) {
      reset({
        GroupID: '',
        SessionID: '',
        SubClassID: '',
        SubjectID: '',
        UserID: '',
        ClassWork: '',
        HomeWork: '',
        notDoneStudents: [],
      });
      setUseSingleMode(false);
      initializedRef.current = false;
    }
  }, [id, reset]);

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = useCallback(
    async (data) => {
      try {
        if (useSingleMode) {
          if (!data.SessionID || !data.SubClassID || !data.SubjectID || !data.UserID) {
            toast.error(translate('সব ফিল্ড পূরণ করুন'));
            return;
          }

          const submissionData = {
            SessionID: Number(data.SessionID),
            SubClassID: Number(data.SubClassID),
            SubjectID: Number(data.SubjectID),
            UserID: Number(data.UserID),
            ClassWork: data.ClassWork,
            HomeWork: data.HomeWork,
            notDoneStudents: Array.isArray(data.notDoneStudents)
              ? data.notDoneStudents.map((sid) => Number(sid))
              : [],
          };

          if (id) {
            await updateHomeWork({ id, ...submissionData }).unwrap();
            toast.success(translate('Updated successfully'));
          } else {
            await createHomeWorkSingle(submissionData).unwrap();
            toast.success(translate('Created successfully'));
          }
        } else {
          if (!data.GroupID) {
            toast.error(translate('Select a group'));
            return;
          }

          const submissionData = {
            GroupID: Number(data.GroupID),
            ClassWork: data.ClassWork,
            HomeWork: data.HomeWork,
            notDoneStudents: Array.isArray(data.notDoneStudents)
              ? data.notDoneStudents.map((sid) => Number(sid))
              : [],
          };

          if (id) {
            await updateHomeWork({ id, ...submissionData }).unwrap();
            toast.success(translate('Updated successfully'));
          } else {
            await createHomeWork(submissionData).unwrap();
            toast.success(translate('Created successfully'));
          }
        }

        hideModal();
      } catch (error) {
        let message = translate('Something went wrong');

        if (error?.data?.error) {
          message = error.data.error;
        } else if (error?.message) {
          message = error.message;
        }

        toast.error(message);
      }
    },
    [id, useSingleMode, updateHomeWork, createHomeWork, createHomeWorkSingle, translate]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              id="useSingleMode"
              checked={useSingleMode}
              disabled={!!id}
              onChange={(e) => setUseSingleMode(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="useSingleMode" className="text-sm cursor-pointer select-none">
              বিকল্প পদ্ধতি (সেশন/সাবক্লাস/বিষয়/শিক্ষক আলাদাভাবে নির্বাচন করুন)
            </label>
          </div>

          {!useSingleMode && (
            <div className="sm:col-span-2">
              <DefaultSelect
                label="Group"
                registerKey="GroupID"
                options={groupOptions}
                valueField="GroupID"
                nameField="GroupName"
                disabled={id ? true : false}
              />
            </div>
          )}

          {useSingleMode && (
            <>
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
                disabled={!SingleSubClassID}
              />

              <DefaultSelect
                label="Teacher"
                registerKey="UserID"
                options={teacherData ?? []}
                valueField="UserID"
                nameField="UserName"
              />
            </>
          )}

          <Textarea registerKey="ClassWork" label="Class Work" />

          <Textarea registerKey="HomeWork" label="Home Work" />

          {!id && (
            <div className="sm:col-span-2">
              <SearchableMultiStudentSelect
                label="যে শিক্ষার্থীর পড়া হয়নি:"
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
          loading={isCreating || isUpdating || isCreatingSingle}
          className="mt-4 bg-blue-500 text-white"
        >
          {id ? translate('Update') : translate('Create')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default HomeWorkCreateUpdateForm;
