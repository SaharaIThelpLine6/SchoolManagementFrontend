import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

/* ───────────── রঙের থিম (Tailwind ক্লাস স্ট্যাটিক রাখা হয়েছে, যাতে purge না হয়) ─────────────
   নতুন থিম যোগ করতে: এখানে একটা entry + নিচের themeSwatch-এ একটা entry দিলেই modal-এ আপনাআপনি দেখা যাবে */
const themes = {
  orange: {
    bar: 'from-orange-300 via-orange-400 to-amber-300',
    glow: 'from-orange-100/80 via-orange-50/40',
    tile: 'from-orange-300 to-orange-500 shadow-[0_10px_22px_-8px_rgba(249,115,22,0.7)]',
    featBg: 'bg-orange-100',
    featText: 'text-orange-500',
    dot: 'bg-orange-400',
    verPill: 'bg-orange-50 ring-orange-200/70',
    verText: 'text-orange-600',
    btn: 'from-orange-400 to-orange-500 shadow-[0_10px_24px_-8px_rgba(249,115,22,0.75)] hover:from-orange-500 hover:to-orange-600',
    focus: 'focus-visible:ring-orange-300',
  },
  sky: {
    bar: 'from-sky-300 via-sky-400 to-cyan-300',
    glow: 'from-sky-100/80 via-sky-50/40',
    tile: 'from-sky-300 to-sky-500 shadow-[0_10px_22px_-8px_rgba(14,165,233,0.7)]',
    featBg: 'bg-sky-100',
    featText: 'text-sky-500',
    dot: 'bg-sky-400',
    verPill: 'bg-sky-50 ring-sky-200/70',
    verText: 'text-sky-600',
    btn: 'from-sky-400 to-sky-500 shadow-[0_10px_24px_-8px_rgba(14,165,233,0.75)] hover:from-sky-500 hover:to-sky-600',
    focus: 'focus-visible:ring-sky-300',
  },
  violet: {
    bar: 'from-violet-300 via-violet-400 to-fuchsia-300',
    glow: 'from-violet-100/80 via-violet-50/40',
    tile: 'from-violet-300 to-violet-500 shadow-[0_10px_22px_-8px_rgba(139,92,246,0.7)]',
    featBg: 'bg-violet-100',
    featText: 'text-violet-500',
    dot: 'bg-violet-400',
    verPill: 'bg-violet-50 ring-violet-200/70',
    verText: 'text-violet-600',
    btn: 'from-violet-400 to-violet-500 shadow-[0_10px_24px_-8px_rgba(139,92,246,0.75)] hover:from-violet-500 hover:to-violet-600',
    focus: 'focus-visible:ring-violet-300',
  },
  rose: {
    bar: 'from-rose-300 via-rose-400 to-pink-300',
    glow: 'from-rose-100/80 via-rose-50/40',
    tile: 'from-rose-300 to-rose-500 shadow-[0_10px_22px_-8px_rgba(244,63,94,0.7)]',
    featBg: 'bg-rose-100',
    featText: 'text-rose-500',
    dot: 'bg-rose-400',
    verPill: 'bg-rose-50 ring-rose-200/70',
    verText: 'text-rose-600',
    btn: 'from-rose-400 to-rose-500 shadow-[0_10px_24px_-8px_rgba(244,63,94,0.75)] hover:from-rose-500 hover:to-rose-600',
    focus: 'focus-visible:ring-rose-300',
  },
  teal: {
    bar: 'from-teal-300 via-teal-400 to-emerald-300',
    glow: 'from-teal-100/80 via-teal-50/40',
    tile: 'from-teal-300 to-teal-500 shadow-[0_10px_22px_-8px_rgba(20,184,166,0.7)]',
    featBg: 'bg-teal-100',
    featText: 'text-teal-600',
    dot: 'bg-teal-400',
    verPill: 'bg-teal-50 ring-teal-200/70',
    verText: 'text-teal-600',
    btn: 'from-teal-400 to-teal-500 shadow-[0_10px_24px_-8px_rgba(20,184,166,0.75)] hover:from-teal-500 hover:to-teal-600',
    focus: 'focus-visible:ring-teal-300',
  },
  amber: {
    bar: 'from-amber-300 via-amber-400 to-yellow-300',
    glow: 'from-amber-100/80 via-amber-50/40',
    tile: 'from-amber-300 to-amber-500 shadow-[0_10px_22px_-8px_rgba(245,158,11,0.7)]',
    featBg: 'bg-amber-100',
    featText: 'text-amber-600',
    dot: 'bg-amber-400',
    verPill: 'bg-amber-50 ring-amber-200/70',
    verText: 'text-amber-600',
    btn: 'from-amber-400 to-amber-500 shadow-[0_10px_24px_-8px_rgba(245,158,11,0.75)] hover:from-amber-500 hover:to-amber-600',
    focus: 'focus-visible:ring-amber-300',
  },
  indigo: {
    bar: 'from-indigo-300 via-indigo-400 to-blue-300',
    glow: 'from-indigo-100/80 via-indigo-50/40',
    tile: 'from-indigo-300 to-indigo-500 shadow-[0_10px_22px_-8px_rgba(99,102,241,0.7)]',
    featBg: 'bg-indigo-100',
    featText: 'text-indigo-500',
    dot: 'bg-indigo-400',
    verPill: 'bg-indigo-50 ring-indigo-200/70',
    verText: 'text-indigo-600',
    btn: 'from-indigo-400 to-indigo-500 shadow-[0_10px_24px_-8px_rgba(99,102,241,0.75)] hover:from-indigo-500 hover:to-indigo-600',
    focus: 'focus-visible:ring-indigo-300',
  },
  pink: {
    bar: 'from-pink-300 via-pink-400 to-fuchsia-300',
    glow: 'from-pink-100/80 via-pink-50/40',
    tile: 'from-pink-300 to-pink-500 shadow-[0_10px_22px_-8px_rgba(236,72,153,0.7)]',
    featBg: 'bg-pink-100',
    featText: 'text-pink-500',
    dot: 'bg-pink-400',
    verPill: 'bg-pink-50 ring-pink-200/70',
    verText: 'text-pink-600',
    btn: 'from-pink-400 to-pink-500 shadow-[0_10px_24px_-8px_rgba(236,72,153,0.75)] hover:from-pink-500 hover:to-pink-600',
    focus: 'focus-visible:ring-pink-300',
  },
  cyan: {
    bar: 'from-cyan-300 via-cyan-400 to-sky-300',
    glow: 'from-cyan-100/80 via-cyan-50/40',
    tile: 'from-cyan-300 to-cyan-500 shadow-[0_10px_22px_-8px_rgba(6,182,212,0.7)]',
    featBg: 'bg-cyan-100',
    featText: 'text-cyan-600',
    dot: 'bg-cyan-400',
    verPill: 'bg-cyan-50 ring-cyan-200/70',
    verText: 'text-cyan-700',
    btn: 'from-cyan-500 to-cyan-600 shadow-[0_10px_24px_-8px_rgba(6,182,212,0.75)] hover:from-cyan-600 hover:to-cyan-700',
    focus: 'focus-visible:ring-cyan-300',
  },
  lime: {
    bar: 'from-lime-300 via-lime-400 to-green-300',
    glow: 'from-lime-100/80 via-lime-50/40',
    tile: 'from-lime-400 to-lime-600 shadow-[0_10px_22px_-8px_rgba(101,163,13,0.7)]',
    featBg: 'bg-lime-100',
    featText: 'text-lime-600',
    dot: 'bg-lime-500',
    verPill: 'bg-lime-50 ring-lime-200/70',
    verText: 'text-lime-700',
    btn: 'from-lime-500 to-lime-600 shadow-[0_10px_24px_-8px_rgba(101,163,13,0.75)] hover:from-lime-600 hover:to-lime-700',
    focus: 'focus-visible:ring-lime-300',
  },
};

/* modal-এর রঙ বাছাইয়ের গোল বোতামের রঙ (এটাও স্ট্যাটিক) */
const themeSwatch = {
  orange: 'bg-orange-400',
  sky: 'bg-sky-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
  teal: 'bg-teal-400',
  amber: 'bg-amber-400',
  indigo: 'bg-indigo-400',
  pink: 'bg-pink-400',
  cyan: 'bg-cyan-500',
  lime: 'bg-lime-500',
};

/* ───────────── আইকন লাইব্রেরি — ডেটায় শুধু key রাখা হয় (ডাটাবেসে সেভ করাও সহজ) ───────────── */
const icons = {
  reminder: {
    label: 'রিমাইন্ডার',
    paths: ['M4 5a2 2 0 012-2h12a2 2 0 012 2v9l-6 6H6a2 2 0 01-2-2V5z', 'M14 20v-4a2 2 0 012-2h4'],
  },
  attendance: {
    label: 'হাজিরা',
    paths: [
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    ],
  },
  book: {
    label: 'বই',
    paths: [
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    ],
  },
  result: {
    label: 'ফলাফল',
    paths: [
      'M12 14l9-5-9-5-9 5 9 5z',
      'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    ],
  },
  clock: { label: 'ঘড়ি', paths: ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'] },
  video: {
    label: 'ভিডিও',
    paths: [
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    ],
  },
  notice: {
    label: 'নোটিশ',
    paths: [
      'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    ],
  },
  alert: { label: 'অভিযোগ', paths: ['M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'] },
  wallet: {
    label: 'ফি',
    paths: [
      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    ],
  },
  ticket: {
    label: 'অ্যাডমিট',
    paths: [
      'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    ],
  },
  bell: {
    label: 'বেল',
    paths: [
      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    ],
  },
  star: {
    label: 'স্টার',
    paths: [
      'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    ],
  },
};

/* ───────────── কোন অ্যাপের মডিউল — ব্যাজের লেখা ও রঙ ───────────── */
const audiences = {
  teacher: { label: 'শিক্ষক অ্যাপ', cls: 'bg-blue-50 text-blue-600 ring-blue-100' },
  parent: { label: 'অভিভাবক অ্যাপ', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  both: { label: 'শিক্ষক ও অভিভাবক অ্যাপ', cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
};

/* ───────────── মডিউল ডেটা (শুরুর নমুনা — পরে API থেকে আনলে এটা initial state হিসেবে বদলে দিন) ───────────── */
const initialModules = [
  {
    id: 1,
    title: 'রিমাইন্ডার মডিউল',
    audience: 'both',
    theme: 'orange',
    icon: 'reminder',
    defaultEnabled: true,
    version: 'v9.0.1',
    price: 'ফ্রি',
    features: [
      'চালু থাকলে: ব্যবহারকারী টাস্ক তৈরি করতে পারবে, রিমাইন্ডারের দিন নোটিফিকেশন পাবে এবং ড্যাশবোর্ডে স্টিকি নোট আকারে আপকামিং টাস্ক দেখা যাবে।',
    ],
  },
  {
    id: 2,
    title: 'ডিজিটাল হাজিরা মডিউল',
    audience: 'teacher',
    theme: 'sky',
    icon: 'attendance',
    defaultEnabled: true,
    version: 'v4.1.0',
    price: 'ফ্রি',
    features: [
      'শিক্ষক মোবাইল থেকেই ক্লাসের দৈনিক হাজিরা নিতে পারবেন।',
      'এক ট্যাপে উপস্থিত, অনুপস্থিত বা ছুটি চিহ্নিত করা যাবে।',
      'অনুপস্থিত শিক্ষার্থীর অভিভাবকের কাছে স্বয়ংক্রিয়ভাবে নোটিফিকেশন যাবে।',
      'মাসিক হাজিরার সারসংক্ষেপ ও শতকরা হার দেখা যাবে।',
      'ইন্টারনেট না থাকলে অফলাইনে হাজিরা রেখে পরে সিঙ্ক করা যাবে।',
    ],
  },
  {
    id: 3,
    title: 'হোমওয়ার্ক মডিউল',
    audience: 'both',
    theme: 'violet',
    icon: 'book',
    defaultEnabled: true,
    version: 'v2.6.3',
    price: 'ফ্রি',
    features: [
      'শিক্ষক ক্লাস ও বিষয় অনুযায়ী ছবি বা পিডিএফসহ হোমওয়ার্ক দিতে পারবেন।',
      'জমা দেওয়ার শেষ তারিখ ঠিক করা যাবে।',
      'অভিভাবক সন্তানের আজকের ও বকেয়া হোমওয়ার্ক এক জায়গায় দেখবেন।',
      'নতুন হোমওয়ার্ক দিলে অভিভাবকের কাছে নোটিফিকেশন যাবে।',
    ],
  },
  {
    id: 4,
    title: 'ফলাফল এন্ট্রি মডিউল',
    audience: 'teacher',
    theme: 'rose',
    icon: 'result',
    defaultEnabled: true,
    version: 'v3.0.2',
    price: 'ফ্রি',
    features: [
      'শিক্ষক নিজের বিষয়ের নম্বর মোবাইল থেকে সরাসরি এন্ট্রি দিতে পারবেন।',
      'মোট নম্বর, গ্রেড ও জিপিএ স্বয়ংক্রিয়ভাবে হিসাব হবে।',
      'খাতা লক করার পর নম্বর আর পরিবর্তন করা যাবে না।',
      'এন্ট্রি দেওয়ার সাথে সাথে সার্ভারে সংরক্ষণ হবে, আলাদা সেভ বাটন লাগবে না।',
      'কোন শিক্ষার্থীর নম্বর বাকি আছে তা আলাদা করে দেখা যাবে।',
    ],
  },
  {
    id: 5,
    title: 'ক্লাস রুটিন মডিউল',
    audience: 'both',
    theme: 'teal',
    icon: 'clock',
    defaultEnabled: true,
    version: 'v1.8.0',
    price: 'ফ্রি',
    features: [
      'শিক্ষক আজকের ক্লাসগুলো সময় ও কক্ষসহ এক নজরে দেখতে পারবেন।',
      'অভিভাবক সন্তানের সাপ্তাহিক ক্লাস রুটিন দেখবেন।',
      'রুটিন বদলালে সংশ্লিষ্ট সবার কাছে নোটিফিকেশন যাবে।',
    ],
  },
  {
    id: 6,
    title: 'ক্লাস ভিডিও মডিউল',
    audience: 'parent',
    theme: 'amber',
    icon: 'video',
    defaultEnabled: true,
    version: 'v1.4.5',
    price: 'ফ্রি',
    features: [
      'শিক্ষকের আপলোড করা পাঠের ভিডিও ক্লাস ও বিষয় অনুযায়ী সাজানো থাকবে।',
      'শিক্ষার্থী যেকোনো সময় ভিডিও দেখে পড়া ঝালিয়ে নিতে পারবে।',
      'নতুন ভিডিও আসলে অভিভাবকের কাছে নোটিফিকেশন যাবে।',
      'ভিডিওর শিরোনাম ও তারিখ দিয়ে খুঁজে নেওয়া যাবে।',
    ],
  },
  {
    id: 7,
    title: 'নোটিশ বোর্ড মডিউল',
    audience: 'both',
    theme: 'indigo',
    icon: 'notice',
    defaultEnabled: true,
    version: 'v2.2.1',
    price: 'ফ্রি',
    features: [
      'প্রতিষ্ঠানের নোটিশ, ছুটি ও পরীক্ষার ঘোষণা সবার মোবাইলে পৌঁছে যাবে।',
      'গুরুত্বপূর্ণ নোটিশ উপরে পিন করে রাখা যাবে।',
      'নোটিশ কে পড়েছে আর কে পড়েনি তা দেখা যাবে।',
      'শুধু নির্দিষ্ট ক্লাসের অভিভাবকদের নোটিশ পাঠানো যাবে।',
    ],
  },
  {
    id: 8,
    title: 'অভিযোগ বাক্স মডিউল',
    audience: 'parent',
    theme: 'pink',
    icon: 'alert',
    defaultEnabled: true,
    version: 'v1.2.0',
    price: 'ফ্রি',
    features: [
      'অভিভাবক সরাসরি মোবাইল থেকে অভিযোগ বা পরামর্শ জানাতে পারবেন।',
      'অভিযোগের বর্তমান অবস্থা (গ্রহণ, প্রক্রিয়াধীন, সমাধান) দেখা যাবে।',
      'অভিযোগ জমা দেওয়ার আগে শর্তাবলি দেখানো হবে।',
    ],
  },
  {
    id: 9,
    title: 'ফি ও বকেয়া মডিউল',
    audience: 'parent',
    theme: 'cyan',
    icon: 'wallet',
    defaultEnabled: true,
    version: 'v3.5.2',
    price: 'ফ্রি',
    features: [
      'অভিভাবক সন্তানের মাসিক ফি, বকেয়া ও জমার হিসাব দেখতে পারবেন।',
      'বিকাশ, নগদ বা কার্ডে অনলাইনে ফি পরিশোধ করা যাবে।',
      'পেমেন্টের পর স্বয়ংক্রিয়ভাবে রসিদ তৈরি হবে এবং ডাউনলোড করা যাবে।',
      'বকেয়া থাকলে নির্ধারিত তারিখে রিমাইন্ডার যাবে।',
      'আগের সব পেমেন্টের ইতিহাস তারিখ অনুযায়ী দেখা যাবে।',
    ],
  },
  {
    id: 10,
    title: 'পরীক্ষা ও অ্যাডমিট কার্ড মডিউল',
    audience: 'parent',
    theme: 'lime',
    icon: 'ticket',
    defaultEnabled: true,
    version: 'v2.0.4',
    price: 'ফ্রি',
    features: [
      'অভিভাবক পরীক্ষার রুটিন, কক্ষ ও আসন বিন্যাস দেখতে পারবেন।',
      'অ্যাডমিট কার্ড মোবাইলে দেখা ও ডাউনলোড করা যাবে।',
      'ফলাফল প্রকাশ হলে নোটিফিকেশন পাওয়া যাবে এবং মার্কশিট দেখা যাবে।',
      'পরীক্ষার ফি বকেয়া থাকলে অ্যাডমিট কার্ডে সতর্কবার্তা দেখাবে।',
    ],
  },
];

/* ───────────── ছোট সহায়ক কম্পোনেন্ট ───────────── */
const Svg = ({ paths, className = 'h-5 w-5', strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    {paths.map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);

const P = {
  plus: ['M12 4v16m8-8H4'],
  edit: ['M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'],
  trash: [
    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  ],
  close: ['M6 18L18 6M6 6l12 12'],
  check: ['M5 13l4 4L19 7'],
};

/* ───────────── মডিউল কার্ড ───────────── */
const ModuleCard = ({ module, onEdit, onDelete }) => {
  const t = themes[module.theme] || themes.orange;
  const audience = audiences[module.audience] || audiences.both;
  const iconPaths = (icons[module.icon] || icons.star).paths;
  const { user } = useSelector((state) => state.auth);

  const [enabled, setEnabled] = useState(module.defaultEnabled);
  const [savedEnabled, setSavedEnabled] = useState(module.defaultEnabled);
  const [justSaved, setJustSaved] = useState(false);

  // পরিবর্তন হয়েছে কি না — না হলে সংরক্ষণ বাটন নিষ্ক্রিয় থাকবে
  const dirty = enabled !== savedEnabled;

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const handleSave = () => {
    if (!dirty) return;
    // এখানে সংরক্ষণের লজিক / API কল বসান (চালু/বন্ধ অবস্থা)
    console.log({ id: module.id, enabled });
    setSavedEnabled(enabled);
    setJustSaved(true);
  };

  const buttonStyle = justSaved
    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_10px_24px_-8px_rgba(5,150,105,0.7)]'
    : dirty
      ? `bg-gradient-to-b ${t.btn} text-white active:scale-[0.98]`
      : 'bg-slate-100 text-slate-400 cursor-not-allowed';

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_-14px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-14px_rgba(15,23,42,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* উপরের গ্লো ও অ্যাকসেন্ট — বন্ধ করলে ধূসর হয়ে যায় */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 transition-all duration-500 motion-reduce:transition-none ${enabled ? '' : 'opacity-60 grayscale'}`}
      >
        <div className={`h-1.5 bg-gradient-to-r ${t.bar}`} />
        <div className={`h-36 bg-gradient-to-b ${t.glow} to-transparent`} />
      </div>

      <div className="relative flex flex-1 flex-col">
        {/* হেডার */}
        <div className="flex items-center gap-3.5 px-5 pb-5 pt-8">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/50 transition-all duration-500 motion-reduce:transition-none ${t.tile} ${enabled ? '' : 'opacity-60 grayscale'}`}
          >
            <Svg paths={iconPaths} className="h-7 w-7 text-white" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <h2 className="text-lg font-bold leading-tight text-slate-800">{module.title}</h2>
            <span
              className={`rounded-full px-2.5 text-sm py-0.5 font-semibold ring-1 ring-inset ${audience.cls}`}
            >
              {audience.label}
            </span>
          </div>

          {/* টগল */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={`${module.title} চালু/বন্ধ`}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-[30px] w-[54px] shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 motion-reduce:transition-none ${enabled ? 'bg-emerald-500 shadow-[0_6px_16px_-4px_rgba(16,185,129,0.65)]' : 'bg-slate-300'
              }`}
          >
            <span
              className={`absolute left-[3px] top-[3px] h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none ${enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* ফিচার বক্স — লেখা বেশি হলে ভেতরে স্ক্রল হবে */}
        <div className="flex-1 px-5 pb-5">
          <div className="h-full rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
            <div className="mb-2.5 flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.featBg}`}>
                <Svg paths={icons.attendance.paths} className={`h-6 w-6 ${t.featText}`} />
              </div>
              <span className="text-base font-bold text-slate-800">বিস্তারিত</span>
            </div>

            <ul
              tabIndex={0}
              className="max-h-52 space-y-2 overflow-y-auto rounded pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
            >
              {module.features.map((feature, idx) => (
                <li key={idx} className="flex gap-2 text-[13px] leading-relaxed text-slate-600">
                  <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ফুটার */}
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
            <span className={`rounded-xl px-3.5 py-2 text-xs text-slate-600 ring-1 ring-inset ${t.verPill}`}>
              সংস্করণ <b className={`ml-0.5 ${t.verText}`}>{module.version}</b>
            </span>
            <span className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs text-slate-600 ring-1 ring-inset ring-emerald-200/70">
              মূল্য <b className="ml-0.5 text-emerald-700">{module.price}</b>
            </span>

            {/* সম্পাদনা ও মুছুন */}
            {
              user?.permissionType === 1 &&
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(module)}
                  aria-label={`${module.title} সম্পাদনা`}
                  title="সম্পাদনা"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <Svg paths={P.edit} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(module)}
                  aria-label={`${module.title} মুছুন`}
                  title="মুছুন"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <Svg paths={P.trash} className="h-4 w-4" />
                </button>
              </div>
            }
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty && !justSaved}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${t.focus} ${buttonStyle}`}
          >
            {justSaved && <Svg paths={P.check} className="h-4 w-4" strokeWidth={3} />}
            {justSaved ? 'সংরক্ষিত হয়েছে' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───────────── মডাল সহায়ক ───────────── */
const inputCls =
  'w-full rounded-xl border-0 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400';

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-600">{label}</label>
    {children}
  </div>
);

const ModalShell = ({ onClose, children, maxWidth = 'max-w-xl' }) => {
  // Esc চাপলে বন্ধ + পেছনের স্ক্রল বন্ধ
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden mb-8 rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/5`}
      >
        {children}
      </div>
    </div>
  );
};

/* ───────────── নতুন / সম্পাদনা মডাল ───────────── */
const emptyForm = {
  title: '',
  audience: 'both',
  theme: 'orange',
  icon: 'star',
  version: 'v1.0.0',
  price: 'ফ্রি',
  defaultEnabled: true,
  features: [''],
};

const ModuleFormModal = ({ module, onClose, onSubmit }) => {
  const isEdit = !!module;
  const [form, setForm] = useState(
    module ? { ...module, features: [...module.features] } : emptyForm
  );
  const [error, setError] = useState('');

  const t = themes[form.theme] || themes.orange;
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setFeature = (i, value) =>
    setForm((f) => ({ ...f, features: f.features.map((x, idx) => (idx === i ? value : x)) }));
  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i) =>
    setForm((f) => ({
      ...f,
      features: f.features.length > 1 ? f.features.filter((_, idx) => idx !== i) : [''],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const features = form.features.map((x) => x.trim()).filter(Boolean);

    if (!title) return setError('মডিউলের নাম দিন।');
    if (features.length === 0) return setError('কমপক্ষে একটি বৈশিষ্ট্য লিখুন।');

    onSubmit({
      ...form,
      title,
      version: form.version.trim() || 'v1.0.0',
      price: form.price.trim() || 'ফ্রি',
      features,
    });
  };

  return (
    <ModalShell onClose={onClose}>
      {/* হেডার — নির্বাচিত থিম ও আইকনের লাইভ প্রিভিউ */}
      <div className="relative shrink-0 overflow-hidden border-b border-slate-100 font-SolaimanLipi">
        <div className={`h-1.5 bg-gradient-to-r ${t.bar}`} />
        <div className={`absolute inset-x-0 top-1.5 h-24 bg-gradient-to-b ${t.glow} to-transparent`} />
        <div className="relative flex items-center gap-3.5 px-6 py-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/50 transition-all duration-300 ${t.tile}`}
          >
            <Svg paths={(icons[form.icon] || icons.star).paths} className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-800">
              {isEdit ? 'মডিউল সম্পাদনা' : 'নতুন মডিউল তৈরি করুন'}
            </h3>
            <p className="truncate text-xs text-slate-500">{form.title.trim() || 'মডিউলের নাম এখানে দেখাবে'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Svg paths={P.close} className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
          <Field label="মডিউলের নাম *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                set('title', e.target.value);
                setError('');
              }}
              placeholder="যেমন: লাইব্রেরি মডিউল"
              className={inputCls}
              autoFocus
            />
          </Field>

          <Field label="কোন অ্যাপের জন্য">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(audiences).map(([key, a]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('audience', key)}
                  className={`rounded-xl px-2 py-2.5 text-xs font-semibold ring-1 ring-inset transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${form.audience === key
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-400'
                    : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="রঙের থিম">
            <div className="flex flex-wrap gap-2.5">
              {Object.keys(themes).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('theme', key)}
                  aria-label={key}
                  aria-pressed={form.theme === key}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${themeSwatch[key]} text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${form.theme === key
                    ? 'scale-110 ring-2 ring-slate-800 ring-offset-2'
                    : 'opacity-80 hover:scale-105 hover:opacity-100'
                    }`}
                >
                  {form.theme === key && <Svg paths={P.check} className="h-4 w-4" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Field>

          <Field label="আইকন">
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(icons).map(([key, ic]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('icon', key)}
                  title={ic.label}
                  aria-label={ic.label}
                  aria-pressed={form.icon === key}
                  className={`flex h-11 items-center justify-center rounded-xl ring-1 ring-inset transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${form.icon === key
                    ? 'bg-emerald-50 text-emerald-600 ring-emerald-400'
                    : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <Svg paths={ic.paths} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="সংস্করণ">
              <input
                type="text"
                value={form.version}
                onChange={(e) => set('version', e.target.value)}
                placeholder="v1.0.0"
                className={inputCls}
              />
            </Field>
            <Field label="মূল্য">
              <input
                type="text"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="ফ্রি বা ৳৩০০/মাস"
                className={inputCls}
              />
            </Field>
          </div>

          {/* নতুন তৈরির সময়ই শুরুর অবস্থা ঠিক করা যাবে */}
          {!isEdit && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-inset ring-slate-200">
              <span className="text-sm font-semibold text-slate-700">তৈরির পরেই চালু থাকবে</span>
              <button
                type="button"
                role="switch"
                aria-checked={form.defaultEnabled}
                onClick={() => set('defaultEnabled', !form.defaultEnabled)}
                className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${form.defaultEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.defaultEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          )}

          <Field label="মডিউল বৈশিষ্ট্য *">
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.dot}`} />
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => {
                      setFeature(i, e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder={`বৈশিষ্ট্য ${(i + 1).toLocaleString('bn-BD')}`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    aria-label="বৈশিষ্ট্য মুছুন"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  >
                    <Svg paths={P.close} className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Svg paths={P.plus} className="h-3.5 w-3.5" strokeWidth={2.5} />
              আরেকটি বৈশিষ্ট্য যোগ করুন
            </button>
          </Field>
        </div>

        {/* ফুটার */}
        <div className="shrink-0 border-t border-slate-100 px-6 pb-5 pt-4">
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-100">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className={`flex-[2] rounded-2xl bg-gradient-to-b px-5 py-3 text-sm font-bold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${t.btn} ${t.focus}`}
            >
              {isEdit ? 'আপডেট করুন' : 'মডিউল তৈরি করুন'}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

/* ───────────── মুছে ফেলার নিশ্চিতকরণ ───────────── */
const DeleteModal = ({ module, onClose, onConfirm }) => (
  <ModalShell onClose={onClose} maxWidth="max-w-sm">
    <div className="px-6 pb-5 pt-7 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-inset ring-rose-100">
        <Svg paths={P.trash} className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">মডিউল মুছে ফেলবেন?</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        “{module.title}” স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো যাবে না।
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          বাতিল
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(244,63,94,0.75)] transition hover:from-rose-600 hover:to-rose-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
        >
          হ্যাঁ, মুছুন
        </button>
      </div>
    </div>
  </ModalShell>
);

/* ───────────── মূল পেজ ───────────── */
const Module = () => {
  const [modules, setModules] = useState(initialModules);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = নতুন তৈরি
  const [deleting, setDeleting] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (module) => {
    setEditing(module);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (data) => {
    if (editing) {
      // এখানে আপডেট API কল বসান
      setModules((list) => list.map((m) => (m.id === editing.id ? { ...m, ...data, id: m.id } : m)));
    } else {
      // এখানে তৈরির API কল বসান (সার্ভার থেকে আসল id নিন)
      setModules((list) => [...list, { ...data, id: Date.now() }]);
    }
    closeForm();
  };

  const handleDelete = () => {
    // এখানে ডিলিট API কল বসান
    setModules((list) => list.filter((m) => m.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br rounded-md from-emerald-50 via-white to-orange-50/40 p-6 font-SolaimanLipi">
      {/* পেজ হেডার */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_10px_22px_-8px_rgba(16,185,129,0.7)] ring-1 ring-inset ring-white/50">
            <Svg
              paths={[
                'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
              ]}
              className="h-6 w-6"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight text-slate-800">ফ্রি মডিউল</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
                {modules.length.toLocaleString('bn-BD')}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">কোনো খরচ নেই — সরাসরি চালু করা যায়।</p>
          </div>
        </div>
        {
          user?.permissionType === 1 &&
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(5,150,105,0.7)] transition-all duration-300 hover:from-emerald-500 hover:to-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <Svg paths={P.plus} className="h-4 w-4" strokeWidth={2.5} />
            নতুন মডিউল
          </button>
        }
      </div>

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white/70 px-6 py-16 text-center ring-1 ring-slate-900/5">
          <p className="text-sm font-semibold text-slate-600">কোনো মডিউল নেই</p>
          <p className="mt-1 text-xs text-slate-400">উপরের “নতুন মডিউল” বাটনে ক্লিক করে যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {formOpen && (
        <ModuleFormModal
          key={editing ? editing.id : 'new'}
          module={editing}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <DeleteModal module={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default Module;