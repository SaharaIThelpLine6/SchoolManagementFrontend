import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

import { useEffect } from 'react';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useCreateClassVideoMutation,
  useGetSingleClassVideoQuery,
  useGetSubClassListQuery,
  useUpdateClassVideoMutation,
} from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';

const ClassVideoCreateUpdate = ({ videoId }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset, setValue } = methods;
  const id = Number(videoId);

  const [createClassVideo, { isLoading: isCreating }] =
    useCreateClassVideoMutation();
  const [updateClassVideo, { isLoading: isUpdating }] =
    useUpdateClassVideoMutation();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const { data: singleClassVideo = [], isLoading: isVideoLoading } =
    useGetSingleClassVideoQuery(
      { id },
      { skip: !id } // ✅ Skip if videoId is falsy
    );

  const selectedVideo = singleClassVideo?.data;

  // Prefill form when editing
  useEffect(() => {
    if (selectedVideo) {
      setValue('VideoName', selectedVideo.TutorialName);
      setValue('VideoLink', selectedVideo.TutorialLink);
      setValue('SessionID', selectedVideo.SessionID);
      setValue('SubClassID', selectedVideo.SubClassID);
    }
  }, [videoId, selectedVideo, setValue]);

  const onSubmit = async (data) => {
    const finalData = {
      TutorialName: data.VideoName,
      TutorialLink: data.VideoLink,
      SessionID: data.SessionID || null,
      SubClassID: data.SubClassID || null,
    };

    try {
      if (videoId) {
        // EDIT
        await updateClassVideo({ id: videoId, ...finalData }).unwrap();
        Swal.fire({
          title: translate('Class video updated successfully!'),
          icon: 'success',
        });
      } else {
        // CREATE
        await createClassVideo(finalData).unwrap();
        Swal.fire({
          title: translate('Class video created successfully!'),
          icon: 'success',
        });
      }

      hideModal();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: translate('Failed to submit class video'),
        confirmButtonColor: '#3B82F6',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="font-SolaimanLipi p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <DefaultInput
            registerKey="VideoName"
            require={translate('Video name is required')}
            type="text"
            placeholder={translate('Enter video name') + ' ...'}
            label="Video Name"
          />

          <DefaultInput
            registerKey="VideoLink"
            require={translate('Video link is required')}
            type="text"
            placeholder={translate('Enter video link') + ' ...'}
            label="Video Link"
          />

          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            defaultSelect={false}
            unicode
          />
          <DefaultSelect
            label={translate('SubClass')}
            nameField="SubClass"
            registerKey="SubClassID"
            valueField="SubClassID"
            options={subClassData}
            defaultSelect={false}
            unicode
          />
        </div>

        <Button
          loading={isCreating || isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          type="submit"
        >
          {videoId ? translate('Update') : translate('Create')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ClassVideoCreateUpdate;
