import React, { useState, useEffect, useRef } from 'react';
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

const WHATSAPP = 'https://wa.me/8801822930055';

/* ---------- ছোট helper ---------- */
// ইংরেজি সংখ্যা → বাংলা সংখ্যা
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const CheckIcon = ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
        />
    </svg>
);

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

/* সেকশন হেডিং */
const SectionHeading = ({ eyebrow, title, subtitle, light = false, center = true }) => {
    const [ref, inView] = useInView(0.1);
    return (
        <div
            ref={ref}
            className={`${center ? 'text-center mx-auto' : ''} max-w-3xl mb-12 md:mb-16 ${
                inView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
        >
            {eyebrow && (
                <span
                    className={`inline-flex items-center gap-2 text-[11px] md:text-xs font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full mb-5 ${
                        light
                            ? 'bg-white/10 text-white/90 ring-1 ring-inset ring-white/20'
                            : 'bg-primary/10 text-primary-dark ring-1 ring-inset ring-primary/20'
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-white' : 'bg-primary'}`} />
                    {eyebrow}
                </span>
            )}
            <h2
                className={`text-[26px] leading-tight md:text-[40px] md:leading-[1.15] font-extrabold tracking-tight ${
                    light ? 'text-white' : 'text-slate-900'
                }`}
            >
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-4 text-[15px] md:text-lg leading-relaxed ${light ? 'text-white/70' : 'text-slate-500'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

/* ফিচার লিস্ট আইটেম (☛ এর বদলে আধুনিক চেক) */
const FeatureLine = ({ children, tone = 'light' }) => (
    <li className="flex items-start gap-3">
        <span
            className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${
                tone === 'dark' ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary-dark'
            }`}
        >
            <CheckIcon />
        </span>
        <span className={`text-[14px] md:text-[15px] leading-relaxed ${tone === 'dark' ? 'text-white/75' : 'text-slate-600'}`}>
            {children}
        </span>
    </li>
);

/* আরও দেখুন বাটন */
const MoreButton = ({ expanded, onClick, moreCount }) => (
    <button
        onClick={onClick}
        className="mt-7 inline-flex items-center gap-2 pl-5 pr-4 py-2.5 rounded-full bg-white text-primary-dark text-[13px] font-bold ring-1 ring-inset ring-slate-200 shadow-sm hover:ring-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
        {expanded ? 'কম দেখুন' : `আরও দেখুন (${bn(moreCount)} টি)`}
        <span className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                    fillRule="evenodd"
                    d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                    clipRule="evenodd"
                />
            </svg>
        </span>
    </button>
);

/* প্ল্যাটফর্ম কার্ড */
const PlatformCard = ({ icon, title, desc, cta, href, index, scale = false }) => {
    const [ref, inView] = useInView(0.15);
    return (
        <div
            ref={ref}
            className={`group relative bg-white rounded-2xl p-6 ring-1 ring-inset ring-slate-200/80 hover:ring-primary/30 hover:shadow-[0_18px_40px_-18px_rgba(15,95,151,0.35)] hover:-translate-y-1.5 transition-all duration-300 ${
                inView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 90}ms` }}
        >
            <div className="w-14 h-14 rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100 flex items-center justify-center mb-5 group-hover:bg-primary/5 group-hover:ring-primary/20 transition-colors">
                <img
                    src={icon}
                    alt={title}
                    className={`w-8 h-8 object-contain ${scale ? 'scale-[1.35]' : ''} group-hover:scale-110 transition-transform duration-300`}
                />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-[13px] leading-relaxed text-slate-500 mb-5 min-h-[40px]">{desc}</p>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-dark hover:gap-2.5 transition-all"
            >
                {cta}
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path
                        fillRule="evenodd"
                        d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z"
                        clipRule="evenodd"
                    />
                </svg>
            </a>
        </div>
    );
};

const ClientCard = ({ c, index }) => {
    const [ref, isInView] = useInView(0.1);
    return (
        <div
            ref={ref}
            className={`bg-white rounded-2xl p-6 text-center ring-1 ring-inset ring-slate-200 hover:-translate-y-1.5 hover:shadow-lg transition-all ${
                isInView ? 'animate-bounce-in' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{c.location}</p>
        </div>
    );
};

/* প্রাইসিং কার্ড */
const PricingCard = ({ pkg, index }) => {
    const [ref, isInView] = useInView(0.12);
    const featured = pkg.featured;
    return (
        <div
            ref={ref}
            className={`relative rounded-3xl p-7 md:p-8 flex flex-col transition-all duration-300 ${
                featured
                    ? 'bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white shadow-[0_28px_60px_-20px_rgba(15,95,151,0.55)] lg:scale-[1.04]'
                    : 'bg-white ring-1 ring-inset ring-slate-200 hover:ring-primary/30 hover:shadow-[0_22px_50px_-24px_rgba(15,95,151,0.4)] hover:-translate-y-1.5'
            } ${isInView ? 'animate-bounce-in' : 'opacity-0'}`}
            style={{ animationDelay: `${index * 110}ms` }}
        >
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-extrabold tracking-wide px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    সবচেয়ে জনপ্রিয়
                </span>
            )}

            <div className="mb-6">
                <p className={`text-[13px] font-bold tracking-wide ${featured ? 'text-white/70' : 'text-slate-400'}`}>
                    {pkg.name}
                </p>
                <p className={`mt-1 text-[15px] font-semibold ${featured ? 'text-white' : 'text-slate-700'}`}>
                    শিক্ষার্থী লিমিট {pkg.limit}
                </p>
                <div className="mt-5 flex items-end gap-1.5">
                    <span className={`text-2xl font-bold ${featured ? 'text-white/80' : 'text-slate-400'}`}>৳</span>
                    <span className={`text-[42px] leading-none font-extrabold tracking-tight ${featured ? 'text-white' : 'text-slate-900'}`}>
                        {pkg.price}
                    </span>
                </div>
                <p className={`mt-2 text-[12px] ${featured ? 'text-white/60' : 'text-slate-400'}`}>এককালীন পেমেন্ট</p>
            </div>

            <div className={`h-px w-full ${featured ? 'bg-white/15' : 'bg-slate-100'}`} />

            <ul className="flex flex-col gap-3.5 py-6 flex-1">
                {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span
                            className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                                featured ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary-dark'
                            }`}
                        >
                            <CheckIcon className="w-3 h-3" />
                        </span>
                        <span className={`text-[13.5px] leading-snug ${featured ? 'text-white/85' : 'text-slate-600'}`}>{f}</span>
                    </li>
                ))}
            </ul>

            <a
                href={`${WHATSAPP}?text=${encodeURIComponent(`আমি ${pkg.name} কিনতে চাই`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center w-full py-3.5 rounded-xl text-[14px] font-bold transition-all active:scale-[0.98] ${
                    featured
                        ? 'bg-white text-primary-dark hover:shadow-xl'
                        : 'bg-slate-50 text-primary-dark ring-1 ring-inset ring-slate-200 hover:bg-primary hover:text-white hover:ring-primary'
                }`}
            >
                এটি কিনুন
            </a>
        </div>
    );
};

const GuideItem = ({ item, idx, openGuideIndex, setOpenGuideIndex }) => {
    const [ref, isInView] = useInView(0.1);
    const open = openGuideIndex === idx;
    return (
        <div
            ref={ref}
            className={`bg-white rounded-2xl overflow-hidden ring-1 ring-inset transition-all ${
                open ? 'ring-primary/30 shadow-md' : 'ring-slate-200 hover:ring-slate-300'
            } ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${idx * 60}ms` }}
        >
            <button
                onClick={() => setOpenGuideIndex(open ? null : idx)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-slate-800 text-[15px] cursor-pointer"
            >
                <span>{item.q}</span>
                <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        open ? 'bg-primary text-white rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path
                            fillRule="evenodd"
                            d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <div className="px-5">
                    <p className="text-[14px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{item.a}</p>
                </div>
            </div>
        </div>
    );
};

/* ---------- মডিউল ডাটা ---------- */
const MODULES = [
    {
        title: 'শিক্ষার্থী ব্যবস্থাপনা',
        short: 'ভর্তি থেকে সার্টিফিকেট',
        image: img15,
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
    },
    {
        title: 'দান ও অনুদান (Donation)',
        short: 'দাতা ও তহবিল ট্র্যাকিং',
        image: img2,
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
    },
    {
        title: 'শিক্ষক ও কর্মচারী ব্যবস্থাপনা',
        short: 'প্রোফাইল, হাজিরা ও পে-রোল',
        image: img3,
        items: [
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
    },
    {
        title: 'একাডেমিক ও রুটিন ব্যবস্থাপনা',
        short: 'ড্র্যাগ অ্যান্ড ড্রপ রুটিন',
        image: img4,
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
    },
    {
        title: 'হিসাব ও অ্যাকাউন্টিং ব্যবস্থাপনা',
        short: 'আয়-ব্যয়, লেজার ও ব্যালেন্স শিট',
        image: img1,
        items: [
            'দৈনিক আয়-ব্যয় এন্ট্রি ও ট্র্যাকিং',
            'মাসিক ও বার্ষিক আর্থিক প্রতিবেদন তৈরী',
            'বাজেট ব্যবস্থাপনা ও পরিকল্পনা',
            'বিভিন্ন খাতভিত্তিক আয়-ব্যয় বিশ্লেষণ',
            'অটোমেটিক ব্যালেন্স শিট জেনারেশন',
            'লেজার ও জাবেদা সংরক্ষণ এবং প্রিন্ট',
            'হিসাবের জন্য পিডিএফ/এক্সেল রিপোর্ট ডাউনলোড',
        ],
    },
    {
        title: 'পাঠাগার (লাইব্রেরি) ব্যবস্থাপনা',
        short: 'বই ইস্যু ও রিটার্ন',
        image: img19,
        items: [
            'বই যোগ, এডিট ও ডিলিট সুবিধা',
            'বই ইস্যু ও রিটার্ন ট্র্যাকিং',
            'নির্ধারিত তারিখ অতিক্রম করলে নোটিফিকেশন',
            'বইয়ের ক্যাটাগরি ও শাখাভিত্তিক তালিকা',
            'শিক্ষার্থী ও শিক্ষকদের ইস্যু হিস্টোরি',
            'লাইব্রেরি কার্ড জেনারেশন',
            'বইয়ের প্রাপ্যতা স্ট্যাটাস চেক',
        ],
    },
    {
        title: 'হোস্টেল ও বোর্ডিং ব্যবস্থাপনা',
        short: 'সীট, খানা ও হিসাব',
        image: img20,
        items: [
            'রুম ও সীট বরাদ্দ ব্যবস্থাপনা',
            'হোস্টেল ফি আদায় ও ট্র্যাকিং',
            'খানা ও খাবারের ব্যবস্থাপনা (মেনু প্ল্যান)',
            'হাজিরার ভিত্তিতে খাবার তালিকা তৈরী',
            'হোস্টেলের আয়-ব্যয় হিসাব',
            'হোস্টেলের ছাত্রদের প্রোফাইল ও অভিভাবক তথ্য',
            'অভিভাবকদের সাথে যোগাযোগ ব্যবস্থা',
        ],
    },
    {
        title: 'এসএমএস ও নোটিফিকেশন সিস্টেম',
        short: 'স্বয়ংক্রিয় এসএমএস ও পুশ',
        image: img16,
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
    },
    {
        title: 'অনলাইন পরীক্ষা ও ফলাফল পোর্টাল',
        short: 'অটো গ্রেডিং ও মার্কশিট',
        image: img17,
        items: [
            'অনলাইনে পরীক্ষা গ্রহণ ও মূল্যায়ন',
            'স্বয়ংক্রিয় গ্রেডিং (বাংলা ও আরবি ভাষায়)',
            'পরীক্ষার সময়সীমা ও টাইমার সেটিং',
            'শিক্ষার্থীদের জন্য ফলাফল ডাউনলোড',
            'পরীক্ষার পরিসংখ্যান ও বিশ্লেষণ রিপোর্ট',
            'পাবলিশ করলে শিক্ষার্থীরা অনলাইনে ফলাফল দেখতে পায়',
            'রেজাল্ট কার্ড ও মার্কশিট জেনারেশন',
        ],
    },
    {
        title: 'শিক্ষার্থীর অভিভাবক প্যানেল',
        short: 'অভিভাবকের নিজস্ব লগইন',
        image: img27,
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
    },
    {
        title: 'শিক্ষার্থী হাজিরা (হাজিরা মেশিন দ্বারা)',
        short: 'বায়োমেট্রিক ইন্টিগ্রেশন',
        image: img29,
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
    },
    {
        title: 'শিক্ষার্থী হাজিরা (হাজিরা মেশিন ব্যতীত)',
        short: 'ম্যানুয়াল হাজিরা খাতা',
        image: img30,
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
    },
    {
        title: 'মতামত ও পরামর্শ',
        short: 'ফিডব্যাক ও ফলোআপ',
        image: img31,
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
    },
    {
        title: 'সেটিংস ও কনফিগারেশন',
        short: 'রোল, ভাষা ও ব্যাকআপ',
        image: img18,
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
    },
];

/* ---------- মডিউল এক্সপ্লোরার (স্ক্রল-স্পাই ভিত্তিক) ---------- */
const ModuleExplorer = () => {
    const [active, setActive] = useState(0);
    const sectionRefs = useRef([]);
    const navRef = useRef(null);
    const navItemRefs = useRef([]);
    const chipsRef = useRef(null);
    const chipRefs = useRef([]);

    // 🔹 পেজ স্ক্রলের সাথে সাথে ডান পাশের লিস্টে active মডিউল পরিবর্তন হবে
    useEffect(() => {
        let ticking = false;
        const update = () => {
            ticking = false;
            const line = window.innerHeight * 0.32; // উপর থেকে ৩২% জায়গায় কাল্পনিক লাইন
            let current = 0;
            for (let i = 0; i < sectionRefs.current.length; i++) {
                const el = sectionRefs.current[i];
                if (el && el.getBoundingClientRect().top <= line) current = i;
            }
            setActive((prev) => (prev === current ? prev : current));
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // 🔹 active আইটেম লিস্টের ভিউর বাইরে চলে গেলে লিস্ট নিজে থেকে স্ক্রল করবে
    useEffect(() => {
        const nav = navRef.current;
        const item = navItemRefs.current[active];
        if (nav && item) {
            const top = item.offsetTop;
            const bottom = top + item.offsetHeight;
            if (top < nav.scrollTop) nav.scrollTop = top - 8;
            else if (bottom > nav.scrollTop + nav.clientHeight) nav.scrollTop = bottom - nav.clientHeight + 8;
        }

        const chips = chipsRef.current;
        const chip = chipRefs.current[active];
        if (chips && chip) {
            const left = chip.offsetLeft;
            const right = left + chip.offsetWidth;
            if (left < chips.scrollLeft) chips.scrollLeft = left - 16;
            else if (right > chips.scrollLeft + chips.clientWidth) chips.scrollLeft = right - chips.clientWidth + 16;
        }
    }, [active]);

    // 🔹 ক্লিক করলে ঐ মডিউলে স্মুথ স্ক্রল (উপরের fixed navbar এর জন্য অফসেট)
    const goTo = (i) => {
        const el = sectionRefs.current[i];
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    return (
        <>
            {/* ===== মোবাইলের জন্য স্টিকি চিপস নেভিগেশন ===== */}
            <div className="lg:hidden sticky top-16 z-30 -mx-5 px-5 py-3 bg-white/90 backdrop-blur-md border-b border-slate-100">
                <div ref={chipsRef} className="overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex gap-2 w-max">
                        {MODULES.map((m, i) => (
                            <button
                                key={i}
                                ref={(el) => (chipRefs.current[i] = el)}
                                onClick={() => goTo(i)}
                                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-bold transition-all ${
                                    active === i
                                        ? 'bg-gradient-to-r from-primary-navy to-primary text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200'
                                }`}
                            >
                                <span className={`text-[11px] ${active === i ? 'text-white/70' : 'text-slate-400'}`}>
                                    {bn(i + 1)}
                                </span>
                                {m.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_330px] gap-6 lg:gap-10">
                {/* ===== বাম পাশ: সব মডিউল স্ট্যাক আকারে (স্ক্রল হবে) ===== */}
                <div className="flex flex-col gap-6 lg:gap-8 min-w-0">
                    {MODULES.map((mod, i) => (
                        <article
                            key={i}
                            ref={(el) => (sectionRefs.current[i] = el)}
                            id={`module-${i + 1}`}
                            className={`scroll-mt-28 bg-white rounded-3xl ring-1 ring-inset overflow-hidden transition-all duration-300 ${
                                active === i
                                    ? 'ring-primary/25 shadow-[0_24px_60px_-30px_rgba(15,95,151,0.45)]'
                                    : 'ring-slate-200 shadow-sm'
                            }`}
                        >
                            {/* প্রিভিউ ইমেজ */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-7">
                                <div className="absolute top-4 left-4 md:top-7 md:left-7 z-10">
                                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-primary-dark text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ring-1 ring-inset ring-slate-200">
                                        মডিউল {bn(i + 1)}
                                    </span>
                                </div>
                                <img
                                    src={mod.image}
                                    alt={mod.title}
                                    loading="lazy"
                                    className="w-full rounded-2xl shadow-xl ring-1 ring-inset ring-slate-900/5"
                                />
                            </div>

                            {/* কনটেন্ট */}
                            <div className="p-5 md:p-8 border-t border-slate-100">
                                <h3 className="text-[20px] md:text-[26px] font-extrabold text-slate-900 tracking-tight">
                                    {mod.title}
                                </h3>
                                <p className="mt-1.5 text-[13.5px] text-primary-dark font-semibold">{mod.short}</p>

                                <div className="mt-6 grid sm:grid-cols-2 gap-x-7 gap-y-4">
                                    {mod.items.map((item, k) => (
                                        <div key={k} className="flex items-start gap-2.5">
                                            <span className="mt-0.5 shrink-0 w-[18px] h-[18px] rounded-md bg-primary/10 text-primary-dark flex items-center justify-center">
                                                <CheckIcon className="w-3 h-3" />
                                            </span>
                                            <span className="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* শেষে একটি CTA */}
                    <div className="bg-gradient-to-br from-primary-navy via-primary-dark to-primary rounded-3xl p-7 md:p-9 text-center">
                        <h3 className="text-[20px] md:text-[26px] font-extrabold text-white tracking-tight">
                            সব মডিউল একসাথে — একটি প্যাকেজে
                        </h3>
                        <p className="mt-3 text-[14px] text-white/70 max-w-lg mx-auto leading-relaxed">
                            কোন মডিউল আপনার প্রতিষ্ঠানের জন্য সবচেয়ে উপযোগী, তা জানতে সরাসরি কথা বলুন।
                        </p>
                        <a
                            href={WHATSAPP}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary-navy text-[14px] font-bold shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all"
                        >
                            <WhatsAppIcon className="w-[18px] h-[18px]" />
                            এখনই যোগাযোগ করুন
                        </a>
                    </div>
                </div>

                {/* ===== ডান পাশ: স্টিকি মডিউল নেভিগেশন ===== */}
                <aside className="hidden lg:block">
                    <div className="sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col bg-white rounded-2xl ring-1 ring-inset ring-slate-200 p-2.5 shadow-sm">
                        <div className="shrink-0 flex items-center justify-between px-3 pt-2 pb-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                মোট {bn(MODULES.length)} টি মডিউল
                            </p>
                            <span className="text-[11px] font-bold text-primary-dark">
                                {bn(active + 1)}/{bn(MODULES.length)}
                            </span>
                        </div>

                        {/* প্রোগ্রেস বার */}
                        <div className="shrink-0 mx-3 mb-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-navy to-primary transition-all duration-300"
                                style={{ width: `${((active + 1) / MODULES.length) * 100}%` }}
                            />
                        </div>

                        <div ref={navRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1 scroll-smooth">
                            {MODULES.map((m, i) => (
                                <button
                                    key={i}
                                    ref={(el) => (navItemRefs.current[i] = el)}
                                    onClick={() => goTo(i)}
                                    className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                        active === i
                                            ? 'bg-gradient-to-r from-primary-navy to-primary text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <span
                                        className={`shrink-0 w-7 h-7 rounded-lg text-[12px] font-bold flex items-center justify-center ${
                                            active === i ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {bn(i + 1)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[13.5px] font-bold leading-tight truncate">{m.title}</span>
                                        <span
                                            className={`block text-[11.5px] mt-0.5 truncate ${
                                                active === i ? 'text-white/70' : 'text-slate-400'
                                            }`}
                                        >
                                            {m.short}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

/* ---------- ডাটা কনস্ট্যান্ট ---------- */
const HERO_FEATURES = [
    'অনলাইন ভর্তি',
    'স্বয়ংক্রিয় উপস্থিতি',
    'অনলাইন ফি/পেমেন্ট',
    'তাৎক্ষণিক এসএমএস',
    'অনলাইন অনুদান',
    'অনলাইনে পরীক্ষা ফলাফল',
    'ছাত্রাবাস',
    'পাঠাগার',
    'প্রাতিষ্ঠানিক আয়-ব্যায়',
];

const WHY_ITEMS = [
    'এর মাধ্যমে শিক্ষার্থীর সকল তথ্য, ক্লাস/শ্রেণীর তথ্য, পড়া-লেখা, হিসাব-নিকাশ, বোর্ডিং/হোস্টেল-এর আয় ব্যয়, শিক্ষার্থী ভর্তি রেজিস্ট্রার, ফলাফল রেজিস্ট্রার, প্রবেশপত্র, সার্টিফিকেট, নম্বরপত্র, স্বাক্ষরপত্র ও ফলাফলসহ পরীক্ষার সকল কাজ, পাঠাগারের কাজসহ মাদ্রাসার যাবতীয় কাজ সহজ ও সুন্দর করে অটোমেটিকভাবে করা যাবে।',
    'যারা কম্পিউটার চালাতে বেশী অভ্যস্ত নন ও বেশী অবগত নন তারা সহজে কম্পিউটারের কাজগুলো আঞ্জাম দিতে পারবে।',
    'একটি মাদ্রাসার ১০/১৫ জনের কাজ একাই একজন করতে পারবেন।',
    'কাজের প্রিন্টআউট খুবই সুন্দর ও পরিষ্কার দেখাবে।',
    'বড় বড় খাতা ব্যবহার করে আলমিরা ভরপুর করার কোন প্রয়োজন নেই, ছোট ছোট ফাইলেই যথেষ্ট।',
    'কোন তথ্য এন্ট্রি দেয়ার সাথে সাথে উক্ত তথ্য যে রিপোর্টে যাওয়া দরকার সেখানে অটোমেটিক চলে যাবে।',
    'একাধিক লোক এক সাথে ছাত্রদের বিষয়ের প্রাপ্ত নাম্বার এন্ট্রিসহ বিভিন্ন ধরনের কাজ শেয়ারের মাধ্যমে করতে পারবে।',
    'পরীক্ষার্থীর প্রাপ্ত নাম্বার এন্ট্রি দেয়ার সাথে সাথে বাংলা ও আরবী দুই ভাষায় অটোমেটিক (A+, A- ইত্যাদি Grading System) ফলাফল তৈরী হবে এবং Published করলে অনলাইনে শিক্ষার্থীরা ফলাফল দেখতে পাবে।',
    'ছাত্রদের হাজিরার উপর ভিত্তি করে বোর্ডিং-এর খানা দেয়ার তালিকা তৈরী হবে, ফলে খানা অপচয় রোধ হবে।',
    'ছাত্রদের ভর্তি ফি, খানা ফি, মাসিক বেতন ও বকেয়া আদায়ের কাজ সহজে করা যাবে।',
    'স্টাফদের বেতন, মাদ্রাসার আয় ব্যয় ও বোর্ডিংএর আয় ব্যয়সহ সকল প্রকার হিসাবের কাজ সহজে করা যাবে।',
    'শিক্ষার্থীর সীট বন্টনসহ ছাত্রাবাসের সকল ব্যবস্থাপনা সুন্দর ও সহজলভ্যভাবে করা যায়।',
    'প্রতিষ্ঠানের পাঠাগারের কার্যক্রম যেমন: পাঠাগার থেকে কখন কে, কয়টি বই নিয়েছে — এধরনের সকল কার্যক্রম সহজে পরিচালনা করা যায়।',
];

const TECH_NEEDS = [
    'এক বা একাধিক ডেস্কটপ বা ল্যাপটপ পিসি (কম্পিউটার)।',
    'মোবাইলের মাধ্যমে ব্যবহার করা যাবে।',
    'মোবাইলে প্রিন্ট করার জন্য বারকোড (POS) মিনি প্রিন্টার।',
    'রাউটার বা সুইচ ও ইন্টারনেট।',
];

const TECH_FEATURES = [
    'সফটওয়্যারটি সম্পূর্ণ ডাইনামিক, সুতরাং যেকোনোভাবে নিজেরাই কাস্টমাইজ করে নিতে পারবেন।',
    'তিন ভাষায় ব্যবহার করা যাবে — আরবী, বাংলা ও ইংরেজীতে।',
    'ব্যবহার-বান্ধব UI/UX।',
    'Desktop, Web, Mobile, Windows ও Apple সহ যেকোন Platform-এ ব্যবহার উপযোগী।',
    'JavaScript, Node.js, React.js, React Native, Vb.net ইত্যাদি টেকনোলজি ব্যবহার করা হয়েছে।',
    'সিকিউরিটি ও ব্যাকআপ সুবিধা।',
];

const PARTNERS = [
    'দারুল উলুম ইসলামিয়া মাদ্রাসা',
    'আল হেরা ইসলামিয়া মহিলা মাদ্রাসা',
    'আলহাজ্ব রোকনউদ্দিন ইসলামিয়া মাদ্রাসা',
    'খিদিরপুর আফজালুল উলূম মাদরাসা',
    'জামিয়া ইসলামিয়া মাদ্রাসা',
    'ফুরকানিয়া মাদ্রাসা',
];

const PACKAGES = [
    { name: 'প্যাকেজ ১', limit: '১০০', price: '১০,০০০' },
    { name: 'প্যাকেজ ২', limit: '২০০', price: '১৫,০০০' },
    { name: 'প্যাকেজ ৩', limit: '৩০০', price: '১৯,০০০', featured: true },
    { name: 'প্যাকেজ ৪', limit: '৪০০', price: '২২,০০০' },
    { name: 'প্যাকেজ ৫', limit: '৫০০', price: '২৪,০০০' },
    {
        name: 'প্যাকেজ ৬',
        limit: '৬০০+',
        price: '২৫,০০০',
        extra: ['৬০০ এর পর প্রতি ১০০ জনে ১,০০০ টাকা', 'ডেডিকেটেড সাপোর্ট (২৪/৭)'],
    },
].map((p) => ({
    ...p,
    features: [
        'পূর্ণাঙ্গ ডেটাবেস ও নিরাপত্তা',
        'অনলাইন ফি পেমেন্ট',
        'এসএমএস নোটিফিকেশন',
        ...(p.extra || ['প্রায়োরিটি সাপোর্ট']),
    ],
}));

const SERVERS = [
    { name: 'মালয়েশিয়া সার্ভার', tag: 'প্রাইমারি', desc: 'Load Balancer যুক্ত মেইন সার্ভার' },
    { name: 'বাংলাদেশ সার্ভার', tag: 'BDIX', desc: 'দ্রুত গতির জন্য লোকাল BDIX সার্ভার' },
    { name: 'ব্যাকআপ সার্ভার', tag: 'ব্যাকআপ', desc: 'ওয়েবসাইটে রাখা তৃতীয় ব্যাকআপ সার্ভার' },
];

/* ---------- মূল Home কম্পোনেন্ট ---------- */
const Home = () => {
  const [openGuideIndex, setOpenGuideIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState(false);   // 🔹 কেন ব্যবহার করবেন সেকশনের জন্য
  const [expandedTech, setExpandedTech] = useState(false); // 🔹 প্রযুক্তিগত দিক সেকশনের জন্য
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
  const [securityRef, securityInView] = useInView(0.1);
  const [techRef, techInView] = useInView(0.15);

  const visibleWhy = expandedWhy ? WHY_ITEMS : WHY_ITEMS.slice(0, 5);
  const visibleTechFeatures = expandedTech ? TECH_FEATURES : TECH_FEATURES.slice(0, 5);

  return (
    <>
      {/* লোকাল কিছু স্টাইল — tailwind config পরিবর্তন ছাড়াই */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes qmm-marquee-rev {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .qmm-marquee-rev { animation: qmm-marquee-rev 38s linear infinite; }
        @keyframes qmm-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
          70% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        .qmm-pulse-ring { animation: qmm-pulse-ring 2.4s ease-out infinite; }
      `}</style>

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
            <h1 className="text-[27px] md:text-[50px] text-justify sm:text-left font-bold mb-1 leading-tight">
              বাংলাদেশের সর্বোচ্চ ব্যবহৃত মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার
            </h1>

            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-4 mt-4">
              {HERO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center justify-start gap-2">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs">
                    ✓
                  </span>
                  <span className="text-[14px] md:text-base whitespace-nowrap">{f}</span>
                </li>
              ))}
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
      <section ref={platformRef} className="py-20 md:py-24 px-5 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="সব প্ল্যাটফর্মে"
            title="যেকোনো ডিভাইস থেকে প্রতিষ্ঠান পরিচালনা করুন"
            subtitle="ওয়েব, অ্যান্ড্রয়েড, আইওএস ও ডেস্কটপ – আপনার পছন্দের প্ল্যাটফর্মে আমাদের সফটওয়্যার ব্যবহার করুন।"
          />

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${platformInView ? '' : ''}`}>
            <PlatformCard
              index={0}
              icon={img28}
              scale
              title="ডেস্কটপ অ্যাপ"
              desc="Windows ও macOS-এর জন্য ডাউনলোড করুন"
              cta="ডাউনলোড করুন"
              href={softwareDetails?.UpSoftwareLink}
            />
            <PlatformCard
              index={1}
              icon={img21}
              title="ওয়েব অ্যাপ"
              desc="যেকোনো ব্রাউজার থেকে লগইন করে ব্যবহার করুন"
              cta="এখন ব্যবহার করুন"
              href="https://qmmsoft.com/login"
            />
            <PlatformCard
              index={2}
              icon={img22}
              title="অ্যান্ড্রয়েড অ্যাপ"
              desc="প্লে স্টোর থেকে ডাউনলোড করে ব্যবহার করুন"
              cta="ডাউনলোড করুন"
              href="https://play.google.com/store/search?q=qmmsoft&c=apps&hl=en"
            />
            <PlatformCard
              index={3}
              icon={img23}
              scale
              title="আইওএস অ্যাপ"
              desc="অ্যাপ স্টোর থেকে ডাউনলোড করে ব্যবহার করুন"
              cta="ডাউনলোড করুন"
              href="#"
            />
          </div>
        </div>
      </section>

      {/* ========== কেন ব্যবহার করবেন ========== */}
      <section className="py-20 md:py-24 px-5 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center gap-10 lg:gap-16">
            {/* ইমেজ */}
            <div ref={aboutImgRef} className={`relative ${aboutImgInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="absolute -top-5 -left-5 w-32 h-32 rounded-2xl bg-primary/5 hidden md:block" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-sky-100/70 blur-2xl hidden md:block" />
              <img
                src={img24}
                alt="সফটওয়্যার পরিচিতি"
                className="relative w-full rounded-3xl shadow-[0_30px_70px_-30px_rgba(15,23,42,0.4)] ring-1 ring-inset ring-slate-900/5"
              />
            </div>

            {/* টেক্সট */}
            <div ref={aboutTextRef} className={aboutTextInView ? 'animate-fade-in-up' : 'opacity-0'}>
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary-dark text-[11px] font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                কেন ব্যবহার করবেন
              </span>

              <h2 className="mt-5 text-[26px] leading-tight md:text-[38px] md:leading-[1.15] font-extrabold tracking-tight text-slate-900">
                মাদ্রাসার যাবতীয় কাজ <span className="text-primary">এক প্ল্যাটফর্মে</span>
              </h2>

              <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-slate-500">
                ভর্তি থেকে ফলাফল, হিসাব-নিকাশ থেকে বোর্ডিং, লাইব্রেরি থেকে এসএমএস নোটিফিকেশন —
                মাদ্রাসার প্রতিটি কাজ এক জায়গা থেকে সহজ ও স্বয়ংক্রিয়ভাবে পরিচালনা করুন।
              </p>

              <ul className="mt-7 flex flex-col gap-4">
                {visibleWhy.map((item, i) => (
                  <FeatureLine key={i}>{item}</FeatureLine>
                ))}
              </ul>

              <MoreButton
                expanded={expandedWhy}
                onClick={() => setExpandedWhy(!expandedWhy)}
                moreCount={WHY_ITEMS.length - 5}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== প্রযুক্তিগত দিক ========== */}
      <section ref={techRef} className="py-20 md:py-24 px-5 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 items-start gap-10 lg:gap-16">
            {/* টেক্সট */}
            <div className={`order-2 lg:order-1 ${techInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary-dark text-[11px] font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                প্রযুক্তিগত দিক
              </span>

              <h2 className="mt-5 text-[26px] leading-tight md:text-[38px] md:leading-[1.15] font-extrabold tracking-tight text-slate-900">
                ব্যবহার করতে যা যা প্রয়োজন
              </h2>

              {/* প্রয়োজনীয়তা কার্ড */}
              <div className="mt-7 bg-white rounded-2xl p-6 ring-1 ring-inset ring-slate-200 shadow-sm">
                <p className="flex items-center gap-2 text-[14px] font-bold text-slate-900 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[14px]">🖥️</span>
                  ব্যবহার করতে যা প্রয়োজন
                </p>
                <ul className="flex flex-col gap-3.5">
                  {TECH_NEEDS.map((item, i) => (
                    <FeatureLine key={i}>{item}</FeatureLine>
                  ))}
                </ul>
              </div>

              {/* বৈশিষ্ট্য কার্ড */}
              <div className="mt-5 bg-white rounded-2xl p-6 ring-1 ring-inset ring-slate-200 shadow-sm">
                <p className="flex items-center gap-2 text-[14px] font-bold text-slate-900 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[14px]">⚙️</span>
                  সফটওয়্যারের বৈশিষ্ট্য
                </p>
                <ul className="flex flex-col gap-3.5">
                  {visibleTechFeatures.map((item, i) => (
                    <FeatureLine key={i}>{item}</FeatureLine>
                  ))}
                </ul>
                <MoreButton
                  expanded={expandedTech}
                  onClick={() => setExpandedTech(!expandedTech)}
                  moreCount={TECH_FEATURES.length - 5}
                />
              </div>
            </div>

            {/* ইমেজ */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-tr from-primary/10 to-sky-100/60 rounded-[28px] blur-xl" />
                <img
                  src={img25}
                  alt="প্রযুক্তিগত দিক"
                  className="relative w-full rounded-3xl shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] ring-1 ring-inset ring-slate-900/5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MODULES ========== */}
      <section className="py-20 md:py-28 px-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div ref={modulesHeaderRef} className={modulesHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}>
            <SectionHeading
              eyebrow="সম্পূর্ণ সমাধান – এক প্ল্যাটফর্মে"
              title="একটি প্রতিষ্ঠানের যাবতীয় কাজের সম্পূর্ণ সমাধান"
              subtitle="স্ক্রল করে সব মডিউল দেখুন — ডান পাশের তালিকা থেকে সরাসরি যেকোনো মডিউলে যেতে পারবেন।"
            />
          </div>

          <ModuleExplorer />
        </div>
      </section>

      {/* ========== নিরাপত্তা ও নির্ভরযোগ্যতা ========== */}
      <section ref={securityRef} className="relative py-20 md:py-28 px-5 overflow-hidden bg-primary-navy">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-dark to-primary" />
        <div className="absolute -top-24 right-0 w-[380px] h-[380px] rounded-full bg-sky-400/20 blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeading
            light
            eyebrow="নিরাপত্তা ও নির্ভরযোগ্যতা"
            title="কেন এই সফটওয়্যার ব্যবহার করবেন?"
            subtitle="আপনার প্রতিষ্ঠানের ডাটা একাধিক সার্ভারে সুরক্ষিত — কম্পিউটার নষ্ট হলেও তথ্য হারাবে না।"
          />

          <div className={`grid lg:grid-cols-2 gap-6 lg:gap-10 items-start ${securityInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* বাম: প্রশ্নোত্তর */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-inset ring-white/15">
                <p className="text-[15px] font-bold text-white mb-2.5">
                  কম্পিউটার নষ্ট হয়ে গেলে কি ডাটা হারিয়ে যাওয়ার ভয় আছে?
                </p>
                <p className="text-[14px] leading-relaxed text-white/70">
                  সফটওয়্যার নষ্ট হওয়া বা তথ্য কম্পিউটার থেকে চলে যাওয়ার কোন ভয় বা সম্ভাবনা নেই,
                  কারণ এর সকল তথ্য সার্ভারে জমা হয়।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-inset ring-white/15">
                <p className="text-[15px] font-bold text-white mb-2.5">
                  সার্ভার নষ্ট হয়ে গেলে বা ডাটা হারিয়ে যাওয়ার সম্ভাবনা কতটুকু?
                </p>
                <p className="text-[14px] leading-relaxed text-white/70">
                  আমাদের ৩টি সার্ভার ইন্টিগ্রেড করা আছে — একটি সার্ভার মালয়েশিয়াতে, আরেকটি বাংলাদেশে
                  (BDIX-এর জন্য); দুটির মধ্যে Load Balancer ও Failover Cluster করা রয়েছে, একটি সার্ভার ডাউন
                  হলে আরেকটি আপ হয়ে যাবে। ৩য় আরেকটি সার্ভার ওয়েবসাইটে রাখা হয়েছে, যেটা ব্যাকআপের জন্য।
                  ফলে বলা যায় ৯৯% সুরক্ষা রয়েছে।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-inset ring-white/15">
                <p className="flex items-center gap-2 text-[15px] font-bold text-white mb-2.5">
                  <span className="text-base">💎</span> দীর্ঘমেয়াদী বিনিয়োগ
                </p>
                <ul className="flex flex-col gap-3">
                  <FeatureLine tone="dark">
                    যদিও সফটওয়্যারটি এককালীন এবং সবচাইতে সাশ্রয়ী মূল্যে কেনা হয়, কিন্তু এটি প্রতিষ্ঠানের জন্য
                    একটি অত্যান্ত গুরুত্বপূর্ণ ও মূল্যবান স্থায়ী সম্পত্তি হিসেবে বিবেচিত।
                  </FeatureLine>
                  <FeatureLine tone="dark">এর উপকারিতা এবং প্রভাব আজীবন চলমান থাকবে।</FeatureLine>
                </ul>
              </div>
            </div>

            {/* ডান: সার্ভার টপোলজি + ইমেজ */}
            <div className="flex flex-col gap-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-7 ring-1 ring-inset ring-white/15">
                <div className="flex items-center justify-between mb-5">
                  <p className="flex items-center gap-2 text-[14px] font-bold text-white">
                    <span className="text-base">🛡️</span> সার্ভার ও ডাটা নিরাপত্তা
                  </p>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-400/15 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ring-inset ring-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 qmm-pulse-ring" />
                    {bn(99)}% সুরক্ষিত
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {SERVERS.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 bg-white/5 rounded-xl p-4 ring-1 ring-inset ring-white/10"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center text-[13px] font-bold">
                        {bn(i + 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-white">
                          {s.name}
                          <span className="text-[10.5px] font-bold uppercase tracking-wide bg-white/10 text-white/75 px-2 py-0.5 rounded">
                            {s.tag}
                          </span>
                        </p>
                        <p className="mt-1 text-[12.5px] text-white/60 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[12px] text-white/50 leading-relaxed">
                  * ১ম ও ২য় সার্ভারের মধ্যে Load Balancer ও Failover Cluster সক্রিয় রয়েছে।
                </p>
              </div>

              <img
                src={img26}
                alt="নিরাপত্তা"
                className="w-full rounded-3xl ring-1 ring-inset ring-white/15 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== PARTNERS MARQUEE ========== */}
      <section className="py-20 md:py-24 bg-slate-50 overflow-hidden">
        <div className="px-5">
          <SectionHeading
            eyebrow="আমাদের গ্রাহক"
            title="আমাদের সম্মানিত পার্টনারসমূহ"
            subtitle="দেশের বিভিন্ন প্রান্তের মাদ্রাসা ও শিক্ষা প্রতিষ্ঠান আমাদের সফটওয়্যার ব্যবহার করছে।"
          />
        </div>

        {/* সারি ১ */}
        <div className="relative w-full overflow-hidden partners-mask">
          <div className="flex items-center gap-4 w-max animate-marquee hover:[animation-play-state:paused]">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div
                key={`a-${i}`}
                className="group flex items-center gap-3 flex-shrink-0 bg-white rounded-2xl px-5 py-4 ring-1 ring-inset ring-slate-200 shadow-sm hover:ring-primary/30 hover:shadow-md transition-all whitespace-nowrap"
              >
                <span className="w-9 h-9 flex items-center justify-center text-base rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100 group-hover:bg-primary/5 transition-colors">
                  🏛️
                </span>
                <span className="text-[14px] font-bold text-slate-700">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* সারি ২ (উল্টো দিকে) */}
        <div className="relative w-full overflow-hidden partners-mask mt-4">
          <div className="flex items-center gap-4 w-max qmm-marquee-rev hover:[animation-play-state:paused]">
            {[...PARTNERS.slice().reverse(), ...PARTNERS.slice().reverse()].map((p, i) => (
              <div
                key={`b-${i}`}
                className="group flex items-center gap-3 flex-shrink-0 bg-white rounded-2xl px-5 py-4 ring-1 ring-inset ring-slate-200 shadow-sm hover:ring-primary/30 hover:shadow-md transition-all whitespace-nowrap"
              >
                <span className="w-9 h-9 flex items-center justify-center text-base rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-100 group-hover:bg-primary/5 transition-colors">
                  🏛️
                </span>
                <span className="text-[14px] font-bold text-slate-700">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14 px-5">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-navy to-primary text-white font-bold text-[14px] rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
          >
            <WhatsAppIcon />
            সফটওয়্যার কিনতে যোগাযোগ করুন
          </a>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="py-20 md:py-28 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div ref={pricingHeaderRef} className={pricingHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}>
            <SectionHeading
              eyebrow="মূল্য তালিকা"
              title="আপনার প্রতিষ্ঠানের জন্য উপযুক্ত প্যাকেজ বেছে নিন"
              subtitle="শিক্ষার্থীর সংখ্যা অনুযায়ী বিভিন্ন প্যাকেজ — যেকোনো সময় আপগ্রেড করার সুবিধা।"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {PACKAGES.map((pkg, i) => (
              <PricingCard key={i} pkg={pkg} index={i} />
            ))}
          </div>

          <p className="mt-10 text-center text-[13px] text-slate-400">
            সব প্যাকেজে সম্পূর্ণ মডিউল অ্যাক্সেস অন্তর্ভুক্ত। বিস্তারিত জানতে সরাসরি যোগাযোগ করুন।
          </p>
        </div>
      </section>

      {/* ========== GUIDE ACCORDION ========== */}
      {/* <section className="py-24 px-6 max-w-5xl mx-auto bg-slate-50">
          <div ref={guideHeaderRef} className={`text-center mb-12 ${guideHeaderInView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">প্রশ্ন ও উত্তর (FAQ)</h2>
              <p className="text-base text-slate-500 max-w-xl mx-auto">সফটওয়্যার ব্যবহার, সেটআপ ও পরিচালনার সকল প্রশ্নের উত্তর এখানে</p>
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
          </div>
      </section> */}

      {/* ========== SUBSCRIBE ========== */}
      <section
        ref={subscribeRef}
        className={`relative py-20 md:py-24 px-5 overflow-hidden bg-primary-navy ${
          subscribeInView ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-dark to-primary" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full bg-sky-400/20 blur-[120px]" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-[11px] font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full ring-1 ring-inset ring-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
            নিউজলেটার
          </span>

          <h2 className="mt-5 text-[26px] md:text-[38px] leading-tight font-extrabold tracking-tight text-white">
            আমাদের সাথে যুক্ত থাকুন
          </h2>

          <p className="mt-4 text-[14px] md:text-[16px] text-white/70 leading-relaxed max-w-lg mx-auto">
            নতুন ফিচার, অফার ও শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনার টিপস সবার আগে পেতে সাবস্ক্রাইব করুন।
          </p>

          <form className="mt-8 flex flex-col sm:flex-row gap-2.5 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl sm:rounded-full ring-1 ring-inset ring-white/20 max-w-md mx-auto">
            <input
              type="phone"
              className="flex-1 min-w-0 bg-transparent border-none outline-none px-5 py-3 text-[14px] text-white placeholder-white/50 text-center sm:text-left"
              placeholder="আপনার মোবাইল নাম্বার দিন"
            />
            <button
              type="submit"
              className="shrink-0 bg-white text-primary-navy font-bold text-[14px] px-6 py-3 rounded-xl sm:rounded-full hover:shadow-xl active:scale-[0.98] transition-all"
            >
              সাবস্ক্রাইব করুন
            </button>
          </form>

          <p className="mt-4 text-[12px] text-white/45">আমরা কখনো আপনার নাম্বার শেয়ার করি না।</p>
        </div>
      </section>

    </>
  );
};

export default Home;
