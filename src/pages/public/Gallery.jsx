import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchWebsiteSettings } from '../../features/studentResultPublicView/studentResultPublicViewSlice';

const API_URL = import.meta.env.VITE_SERVER_URL;

/* ---------------------------------------------------------------------------
   Photo gallery page.

   The photos come from the website settings page, saved under the
   GalleryImages key as a JSON array of paths, in display order.
--------------------------------------------------------------------------- */
const Gallery = () => {
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const { schoolData, websiteSettings } = useSelector(
    (state) => state.studentResultPublicView
  );

  // Index of the photo shown full screen; null means the viewer is closed
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    dispatch(fetchWebsiteSettings({ schoolId: schoolid }));
  }, [dispatch, schoolid]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const settingsObject = React.useMemo(() => {
    if (!websiteSettings || websiteSettings.length === 0) return {};
    return websiteSettings.reduce((acc, item) => {
      acc[item.FieldKey] = item.FieldValue;
      return acc;
    }, {});
  }, [websiteSettings]);

  const primary = settingsObject.primary || '#1E4D2B';
  const secondary = settingsObject.secondary || '#fbbf24';
  const title = settingsObject.galleryTitle || 'ফটো গ্যালারি';

  const photos = React.useMemo(() => {
    const raw = settingsObject.GalleryImages;
    let list = [];

    if (Array.isArray(raw)) {
      list = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        list = [];
      }
    }

    return list
      .filter(Boolean)
      .map((path) => `${API_URL}/public/${String(path).replace(/^\/+/, '')}`);
  }, [settingsObject.GalleryImages]);

  const showNext = useCallback(
    (step) => {
      setActiveIndex((prev) => {
        if (prev === null || !photos.length) return prev;
        const total = photos.length;
        return (prev + step + total) % total;
      });
    },
    [photos.length]
  );

  // Arrow keys move between photos, Escape closes the viewer
  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') showNext(1);
      if (event.key === 'ArrowLeft') showNext(-1);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, showNext]);

  return (
    <div className="min-h-screen bg-[#FCF9F2] selection:bg-amber-200 selection:text-amber-900">

      {/* ===== PAGE HEADER ===== */}
      <section
        className="relative overflow-hidden py-14 md:py-20"
        style={{ background: `linear-gradient(to bottom right, ${primary})` }}
      >
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ backgroundColor: secondary }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl relative z-10 text-center">
          <h1 className="text-[28px] md:text-[42px] font-extrabold text-white drop-shadow-lg">
            {title}
          </h1>

          {schoolData?.InstitutionName && (
            <div className="inline-block mt-4 px-5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[16px] md:text-[18px]">
              {schoolData.InstitutionName}
            </div>
          )}

          <div
            className="w-24 h-1.5 mx-auto mt-6 rounded-full"
            style={{ background: `linear-gradient(to right, ${secondary}, #ffffff)` }}
          ></div>
        </div>
      </section>

      {/* ===== PHOTO GRID ===== */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          {photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <p className="text-gray-500 text-[18px] font-medium">
                এখনো কোনো ছবি যোগ করা হয়নি
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {photos.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                >
                  <img
                    src={src}
                    alt={`${title} ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* zoom hint on hover */}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                      <path d="M21 21l-6 -6" />
                      <path d="M7 10l6 0" />
                      <path d="M10 7l0 6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to={`/${schoolid}`}
              className="group inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-bold text-[18px] shadow-xl transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: primary }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l14 0" />
                <path d="M5 12l6 6" />
                <path d="M5 12l6 -6" />
              </svg>
              হোমে ফিরে যান
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FULL SCREEN VIEWER ===== */}
      {activeIndex !== null && photos[activeIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveIndex(null)}
        >
          {/* close */}
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="close"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          {/* counter */}
          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-semibold">
            {activeIndex + 1} / {photos.length}
          </span>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="previous photo"
                onClick={(event) => { event.stopPropagation(); showNext(-1); }}
                className="absolute left-3 md:left-6 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 6l-6 6l6 6" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="next photo"
                onClick={(event) => { event.stopPropagation(); showNext(1); }}
                className="absolute right-3 md:right-6 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </button>
            </>
          )}

          <img
            src={photos[activeIndex]}
            alt={`${title} ${activeIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;