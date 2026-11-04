import React, { useMemo, useState } from 'react';
import { useGetVideoTutorialQuery } from '../../features/videotutorial/VideoTutorialQuerySlice';

export default function AllTutorialsExam() {
    const [search, setSearch] = useState('');

    const {
        data: videoList,
        isLoading: isVideoListLoading,
        isError: isVideoListError,
    } = useGetVideoTutorialQuery(1);

    const normalizeText = (text = '') =>
        text
            .toString()
            .normalize('NFC')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .trim()
            .toLowerCase();

    const filteredVideos = useMemo(() => {
        return (videoList ?? []).filter(video =>
            normalizeText(video.TutorialName).includes(
                normalizeText(search)
            )
        );
    }, [videoList, search]);

    // Featured video
    const featuredVideo = filteredVideos.find(
        video => video.VSerial === 1
    );

    // Other videos
    const otherVideos = filteredVideos.filter(
        video => video.ID !== featuredVideo?.ID
    );

    if (isVideoListError) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center bg-red-50 p-8 rounded-2xl">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold text-red-600">
                        ভিডিও লোড করা সম্ভব হয়নি
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                        অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br p-3 sm:p-5 lg:p-7">
            <div className="max-w-[1600px] mx-auto">
                {/* ================= SEARCH SECTION ================= */}
                <div className="mb-7">
                    <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-2 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 flex items-center gap-3 px-4">
                            <svg
                                className="w-6 h-6 text-violet-600 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <input
                                type="text"
                                placeholder="টিউটোরিয়াল খুঁজুন..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full py-3 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="text-gray-400 hover:text-red-500 text-xl"
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold">
                            <span>🎬</span>
                            <span>
                                {isVideoListLoading
                                    ? 'লোড হচ্ছে...'
                                    : `${filteredVideos.length} টি ভিডিও`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ================= LOADING SKELETON ================= */}
                {isVideoListLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(item => (
                            <div
                                key={item}
                                className="bg-white rounded-2xl p-3 shadow-md animate-pulse"
                            >
                                <div className="aspect-video bg-gray-200 rounded-xl" />
                                <div className="h-5 bg-gray-200 rounded mt-4 w-3/4" />
                                <div className="h-4 bg-gray-100 rounded mt-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {!isVideoListLoading && (
                    <>
                        {/* ================= FEATURED VIDEO ================= */}
                        {featuredVideo && (
                            <div className="mb-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/50 p-4 sm:p-6 overflow-hidden">
                                    {/* Featured Video Player */}
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-2xl blur-xl opacity-20" />
                                        <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${featuredVideo.VideoID}`}
                                                title={featuredVideo.TutorialName}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>

                                    {/* Featured Details */}
                                    <div className="flex flex-col justify-center py-2 lg:pl-4">
                                        <span className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 text-violet-700 font-bold text-sm mb-5">
                                            <span>⭐</span>
                                            বিশেষ ভিডিও
                                        </span>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 leading-relaxed">
                                            {featuredVideo.TutorialName}
                                        </h2>
                                        <div className="h-1 w-20 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 mt-5" />
                                        <div className="flex flex-wrap items-center gap-3 mt-6">
                                            <span className="px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-semibold">
                                                ✓ নির্বাচিত টিউটোরিয়াল
                                            </span>
                                            <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
                                                ▶ ভিডিও ক্লাস
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= OTHER VIDEOS ================= */}
                        {otherVideos.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-blue-600 to-cyan-400" />
                                        <h2 className="text-xl font-bold text-gray-800">
                                            সকল টিউটোরিয়াল
                                        </h2>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {otherVideos.length} টি ভিডিও
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {otherVideos.map((video, index) => (
                                        <div
                                            key={video.ID}
                                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-violet-100 transition-all duration-300 hover:-translate-y-1"
                                        >
                                            {/* Video Player */}
                                            <div className="relative bg-black aspect-video overflow-hidden">
                                                <iframe
                                                    className="w-full h-full"
                                                    src={`https://www.youtube.com/embed/${video.VideoID}`}
                                                    title={video.TutorialName}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            </div>

                                            {/* Video Details */}
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-50 text-violet-600">
                                                        ভিডিও #{index + 1}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        ▶ Tutorial
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 leading-relaxed line-clamp-2 min-h-[56px] group-hover:text-violet-600 transition-colors">
                                                    {video.TutorialName}
                                                </h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ================= EMPTY STATE ================= */}
                        {filteredVideos.length === 0 && (
                            <div className="bg-white rounded-3xl border border-dashed border-indigo-200 py-16 px-5 text-center shadow-sm">
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center text-4xl mb-5">
                                    🔍
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    কোনো টিউটোরিয়াল পাওয়া যায়নি
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    অন্য কোনো নামে সার্চ করে দেখুন।
                                </p>
                                <button
                                    onClick={() => setSearch('')}
                                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all"
                                >
                                    সকল ভিডিও দেখুন
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
