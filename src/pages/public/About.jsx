import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchWebsiteSettings } from '../../features/studentResultPublicView/studentResultPublicViewSlice';

/* ---------------------------------------------------------------------------
   Full "about" text page.
--------------------------------------------------------------------------- */
const About = () => {
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const { schoolData, websiteSettings } = useSelector(
    (state) => state.studentResultPublicView
  );

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
            {settingsObject?.primaryHeading}
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

      {/* ===== FULL DESCRIPTION ===== */}
      <section className="py-12 md:py-20">
        {/* এখানে max-w-4xl এর পরিবর্তে max-w-screen-2xl ব্যবহার করা হয়েছে */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-12">
            <p className="text-[18px] md:text-[22px] text-gray-700 leading-relaxed text-justify hyphens-auto whitespace-pre-line">
              {settingsObject.aboutText}
            </p>
          </div>

          <div className="text-center mt-10">
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
    </div>
  );
};

export default About;