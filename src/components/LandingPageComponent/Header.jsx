import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const inactiveLink = scrolled
    ? 'text-[#263238] hover:text-[#78B9B5]'
    : 'text-white hover:text-white';

  const activeLink = scrolled
    ? 'text-[#0F828C] font-bold'
    : 'text-white font-bold';

  // Helper to render mobile links
  const mobileNavLink = (to, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center justify-between px-5 py-4 text-[15px] font-semibold border-b border-[#D9E8F5] no-underline ${
          isActive ? 'text-[#0F828C] font-bold' : 'text-[#263238]'
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header
      id="mainHeader"
      className={`fixed top-0 left-0 w-full z-999 flex items-center justify-between gap-4 px-6 py-4 md:px-12 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-3 select-none no-underline">
        <img
          src="/saharaITnewlogo.svg"
          alt="Sahara IT Logo"
          className="w-[130px] h-auto block"
        />
      </NavLink>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-8 ml-auto text-sm font-medium">
        <NavLink to="/" end className={({ isActive }) => `transition-colors duration-200 ${isActive ? activeLink : inactiveLink}`}>
          হোম
        </NavLink>

        {/* Dropdown – কোম্পানি */}
        <div className="relative group">
          <button
            className={`flex items-center gap-1 bg-transparent border-none font-inherit cursor-pointer p-0 transition-colors duration-200 ${inactiveLink}`}
          >
            কোম্পানি <span className="text-[9px] mt-0.5">▼</span>
          </button>
          <ul className="absolute mt-1.5 top-full left-0 w-56 opacity-0 -translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.12)] border border-[#D9E8F5] overflow-hidden bg-white">
            <li>
              <NavLink
                to="/about-us"
                className="block bg-white px-4 py-2.5 text-sm text-[#6B7280] border-b border-[#D9E8F5] transition-colors duration-150 hover:bg-[#F5F9FC] hover:text-[#0F828C]"
              >
                আমাদের সম্পর্কে
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/management-team"
                className="block bg-white px-4 py-2.5 text-sm text-[#6B7280] border-b border-[#D9E8F5] transition-colors duration-150 hover:bg-[#F5F9FC] hover:text-[#0F828C]"
              >
                ব্যবস্থাপনা টিম
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/photo-gallery"
                className="block bg-white px-4 py-2.5 text-sm text-[#6B7280] transition-colors duration-150 hover:bg-[#F5F9FC] hover:text-[#0F828C]"
              >
                ফটো গ্যালারি
              </NavLink>
            </li>
          </ul>
        </div>

        <NavLink to="/contact-us" className={`transition-colors duration-200 ${inactiveLink}`}>যোগাযোগ</NavLink>
        <NavLink to="/login" className={`transition-colors duration-200 ${inactiveLink}`}>মাদ্রাসা লগিন</NavLink>
      </nav>

      {/* CTA – Desktop (inline style added for gradient) */}
      <a
        href="https://wa.me/8801822930055"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-[13px] rounded-md font-medium text-white bg-linear-to-r from-[#0F828C] to-[#78B9B5] shadow-[0_4px_10px_rgba(15,95,151,0.30)] transition-opacity duration-200 hover:opacity-95 active:scale-[0.97] no-underline"
        style={{
          backgroundImage: 'linear-gradient(90deg, #0F828C 0%, #78B9B5 100%)',
          boxShadow: '0 4px 10px rgba(15,95,151,0.30)',
        }}
      >
        সফটওয়্যার ব্যবহার করতে চাই
      </a>

      {/* Mobile menu button */}
      <button
        id="menuBtn"
        aria-label="মেনু খুলুন"
        onClick={() => setMenuOpen((o) => !o)}
        className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-md border shadow-sm cursor-pointer shrink-0 transition-colors duration-300 text-[#263238] ${
          scrolled
            ? 'bg-white border-[#D9E8F5]'
            : 'bg-white/85 backdrop-blur-sm border-[#D9E8F5]/60'
        }`}
      >
        {menuOpen ? (
          <svg className="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile floating menu – simplified */}
      {menuOpen && (
        <div id="mobileMenu" className="lg:hidden absolute top-full left-0 right-0 pt-2 px-4 max-h-[80vh] overflow-y-auto">
          <div className="bg-white border border-[#D9E8F5] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.15)] overflow-hidden">
            {/* Simple links */}
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-4 text-[15px] font-semibold border-b border-[#D9E8F5] no-underline ${
                  isActive ? 'text-[#0F828C] font-bold' : 'text-[#263238]'
                }`
              }
            >
              হোম
            </NavLink>

            {/* কোম্পানি dropdown */}
            <div className="border-b border-[#D9E8F5]">
              <button
                onClick={() => toggleAccordion('company')}
                className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none font-semibold text-[15px] text-[#263238] cursor-pointer"
              >
                কোম্পানি
                <span className={`text-[13px] text-gray-400 transition-transform duration-200 ${openAccordions.has('company') ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {openAccordions.has('company') && (
                <ul className="bg-[#F5F9FC] px-5 pb-2">
                  <li><NavLink to="/about-us" onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-[#6B7280] border-t border-[#D9E8F5] no-underline hover:text-[#0F828C]">আমাদের সম্পর্কে</NavLink></li>
                  <li><NavLink to="/management-team" onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-[#6B7280] border-t border-[#D9E8F5] no-underline hover:text-[#0F828C]">ব্যবস্থাপনা টিম</NavLink></li>
                  <li><NavLink to="/photo-gallery" onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm text-[#6B7280] border-t border-[#D9E8F5] no-underline hover:text-[#0F828C]">ফটো গ্যালারি</NavLink></li>
                </ul>
              )}
            </div>

            {/* Simple links */}
            <NavLink to="/contact-us" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#263238] border-b border-[#D9E8F5] no-underline hover:text-[#0F828C]">যোগাযোগ</NavLink>
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-5 py-4 text-[15px] font-semibold text-[#263238] border-b border-[#D9E8F5] no-underline hover:text-[#0F828C]">মাদ্রাসা লগিন</NavLink>
          </div>

          {/* CTA button (mobile) — inline style added for gradient */}
          <a
            href="https://wa.me/8801822930055"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-3 px-4 py-3.5 text-sm rounded-xl text-center font-medium text-white bg-linear-to-r from-[#0F828C] to-[#78B9B5] shadow-[0_4px_10px_rgba(15,95,151,0.30)] no-underline"
            style={{
              backgroundImage: 'linear-gradient(90deg, #0F828C 0%, #78B9B5 100%)',
              boxShadow: '0 4px 10px rgba(15,95,151,0.30)',
            }}
          >
            সফটওয়্যার ব্যবহার করতে চাই
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
