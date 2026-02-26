import React, { useState } from 'react';
import { useGetVideoLinkListQuery } from '../features/help/helpQuerySlice';

export default function YoutubeTutorials() {
    const [search, setSearch] = useState("");
    const {
        data: videoList,
        isLoading: isVideoListLoading,
        isError: isVideoListError,
    } = useGetVideoLinkListQuery();
    const normalizeText = (text = "") =>text
    .toString()
    .normalize("NFC")          // Unicode normalize
    .replace(/[^\p{L}\p{N}]+/gu, " ") // special chars remove
    .trim()
    .toLowerCase();
    const filteredVideos = videoList?.filter(video =>
        normalizeText(video.TutorialName).includes(
            normalizeText(search)
        )
    );


    if (isVideoListLoading) return <p>Loading...</p>;
    if (isVideoListError) return <p>Failed to load videos</p>;
    return (
        <div className="youtube-tutorials">
            <input
                type="text"
                placeholder="Search tutorials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-8 w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring"
            />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-y-[60px] gap-x-[10px]'>
                {
                    filteredVideos && filteredVideos.map((video) => (
                        <div className="video-list">
                            <iframe
                                className='aspect-video w-full rounded-lg'
                                src={`https://www.youtube.com/embed/${video.VideoID}`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <p className='text-[28px] pt-4'>{video.TutorialName}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}