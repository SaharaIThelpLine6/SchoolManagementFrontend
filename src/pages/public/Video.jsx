import React, { useState } from "react";
import { useGetWebSettingsQuery } from "../../features/settings/settingsQuerySlice";

// Helper to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Video = () => {
  // Fetch settings from the website settings endpoint
  const {
    data: settingsData,
    isLoading,
    isError,
  } = useGetWebSettingsQuery();

  // Extract videoLinks from settings
  const videoLinks = React.useMemo(() => {
    if (!settingsData || !Array.isArray(settingsData)) return [];
    const videoField = settingsData.find(item => item.FieldKey === 'videoLinks');
    if (!videoField) return [];
    try {
      const parsed = JSON.parse(videoField.FieldValue);
      return Array.isArray(parsed) ? parsed.filter(item => item?.url?.trim()) : [];
    } catch {
      return [];
    }
  }, [settingsData]);

  // Modern Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-[#fafaf9] min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-medium tracking-wide">Loading tutorials...</p>
        </div>
      </div>
    );
  }

  // Modern Error State
  if (isError) {
    return (
      <div className="flex items-center justify-center bg-[#fafaf9] min-h-screen p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-red-100">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load videos</h3>
          <p className="text-gray-500 text-sm">Please check your connection and try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-SolaimanLipi bg-[#fafaf9] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Video Grid */}
        {videoLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoLinks.map((item, index) => {
              const videoId = getYouTubeVideoId(item.url);
              // If not YouTube, skip or use a fallback? For now only YouTube supported.
              if (!videoId) return null;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    <iframe
                      className="absolute inset-0 w-full h-full border-0"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={`Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200 max-w-3xl mx-auto">
            <svg 
              className="mx-auto h-16 w-16 text-gray-300 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-500 mb-6">There are no video tutorials available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;
