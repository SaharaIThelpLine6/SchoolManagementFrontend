import { useEffect } from 'react';

const useAppEffects = () => {
  useEffect(() => {
    const header = document.getElementById('mainHeader');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const THRESHOLD = 40;

    if (!header || !menuBtn || !mobileMenu) return;

    // ── ১. মোবাইল অ্যাকর্ডিয়ন ──
    const accordionToggles = document.querySelectorAll('.mobile-accordion__toggle');
    accordionToggles.forEach((toggle) => {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const accordion = this.closest('.mobile-accordion');
        if (accordion) accordion.classList.toggle('is-open');
      });
    });

    // ── ২. FAQ অ্যাকর্ডিয়ন ──
    const faqToggles = document.querySelectorAll('.guide-item__toggle');
    faqToggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.guide-item');
        if (item) item.classList.toggle('is-open');
      });
    });

    // ── ৩. হ্যামবার্গার ──
    const handleMenuToggle = (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open');
      menuBtn.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
    };
    menuBtn.addEventListener('click', handleMenuToggle);

    // ── ৪. মেনু লিংক ──
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        menuBtn.classList.remove('is-open');
        menuBtn.setAttribute('aria-label', 'মেনু খুলুন');
      });
    });

    // ── ৫. স্ক্রল ইফেক্ট ──
    let ticking = false;
    const handleScroll = () => {
      if (window.scrollY > THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    handleScroll();

    // ── ৬. স্ক্রল টু টপ ভিজিবিলিটি ──
    const handleScrollTopVisibility = () => {
      if (scrollTopBtn) {
        if (window.scrollY > 300) {
          scrollTopBtn.classList.add('is-visible');
        } else {
          scrollTopBtn.classList.remove('is-visible');
        }
      }
    };
    window.addEventListener('scroll', handleScrollTopVisibility);
    handleScrollTopVisibility();

    // ── ৭. স্ক্রল টু টপ বাটন ক্লিক ──
    // ★ ফাংশনটি বাইরে ডিফাইন করলাম যাতে ক্লিনআপে অ্যাক্সেস পাওয়া যায় ★
    const handleScrollTop = (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', handleScrollTop);
    }

    // ── ৮. স্মুথ মাউস হুইল ──
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cleanupSmoothScroll = null;
    if (!isTouchDevice && !prefersReducedMotion) {
      let currentY = window.scrollY;
      let targetY = window.scrollY;
      const ease = 0.09;
      const wheelMultiplier = 1;
      let rafId = null;

      const clampTarget = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetY = Math.max(0, Math.min(targetY, maxScroll));
      };

      const animate = () => {
        currentY += (targetY - currentY) * ease;
        if (Math.abs(targetY - currentY) < 0.5) {
          currentY = targetY;
          window.scrollTo(0, currentY);
          rafId = null;
          return;
        }
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(animate);
      };

      const onWheel = (e) => {
        e.preventDefault();
        targetY += e.deltaY * wheelMultiplier;
        clampTarget();
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      window.addEventListener('wheel', onWheel, { passive: false });

      const onResize = () => clampTarget();
      window.addEventListener('resize', onResize);

      const onScrollSync = () => {
        if (!rafId) {
          currentY = window.scrollY;
          targetY = window.scrollY;
        }
      };
      window.addEventListener('scroll', onScrollSync, { passive: true });

      window.__syncSmoothScroll = (newY) => {
        currentY = newY;
        targetY = newY;
      };

      cleanupSmoothScroll = () => {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScrollSync);
        if (rafId) cancelAnimationFrame(rafId);
        delete window.__syncSmoothScroll;
      };
    }

    // ── ক্লিনআপ ──
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', handleScrollTopVisibility);
      menuBtn.removeEventListener('click', handleMenuToggle);
      if (scrollTopBtn) {
        scrollTopBtn.removeEventListener('click', handleScrollTop);
      }
      if (cleanupSmoothScroll) cleanupSmoothScroll();
    };
  }, []);
};

export default useAppEffects;
