import React, { useState } from "react";
import { useGetVideoLinkListQuery } from "../../features/help/helpQuerySlice";

const Video = () => {
  const [search, setSearch] = useState("");

  const {
    data: videoList,
    isLoading: isVideoListLoading,
    isError: isVideoListError,
  } = useGetVideoLinkListQuery();

  // Normalize text for case-insensitive, special-character-free search
  const normalizeText = (text = "") =>
    text
      .toString()
      .normalize("NFC")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .toLowerCase();

  // Filter videos based on search term
  const filteredVideos =
    videoList?.filter((video) =>
      normalizeText(video.TutorialName).includes(normalizeText(search))
    ) || [];

  // Modern Loading State
  if (isVideoListLoading) {
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
  if (isVideoListError) {
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
        
        {/* Modern Search Input */}
        <div className="max-w-2xl mx-auto mb-14 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {/* Search Icon */}
            <svg
              className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for a tutorial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-300 text-base"
          />
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <div 
                key={video.VideoID} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="relative w-full aspect-video bg-gray-100">
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${video.VideoID}`}
                    title={video.TutorialName}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-5 flex-grow flex items-start border-t border-gray-50">
                  <p className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.TutorialName}
                  </p>
                </div>
              </div>
            ))}
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
            <p className="text-gray-500 mb-6">We couldn't find anything matching "{search}".</p>
            <button
              onClick={() => setSearch("")}
              className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-colors duration-200"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;


























// import React, { useState } from "react";
// import { useGetVideoLinkListQuery } from "../../features/help/helpQuerySlice";

// const Video = () => {
//   const [search, setSearch] = useState("");

//   const {
//     data: videoList,
//     isLoading: isVideoListLoading,
//     isError: isVideoListError,
//   } = useGetVideoLinkListQuery();

//   // Normalize text for case-insensitive, special-character-free search
//   const normalizeText = (text = "") =>
//     text
//       .toString()
//       .normalize("NFC")
//       .replace(/[^\p{L}\p{N}]+/gu, " ")
//       .trim()
//       .toLowerCase();

//   // Filter videos based on search term
//   const filteredVideos =
//     videoList?.filter((video) =>
//       normalizeText(video.TutorialName).includes(normalizeText(search))
//     ) || [];

//   if (isVideoListLoading) {
//     return (
//       <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4 min-h-screen">
//         <p className="text-xl text-gray-700">Loading videos...</p>
//       </div>
//     );
//   }

//   if (isVideoListError) {
//     return (
//       <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4 min-h-screen">
//         <p className="text-xl text-red-600">Failed to load videos</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4 min-h-screen">
//       <div className="max-w-6xl mx-auto">

//         {/* Search Input */}
//         <input
//           type="text"
//           placeholder="Search tutorials..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="mb-8 w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
//         />

//         {/* Video Grid - 3 columns on desktop, responsive */}
//         {filteredVideos.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredVideos.map((video) => (
//               <div key={video.VideoID} className="video-list">
//                 <iframe
//                   className="aspect-video w-full rounded-lg shadow-lg"
//                   src={`https://www.youtube.com/embed/${video.VideoID}`}
//                   title={video.TutorialName}
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                 ></iframe>
//                 <p className="text-lg font-medium mt-3 text-gray-800">
//                   {video.TutorialName}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-600 text-lg mt-8">
//             No videos found.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Video;
