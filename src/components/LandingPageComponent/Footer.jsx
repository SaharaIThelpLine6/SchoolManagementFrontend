import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <footer className="bg-[#320A6B] text-white/75">
        <div className="max-w-[1250px] max-w-312.5 mx-auto px-4 sm:px-6 pt-9 sm:pt-11 md:pt-[60px] lg:pt-20 pb-[26px] sm:pb-[34px] md:pb-[50px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr] gap-8 sm:gap-9 md:gap-10 lg:gap-[50px] text-center sm:text-left">
          {/* কলাম ১: অ্যাবাউট */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 max-w-full sm:max-w-[500px] lg:max-w-none mx-auto sm:mx-0">
            <NavLink to="/" className="inline-block no-underline mb-[18px]">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-[-0.5px]">
                Sahara<span className="text-[#78B9B5]">IT</span>
              </h2>
            </NavLink>
            <p className="text-[12.5px] sm:text-[13.5px] md:text-[14.5px] leading-[1.8] text-white/65 mb-[26px]">
              একটি ক্লাউড-ভিত্তিক শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনা সফটওয়্যার — স্কুল, কলেজ, মাদ্রাসা ও কোচিং সেন্টারের সকল প্রশাসনিক কাজ সহজ করতে তৈরি।
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              {/* সোশ্যাল আইকন */}
              <a href="https://www.facebook.com/saharaitbd" aria-label="Facebook" target="_blank" className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center bg-white/[0.08] rounded-full text-white transition-all duration-200 hover:bg-[#78B9B5] hover:-translate-y-[3px]">
                <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@saharait7782" target="_blank" aria-label="YouTube" className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center bg-white/[0.08] rounded-full text-white transition-all duration-200 hover:bg-[#78B9B5] hover:-translate-y-[3px]">
                <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z" />
                </svg>
              </a>
              <a href="https://wa.me/8801822930055" target="_blank" aria-label="WhatsApp" className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center bg-white/[0.08] rounded-full text-white transition-all duration-200 hover:bg-[#78B9B5] hover:-translate-y-[3px]">
                <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 0 0-10.4 18l-1.5 5.5 5.6-1.5A12 12 0 1 0 12 0zm0 21.8a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.3.9.9-3.2-.2-.4a9.8 9.8 0 1 1 8 4.3zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1a8 8 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5.3-.4c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* কলাম ২: কুইক লিংক */}
          <div>
            <h3 className="text-sm sm:text-[15px] md:text-base font-bold text-white mb-4 sm:mb-[22px]">কুইক লিংক</h3>
            <ul>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/" className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">হোম</NavLink>
              </li>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/contact-us" className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">যোগাযোগ</NavLink>
              </li>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/login" target='_blank' className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">মাদ্রাসা লগিন</NavLink>
              </li>
            </ul>
          </div>

          {/* কলাম ৩: কোম্পানি */}
          <div>
            <h3 className="text-sm sm:text-[15px] md:text-base font-bold text-white mb-4 sm:mb-[22px]">কোম্পানি</h3>
            <ul>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/about-us" className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">আমাদের সম্পর্কে</NavLink>
              </li>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/management-team" className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">ব্যবস্থাপনা টিম</NavLink>
              </li>
              <li className="mb-[13px] text-[12.5px] sm:text-[13.5px] md:text-[14.5px]">
                <NavLink to="/photo-gallery" className="text-white/65 no-underline transition-all duration-200 hover:text-[#78B9B5] hover:pr-1">ফটো গ্যালারি</NavLink>
              </li>
            </ul>
          </div>

          {/* কলাম ৪: যোগাযোগ */}
          <div>
            <h3 className="text-sm sm:text-[15px] md:text-base font-bold text-white mb-4 sm:mb-[22px]">যোগাযোগ</h3>
            <ul>
              <li className="flex items-start justify-center sm:justify-start gap-2.5 text-[12.5px] sm:text-[13.5px] md:text-[14.5px] text-white/65 mb-4 leading-[1.6]">
                <span className="flex-shrink-0 text-[15px] mt-[1px]">📍</span>
                <span>ভাঙ্গা প্রেস, যাত্রাবাড়ী, ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-start justify-center sm:justify-start gap-2.5 text-[12.5px] sm:text-[13.5px] md:text-[14.5px] text-white/65 mb-4 leading-[1.6]">
                <span className="flex-shrink-0 text-[15px] mt-[1px]">📞</span>
                <a href="tel:+8801822930055" target='_blank' className="text-white/65 no-underline transition-colors duration-200 hover:text-[#78B9B5]">
                  +880 18229-30055
                </a>
              </li>
              {/* <li className="flex items-start justify-center sm:justify-start gap-2.5 text-[12.5px] sm:text-[13.5px] md:text-[14.5px] text-white/65 mb-4 leading-[1.6]">
                <span className="flex-shrink-0 text-[15px] mt-[1px]">✉️</span>
                <a href="mailto:info@school360.com.bd" className="text-white/65 no-underline transition-colors duration-200 hover:text-[#78B9B5]">
                  info@school360.com.bd
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 sm:px-6 py-5 max-w-[1250px] mx-auto flex flex-col sm:flex-row items-center justify-between flex-wrap gap-3">
          <p className="text-[12.5px] sm:text-[13.5px] text-white/55">© ২০২৬ SaharaIT. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-2.5 text-[13.5px]">
            <NavLink to="/privacy-policy" className="text-white/55 no-underline transition-colors duration-200 hover:text-[#78B9B5]">প্রাইভেসি পলিসি</NavLink>
          </div>
        </div>
      </footer>

      {/* ফ্লোটিং বাটন */}
      <div className="fixed right-3.5 sm:right-[18px] lg:right-6 bottom-4 sm:bottom-5 lg:bottom-7 z-[998] flex flex-col items-center gap-3.5 sm:gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="উপরে যান"
          className={`w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#0F828C] to-[#320A6B] shadow-[0_6px_18px_rgba(0,0,0,0.25)] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)] ${
            showScrollTop ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <svg className="w-[18px] h-[18px] sm:w-[21px] sm:h-[21px] lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>

        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noreferrer"
          aria-label="হোয়াটসঅ্যাপে যোগাযোগ করুন"
          className="w-[42px] h-[42px] sm:w-[50px] sm:h-[50px] lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white bg-[#25d366] shadow-[0_6px_18px_rgba(0,0,0,0.25)] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
        >
          <svg className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] lg:w-7 lg:h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0a12 12 0 0 0-10.4 18l-1.5 5.5 5.6-1.5A12 12 0 1 0 12 0zm0 21.8a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.3.9.9-3.2-.2-.4a9.8 9.8 0 1 1 8 4.3zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1a8 8 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.4-.5.3-.4c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </a>
      </div>
    </>
  );
};

export default Footer;
