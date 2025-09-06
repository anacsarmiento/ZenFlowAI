
import React from 'react';
import { YogaRecommendation } from '../types';

interface RecommendationDisplayProps {
  recommendation: YogaRecommendation;
  imageUrl: string;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, imageUrl }) => {
  const { busynessLevel, recommendedFlow, reasoning, samplePose } = recommendation;
  
  const getBusynessColor = () => {
    switch(busynessLevel) {
      case 'Busy': return 'bg-red-100 text-red-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Relaxed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="animate-fade-in transition-opacity duration-500 ease-in-out">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-[var(--primary-200)] pb-2">Your Personalized Flow</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 pr-0 md:pr-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Busyness Level</h3>
            <p className={`inline-block px-3 py-1 mt-1 text-md font-bold rounded-full ${getBusynessColor()}`}>
              {busynessLevel}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recommended Flow</h3>
            <p className="text-2xl font-bold text-[var(--primary-700)]">{recommendedFlow}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Why this flow?</h3>
            <p className="text-gray-600 leading-relaxed">{reasoning}</p>
          </div>
        </div>
        <div className="md:col-span-1 flex flex-col items-center justify-center">
            {imageUrl ? (
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <img src={imageUrl} alt={samplePose} className="w-full h-full object-cover" />
              </div>
            ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                    <div className="w-10 h-10 border-4 border-dashed border-gray-300 rounded-full animate-spin"></div>
              </div>
            )}
            <p className="mt-3 font-semibold text-gray-700 text-center">{samplePose}</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDisplay;