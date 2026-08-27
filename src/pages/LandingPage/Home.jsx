import React, { useState, useEffect } from 'react';
import useInView from '../../hooks/LandingPageHooks/useInView';
import { NavLink } from 'react-router-dom';
import { useGetSoftwareDetailsQuery } from '../../features/userInfo/userInfoQuerySlice';

const img1 = 'LandingPage/assets/m1.png';
const img2 = 'LandingPage/assets/m2.png';
const img3 = 'LandingPage/assets/m3.png';
const img4 = 'LandingPage/assets/m4.png';
const img5 = 'LandingPage/assets/m5.png';
const img6 = 'LandingPage/assets/m6.png';
const img7 = 'LandingPage/assets/m7.png';
const img8 = 'LandingPage/assets/m8.png';
const img9 = 'LandingPage/assets/m9.png';
const img10 = 'LandingPage/assets/m10.png';
const img15 = 'LandingPage/assets/m15.png';
const img16 = 'LandingPage/assets/m16.png';
const img17 = 'LandingPage/assets/m17.png';
const img18 = 'LandingPage/assets/m18.png';
const img19 = 'LandingPage/assets/m19.png';
const img20 = 'LandingPage/assets/m20.png';
const img27 = 'LandingPage/assets/m27.jpeg';
const img29 = 'LandingPage/assets/m29.png';
const img30 = 'LandingPage/assets/m30.png';
const img31 = 'LandingPage/assets/m31.png';

{/* ========== প্ল্যাটফর্ম নির্বাচন icon ========== */}
const img21 = 'LandingPage/assets/soft/web.png'
const img22 = 'LandingPage/assets/soft/android.png'
const img23 = 'LandingPage/assets/soft/ios2.png'
const img28 = 'LandingPage/assets/soft/desktop.png';

const img24 = 'LandingPage/assets/about.png'
const img25 = 'LandingPage/assets/m13.png'
const img26 = 'LandingPage/assets/m12.png'

const API_URL = import.meta.env.VITE_SERVER_URL || ""; // 🌟 API URL

/* ---------- ছোট helper components ---------- */
const ModuleRow = ({ mod, idx }) => {
    // ইমেজ কন্টেন্টের মাঝামাঝি থাকবে এবং স্ক্রল হবে
    return (
        <div
            className={`flex flex-col md:items-center gap-8 md:gap-14 mb-0 last:mb-0 relative ${
                mod.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
            }`}
        >
            {/* Image column – scrolls naturally with content */}
            <div className="flex-1 min-w-0 w-full">
                <img
                    src={mod.image}
                    alt={mod.title}
                    className="w-full rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Text column */}
            <div className="flex-1 min-w-0 w-full md:py-4">
                <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-5 py-1.5 rounded text-sm font-semibold mb-4">
                    মডিউল {idx + 1}
                </span>

                <h2 className="flex items-center gap-2.5 text-2xl md:text-3xl font-bold text-gray-800 mb-5">
                    <span className="text-3xl">{mod.icon}</span> {mod.title}
                </h2>

                <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
                    {mod.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className={`${mod.checkColor || 'text-primary-dark'} font-bold`}>☛</span> {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ClientCard = ({ c, index }) => {
    const [ref, isInView] = useInView(0.1);
    return (
        <div
            ref={ref}
            className={`bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-md hover:-translate-y-1.5 hover:shadow-lg transition-all ${
                isInView ? 'animate-bounce-in' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{c.name}</h3>
            <p className="text-sm text-gray-800 font-medium">{c.location}</p>
        </div>
    );
};

const PricingCard = ({ children, index, featured }) => {
    const [ref, isInView] = useInView(0.15);
    return (
        <div
            ref={ref}
            className={`relative bg-white ${
                featured
                    ? 'border-2 border-primary shadow-[0_14px_34px_rgba(15,95,151,0.18)] scale-100 md:scale-105 hover:scale-100 md:hover:scale-105'
                    : 'border border-gray-200 shadow-md'
            } rounded-3xl p-8 hover:-translate-y-1.5 hover:shadow-lg transition-all ${
                isInView ? 'animate-bounce-in' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {children}
        </div>
    );
};

const GuideItem = ({ item, idx, openGuideIndex, setOpenGuideIndex }) => {
    const [ref, isInView] = useInView(0.1);
    return (
        <div
            ref={ref}
            className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition ${
                isInView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${idx * 70}ms` }}
        >
            <button
                onClick={() => setOpenGuideIndex(openGuideIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-gray-800 text-base cursor-pointer"
            >
                <span>{item.q}</span>
                <span
                    className={`text-primary-dark text-lg transform transition-transform duration-200 ${
                        openGuideIndex === idx ? 'rotate-180' : ''
                    }`}
                >
                    ⌄
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    openGuideIndex === idx ? 'max-h-60 pb-5' : 'max-h-0'
                }`}
            >
                <div className="px-5">
                    <p className="text-sm text-gray-800 leading-relaxed border-t border-gray-200 pt-4">{item.a}</p>
                </div>
            </div>
        </div>
    );
};

/* ---------- মূল Home কম্পোনেন্ট ---------- */
const Home = () => {
  const [openGuideIndex, setOpenGuideIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { data: softwareDetails } = useGetSoftwareDetailsQuery();

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const [aboutImgRef, aboutImgInView] = useInView(0.2);
  const [aboutTextRef, aboutTextInView] = useInView(0.2);
  const [modulesHeaderRef, modulesHeaderInView] = useInView(0.1);
  const [clientsHeaderRef, clientsHeaderInView] = useInView(0.1);
  const [pricingHeaderRef, pricingHeaderInView] = useInView(0.1);
  const [guideHeaderRef, guideHeaderInView] = useInView(0.1);
  const [subscribeRef, subscribeInView] = useInView(0.1);
  const [platformRef, platformInView] = useInView(0.1);

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative bg-gradient-to-br from-primary-navy via-primary-dark to-primary pt-28 pb-30 sm:pb-64 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between px-5 md:px-12 gap-8 md:gap-12 lg:gap-20 relative z-10">
          {/* Video Container */}
          <div className="flex-1 min-w-0 flex justify-center md:justify-end">
            <div className="w-full max-w-full md:max-w-[560px] aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/tswcAxCoEB0?si=MKRtYN1EkU68oOia"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 text-white text-center md:text-left">
            <h1 className="text-[27px] md:text-[50px] text-justify sm:text-left font-bold mb-1 leading-tight">বাংলাদেশের সর্বোচ্চ ব্যবহৃত মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার</h1>
            
            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-4 mt-4">
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">অনলাইন ভর্তি</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">স্বয়ংক্রিয় উপস্থিতি</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">অনলাইন ফি/পেমেন্ট</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">তাৎক্ষণিক এসএমএস</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">অনলাইন অনুদান</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">অনলাইনে পরীক্ষা ফলাফল</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">ছাত্রাবাস</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">পাঠাগার</span>
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">✓</span> 
                <span className="text-[14px] md:text-base whitespace-nowrap">প্রাতিষ্ঠানিক আয়-ব্যায়</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full leading-[0] z-10">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-[100px] sm:h-[130px] md:h-[180px] lg:h-[265px]">
            <path fill="rgba(255,255,255,0.4)" d="M0,200 C450,450 1000,-10 1440,70 L1440,320 L0,320 Z" />
            <path fill="#ffffff" d="M0,200 C450,450 1000,20 1440,100 L1440,320 L0,320 Z" />
          </svg>
        </div>
      </section>

      {/* ========== প্ল্যাটফর্ম নির্বাচন ========== */}
      <section ref={platformRef} className={`py-16 px-5 bg-gray-50 ${platformInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-5 py-1.5 rounded text-sm font-semibold mb-4">
            সব প্ল্যাটফর্মে
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            আমাদের সফটওয়্যার যেকোনো ডিভাইসে ব্যবহার করুন
          </h2>
          <p className="text-base text-gray-800 mb-10 max-w-2xl mx-auto">
            ওয়েব, অ্যান্ড্রয়েড, আইওএস ও ডেস্কটপ – আপনার পছন্দের প্ল্যাটফর্মে আমাদের সফটওয়্যার ব্যবহার করে প্রতিষ্ঠান পরিচালনা করুন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Desktop App */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <div className="relative w-16 h-16 mx-auto mb-4 overflow-visible">
                <img 
                  src={img28} 
                  alt="ডেস্কটপ অ্যাপ" 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain scale-150" 
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ডেস্কটপ অ্যাপ</h3>
              <p className="text-sm text-gray-800 mb-5">Windows ও macOS-এর জন্য ডাউনলোড করুন</p>
              <a
                href={softwareDetails?.UpSoftwareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary-dark to-primary text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition"
              >
                ডাউনলোড করুন
              </a>
            </div>

            {/* Web */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                <img src={img21} alt="ওয়েব অ্যাপ" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ওয়েব অ্যাপ</h3>
              <p className="text-sm text-gray-800 mb-5">যেকোনো ব্রাউজার থেকে লগইন করে ব্যবহার করুন</p>
              <a
                href='https://qmmsoft.com/login' target='_blank' rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary-dark to-primary text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition"
              >
                এখন ব্যবহার করুন
              </a>
            </div>

            {/* Android */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                <img src={img22} alt="অ্যান্ড্রয়েড অ্যাপ" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">অ্যান্ড্রয়েড অ্যাপ</h3>
              <p className="text-sm text-gray-800 mb-5">প্লে স্টোর থেকে ডাউনলোড করে ব্যবহার করুন</p>
              <a
                href="https://play.google.com/store/search?q=qmmsoft&c=apps&hl=en" target='_blank' rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary-dark to-primary text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition"
              >
                ডাউনলোড করুন
              </a>
            </div>

            {/* iOS */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <div className="relative w-16 h-16 mx-auto mb-4 overflow-visible">
                <img 
                  src={img23} 
                  alt="আইওএস অ্যাপ" 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain scale-150" 
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">আইওএস অ্যাপ</h3>
              <p className="text-sm text-gray-800 mb-5">অ্যাপ স্টোর থেকে ডাউনলোড করে ব্যবহার করুন</p>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary-dark to-primary text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition"
              >
                ডাউনলোড করুন
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ========== নতুন হেডিং সেকশন ========== */}
      <section className="py-12 px-5 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            সম্পূর্ণ সমাধান – এক প্ল্যাটফর্মে
          </h2>
          <p className="text-base text-gray-800 max-w-2xl mx-auto">
            সুবিধা, নিরাপত্তা, প্রযুক্তি ও মডিউল – সবকিছু এক জায়গায়
          </p>
        </div>
      </section>

      {/* ========== কেন ব্যবহার করবেন ========== */}
      <section className="py-5 px-5 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14 relative">
          {/* Image column – scrolls normally */}
          <div className="flex-1 min-w-0 w-full z-10">
            <img
              src={img24}
              alt="About"
              className="w-full rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Text column */}
          <div className="flex-1 min-w-0 md:py-4">
            <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-5 py-1.5 rounded text-sm font-semibold mb-4">
              কেন ব্যবহার করবেন
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-5">
              মাদ্রাসার যাবতীয় কাজ এক প্ল্যাটফর্মে
            </h2>
            <p className="text-1xl md:text-2xl text-gray-800 mb-5">
              ভর্তি থেকে ফলাফল, হিসাব-নিকাশ থেকে বোর্ডিং, লাইব্রেরি থেকে এসএমএস নোটিফিকেশন —
              মাদ্রাসার প্রতিটি কাজ এক জায়গা থেকে সহজ ও স্বয়ংক্রিয়ভাবে পরিচালনা করুন।
            </p>
            <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> এর মাধ্যমে শিক্ষার্থীর সকল তথ্য, ক্লাস/শ্রেণীর তথ্য, পড়া-লেখা, হিসাব-নিকাশ, বোর্ডিং/হোস্টেল-এর আয় ব্যয়, শিক্ষার্থী ভর্তি রেজিস্ট্রার, ফলাফল রেজিস্ট্রার, প্রবেশপত্র, সার্টিফিকেট, নম্বরপত্র, স্বাক্ষরপত্র ও ফলাফলসহ পরীক্ষার সকল কাজ, পাঠাগারের কাজসহ মাদ্রাসার যাবতীয় কাজ সহজ ও সুন্দর করে অটোমেটিকভাবে করা যাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> যারা কম্পিউটার চালাতে বেশী অভ্যস্ত নন ও বেশী অবগত নন তারা সহজে কম্পিউটারের কাজগুলো আঞ্জাম দিতে পারবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> একটি মাদ্রাসার ১০/১৫ জনের কাজ একাই একজন করতে পারবেন।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> কাজের প্রিন্টআউট খুবই সুন্দর ও পরিষ্কার দেখাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> বড় বড় খাতা ব্যবহার করে আলমিরা ভরপুর করার কোন প্রয়োজন নেই, ছোট ছোট ফাইলেই যথেষ্ট।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> কোন তথ্য এন্ট্রি দেয়ার সাথে সাথে উক্ত তথ্য যে রিপোর্টে যাওয়া দরকার সেখানে অটোমেটিক চলে যাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> একাধিক লোক এক সাথে ছাত্রদের বিষয়ের প্রাপ্ত নাম্বার এন্ট্রিসহ বিভিন্ন ধরনের কাজ শেয়ারের মাধ্যমে করতে পারবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> পরীক্ষার্থীর প্রাপ্ত নাম্বার এন্ট্রি দেয়ার সাথে সাথে বাংলা ও আরবী দুই ভাষায় অটোমেটিক (A+, A- ইত্যাদি Grading System) ফলাফল তৈরী হবে এবং Published করলে অনলাইনে শিক্ষার্থীরা ফলাফল দেখতে পাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> ছাত্রদের হাজিরার উপর ভিত্তি করে বোর্ডিং-এর খানা দেয়ার তালিকা তৈরী হবে, ফলে খানা অপচয় রোধ হবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> ছাত্রদের ভর্তি ফি, খানা ফি, মাসিক বেতন ও বকেয়া আদায়ের কাজ সহজে করা যাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> স্টাফদের বেতন, মাদ্রাসার আয় ব্যয় ও বোর্ডিংএর আয় ব্যয়সহ সকল প্রকার হিসাবের কাজ সহজে করা যাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> শিক্ষার্থীর সীট বন্টনসহ ছাত্রাবাসের সকল ব্যবস্থাপনা সুন্দর ও সহজলভ্যভাবে করা যায়।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> প্রতিষ্ঠানের পাঠাগারের কার্যক্রম যেমন: পাঠাগার থেকে কখন কে, কয়টি বই নিয়েছে — এধরনের সকল কার্যক্রম সহজে পরিচালনা করা যায়।
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========== প্রযুক্তিগত দিক ========== */}
      <section className="py-5 px-5 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14 relative">
          {/* Image column – scrolls normally */}
          <div className="flex-1 min-w-0 w-full z-10">
            <img
              src={img25}
              alt="About"
              className="w-full rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Text column */}
          <div className="flex-1 min-w-0 md:py-4">
            <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-5 py-1.5 rounded text-sm font-semibold mb-4">
              প্রযুক্তিগত দিক
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-5">
              ব্যবহার করতে যা যা প্রয়োজন
            </h2>
            <p className="text-1xl md:text-2xl text-gray-800 mb-5">
              🖥️ ব্যবহার করতে যা প্রয়োজন
            </p>
            <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> এক বা একাধিক ডেস্কটপ বা ল্যাপটপ পিসি (কম্পিউটার)।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> মোবাইলের মাধ্যমে ব্যবহার করা যাবে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> মোবাইলে প্রিন্ট করার জন্য বারকোড (POS) মিনি প্রিন্টার।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> রাউটার বা সুইচ ও ইন্টারনেট।
              </li>
            </ul>
            <p className="text-1xl md:text-2xl text-gray-800 mb-5">
              ⚙️ সফটওয়্যারের বৈশিষ্ট্য
            </p>
            <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> সফটওয়্যারটি সম্পূর্ণ ডাইনামিক, সুতরাং যেকোনোভাবে নিজেরাই কাস্টোমাইজ করে নিতে পারবেন।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> তিন ভাষায় ব্যবহার করা যাবে — আরবী, বাংলা ও ইংরেজীতে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> ব্যবহার-বান্ধব UI/UX।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> Desktop, Web, Mobile, Windows ও Apple সহ যেকোন Platform-এ ব্যবহার উপযোগী।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> JavaScript, Node.js, React.js, React Native, Vb.net ইত্যাদি টেকনোলজি ব্যবহার করা হয়েছে।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> সিকিউরিটি ও ব্যাকআপ সুবিধা।
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========== MODULES ========== */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div ref={modulesHeaderRef} className={`text-center mb-16 ${modulesHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">একটি প্রতিষ্ঠানের যাবতীয় কাজের সম্পূর্ণ সমাধান</h2>
            <p className="text-base text-gray-800">একটি প্রতিষ্ঠানের সকল প্রশাসনিক ও শিক্ষা কার্যক্রমের পূর্ণাঙ্গ সমাধান।</p>
          </div>

          <div className="flex flex-col gap-12 md:gap-20">
            {/* ===== মডিউল ১: শিক্ষার্থী ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={0}
              mod={{
                title: 'শিক্ষার্থী ব্যবস্থাপনা',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img15,
                reverse: false,
                items: [
                  'নতুন ভর্তি ও বিস্তারিত তথ্য সংরক্ষণ',
                  'ভর্তি ও ভর্তির ধরণ: আবাসিক/অনাবাসিক, নতুন/পুরাতন, আর্থিক অবস্থা (গরিব, অসহায়) সহ',
                  'অনলাইন ভর্তি আবেদন, ভর্তি ও ভর্তির রিসিট জেনারেশন',
                  'ভর্তির সাথে সাথে অভিভাবকের মোবাইলে স্বয়ংক্রিয় এসএমএস',
                  'শিক্ষার্থীদের প্রোফাইল তৈরী ও এডিট',
                  'প্রমোশন সিস্টেম (এক ক্লাস থেকে অন্য ক্লাসে উন্নীতকরণ)',
                  'শিক্ষাবর্ষ, ক্লাস, গ্রুপ, সেকশন, শিফট, উপস্থিতি, রেজাল্ট ও শিক্ষা অগ্রগতি ট্র্যাকিং',
                  'শিক্ষাবর্ষ, গ্রুপ, সেকশন, শিফট ভিত্তিক ফিল্টারিং',
                  'ভর্তি রেজিস্টার রিপোর্ট, ছবিসহ শিক্ষার্থীর তালিকা ও রেজিস্টার খাতা',
                  'সংক্ষিপ্ত ভর্তি পরিসংখ্যান রিপোর্ট (শ্রেণি, আবাসিক, অনাবাসিক, নতুন, পুরাতন, ছাত্র/ছাত্রী)',
                  'হাজিরা খাতা তৈরী (ছবিসহ) ও খাজিরা ব্যবস্থাপনা',
                  'অটোমেটিক আইডি কার্ড জেনারেশন ও কাস্টমাইজেশন সুবিধা',
                  'সার্টিফিকেট / প্রত্যয়নপত্র জেনারেশন',
                  'আখলাকী ও চারিত্রিক রিপোর্ট তৈরির ব্যবস্থা',
                  'এক্সেলে ডাটা এক্সপোর্ট ও ইমপোর্ট সুবিধা',
                  'ভর্তি ফরম কাস্টমাইজেশন ও পুরাতন শিক্ষার্থীর পরীক্ষার ফলাফল উল্লেখ',
                  'বই, বিষয় ও কিতাবের তালিকা ব্যবস্থাপনা',
                  'অভিভাবকের মোবাইল নাম্বার সম্পৃক্তকরণ (কার নাম্বার তা উল্লেখ সহ)',
                ],
              }}
            />

            {/* ===== মডিউল ২: দান ও অনুদান ===== */}
            <ModuleRow
              idx={1}
              mod={{
                title: 'দান ও অনুদান (Donation)',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img2,
                reverse: true,
                items: [
                  'দাতা তালিকা ও কন্ট্রিবিউশন ট্র্যাকিং',
                  'ডোনেশন পোর্টালের মাধ্যমে অনলাইন দান',
                  'দাতাদের জন্য অটোমেটিক ডোনেশন রিসিট',
                  'দাতাদের শ্রেণিবিভাগ (ব্যক্তি/প্রতিষ্ঠান/নিয়মিত দাতা)',
                  'দানের উদ্দেশ্য (সাধারণ তহবিল, এককালীন প্রকল্প, ইত্যাদি)',
                  'অটোমেটিক ডোনেশন রিসিট ও ট্যাক্স সার্টিফিকেট জেনারেশন',
                  'দানের হিসাব সংক্রান্ত রিপোর্ট (মাসিক/বার্ষিক)',
                  'এস এম এস এর মাধ্যমে ফি গ্রহন ভেরিফেকেশন ও বকেয়া তথ্য পাঠানো',
                ],
              }}
            />

            {/* ===== মডিউল ৩: শিক্ষক ও কর্মচারী ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={2}
              mod={{
                title: 'শিক্ষক ও কর্মচারী ব্যবস্থাপনা',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img3,
                reverse: false,
                items:[
                  'প্রোফাইল ম্যানেজমেন্ট ও তথ্য সংরক্ষণ (প্রোফাইল তৈরী ও এডিট সহ)',
                  'ক্লাস এসাইনমেন্ট ও শিক্ষকদের দৈনন্দিন কাজের রিপোর্ট ট্র্যাকিং (কি কাজ করেছেন, কতটুকু সম্পন্ন)',
                  'অফিস রিকুইজিশন, স্টোর ম্যানেজমেন্ট ও কর্মচারীদের কাজের অ্যাসাইনমেন্ট ও ফলোআপ',
                  'উপস্থিতি গ্রহণ ও বিস্তারিত রিপোর্ট',
                  'ছুটি ব্যবস্থাপনা (অ্যাপ্লাই, অনুমোদন, ব্যালেন্স)',
                  'শিক্ষকদের জন্য ক্লাস রুটিন ভিউ',
                  'পে-রোল ও বেতন স্লিপ জেনারেশন',
                  'কর্মচারীদের কর্মঘণ্টা ও ওভারটাইম ট্র্যাকিং',
                  'বিভিন্ন ডিজাইনের শিক্ষক ও স্টাফদের আইডি কার্ড অটোমেটিক জেনারেশন',
                ],
              }}
            />

            {/* ===== মডিউল ৪: একাডেমিক ও রুটিন ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={3}
              mod={{
                title: 'একাডেমিক ও রুটিন ব্যবস্থাপনা',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img4,
                reverse: true,
                items: [
                  'ডাইনামিক ক্লাস টাইম ম্যানেজমেন্ট',
                  'ড্র্যাগ অ্যান্ড ড্রপ রুটিন বিল্ডার',
                  'অটোমেটিক সময় ও শিক্ষক সিলেকশন',
                  'ডে-টু-ডে রুটিন কপি সুবিধা',
                  'পরীক্ষার সময়সূচী তৈরি ও প্রকাশ',
                  'শিক্ষক ও ক্লাসরুমের কনফ্লিক্ট চেকার',
                  'সাপ্তাহিক/মাসিক রুটিন প্রিন্ট অপশন',
                  'শিক্ষার্থীদের জন্য ব্যক্তিগত রুটিন ডাউনলোড',
                ],
              }}
            />

            {/* ===== মডিউল ৫: হিসাব/অ্যাকাউন্টিং ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={4}
              mod={{
                title: 'হিসাব ও অ্যাকাউন্টিং ব্যবস্থাপনা',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img1, 
                reverse: false,
                items: [
                  'দৈনিক আয়-ব্যয় এন্ট্রি ও ট্র্যাকিং',
                  'মাসিক ও বার্ষিক আর্থিক প্রতিবেদন তৈরী',
                  'বাজেট ব্যবস্থাপনা ও পরিকল্পনা',
                  'বিভিন্ন খাতভিত্তিক আয়-ব্যয় বিশ্লেষণ',
                  'অটোমেটিক ব্যালেন্স শিট জেনারেশন',
                  'লেজার ও জাবেদা সংরক্ষণ এবং প্রিন্ট',
                  'হিসাবের জন্য পিডিএফ/এক্সেল রিপোর্ট ডাউনলোড',
                ],
              }}
            />

            {/* ===== মডিউল ৬: পাঠাগার (লাইব্রেরি) ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={5}
              mod={{
                title: 'পাঠাগার (লাইব্রেরি) ব্যবস্থাপনা',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img19, 
                reverse: true,
                items: [
                  'বই যোগ, এডিট ও ডিলিট সুবিধা',
                  'বই ইস্যু ও রিটার্ন ট্র্যাকিং',
                  'নির্ধারিত তারিখ অতিক্রম করলে নোটিফিকেশন',
                  'বইয়ের ক্যাটাগরি ও শাখাভিত্তিক তালিকা',
                  'শিক্ষার্থী ও শিক্ষকদের ইস্যু হিস্টোরি',
                  'লাইব্রেরি কার্ড জেনারেশন',
                  'বইয়ের প্রাপ্যতা স্ট্যাটাস চেক',
                ],
              }}
            />

            {/* ===== মডিউল ৭: হোস্টেল/বোর্ডিং ব্যবস্থাপনা ===== */}
            <ModuleRow
              idx={6}
              mod={{
                title: 'হোস্টেল ও বোর্ডিং ব্যবস্থাপনা',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img20, 
                reverse: false,
                items: [
                  'রুম ও সীট বরাদ্দ ব্যবস্থাপনা',
                  'হোস্টেল ফি আদায় ও ট্র্যাকিং',
                  'খানা ও খাবারের ব্যবস্থাপনা (মেনু প্ল্যান)',
                  'হাজিরার ভিত্তিতে খাবার তালিকা তৈরী',
                  'হোস্টেলের আয়-ব্যয় হিসাব',
                  'হোস্টেলের ছাত্রদের প্রোফাইল ও অভিভাবক তথ্য',
                  'অভিভাবকদের সাথে যোগাযোগ ব্যবস্থা',
                ],
              }}
            />

            {/* ===== মডিউল ৮: এসএমএস ও নোটিফিকেশন সিস্টেম ===== */}
            <ModuleRow
              idx={7}
              mod={{
                title: 'এসএমএস ও নোটিফিকেশন সিস্টেম',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img16, 
                reverse: true,
                items: [
                  'ভর্তির সাথে সাথে অভিভাবককে স্বয়ংক্রিয় এসএমএস',
                  'উপস্থিতি ও অনুপস্থিতির নোটিফিকেশন',
                  'পরীক্ষার ফলাফল এসএমএসের মাধ্যমে জানানো',
                  'বেতন ও ফি আদায়ের রিসিট এসএমএস',
                  'কাস্টম এসএমএস টেমপ্লেট তৈরি',
                  'গ্রুপভিত্তিক এসএমএস (শ্রেণি/বিভাগ অনুযায়ী)',
                  'ইমেইল ও পুশ নোটিফিকেশন সুবিধা',
                  'বই ইস্যু/রিটার্ন নোটিফিকেশন',
                ],
              }}
            />

            {/* ===== মডিউল ৯: অনলাইন পরীক্ষা ও ফলাফল পোর্টাল ===== */}
            <ModuleRow
              idx={8}
              mod={{
                title: 'অনলাইন পরীক্ষা ও ফলাফল পোর্টাল',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img17, 
                reverse: false,
                items: [
                  'অনলাইনে পরীক্ষা গ্রহণ ও মূল্যায়ন',
                  'স্বয়ংক্রিয় গ্রেডিং (বাংলা ও আরবি ভাষায়)',
                  'পরীক্ষার সময়সীমা ও টাইমার সেটিং',
                  'শিক্ষার্থীদের জন্য ফলাফল ডাউনলোড',
                  'পরীক্ষার পরিসংখ্যান ও বিশ্লেষণ রিপোর্ট',
                  'পাবলিশ করলে শিক্ষার্থীরা অনলাইনে ফলাফল দেখতে পায়',
                  'রেজাল্ট কার্ড ও মার্কশিট জেনারেশন',
                ],
              }}
            />

            {/* ===== মডিউল ১০: শিক্ষার্থীর অভিভাবক প্যানেল ===== */}
            <ModuleRow
              idx={9}
              mod={{
                title: 'শিক্ষার্থীর অভিভাবক প্যানেল',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img27, 
                reverse: true,
                items: [
                  'সন্তানের একাডেমিক অগ্রগতি ও রেজাল্ট দেখা',
                  'উপস্থিতি ও অনুপস্থিতির বিস্তারিত রিপোর্ট',
                  'মাসিক বেতন, ফি ও বকেয়া পরিস্থিতি দেখতে পারা',
                  'অনলাইনে ফি পেমেন্ট করার সুবিধা',
                  'ভর্তি ও পরীক্ষার সার্টিফিকেট ডাউনলোড',
                  'সন্তানের ক্লাস রুটিন ও পরীক্ষার সময়সূচী দেখা',
                  'শিক্ষকদের সাথে সরাসরি যোগাযোগের ব্যবস্থা',
                  'নোটিশ, এসএমএস ও ইমেইল নোটিফিকেশন প্রাপ্তি',
                  'সন্তানের আখলাকী ও চারিত্রিক রিপোর্ট দেখা',
                  'একাধিক সন্তানের তথ্য একসাথে দেখার সুবিধা',
                  'অভিভাবক প্রোফাইল আপডেট ও পাসওয়ার্ড পরিবর্তন',
                  'হোস্টেল/বোর্ডিং-এর খরচ ও খাবারের তথ্য দেখা',
                ],
              }}
            />

            {/* ===== মডিউল ১১: শিক্ষার্থী হাজিরা (হাজিরা মেশিন দ্বারা) ===== */}
            <ModuleRow
              idx={10}
              mod={{
                title: 'শিক্ষার্থী হাজিরা (হাজিরা মেশিন দ্বারা)',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img29,
                reverse: false,
                items: [
                  'হাজিরা মেশিনের সাথে ইন্টিগ্রেশন (বায়োমেট্রিক/আরএফআইডি)',
                  'স্বয়ংক্রিয়ভাবে শিক্ষার্থীর উপস্থিতি রেকর্ড',
                  'প্রতিদিনের হাজিরার রিপোর্ট তৈরী',
                  'মাসিক ও বার্ষিক উপস্থিতি বিশ্লেষণ',
                  'অনুপস্থিত শিক্ষার্থীদের স্বয়ংক্রিয় এসএমএস',
                  'ক্লাসভিত্তিক হাজিরার পরিসংখ্যান',
                  'হাজিরা মেশিনের ডাটা সিঙ্ক ও ব্যাকআপ',
                  'হাজিরা সংশোধন ও ম্যানুয়াল এন্ট্রি সুবিধা',
                ],
              }}
            />

            {/* ===== মডিউল ১২: শিক্ষার্থী হাজিরা (হাজিরা মেশিন ব্যতীত) ===== */}
            <ModuleRow
              idx={11}
              mod={{
                title: 'শিক্ষার্থী হাজিরা (হাজিরা মেশিন ব্যতীত)',
                border: 'border-primary',
                checkColor: 'text-primary',
                image: img30,
                reverse: true,
                items: [
                  'ম্যানুয়ালি হাজিরা গ্রহণ ও এন্ট্রি',
                  'ছবিসহ হাজিরা খাতা তৈরী ও প্রিন্ট',
                  'এক্সেল/সিএসভি ফাইল থেকে হাজিরা ইমপোর্ট',
                  'শ্রেণি ও বিভাগভিত্তিক হাজিরা ফিল্টার',
                  'অনুপস্থিত শিক্ষার্থীদের তালিকা তৈরী',
                  'মাসিক উপস্থিতি রিপোর্ট তৈরী',
                  'হাজিরা সংশোধন ও আপডেটের ব্যবস্থা',
                  'অভিভাবকদের কাছে হাজিরার রিপোর্ট পাঠানো',
                ],
              }}
            />

            {/* ===== মডিউল ১৩: মতামত ও পরামর্শ ===== */}
            <ModuleRow
              idx={12}
              mod={{
                title: 'মতামত ও পরামর্শ',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img31,
                reverse: false,
                items: [
                  'শিক্ষার্থী, শিক্ষক ও অভিভাবকদের জন্য মতামত ফরম',
                  'অনলাইনে মতামত ও পরামর্শ জমা দেওয়ার ব্যবস্থা',
                  'মতামতের ভিত্তিতে রিপোর্ট তৈরী',
                  'মতামতের ক্যাটাগরি ও গুরুত্ব নির্ধারণ',
                  'প্রতিষ্ঠানের উন্নয়নে মতামত বিশ্লেষণ',
                  'পরামর্শের ভিত্তিতে সিদ্ধান্ত গ্রহণ ও ফলোআপ',
                  'মতামতের ইতিহাস সংরক্ষণ ও ট্র্যাকিং',
                  'গোপনীয় মতামত দেওয়ার সুবিধা',
                  'প্রশাসনের পক্ষ থেকে মতামতের উত্তর প্রদান',
                ],
              }}
            />

            {/* ===== মডিউল ১৪: সেটিংস ও কনফিগারেশন ===== */}
            <ModuleRow
              idx={13}
              mod={{
                title: 'সেটিংস ও কনফিগারেশন',
                border: 'border-primary-dark',
                checkColor: 'text-primary-dark',
                image: img18, 
                reverse: true,
                items: [
                  'প্রতিষ্ঠানের নাম, লোগো ও ঠিকানা আপডেট',
                  'শিক্ষাবর্ষ, সেশন ও ছুটি ক্যালেন্ডার সেটআপ',
                  'বিভিন্ন রোল ও পারমিশন কন্ট্রোল (সুপার অ্যাডমিন, শিক্ষক, স্টাফ)',
                  'তিন ভাষায় ইন্টারফেস (আরবি, বাংলা, ইংরেজি)',
                  'ব্যাকআপ ও রিস্টোর ব্যবস্থা',
                  'সিকিউরিটি সেটিংস ও অ্যাক্সেস কন্ট্রোল',
                  'পেমেন্ট গেটওয়ে কনফিগারেশন',
                  'সিস্টেম লগ ও অ্যাক্টিভিটি ট্র্যাকিং',
                ],
              }}
            />
          </div>
        </div>
      </section>

      {/* ========== নতুন হেডিং সেকশন ========== */}
      <section className="py-12 px-5 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-base text-gray-800 max-w-2xl mx-auto">
            <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-5 py-1.5 rounded text-sm font-semibold mb-4">
              নিরাপত্তা ও নির্ভরযোগ্যতা
            </span>
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            কেন এই সফটওয়্যার ব্যবহার করবেন?
          </h2>
        </div>
      </section>

      {/* ========== নিরাপত্তা ও নির্ভরযোগ্যতা ========== */}
      <section className="py-5 px-5 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14 relative">
          {/* Image column – scrolls normally */}
          <div className="flex-1 min-w-0 w-full z-10">
            <img
              src={img26}
              alt="About"
              className="w-full rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Text column */}
          <div className="flex-1 min-w-0 md:py-4">
            <p className="text-1xl md:text-2xl text-gray-800 mb-5">
              💎 দীর্ঘমেয়াদী বিনিয়োগ
            </p>
            <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> যদিও সফটওয়্যারটি এককালীন এবং সবচাইতে সাশ্রয়ী মূল্যে কেনা হয়, কিন্তু এটি প্রতিষ্ঠানের জন্য একটি অত্যান্ত গুরুত্বপূর্ণ ও মূল্যবান স্থায়ী সম্পত্তি হিসেবে বিবেচিত।
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary-dark">☛</span> এর উপকারিতা এবং প্রভাব আজীবন চলমান থাকবে।
              </li>
            </ul>
            <p className="text-1xl md:text-2xl text-gray-800 mb-5">
              🛡️ সার্ভার ও ডাটা নিরাপত্তা
            </p>
            <ul className="flex flex-col gap-3.5 mt-6 mb-2 text-sm md:text-base text-gray-800 text-justify">
              <li className="flex items-start gap-2.5">
                  <p className="text-sm md:text-[15px] font-semibold text-gray-700 mb-1.5">
                    কম্পিউটার নষ্ট হয়ে গেলে কি ডাটা হারিয়ে যাওয়ার ভয় আছে?
                  </p>
              </li>
              <li className="flex items-start gap-2.5">
                  <p className="text-sm md:text-[15px] text-gray-800 leading-relaxed text-justify">
                    <span className="text-primary-dark">☛</span> সফটওয়্যার নষ্ট হওয়া বা তথ্য কম্পিউটার থেকে চলে যাওয়ার কোন ভয় বা সম্ভাবনা নেই, কারণ এর সকল তথ্য সার্ভারে জমা হয়।
                  </p>
              </li>
              <li className="flex items-start gap-2.5">
                <p className="text-sm md:text-[15px] font-semibold text-gray-700 mb-1.5">
                  সার্ভার নষ্ট হয়ে গেলে বা ডাটা হারিয়ে যাওয়ার সম্ভাবনা কতটুকু?
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <p className="text-sm md:text-[15px] text-gray-800 leading-relaxed text-justify">
                  <span className="text-primary-dark">☛</span> আমাদের ৩টি সার্ভার ইন্টিগ্রেড করা আছে — একটি সার্ভার মালয়েশিয়াতে, আরেকটি বাংলাদেশে (BDIX-এর জন্য); দুটির মধ্যে Load Balancer ও Failover Cluster করা রয়েছে, একটি সার্ভার ডাউন হলে আরেকটি আপ হয়ে যাবে। ৩য় আরেকটি সার্ভার ওয়েবসাইটে রাখা হয়েছে, যেটা ব্যাকআপের জন্য। ফলে বলা যায় ৯৯% সুরক্ষা রয়েছে।
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========== PARTNERS MARQUEE ========== */}
      <section className="py-16 bg-gray-50 overflow-hidden">
          <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800">আমাদের সম্মানিত পার্টনারসমূহ</h2>
          </div>
          <div className="relative w-full overflow-hidden partners-mask">
              <div className="flex items-center gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
                  {/* প্রথম সেট */}
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">দারুল উলুম ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">আল হেরা ইসলামিয়া মহিলা মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">আলহাজ্ব রোকনউদ্দিন ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">খিদিরপুর আফজালুল উলূম মাদরাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">জামিয়া ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">ফুরকানিয়া মাদ্রাসা</span>
                  </div>
                  {/* দ্বিতীয় সেট (ডুপ্লিকেট) */}
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">দারুল উলুম ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">আল হেরা ইসলামিয়া মহিলা মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">আলহাজ্ব রোকনউদ্দিন ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">খিদিরপুর আফজালুল উলূম মাদরাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">জামিয়া ইসলামিয়া মাদ্রাসা</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-md whitespace-nowrap">
                      <span className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-primary-dark/20">🏛️</span>
                      <span className="text-base font-semibold text-gray-800">ফুরকানিয়া মাদ্রাসা</span>
                  </div>
              </div>
          </div>
          <div className="text-center mt-14">
            <a
              href="https://wa.me/8801822930055"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-dark to-primary text-white font-semibold text-sm rounded-md shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              সফটওয়্যার কিনতে যোগাযোগ করুন
            </a>
          </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div ref={pricingHeaderRef} className={`text-center mb-14 ${pricingHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="inline-block bg-gradient-to-r from-primary-navy to-primary text-white px-6 py-2 rounded text-sm font-semibold mb-4">মূল্য তালিকা</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 max-w-2xl mx-auto mb-3">আপনার প্রতিষ্ঠানের জন্য উপযুক্ত প্যাকেজ বেছেনিন</h2>
          <p className="text-base text-gray-800">শিক্ষার্থীর সংখ্যা অনুযায়ী বিভিন্ন প্যাকেজ — যেকোনো সময় আপগ্রেড করার সুবিধা</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-start max-w-6xl mx-auto">
          {/* Package 1 */}
          <PricingCard index={0}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ১</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>১০,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>১০০</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> প্রায়োরিটি সাপোর্ট</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

          {/* Package 2 */}
          <PricingCard index={1}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ২</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>১৫,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>২০০</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> প্রায়োরিটি সাপোর্ট</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

          {/* Package 3 (Featured) */}
          <PricingCard index={2} featured>
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-dark to-primary text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md">জনপ্রিয়</span>
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ৩</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>১৯,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>৩০০</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> প্রায়োরিটি সাপোর্ট</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

          {/* Package 4 */}
          <PricingCard index={3}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ৪</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>২২,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>৪০০</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> প্রায়োরিটি সাপোর্ট</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

          {/* Package 5 */}
          <PricingCard index={4}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ৫</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>২৪,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>৫০০</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> প্রায়োরিটি সাপোর্ট</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

          {/* Package 6 */}
          <PricingCard index={5}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">প্যাকেজ ৬</h3>
              <div className="text-5xl font-extrabold text-gray-800 leading-none mb-2"><span className="text-3xl">৳</span>২৫,০০০</div>
            </div>
            <hr className="border-t border-gray-200 my-6" />
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> শিক্ষার্থী লিমিট: <strong>৬০০+</strong></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> অনলাইন ফি পেমেন্ট</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> এসএমএস নোটিফিকেশন</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> <span className="text-primary-dark font-medium">৬০০ এর পর প্রতি ১০০ জনে ১,০০০ টাকা</span></li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 flex items-center justify-center bg-primary-dark text-white rounded-full text-xs font-bold">✓</span> ডেডিকেটেড সাপোর্ট (২৪/৭)</li>
            </ul>
            <a
              href="https://wa.me/8801822930055?text=আমি%20প্যাকেজ%201%20টি%20কিনতে%20চাই"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-4 mt-8 bg-gray-100 text-primary-dark font-bold text-sm rounded-xl hover:bg-gray-200 transition"
            >
              এটি কিনুন
            </a>
          </PricingCard>

        </div>
      </section>

      {/* ========== GUIDE ACCORDION ========== */}
      {/* <section className="py-24 px-6 max-w-5xl mx-auto bg-gray-50">
          <div ref={guideHeaderRef} className={`text-center mb-12 ${guideHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">প্রশ্ন ও উত্তর (FAQ)</h2>
              <p className="text-base text-gray-800 max-w-xl mx-auto">সফটওয়্যার ব্যবহার, সেটআপ ও পরিচালনার সকল প্রশ্নের উত্তর এখানে</p>
          </div>

          <div className="flex flex-col gap-3">
              <GuideItem
                  idx={0}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '১. কিভাবে নতুন শিক্ষাবর্ষ ও ক্লাস সেটআপ করবেন?',
                      a: 'নতুন শিক্ষাবর্ষ শুরু করতে প্রথমে সেটিংস মেনু থেকে "শিক্ষাবর্ষ ব্যবস্থাপনা" অপশনে যান। সেখান থেকে নতুন সেশন যুক্ত করে প্রয়োজনীয় ক্লাস ও শাখা সেটআপ করুন।'
                  }}
              />
              <GuideItem
                  idx={1}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '২. নতুন ছাত্র/ছাত্রী কিভাবে সিস্টেমে যুক্ত করবেন?',
                      a: '"ভর্তি" মেনু থেকে "নতুন ভর্তি" অপশনে গিয়ে ছাত্র/ছাত্রীর প্রয়োজনীয় তথ্য পূরণ করে সাবমিট করলেই সিস্টেমে যুক্ত হয়ে যাবে।'
                  }}
              />
              <GuideItem
                  idx={2}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৩. ছাত্রদের হাজিরা কিভাবে নিবেন (ম্যানুয়াল ও কিউআর কোড)?',
                      a: 'হাজিরা মেনু থেকে ম্যানুয়ালি ছাত্র সিলেক্ট করে উপস্থিতি দেওয়া যায়, অথবা QR কোড স্ক্যান করে দ্রুত হাজিরা নেওয়া যায়।'
                  }}
              />
              <GuideItem
                  idx={3}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৪. কিভাবে পরীক্ষার রেজাল্ট এন্ট্রি করবেন এবং মার্কশিট তৈরি করবেন?',
                      a: 'পরীক্ষা মডিউল থেকে বিষয়ভিত্তিক নম্বর এন্ট্রি করার পর সিস্টেম স্বয়ংক্রিয়ভাবে গ্রেড হিসাব করে মার্কশিট তৈরি করে দেয়।'
                  }}
              />
              <GuideItem
                  idx={4}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৫. অনলাইন ভর্তি আবেদন কিভাবে যাচাই ও অনুমোদন করবেন?',
                      a: 'ভর্তি আবেদন তালিকা থেকে প্রতিটি আবেদন যাচাই করে "অনুমোদন" বা "বাতিল" বাটনে ক্লিক করে সিদ্ধান্ত নিতে পারবেন।'
                  }}
              />
              <GuideItem
                  idx={5}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৬. ছাত্রদের মাসিক বেতন বা ফি কিভাবে আদায় করবেন?',
                      a: 'ফি ম্যানেজমেন্ট মডিউল থেকে ছাত্র সিলেক্ট করে মাসিক বেতন এন্ট্রি করলে স্বয়ংক্রিয় রশিদ তৈরি হয়ে যায়।'
                  }}
              />
              <GuideItem
                  idx={6}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৭. মাদ্রাসার দৈনিক আয়-ব্যয়ের হিসাব (Accounting) কিভাবে রাখবেন?',
                      a: 'একাউন্টিং মডিউলে দৈনিক আয় ও ব্যয় এন্ট্রি করে রাখতে পারবেন, যা থেকে মাসিক ও বার্ষিক প্রতিবেদন স্বয়ংক্রিয়ভাবে তৈরি হয়।'
                  }}
              />
              <GuideItem
                  idx={7}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৮. কিভাবে অভিভাবকদের মোবাইল নাম্বারে এসএমএস বা নোটিফিকেশন পাঠাবেন?',
                      a: 'মেসেজিং মডিউল থেকে টার্গেট গ্রুপ (সকল/শ্রেণি/একক) সিলেক্ট করে বার্তা লিখে পাঠালেই অভিভাবকদের কাছে এসএমএস পৌঁছে যাবে।'
                  }}
              />
              <GuideItem
                  idx={8}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '৯. ছাত্রদের এক ক্লাস থেকে অন্য ক্লাসে প্রমোশন কিভাবে দিবেন?',
                      a: 'প্রমোশন মডিউল থেকে বর্তমান ক্লাস ও নতুন ক্লাস সিলেক্ট করে ছাত্রদের একসাথে বা এককভাবে প্রমোশন দেওয়া যায়।'
                  }}
              />
              <GuideItem
                  idx={9}
                  openGuideIndex={openGuideIndex}
                  setOpenGuideIndex={setOpenGuideIndex}
                  item={{
                      q: '১০. সফটওয়্যারের সাধারণ সেটিংস ও লোগো কিভাবে পরিবর্তন করবেন?',
                      a: 'সেটিংস মেনু থেকে প্রতিষ্ঠানের নাম, লোগো, ঠিকানা ও অন্যান্য তথ্য যেকোনো সময় আপডেট করতে পারবেন।'
                  }}
              />
          </div>
      </section> */}

      {/* ========== SUBSCRIBE ========== */}
      <section ref={subscribeRef} className={`py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary relative overflow-hidden ${subscribeInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-md md:max-w-xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            নিউজলেটার
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            আমাদের সাথে যুক্ত থাকুন
          </h2>

          <p className="text-sm sm:text-base text-white/80 md:text-white/85 mb-6 md:mb-8 leading-relaxed">
            নতুন ফিচার, অফার ও শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনার টিপস সবার আগে পেতে সাবস্ক্রাইব করুন।
          </p>

          <form className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-2 sm:p-2 rounded-2xl sm:rounded-full shadow-xl max-w-md mx-auto">
            <input
              type="phone"
              className="flex-1 min-w-0 border-none outline-none bg-transparent px-5 py-3.5 sm:py-3 text-sm text-gray-800 placeholder-gray-400 w-full text-center sm:text-left"
              placeholder="আপনার মোবাইল নাম্বার দিন"
            />
            <button
              type="submit"
              className="shrink-0 bg-gradient-to-r from-primary-dark to-primary text-white font-bold text-sm px-6 py-3.5 sm:py-3 rounded-xl sm:rounded-full hover:opacity-90 transition active:scale-95 w-full sm:w-auto shadow-md sm:shadow-none"
            >
              সাবস্ক্রাইব করুন
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;
