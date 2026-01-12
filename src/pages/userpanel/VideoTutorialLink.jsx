import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import DefaultSearchInput from '../../components/Forms/DefaultSearchInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { useGetSessionUserPanelQuery, useGetVideoTutorialLinkUserPanelQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const VideoTutorialLink = () => {
  const translate = useTranslate();

  // ✅ form setup
  const methods = useForm({
    defaultValues: {
      search: '',
      SessionID: '',
    },
  });

  const { control, setValue } = methods;

  // ✅ WATCH FORM VALUES (IMPORTANT)
  const search = useWatch({ control, name: 'search' });
  const selectedSessionID = useWatch({ control, name: 'SessionID' });
  const {
    data: videoList = [],
    isLoading,
    isError,
  } = useGetVideoTutorialLinkUserPanelQuery({
    SessionID: selectedSessionID,
  });

  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  // console.log(sessionData, 'sessionData');
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);
  // ✅ Normalize for Bangla + English search
  const normalizeText = (text = '') =>
    text
      .toString()
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .toLowerCase();

  // ✅ Filter logic
  const filteredVideos = videoList?.videos?.filter((video) => {
    const matchesSearch = normalizeText(video.TutorialName).includes(
      normalizeText(search)
    );

    return matchesSearch;
  });
  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);
  useEffect(() => {
    if (videoList?.message) {
      Swal.fire({
        icon: 'info', // 'info', 'success', 'warning', 'error'
        title: 'বার্তা',
        text: videoList.message,
        confirmButtonText: 'ঠিক আছে',
      });
    }
  }, [videoList]);
  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">Error loading videos</div>
    );

  return (
    <FormProvider {...methods}>
      <div className="p-4 bg-gray-50 min-h-screen mb-20">
        <h1 className="text-xl font-bold mb-4 text-center">
          ভিডিও টিউটোরিয়াল
        </h1>

        {/* 🔍 Filters */}
        <div className="flex gap-3 mb-6">
          <DefaultSearchInput
            label={translate('Search')}
            registerKey="search"
            placeholder="Search..."
            unicode
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
          {/* <DefaultSelect
            label={translate('SubClass')}
            nameField="SubClass"
            registerKey="SubClassID"
            valueField="SubClassID"
            options={subClassData}
            defaultSelect={false}
            unicode
          /> */}
        </div>

        {/* 🎥 Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <div key={video.ID} className="bg-white p-4 rounded shadow">
                <p className="text-lg font-semibold mb-2">
                  {video.TutorialName}
                </p>

                <iframe
                  className="aspect-video w-full rounded"
                  src={`https://www.youtube.com/embed/${video.VideoID}`}
                  title={video.TutorialName}
                  allowFullScreen
                />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 col-span-full">
              No videos found
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default VideoTutorialLink;
