import { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Button from '../Button/Button';
import DefaultSelect from './DefaultSelect';

import {
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';

import { useGetSessionsQuery } from '../../features/session/sessionSlice';

import {
  useGetHomeWorkGroupByIdQuery,
  useGetHomeWorkGroupsQuery,
  usePostHomeWorkGroupMutation,
  useUpdateHomeWorkGroupMutation,
} from '../../features/student/studentQuerySlice';

import {
  useGetTeachersInfoQuery,
} from '../../features/teachers/teachersSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const HomeWorkGroupCreateUpdateForm = ({ id }) => {
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: '',
      TeacherID: '',
      // Array of { SubClassID, SubjectID } - one entry per checked subject
      Subjects: [],
    },
  });

  const {
    reset,
    watch,
    setValue,
    register,
    formState: { errors },
  } = methods;

  const selectedSubjects = watch('Subjects') || [];
  const SessionID = watch('SessionID');
  const TeacherID = watch('TeacherID');

  // =========================
  // API
  // =========================

  const {
    data: groupResponse,
    isLoading: isGroupLoading,
  } = useGetHomeWorkGroupByIdQuery(id, {
    skip: !id,
  });

  const groupData =
    groupResponse?.data || groupResponse;

  const { data: sessionData = [] } =
    useGetSessionsQuery();

  const { data: subClassData = [] } =
    useGetSubClassListQuery();

  const { data: teacherData = [] } =
    useGetTeachersInfoQuery();

  const {
    data: academicSubjectsData = [],
  } = useGetAcademicSubjectsQuery();

  const activeSession = sessionData?.find(
    (item) => item.SessionStatus === 1
  );

  // ⚠️ CHANGED: Existing groups are now fetched by SESSION ONLY
  // (TeacherID removed from the query). A Subject that has already
  // been assigned to ANY teacher in this session must be locked,
  // so it can never be assigned to a second teacher.
  const {
    data: existingGroupsResponse,
  } = useGetHomeWorkGroupsQuery(
    {
      SessionID,
      IsActive: true,
    },
    {
      skip: !SessionID,
    }
  );

  const existingGroupsData = useMemo(
    () =>
      existingGroupsResponse?.data ||
      existingGroupsResponse ||
      [],
    [existingGroupsResponse]
  );

  // =========================
  // Mutation
  // =========================

  const [
    createHomeWorkGroup,
    { isLoading: isCreating },
  ] = usePostHomeWorkGroupMutation();

  const [
    updateHomeWorkGroup,
    { isLoading: isUpdating },
  ] = useUpdateHomeWorkGroupMutation();

  // =========================
  // SubClass -> Subject Grouping
  // =========================

  const groupedSubjects = useMemo(() => {
    return subClassData.map((subClass) => ({
      SubClassID: subClass.SubClassID,
      SubClass: subClass.SubClass,
      subjects: academicSubjectsData.filter(
        (subject) =>
          Number(subject.SubClassID) ===
          Number(subClass.SubClassID)
      ),
    }));
  }, [
    subClassData,
    academicSubjectsData,
  ]);

  // Set of "SubClassID-SubjectID" already created for the current
  // Session, REGARDLESS of teacher (excluding the group being edited).
  // Also track which teacher owns each locked subject, so we can show
  // a helpful label (optional, used below).
  const existingSubjectMap = useMemo(() => {
    const map = new Map();

    existingGroupsData.forEach((group) => {
      const groupID = group.GroupID ?? group.id;

      // While editing, don't lock subjects that belong to this same
      // record - the user should still be able to see/keep them.
      if (id && Number(groupID) === Number(id)) {
        return;
      }

      const key = `${Number(group.SubClassID)}-${Number(
        group.SubjectID
      )}`;

      map.set(key, group);
    });

    return map;
  }, [existingGroupsData, id]);

  const isSubjectAlreadyCreated = useCallback(
    (subClassID, subjectID) =>
      existingSubjectMap.has(
        `${Number(subClassID)}-${Number(subjectID)}`
      ),
    [existingSubjectMap]
  );

  // Which teacher already owns this subject (for the small label)
  const getSubjectOwner = useCallback(
    (subClassID, subjectID) =>
      existingSubjectMap.get(
        `${Number(subClassID)}-${Number(subjectID)}`
      ),
    [existingSubjectMap]
  );

  // =========================
  // Default Session
  // =========================

  useEffect(() => {
    if (!id && activeSession?.SessionID) {
      setValue(
        'SessionID',
        activeSession.SessionID
      );
    }
  }, [
    id,
    activeSession?.SessionID,
    setValue,
  ]);

  // =========================
  // Edit Data
  // =========================

  useEffect(() => {
    if (!id || !groupData) return;

    const editSubjects =
      Array.isArray(groupData.Subjects) &&
        groupData.Subjects.length
        ? groupData.Subjects.map((item) => ({
          SubClassID: Number(item.SubClassID),
          SubjectID: Number(item.SubjectID),
        }))
        : groupData.SubClassID &&
          groupData.SubjectID
          ? [
            {
              SubClassID: Number(
                groupData.SubClassID
              ),
              SubjectID: Number(
                groupData.SubjectID
              ),
            },
          ]
          : [];

    reset({
      SessionID:
        groupData.SessionID || '',

      TeacherID:
        groupData.TeacherID || '',

      Subjects: editSubjects,
    });
  }, [
    id,
    groupData,
    reset,
  ]);

  // =========================
  // Reset Create Form
  // =========================

  useEffect(() => {
    if (!id) {
      reset({
        SessionID:
          activeSession?.SessionID || '',
        TeacherID: '',
        Subjects: [],
      });
    }
  }, [
    id,
    activeSession?.SessionID,
    reset,
  ]);

  // Session বদলালে (বা লক লিস্ট রিফ্রেশ হলে) আগে সিলেক্ট করা Subjects
  // গুলোর মধ্যে যেগুলো ইতিমধ্যে অন্য কোনো Teacher-এর জন্য create হয়ে
  // গেছে সেগুলো বাদ দিয়ে দাও (Teacher পরিবর্তনে আর প্রভাব পড়বে না,
  // কারণ লক এখন Session-ভিত্তিক, Teacher-ভিত্তিক নয়)
  useEffect(() => {
    if (!selectedSubjects.length) return;

    const filtered = selectedSubjects.filter(
      (item) =>
        !isSubjectAlreadyCreated(
          item.SubClassID,
          item.SubjectID
        )
    );

    if (filtered.length !== selectedSubjects.length) {
      setValue('Subjects', filtered, {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingSubjectMap]);

  // =========================
  // Checkbox toggle
  // =========================

  const isSubjectChecked = useCallback(
    (subClassID, subjectID) =>
      selectedSubjects.some(
        (item) =>
          Number(item.SubClassID) ===
          Number(subClassID) &&
          Number(item.SubjectID) ===
          Number(subjectID)
      ),
    [selectedSubjects]
  );

  const toggleSubject = useCallback(
    (subClassID, subjectID) => {
      // already created (by any teacher) subjects can't be toggled
      if (
        isSubjectAlreadyCreated(
          subClassID,
          subjectID
        )
      ) {
        return;
      }

      const exists = isSubjectChecked(
        subClassID,
        subjectID
      );

      const updated = exists
        ? selectedSubjects.filter(
          (item) =>
            !(
              Number(item.SubClassID) ===
              Number(subClassID) &&
              Number(item.SubjectID) ===
              Number(subjectID)
            )
        )
        : [
          ...selectedSubjects,
          {
            SubClassID: Number(subClassID),
            SubjectID: Number(subjectID),
          },
        ];

      setValue('Subjects', updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [
      isSubjectAlreadyCreated,
      isSubjectChecked,
      selectedSubjects,
      setValue,
    ]
  );

  // Select / clear all subjects of one subclass at once
  const toggleSubClassAll = useCallback(
    (subClassID, subjects) => {
      const selectableSubjects = subjects.filter(
        (s) =>
          !isSubjectAlreadyCreated(
            subClassID,
            s.SubjectID
          )
      );

      if (!selectableSubjects.length) return;

      const selectableSubjectIds =
        selectableSubjects.map((s) =>
          Number(s.SubjectID)
        );

      const allChecked = selectableSubjectIds.every(
        (subjectID) =>
          isSubjectChecked(
            subClassID,
            subjectID
          )
      );

      const withoutThisSubClass =
        selectedSubjects.filter(
          (item) =>
            Number(item.SubClassID) !==
            Number(subClassID)
        );

      const updated = allChecked
        ? withoutThisSubClass
        : [
          ...withoutThisSubClass,
          ...selectableSubjects.map((s) => ({
            SubClassID: Number(subClassID),
            SubjectID: Number(s.SubjectID),
          })),
        ];

      setValue('Subjects', updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [
      isSubjectAlreadyCreated,
      isSubjectChecked,
      selectedSubjects,
      setValue,
    ]
  );

  // =========================
  // Submit
  // =========================

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (!data.Subjects?.length) {
          toast.error(
            translate(
              'Select at least one subject'
            )
          );
          return;
        }

        // Client-side guard (final source of truth must still be the
        // backend - see notes below the code).
        const conflict = data.Subjects.find((item) =>
          isSubjectAlreadyCreated(
            item.SubClassID,
            item.SubjectID
          )
        );

        if (conflict) {
          toast.error(
            translate(
              'One of the selected subjects is already assigned to another teacher'
            )
          );
          return;
        }

        const submissionData = {
          SessionID:
            Number(data.SessionID),

          TeacherID:
            Number(data.TeacherID),

          // list of { SubClassID, SubjectID }
          Subjects: data.Subjects,
        };

        if (id) {
          await updateHomeWorkGroup({
            id,
            ...submissionData,
          }).unwrap();

          toast.success(
            translate('Updated successfully')
          );
        } else {
          await createHomeWorkGroup(
            submissionData
          ).unwrap();

          toast.success(
            translate('Created successfully')
          );
        }

        hideModal();

      } catch (error) {
        const message =
          error?.data?.error ||
          error?.message ||
          translate('Something went wrong');

        toast.error(message);
      }
    },
    [
      id,
      isSubjectAlreadyCreated,
      updateHomeWorkGroup,
      createHomeWorkGroup,
      translate,
    ]
  );

  // =========================
  // Loading
  // =========================

  if (id && isGroupLoading) {
    return (
      <div className="p-6 text-center">
        Loading...
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          onSubmit
        )}
        className="p-6"
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Session */}

          <DefaultSelect
            label="Session"
            registerKey="SessionID"
            options={sessionData}
            valueField="SessionID"
            nameField="SessionName"
          />

          {/* Teacher */}

          <DefaultSelect
            label="Teacher"
            registerKey="TeacherID"
            options={teacherData}
            valueField="UserID"
            nameField="UserName"
          />

        </div>

        {/* Hidden field just so RHF tracks validation state for Subjects */}
        <input
          type="hidden"
          {...register('Subjects', {
            validate: (value) =>
              (value && value.length > 0) ||
              'Select at least one subject',
          })}
        />

        {/* =========================
            Subject checkboxes grouped by SubClass
           ========================= */}

        <div className="mt-5">
          <label className="block mb-2 text-sm font-medium">
            {translate('Subjects')}
          </label>

          {!SessionID && (
            <p className="text-xs text-gray-400 mb-2">
              {translate(
                'Select a session first to see already created subjects'
              )}
            </p>
          )}

          {errors?.Subjects && (
            <p className="text-red-500 text-xs mb-2">
              {errors.Subjects.message}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {groupedSubjects.map((group) => {
                if (!group.subjects.length) {
                  return null;
                }

                const selectableSubjects =
                  group.subjects.filter(
                    (s) =>
                      !isSubjectAlreadyCreated(
                        group.SubClassID,
                        s.SubjectID
                      )
                  );

                const allChecked =
                  selectableSubjects.length > 0 &&
                  selectableSubjects.every((s) =>
                    isSubjectChecked(
                      group.SubClassID,
                      s.SubjectID
                    )
                  );

                return (
                  <div
                    key={group.SubClassID}
                    className="border-b border-gray-100 pb-4"
                  >
                    {/* SubClass */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleSubClassAll(
                          group.SubClassID,
                          group.subjects
                        )
                      }
                      disabled={
                        !selectableSubjects.length
                      }
                      className="flex items-center gap-2 mb-2 group disabled:cursor-not-allowed"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${allChecked
                          ? 'bg-blue-600'
                          : 'bg-blue-400'
                          }`}
                      />

                      <span className="text-blue-600 font-semibold text-base group-hover:underline">
                        {group.SubClass}
                      </span>
                    </button>

                    {/* Subjects */}

                    <div className="pl-6 space-y-2">
                      {group.subjects.map((subject) => {
                        const alreadyCreated =
                          isSubjectAlreadyCreated(
                            group.SubClassID,
                            subject.SubjectID
                          );

                        const owner = alreadyCreated
                          ? getSubjectOwner(
                            group.SubClassID,
                            subject.SubjectID
                          )
                          : null;

                        const checked =
                          alreadyCreated ||
                          isSubjectChecked(
                            group.SubClassID,
                            subject.SubjectID
                          );

                        return (
                          <label
                            key={subject.SubjectID}
                            className={`flex items-center gap-2 select-none ${alreadyCreated
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={
                                alreadyCreated
                              }
                              onChange={() =>
                                toggleSubject(
                                  group.SubClassID,
                                  subject.SubjectID
                                )
                              }
                              className={`w-4 h-4 rounded ${alreadyCreated
                                ? 'accent-green-600'
                                : 'accent-blue-600 border-gray-400'
                                }`}
                            />

                            <span className="text-sm">
                              {subject.SubjectName}
                            </span>

                            {alreadyCreated && (
                              <span className="text-[10px] text-green-600 font-medium">
                                ✓ {translate('Created')}
                                {owner?.Teacher?.UserName
                                  ? ` (${owner.Teacher.UserName})`
                                  : ''}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            </div>

            {!groupedSubjects.some(
              (g) => g.subjects.length
            ) && (
                <p className="text-sm text-gray-400">
                  {translate('No subjects found')}
                </p>
              )}
          </div>
        </div>

        <Button
          type="submit"
          loading={
            isCreating || isUpdating
          }
          className="mt-4 bg-blue-500 text-white"
        >
          {id
            ? translate('Update')
            : translate('Create')}
        </Button>

      </form>
    </FormProvider>
  );
};

export default HomeWorkGroupCreateUpdateForm;