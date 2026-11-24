import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import Counter from '../../components/Counter';
import { fetchWebsiteSettings } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import bnBijoy2Unicode from '../../utils/conveter';
import avaterImage from '/avatar.png';
const API_URL = import.meta.env.VITE_SERVER_URL;

const MadrashaHomePage = () => {
  const { schoolid } = useParams();
  const { schoolData, websiteSettings } = useSelector(
    (state) => state.studentResultPublicView
  );
  const dispatch = useDispatch();
  const [showAllWhyUs, setShowAllWhyUs] = useState(false);

  /* ---------------------------------------------------------------------
     Hero description height

     The about text can be very long, which used to push the text column
     far past the hero image. It is now cut at the height of the image
     (on desktop) or at a fixed number of lines (on mobile), and a
     "আরো পড়ুন" button appears only when the text really does not fit.
     The full text lives on its own page: /:schoolid/about
  --------------------------------------------------------------------- */
  const heroImageRef = useRef(null);
  const heroTextTopRef = useRef(null);
  const aboutTextRef = useRef(null);
  const [aboutMaxHeight, setAboutMaxHeight] = useState(null);
  const [aboutOverflowing, setAboutOverflowing] = useState(false);

  /* Banner slider — the settings page can now save several banner images */
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchWebsiteSettings({ schoolId: schoolid }));
  }, [dispatch]);

  const settingsObject = React.useMemo(() => {
    if (!websiteSettings || websiteSettings.length === 0) return {};
    return websiteSettings.reduce((acc, item) => {
      acc[item.FieldKey] = item.FieldValue;
      return acc;
    }, {});
  }, [websiteSettings]);

  console.log(settingsObject, 'settingsObject');

  /* Banner images for the hero slider.

     New setting: BannerImages — a JSON array of paths saved by the website
     settings page. The old single BannerImage is still used when the list is
     missing, so nothing breaks before the first save. */
  const bannerImages = React.useMemo(() => {
    const raw = settingsObject.BannerImages;
    let list = [];

    if (Array.isArray(raw)) {
      list = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        list = Array.isArray(parsed) ? parsed : [];
      } catch {
        list = raw.split(',').map((item) => item.trim());
      }
    }

    if (!list.length && settingsObject.BannerImage) {
      list = [settingsObject.BannerImage];
    }

    return list
      .filter(Boolean)
      .map((path) => `${API_URL}/public/${String(path).replace(/^\/+/, '')}`);
  }, [settingsObject.BannerImages, settingsObject.BannerImage]);

  const hasSlider = bannerImages.length > 1;

  const showBanner = (index) => {
    if (!bannerImages.length) return;
    const total = bannerImages.length;
    setBannerIndex(((index % total) + total) % total);
  };

  // Keep the index valid when the number of images changes
  useEffect(() => {
    setBannerIndex(0);
  }, [bannerImages.length]);

  // Auto play, stopped while the pointer is on the slider
  const [bannerPaused, setBannerPaused] = useState(false);

  useEffect(() => {
    if (bannerImages.length < 2 || bannerPaused) return;
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerImages.length, bannerPaused]);

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map((item) => item.trim());
      }
    }
    return [];
  }

  const shadeColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255))
        .toString(16)
        .slice(1)
    );
  };

  useEffect(() => {
    const root = document.documentElement;
    if (settingsObject.primary) {
      root.style.setProperty('--primary', settingsObject.primary);
    }
    if (settingsObject.secondary) {
      root.style.setProperty('--secondary', settingsObject.secondary);
    }
  }, [settingsObject.primary, settingsObject.secondary]);

  useEffect(() => {
    console.log(settingsObject);
  }, [settingsObject]);

  /* Measure the hero image and cut the description to the same height.
     Runs again on resize, when the image finishes loading and whenever
     the text itself changes. */
  useEffect(() => {
    const MOBILE_LINES = 7;        // lines kept when the layout is stacked
    const READ_MORE_SPACE = 64;    // room left for the "আরো পড়ুন" button

    const measure = () => {
      const paragraph = aboutTextRef.current;
      if (!paragraph) return;

      const isDesktop =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 1024px)').matches;

      let nextHeight;

      if (isDesktop && heroImageRef.current) {
        const imageHeight = heroImageRef.current.offsetHeight;
        const topHeight = heroTextTopRef.current
          ? heroTextTopRef.current.offsetHeight
          : 0;
        nextHeight = Math.max(imageHeight - topHeight - READ_MORE_SPACE, 140);
      } else {
        const lineHeight =
          parseFloat(window.getComputedStyle(paragraph).lineHeight) || 30;
        nextHeight = Math.round(lineHeight * MOBILE_LINES);
      }

      setAboutMaxHeight((prev) => (prev === nextHeight ? prev : nextHeight));

      // scrollHeight is the full text height, even while it is cut off
      const overflowing = paragraph.scrollHeight > nextHeight + 2;
      setAboutOverflowing((prev) => (prev === overflowing ? prev : overflowing));
    };

    measure();

    window.addEventListener('resize', measure);

    // the banner images load later and change the hero height
    const images = heroImageRef.current
      ? Array.from(heroImageRef.current.querySelectorAll('img'))
      : [];
    images.forEach((image) => {
      if (!image.complete) image.addEventListener('load', measure);
    });

    let observer;
    if (typeof ResizeObserver !== 'undefined' && heroImageRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(heroImageRef.current);
    }

    return () => {
      window.removeEventListener('resize', measure);
      images.forEach((image) => image.removeEventListener('load', measure));
      if (observer) observer.disconnect();
    };
  }, [
    settingsObject.aboutText,
    settingsObject.BannerImage,
    settingsObject.BannerImages,
    settingsObject.primaryHeading,
  ]);

  const bufferConveter = (bufferData) => {
    if (!bufferData) return '/logo.png';
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString('base64');
    return `data:image/png;base64,${base64String}`;
  };

  const whyUsItems = toArray(settingsObject.whyUsItems);
  const displayedWhyUsItems = showAllWhyUs ? whyUsItems : whyUsItems.slice(0, 4);

  return (
    <div className="madrasha-home-page min-h-screen bg-[#FCF9F2] selection:bg-amber-200 selection:text-amber-900">
      {/* ===== HERO (Original Gradient + Original Image Size) ===== */}
      <section
        className="relative overflow-hidden py-20 md:py-28 lg:py-36"
        style={{
          background: `linear-gradient(to bottom right, ${settingsObject.primary || '#1E4D2B'})`,
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ backgroundColor: settingsObject.primary || '#52B788' }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{ backgroundColor: settingsObject.secondary || '#D8F3DC' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" style={{ backgroundColor: settingsObject.primary || '#95D5B2' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Heading + institution badge are measured together, so the
                  description can take exactly the space that is left */}
              <div ref={heroTextTopRef} className="space-y-6">
                <h1 className="text-[28px] md:text-[40px] text-white leading-tight drop-shadow-2xl text-justify hyphens-auto">
                  {settingsObject?.primaryHeading}
                </h1>
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white">
                  {schoolData?.InstitutionName}
                </div>
              </div>

              <div className="mt-4">
                <p
                  ref={aboutTextRef}
                  className="text-[18px] md:text-[22px] text-[#D8F3DC] max-w-xl mx-auto lg:mx-0 leading-relaxed text-justify hyphens-auto"
                  style={{
                    maxHeight: aboutMaxHeight ? `${aboutMaxHeight}px` : undefined,
                    overflow: 'hidden',
                    // soft fade on the cut edge, works on any background
                    WebkitMaskImage: aboutOverflowing
                      ? 'linear-gradient(to bottom, #000 calc(100% - 2.2rem), transparent 100%)'
                      : undefined,
                    maskImage: aboutOverflowing
                      ? 'linear-gradient(to bottom, #000 calc(100% - 2.2rem), transparent 100%)'
                      : undefined,
                  }}
                >
                  {settingsObject.aboutText}
                </p>

                {aboutOverflowing && (
                  <Link
                    to={`/${schoolid}/about`}
                    className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-6 py-2.5 text-white text-[16px] md:text-[18px] font-bold transition-all duration-300 hover:bg-white/25 hover:scale-105"
                  >
                    আরো পড়ুন
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 12l14 0" />
                      <path d="M13 18l6 -6" />
                      <path d="M13 6l6 6" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Image slider */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <div
                className="relative w-full max-w-2xl lg:max-w-3xl"
                ref={heroImageRef}
                onMouseEnter={() => setBannerPaused(true)}
                onMouseLeave={() => setBannerPaused(false)}
              >
                <div
                  className="absolute -inset-4 rounded-3xl blur-lg opacity-40"
                  style={{
                    background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#4ade80'})`,
                  }}
                ></div>

                {/* The first image carries the height; the rest sit on top of
                    it and only the active one is visible, so changing slides
                    never makes the hero jump. */}
                <div className="relative rounded-[5px] overflow-hidden shadow-2xl border-4 border-white/20 up_down_animation">
                  {bannerImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`banner ${index + 1}`}
                      className={`${
                        index === 0 ? 'relative' : 'absolute inset-0 h-full'
                      } w-full object-cover transition-opacity duration-700 ${
                        index === bannerIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </div>

                {hasSlider && (
                  <>
                    <button
                      type="button"
                      onClick={() => showBanner(bannerIndex - 1)}
                      aria-label="previous banner"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M15 6l-6 6l6 6" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => showBanner(bannerIndex + 1)}
                      aria-label="next banner"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M9 6l6 6l-6 6" />
                      </svg>
                    </button>

                    <div className="relative z-10 flex items-center justify-center gap-2 mt-4">
                      {bannerImages.map((src, index) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => showBanner(index)}
                          aria-label={`banner ${index + 1}`}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            index === bannerIndex ? 'w-7' : 'w-2.5 bg-white/50 hover:bg-white/80'
                          }`}
                          style={
                            index === bannerIndex
                              ? { backgroundColor: settingsObject.secondary || '#fbbf24' }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="py-24 bg-[#FCF9F2] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
          style={{ backgroundColor: settingsObject.primary || '#bbf7d0' }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
          style={{ backgroundColor: settingsObject.secondary || '#fde68a' }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2
              className="text-[28px] md:text-[40px] font-extrabold"
              style={{ color: settingsObject.primary || '#1E4D2B' }}
            >
              {settingsObject.whyUsTitle}
            </h2>
            <div
              className="w-24 h-1.5 mx-auto mt-6 rounded-full"
              style={{
                background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#22c55e'})`,
              }}
            ></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Image Section with 3D Float Effect */}
            <div className="flex-1 w-full flex justify-center relative">
              <div className="relative w-full max-w-2xl lg:max-w-3xl group">
                <div
                  className="absolute -inset-4 rounded-[20px] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"
                  style={{
                    background: `linear-gradient(to top right, ${settingsObject.primary || '#4ade80'}, ${settingsObject.secondary || '#fcd34d'})`,
                  }}
                ></div>
                <div className="relative rounded-[20px] overflow-hidden border-8 border-white shadow-2xl transform transition duration-500 group-hover:scale-[1.02] group-hover:-rotate-1">
                  <img
                    src={`${API_URL}/public/${settingsObject.whyUsImage}`}
                    alt="Why Us"
                    className="w-full h-auto object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ backgroundColor: settingsObject.primary || '#1E4D2B' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* List Section with Show More */}
            <div className="flex-1 w-full">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayedWhyUsItems.map((item, idx) => (
                  <li
                    key={item.text}
                    className="group relative overflow-hidden rounded-2xl border border-transparent bg-white p-0.5 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {/* Animated gradient border */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"
                      style={{
                        background: `linear-gradient(to bottom right, ${settingsObject.secondary || '#fcd34d'}, ${settingsObject.primary || '#34d399'}, ${settingsObject.secondary || '#fcd34d'})`,
                      }}
                    />

                    <div className="relative flex flex-col gap-5 rounded-2xl bg-white p-6 h-full z-10">
                      {/* Icon with floating effect */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-sm transition-all duration-300"
                          style={{background: `linear-gradient(to bottom right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.secondary ? shadeColor(settingsObject.secondary, -20) : '#f97316'})`,
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l5 5l10 -10" />
                          </svg>
                        </span>
                      </div>

                      {/* Text */}
                      <p
                        className="font-bold text-xl lg:text-2xl transition-colors duration-300 leading-snug text-justify"
                        style={{
                          color: settingsObject.primary || '#065f46',
                          textAlignLast: 'justify',
                        }}
                      >
                        {item.text}
                      </p>

                      {/* Decorative line on hover */}
                      <div
                        className="mt-auto w-0 h-1 rounded-full group-hover:w-full transition-all duration-500"
                        style={{
                          background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#34d399'})`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {whyUsItems.length > 4 && !showAllWhyUs && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllWhyUs(true)}
                    className="group relative inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                    style={{ backgroundColor: settingsObject.primary || '#1E4D2B' }}
                  >
                    <span className="relative z-10">আরো দেখাও</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M12 5l0 14" />
                      <path d="M18 13l-6 6" />
                      <path d="M6 13l6 6" />
                    </svg>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${shadeColor(settingsObject.primary || '#1E4D2B', -20)}, ${settingsObject.primary || '#40916C'})`,
                      }}
                    ></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== COUNTER STATS ===== */}
      <div
        className="relative py-[100px] overflow-hidden bg-fixed"
        style={{
          backgroundImage: `url("${API_URL}/public/${settingsObject.BannerImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay with restored opacity – primary colour visible */}
        <div
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{
            background: `linear-gradient(to bottom, ${settingsObject.primary || '#0a2715'}B3, ${settingsObject.primary || '#123520'}99, ${settingsObject.primary || '#0a2715'}BF)`,
          }}
        ></div>
        <div className="relative z-10 container mx-auto px-4 lg:px-8 max-w-screen-2xl">
          <div className="text-center mb-16">
            <h2 className="text-[28px] md:text-[40px] font-extrabold text-white drop-shadow-lg">
              {settingsObject?.studentListHeading}
            </h2>
            <div
              className="w-24 h-2 mx-auto mt-5 rounded-full shadow-sm"
              style={{
                background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#22c55e'})`,
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 place-content-center">
            {/* মোট শিক্ষার্থী */}
            {settingsObject?.totalUser ? (
              <div className="group relative rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-[20px] transition-opacity duration-500"></div>
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-400/30 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                      <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M17 10h2a2 2 0 0 1 2 2v1" />
                      <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-wide">
                    <Counter end={settingsObject?.totalUser} duration={2000} />
                  </div>
                  <p className="text-[16px] md:text-[18px] text-green-100 font-medium">
                    মোট শিক্ষার্থী <br/>
                    <span
                      className="text-sm"
                      style={{ color: settingsObject.secondary || '#fcd34d' }}
                    >
                      ({bnBijoy2Unicode(String(settingsObject?.totalUser))} জন)
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            {/* এবছর শিক্ষার্থী */}
            {settingsObject?.active_session_student ? (
              <div className="group relative rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-400/30 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
                      <path d="M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-wide">
                    <Counter end={settingsObject?.active_session_student} duration={2000} />
                  </div>
                  <p className="text-[16px] md:text-[18px] text-green-100 font-medium">
                    এবছর শিক্ষার্থী <br/>
                    <span style={{ color: settingsObject.secondary || '#fcd34d' }} className="text-sm">
                      ({bnBijoy2Unicode(String(settingsObject?.active_session_student))} জন)
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            {/* মোট ছাত্র */}
            {settingsObject?.active_male_student ? (
              <div className="group relative rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-400/30 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-wide">
                    <Counter end={settingsObject?.active_male_student} duration={2000} />
                  </div>
                  <p className="text-[16px] md:text-[18px] text-green-100 font-medium">
                    মোট ছাত্র <br/>
                    <span style={{ color: settingsObject.secondary || '#fcd34d' }} className="text-sm">
                      ({bnBijoy2Unicode(String(settingsObject?.active_male_student))} জন)
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            {/* মোট ছাত্রী */}
            {settingsObject?.active_female_student ? (
              <div className="group relative rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-pink-500/20 rounded-full flex items-center justify-center mb-4 border border-pink-400/30 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-pink-300">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                      <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-wide">
                    <Counter end={settingsObject?.active_female_student} duration={2000} />
                  </div>
                  <p className="text-[16px] md:text-[18px] text-green-100 font-medium">
                    মোট ছাত্রী <br/>
                    <span style={{ color: settingsObject.secondary || '#fcd34d' }} className="text-sm">
                      ({bnBijoy2Unicode(String(settingsObject?.active_female_student))} জন)
                    </span>
                  </p>
                </div>
              </div>
            ) : null}

            {/* মোট শিক্ষক */}
            {settingsObject?.teacherUser ? (
              <div className="group relative rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 p-6 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2">
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-purple-400/30 group-hover:scale-110 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0v-1.5a9 9 0 1 0 -5.5 8.28" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 tracking-wide">
                    <Counter end={settingsObject?.teacherUser} duration={2000} />
                  </div>
                  <p className="text-[16px] md:text-[18px] text-green-100 font-medium">
                    মোট শিক্ষক <br/>
                    <span style={{ color: settingsObject.secondary || '#fcd34d' }} className="text-sm">
                      ({bnBijoy2Unicode(String(settingsObject?.teacherUser))} জন)
                    </span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ===== ACADEMIC SUBJECTS ===== */}
      <section className="relative py-20 md:py-28 bg-[#FCF9F2] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="flex items-center justify-center mb-4">
              {/* Book icon with dynamic secondary colours */}
              <div
                className="p-4 rounded-full shadow-sm"
                style={{
                  backgroundColor: `${settingsObject.secondary || '#f59e0b'}1A`, // 10% opacity
                  color: settingsObject.secondary || '#f59e0b',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
            
            <h2
              className="text-[36px] md:text-[50px] font-extrabold tracking-tight"
              style={{ color: settingsObject.primary || '#1E4D2B' }}
            >
              {settingsObject.subjectListTitle}
            </h2>
            
            <div
              className="w-24 h-2 mx-auto mt-5 rounded-full shadow-sm"
              style={{background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#22c55e'})`,}}
            ></div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {settingsObject?.accademicSubject?.map((subject) =>
              subject.AcademicSubjects?.length > 0 ? (
                <div
                  key={subject.SubClass}
                  className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-400 overflow-hidden border border-gray-100 hover:-translate-y-2"
                  style={{ borderColor: 'transparent' }} // will be overridden by hover
                >
                  {/* Card Header – dynamic primary gradient  */}
                  <div
                    className="relative py-7 px-6 overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom right, ${settingsObject.primary || '#1E4D2B'}, ${shadeColor(settingsObject.primary || '#1E4D2B', -20)})`,
                    }}
                  >
                    {/* Decorative faint book icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -right-4 -bottom-4 w-28 h-28 text-white opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    
                    <h3 className="relative z-10 text-[24px] md:text-[26px] font-bold text-white text-center tracking-wide">
                      {subject.SubClass}
                    </h3>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-7 md:p-9 flex-1 bg-white">
                    <ul className="space-y-5">
                      {subject.AcademicSubjects?.map((sub) => (
                        <li
                          key={sub.SubjectID}
                          className="text-[18px] md:text-[19px] text-gray-700 font-medium flex items-start gap-4 group/item transition-colors duration-200"
                          style={{ color: 'inherit' }}
                        >
                          {/* List item icon – dynamic secondary */}
                          <div
                            className="mt-0.5 p-2 rounded-md transition-colors"
                            style={{
                              backgroundColor: `${settingsObject.secondary || '#f59e0b'}1A`,
                              color: settingsObject.secondary || '#f59e0b',
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                            </svg>
                          </div>
                          <span
                            className="leading-snug"
                            style={{
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = settingsObject.primary || '#1E4D2B'}
                            onMouseLeave={(e) => e.currentTarget.style.color = ''}
                          >
                            {sub.SubjectName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* ===== TEACHERS ===== */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2
              className="text-[28px] md:text-[40px] font-bold"
              style={{ color: settingsObject.primary || '#1E4D2B' }}
            >
              {settingsObject.teacherListTitle}
            </h2>
            <div
              className="w-24 h-1.5 mx-auto mt-6 rounded-[4px]"
              style={{
                background: `linear-gradient(to right, ${settingsObject.secondary || '#fbbf24'}, ${settingsObject.primary || '#22c55e'})`,
              }}
            ></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {settingsObject?.teachers?.map((teacher, index) => {
              const imageData = teacher?.Image?.data || avaterImage;
              return (
                <div
                  key={teacher.UserID || index}
                  className="group bg-white rounded-[4px] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2"
                >
                  <div className="relative h-[320px] overflow-hidden">
                    <img
                      src={bufferConveter(imageData)}
                      alt={teacher.UserName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div
                      className="absolute bottom-0 w-full h-[80px] bg-no-repeat bg-cover"
                      style={{ backgroundImage: "url(/team-shape.ea006852.svg)", backgroundPosition: 'center' }}
                    ></div>
                  </div>
                  <div className="p-6 text-center bg-white">
                    <h3
                      className="text-[20px] font-bold mb-2"
                      style={{ color: settingsObject.primary || '#1E4D2B' }}
                    >
                      {teacher.UserName}
                    </h3>
                    <p className="text-[#aaa] mt-2">
                      {teacher.Designation}
                    </p>
                    <p className="text-[#aaa] mt-1">
                      মোবাইল নং. {teacher.Mobile1}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default MadrashaHomePage;
