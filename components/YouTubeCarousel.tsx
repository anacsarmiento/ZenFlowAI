import React from 'react';
import { YouTubeVideo } from '../types';

interface YouTubeCarouselProps {
  videos: YouTubeVideo[];
  sources: any[];
  isLoading: boolean;
  error: string;
}

const VideoCard: React.FC<{ video: YouTubeVideo }> = ({ video }) => {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  // Using hqdefault for a higher quality thumbnail suitable for a larger display.
  const thumbnailUrl = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-500)] group"
      aria-label={`Watch ${video.title} on YouTube`}
    >
      <div className="relative aspect-video bg-gray-200">
        <img src={thumbnailUrl} alt={`Thumbnail for ${video.title}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
            </svg>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-800 text-base" title={video.title}>{video.title}</h4>
        <p className="text-sm text-gray-500 mt-1">{video.channel}</p>
      </div>
    </a>
  );
};


const YouTubeCarousel: React.FC<YouTubeCarouselProps> = ({ videos, sources, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Finding Your Sequence...</h3>
        <div className="flex justify-center items-center p-4">
            <div className="w-8 h-8 border-2 border-[var(--primary-200)] border-t-[var(--primary-500)] rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Searching for the perfect flow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Personalized Sequence</h3>
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
              <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null; // Don't render anything if there are no videos
  }

  const video = videos[0];

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Personalized Sequence</h3>
      <div className="w-full">
        <VideoCard video={video} />
      </div>
      
      {sources && sources.length > 0 && (
        <div className="mt-6 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sources</h4>
          <ul className="mt-2 space-y-1">
            {sources.map((source, index) => (
              source.web && (
                <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">・</span>
                    <a 
                      href={source.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-[var(--primary-700)] hover:text-[var(--accent-600)] hover:underline truncate"
                      title={source.web.title}
                    >
                        {source.web.title || source.web.uri}
                    </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default YouTubeCarousel;