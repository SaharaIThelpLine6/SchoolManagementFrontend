import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import Select from "react-select";
import Swal from 'sweetalert2';
import DefaultImageUpload from '../../components/Forms/DefaultImageUpload';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useGetWebSettingsQuery,
  usePostWebsitesettingsMutation,
} from '../../features/settings/settingsQuerySlice';
import useTranslate from '../../utils/Translate';
import Keyword from '../../components/Keywords/Keywords';
import DefaultSelect from '../../components/Forms/DefaultSelect';
const API_URL = import.meta.env.VITE_SERVER_URL;

/* ---------------------------------------------------------------------------
   Reusable picker for an ordered list of images (banner slider, gallery).

   Every entry is one of:
     - already saved -> { id, path, url }
     - newly picked  -> { id, file, url }   (url is an object URL preview)
--------------------------------------------------------------------------- */
function ImageListField({ title, hint, images, onAdd, onRemove, onMove, translate }) {
  const inputRef = useRef(null);

  return (
    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {title}
        </h3>

        <span className="text-sm font-medium text-gray-500">
          {images.length} {translate('image(s)')}
        </span>
      </div>

      {hint && <p className="text-sm text-gray-500 mb-4">{hint}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={image.url}
              alt={`${title} ${index + 1}`}
              className="w-full h-32 object-cover"
            />

            {/* position in the list */}
            <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {index + 1}
            </span>

            {/* not uploaded yet */}
            {image.file && (
              <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                {translate('New')}
              </span>
            )}

            <button
              type="button"
              onClick={() => onRemove(image.id)}
              title={translate('Delete image')}
              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow"
            >
              ✕
            </button>

            {/* reorder */}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                title={translate('Move left')}
                className="bg-white/90 hover:bg-white text-gray-700 w-6 h-6 rounded text-xs shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === images.length - 1}
                title={translate('Move right')}
                className="bg-white/90 hover:bg-white text-gray-700 w-6 h-6 rounded text-xs shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        ))}

        {/* add tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-32 rounded-lg border-2 border-dashed border-blue-300 bg-white/60 hover:bg-white hover:border-blue-500 text-blue-600 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-sm font-semibold">{translate('Add Image')}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          onAdd(Array.from(event.target.files || []));
          // clearing lets the same file be picked again right after removing it
          event.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}

export default function WebsiteSettings() {
  // Home page banner slider
  const [bannerImages, setBannerImages] = useState([]);
  // Photo gallery page
  const [galleryImages, setGalleryImages] = useState([]);

  const [aboutImg, setAboutImg] = useState(null);
  const [aboutUrl, setAboutUrl] = useState(null);

  const methods = useForm({
    defaultValues: {
      fblink: '',
      ylink: '',
      studentListHeading: '',
      primaryHeading: '',
      aboutText: '',
      whyUsTitle: '',
      subjectListTitle: '',
      teacherListTitle: '',
      galleryTitle: '',
      bannerImage: null,
      singleImage: null,
      whyUsList: [{ text: '' }],
      classList: [{ text: '', subjects: [] }],
      teachers: [],
      videoLinks: [],
      importantLinks: [{ title: '', link: '' }],
      primary: '#265d3e',
      secondary: '#fbbf24',
    },
  });
  const translate = useTranslate();
  const { reset, control, register, setValue, watch } = methods;

  // whyUsList field array
  const { fields, append, remove, replace, insert } = useFieldArray({
    control,
    name: 'whyUsList',
  });

  // classList field array
  const { fields: classSubjectFields, append: appendClassSubjectFields, remove: removeClassSubjectFields, replace: replaceClassSubjectFields, insert: insertClassSubjectFields } = useFieldArray({
    control,
    name: 'classList',
  });

  // videoLinks field array
  const { fields: videoFields, append: appendVideo, remove: removeVideo, replace: replaceVideo } = useFieldArray({
    control,
    name: 'videoLinks',
  });

  const {
    fields: importantLinkFields,
    append: appendImportantLink,
    remove: removeImportantLink,
    replace: replaceImportantLinks,
  } = useFieldArray({
    control,
    name: 'importantLinks',
  });

  const [sendWebsiteSettings] = usePostWebsitesettingsMutation();
  // ✅ refetch যোগ করা হয়েছে
  const { data, error, isLoading, refetch } = useGetWebSettingsQuery();
  const [teacherOptions, setTeacherOptions] = useState([]);

  const [classSubjectList, setClassSubjectList] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const watchedClassList = useWatch({
    control,
    name: 'classList'
  });

  // Helper: YouTube video ID extractor
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper: get preview JSX for video link
  const getVideoPreview = (url) => {
    if (!url) {
      return <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No video</div>;
    }

    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
      return (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`}
          alt="Video thumbnail"
          className="w-20 h-14 object-cover rounded"
        />
      );
    }

    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
    if (isDirectVideo) {
      return (
        <video className="w-20 h-14 object-cover rounded" muted>
          <source src={url} type={`video/${url.split('.').pop().toLowerCase()}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return <div className="w-20 h-14 bg-gray-200 rounded flex items-center justify-center text-xs">Unsupported</div>;
  };

  // Turns saved paths into list entries
  const toSavedEntries = (paths, prefix) =>
    paths.map((path, index) => ({
      id: `${prefix}-${index}-${path}`,
      path,
      url: `${API_URL}/public${path}`,
    }));

  const parseJsonList = (value) => {
    try {
      const list = Array.isArray(value) ? value : JSON.parse(value);
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  };

  // Load existing settings
  useEffect(() => {
    if (data) {
      console.log(data);

      // Image lists are collected during the loop and applied after it, so
      // the old single BannerImage can be used as a fallback.
      let savedBannerList = null;
      let savedGalleryList = null;
      let legacyBannerPath = null;

      data.forEach((item) => {
        const key = item.FieldKey;
        let value = item.FieldValue;
        if (key == 'whyUsItems') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = [{ text: '' }];
          }
          remove(0);
          replace(value);
        } else if (key == 'videoLinks') { // <-- নতুন ভিডিও লিংক লোড
          try {
            const videos = JSON.parse(value);
            replaceVideo(Array.isArray(videos) ? videos : []);
          } catch (e) {
            replaceVideo([]);
          }
        }
        else if (key == 'importantLinks') {
          try {
            const links = JSON.parse(value);
            replaceImportantLinks(Array.isArray(links) ? links : [{ title: '', link: '' }]);
          } catch (e) {
            replaceImportantLinks([{ title: '', link: '' }]);
          }
        }
        else if (key == 'BannerImages') {
          savedBannerList = parseJsonList(value);
        }
        else if (key == 'GalleryImages') {
          savedGalleryList = parseJsonList(value);
        }
        else {
          setValue(key, value);
        }
        if (key == 'BannerImage') {
          legacyBannerPath = value;
        }
        if (key == 'whyUsImage') {
          setAboutUrl(`${API_URL}/public${value}`);
        }

        if (key == 'teachers') {
          const teachersData = Array.isArray(value) ? value : [];
          const options = teachersData.map((t) => ({
            value: t.UserID,
            label: t.UserName,
          }));
          const activeTeachers = teachersData.filter((t) =>
            Number(t.OnlineAction) === 1
          );

          const teacherIds = activeTeachers.map((t) => t.UserID);

          setValue("teachers", teacherIds);
          setTeacherOptions(options);
        }
        if (key == 'subjectClass') {
          try {
            const classSubjectsData = Array.isArray(value) ? value : [];
            setClassSubjectList(classSubjectsData);

            /* The classes and subjects that are already published are marked
               with OnlineAction = 1 by the save route. They are read back
               here, otherwise the rows came up empty every time the page was
               opened even though the website was showing them. */
            const activeRows = classSubjectsData
              .filter((group) => Number(group.OnlineAction) === 1)
              .map((group) => ({
                // the select stores its value as a string
                text: String(group.SubClassID),
                subjects: (group.AcademicSubjects || [])
                  .filter((subject) => Number(subject.OnlineAction) === 1)
                  .map((subject) => subject.SubjectID),
              }));

            replaceClassSubjectFields(
              activeRows.length ? activeRows : [{ text: '', subjects: [] }]
            );
          } catch (error) {
            console.error('Error parsing subjectClass:', error);
            setClassSubjectList([]);
          }
        }
      });

      // New multi-image list wins; otherwise fall back to the single image
      const bannerPaths =
        savedBannerList && savedBannerList.length
          ? savedBannerList
          : legacyBannerPath
            ? [legacyBannerPath]
            : [];

      setBannerImages(toSavedEntries(bannerPaths, 'banner'));
      setGalleryImages(toSavedEntries(savedGalleryList || [], 'gallery'));
    }
  }, [data, setValue, append, replace, replaceVideo, replaceImportantLinks, replaceClassSubjectFields]);

  // Release the object URLs of the previews when leaving the page
  useEffect(() => {
    return () => {
      [...bannerImages, ...galleryImages].forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* One set of handlers for both lists — the setter decides which list. */
  const addImages = (setList, prefix) => (files) => {
    if (!files.length) return;

    const picked = files.map((file, index) => ({
      id: `${prefix}-new-${Date.now()}-${index}-${file.name}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setList((prev) => [...prev, ...picked]);
  };

  const removeImage = (setList) => (id) => {
    setList((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target?.file) URL.revokeObjectURL(target.url);
      return prev.filter((image) => image.id !== id);
    });
  };

  // Display order on the website follows this list
  const moveImage = (setList) => (index, step) => {
    setList((prev) => {
      const next = index + step;
      if (next < 0 || next >= prev.length) return prev;
      const list = [...prev];
      [list[index], list[next]] = [list[next], list[index]];
      return list;
    });
  };

  // Saved paths that stay + the newly picked files, under one field name each
  const appendImageList = (formData, images, existingField, filesField) => {
    formData.append(
      existingField,
      JSON.stringify(images.filter((image) => image.path).map((image) => image.path))
    );
    images
      .filter((image) => image.file)
      .forEach((image) => formData.append(filesField, image.file));
  };

  const onSubmit = async (data) => {
    const formattedSubjects = data.classList
      .filter(item => item.text && item.subjects.length > 0)
      .map(item => ({
        subClassId: Number(item.text),
        subjectIds: item.subjects
      }));

    const formData = new FormData();
    // Text fields
    formData.append('fblink', data.fblink);
    formData.append('ylink', data.ylink);
    formData.append('primaryHeading', data.primaryHeading);
    formData.append('studentListHeading', data.studentListHeading);
    formData.append('aboutText', data.aboutText);
    formData.append('whyUsTitle', data.whyUsTitle);
    formData.append('galleryTitle', data.galleryTitle || '');
    // JSON (stringify!)
    formData.append('whyUsList', JSON.stringify(data.whyUsList));
    formData.append('subjectListTitle', data.subjectListTitle);
    formData.append('teacherListTitle', data.teacherListTitle);

    // Colors
    formData.append('primary', data.primary);
    formData.append('secondary', data.secondary);

    // Image lists
    appendImageList(formData, bannerImages, 'existingBannerImages', 'bannerImages');
    appendImageList(formData, galleryImages, 'existingGalleryImages', 'galleryImages');

    // Images (only if selected)
    if (data.singleImage instanceof File) {
      formData.append('singleImage', data.singleImage);
    }
    formData.append("teachers", JSON.stringify(data.teachers));
    formData.append('subjectClasses', JSON.stringify(formattedSubjects));
    // Video Links
    formData.append('videoLinks', JSON.stringify(data.videoLinks));

    formData.append('importantLinks', JSON.stringify(data.importantLinks));

    try {
      await sendWebsiteSettings(formData).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।',
        timer: 2000,
        showConfirmButton: false,
      });
      // ✅ সফল সেভের পর ডাটা রিফেচ করুন
      refetch();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text:
          error?.data?.message || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  const toggleAll = (index, academicSubjects) => {
    const allIds = academicSubjects.map(s => s.SubjectID);
    const selected = watchedClassList?.[index]?.subjects || [];

    setValue(
      `classList.${index}.subjects`,
      selected.length === allIds.length ? [] : allIds
    );
  };

  const toggleOne = (index, subjectId) => {
    const selected = watchedClassList?.[index]?.subjects || [];

    setValue(
      `classList.${index}.subjects`,
      selected.includes(subjectId)
        ? selected.filter(id => id !== subjectId)
        : [...selected, subjectId]
    );
  };

  const isAllChecked = (index, academicSubjects) => {
    const selected = watchedClassList?.[index]?.subjects || [];
    return selected.length === academicSubjects.length && academicSubjects.length;
  };

  const getAcademicSubjects = (index) => {
    const selectedSubClassID = watchedClassList?.[index]?.text;
    if (!selectedSubClassID) return [];
    const found = classSubjectList.find(
      item => item.SubClassID === Number(selectedSubClassID)
    );

    return found?.AcademicSubjects || [];
  };

  return (
    <FormProvider {...methods}>
      <div className="website-settings">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="w-full flex justify-end items-center">
            <a
              href="https://www.youtube.com/watch?v=sdvhPC02B4E&t=153s"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg
    bg-red-50 border border-red-200 text-red-600
    hover:bg-red-600 hover:text-white hover:border-red-600
    shadow-sm hover:shadow-md transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
              </svg>

              <span className="text-sm font-semibold whitespace-nowrap">
                {translate("কিভাবে কাজ করবেন")}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
          <div className="mt-2">
            <DefaultInput
              registerKey="primaryHeading"
              type="text"
              label={translate("Primary Title")}
            />
          </div>

          {/* Color Palette Section */}
          <div className="mt-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{translate('Color Palette')}</h3>
              <button
                type="button"
                onClick={() => {
                  setValue('primary', '#265d3e');   // default primary
                  setValue('secondary', '#fbbf24'); // default secondary
                }}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
              >
                {translate("Reset Colors")}
              </button>
            </div>
            <div className="flex gap-6">
              {/* Primary Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">{translate('Primary Color')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('primary')}
                    className="w-10 h-10 cursor-pointer border-0 rounded bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={watch('primary') || '#265d3e'}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.charAt(0) !== '#') val = '#' + val;
                      // basic hex validation
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setValue('primary', val);
                      } else if (val.length <= 7) {
                        // allow partial input while typing
                        setValue('primary', val);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#265d3e"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">{translate('Secondary Color')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('secondary')}
                    className="w-10 h-10 cursor-pointer border-0 rounded bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={watch('secondary') || '#fbbf24'}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.charAt(0) !== '#') val = '#' + val;
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setValue('secondary', val);
                      } else if (val.length <= 7) {
                        setValue('secondary', val);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#fbbf24"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* End Color Palette Section */}

          <DefaultInput
            registerKey="aboutText"
            type="textarea"
            label={translate("About Section Text")}
          // require="About text is required"
          />

          {/* ---------- Banner images (home page slider) ---------- */}
          <ImageListField
            title={translate('Banner Images')}
            hint={translate('Add as many banner images as you need. They are shown as a slider on the home page, in the order below.')}
            images={bannerImages}
            onAdd={addImages(setBannerImages, 'banner')}
            onRemove={removeImage(setBannerImages)}
            onMove={moveImage(setBannerImages)}
            translate={translate}
          />

          <div className="mt-2">
            <DefaultInput
              registerKey="studentListHeading"
              type="text"
              label={translate("Student Stats Title")}
            />
          </div>

          <DefaultInput
            registerKey="whyUsTitle"
            type="text"
            label={translate("Why Choose Us Title")}
          />
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {translate('Upload About Image')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="singleImage"
                require="This is required"
                image={aboutImg}
                setPreviewUrl={setAboutUrl}
                previewUrl={aboutUrl}
              />
            </div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <DefaultInput
                defaultValue={field.text}
                registerKey={`whyUsList.${index}.text`}
                placeholder={`Point ${index + 1}`}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className="gap-4 flex items-center">
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            >
              {translate("Add")}
            </button>
          </div>

          {/* ---------- Photo gallery ---------- */}
          <div className="mt-4">
            <DefaultInput
              registerKey="galleryTitle"
              type="text"
              label={translate("Gallery Page Title")}
            />
          </div>

          <ImageListField
            title={translate('Gallery Images')}
            hint={translate('These photos are shown on the gallery page, in the order below.')}
            images={galleryImages}
            onAdd={addImages(setGalleryImages, 'gallery')}
            onRemove={removeImage(setGalleryImages)}
            onMove={moveImage(setGalleryImages)}
            translate={translate}
          />
          {/* ---------- Photo gallery end ---------- */}

          <div className="mt-2">
            <DefaultInput
              registerKey="subjectListTitle"
              type="text"
              label={translate("Subject List Title")}
            />
          </div>

          {classSubjectFields.map((field, index) => {
            const academicSubjects = getAcademicSubjects(index);

            return (
              <div key={field.id} className="flex flex-wrap md:flex-nowrap gap-6 items-start mb-4 mt-4">
                <div className="w-full md:w-1/2">
                  {classSubjectList?.length > 0 && (
                    <DefaultSelect
                      options={classSubjectList}
                      nameField="SubClass"
                      valueField="SubClassID"
                      registerKey={`classList.${index}.text`}
                    />
                  )}
                </div>

                {academicSubjects.length > 0 && (
                  <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default w-full md:w-1/2">
                    <table className="w-full text-xl text-left text-body">
                      <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                          <th className="px-4 py-2" width="50">
                            <input
                              type="checkbox"
                              checked={isAllChecked(index, academicSubjects)}
                              onChange={() => toggleAll(index, academicSubjects)}
                            />
                          </th>
                          <th>{translate("Subject Name")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {academicSubjects.map(subject => {
                          const selected =
                            watchedClassList?.[index]?.subjects?.includes(subject.SubjectID);
                          return (
                            <tr key={subject.SubjectID} className="border-b">
                              <td className="px-4">
                                <input
                                  type="checkbox"
                                  checked={selected || false}
                                  onChange={() => toggleOne(index, subject.SubjectID)}
                                />
                              </td>
                              <td>{subject.SubjectName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {classSubjectFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeClassSubjectFields(index)}
                    className="bg-red-500 text-white px-2 rounded h-8"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          <div className="mt-2">
            <div className="gap-4 flex items-center">
              <button
                type="button"
                onClick={() => appendClassSubjectFields({ text: '' })}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
              >
                {translate("Add")}
              </button>
            </div>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="teacherListTitle"
              type="text"
              label={translate("Teacher List Card Title")}
            />
          </div>
          <div className="mt-2 flex flex-wrap md:flex-nowrap gap-2">
            <DefaultInput
              registerKey="fblink"
              type="text"
              label={translate("Facebook Link")}
            />
            <DefaultInput
              registerKey="ylink"
              type="text"
              label={translate("Youtube Link")}
            />
          </div>
          <div className="mt-2">
            <label>{translate('Add Teacher Profile')}</label>

            <Controller
              name="teachers"
              control={control}
              defaultValue={[]}
              render={({ field }) => {
                const isAllChecked =
                  teacherOptions.length > 0 &&
                  teacherOptions.every(opt => field.value?.includes(opt.value));

                const toggleAll = () => {
                  if (isAllChecked) {
                    field.onChange([]);
                  } else {
                    field.onChange(teacherOptions.map(opt => opt.value));
                  }
                };

                const toggleOne = (id) => {
                  if (field.value?.includes(id)) {
                    field.onChange(field.value.filter(v => v !== id));
                  } else {
                    field.onChange([...field.value, id]);
                  }
                };

                return (
                  <>
                    <div className='relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default'>
                      <table className="w-full text-xl text-left rtl:text-right text-body">
                        <thead className='text-xl text-body bg-neutral-secondary-soft border-b rounded-base border-default'>
                          <tr>
                            <th width="50" height="20" className='px-4'>
                              <input
                                type="checkbox"
                                checked={isAllChecked}
                                onChange={toggleAll}
                                className='h-full w-full'
                              />
                            </th>
                            <th>{translate("Teacher Name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherOptions.map((teacher) => (
                            <tr className='bg-neutral-primary border-b border-default' key={teacher.value}>
                              <td width="50" height="20" className='px-4'>
                                <input
                                  type="checkbox"
                                  className='h-full w-full'
                                  checked={field.value?.includes(teacher.value)}
                                  onChange={() => toggleOne(teacher.value)}
                                />
                              </td>
                              <td>{teacher.label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              }}
            />
          </div>

          {/* ---------- নতুন Important Links সেকশন ---------- */}
          <div className="mt-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {translate("Board Result Links")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {translate("Add Board Result links with a title. You can add as many as you need.")}
            </p>

            {importantLinkFields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-3">
                {/* 🟢 Title */}
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    {...register(`importantLinks.${index}.title`)}
                    placeholder={translate("Title (e.g., Notice Board)")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 🟢 Link */}
                <div className="w-full md:flex-1">
                  <input
                    type="text"
                    {...register(`importantLinks.${index}.link`)}
                    placeholder={translate("Link (https://example.com)")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 🟢 Delete Button */}
                <button
                  type="button"
                  onClick={() => removeImportantLink(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                  title={translate("Delete link")}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendImportantLink({ title: '', link: '' })}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              {translate("Add Important Link")}
            </button>
          </div>
          {/* ---------- Important Links সেকশন শেষ ---------- */}

          {/* ---------- নতুন ভিডিও লিংক সেকশন ---------- */}
          <div className="mt-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {translate("Video Links")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {translate("Add as many video links as needed. A preview is shown to identify each.")}
            </p>

            {videoFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register(`videoLinks.${index}.url`)}
                    placeholder={translate("Enter video URL (YouTube, direct MP4, etc.)")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-20 h-14 flex-shrink-0">
                  {getVideoPreview(watch(`videoLinks.${index}.url`))}
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                  title={translate("Delete video")}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendVideo({ url: '' })}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              {translate("Add Video Link")}
            </button>
          </div>
          {/* ---------- ভিডিও লিংক সেকশন শেষ ---------- */}

          <button
            type="submit"
            className="btn btn-primary py-2 px-2 bg-cyan-600 text-white rounded-[4px] mt-4 text-center"
          >
            {translate("Save Settings")}
          </button>
        </form>
      </div>
    </FormProvider>
  );
}
