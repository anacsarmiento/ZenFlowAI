import React from 'react';

interface BusynessVisualizerProps {
  score: number; // A percentage from 0 to 100
}

const BusynessVisualizer: React.FC<BusynessVisualizerProps> = ({ score }) => {
  const totalSegments = 10;
  const activeSegments = Math.round((score / 100) * totalSegments);

  const getColor = (index: number) => {
    if (index >= activeSegments) {
      return 'bg-gray-200'; // Inactive
    }
    if (score <= 40) {
      return 'bg-emerald-400'; // Relaxed
    }
    if (score <= 70) {
      return 'bg-yellow-400'; // Moderate
    }
    return 'bg-red-400'; // Busy
  };

  const getLabel = () => {
    if (score === 0) return 'Ready for your schedule...';
    if (score <= 40) return 'Looks like a relaxed day';
    if (score <= 70) return 'Looks moderately busy';
    return 'Looks like a busy day';
  }

  return (
    <div className="my-2 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-600">
          Estimated Busyness
        </label>
        <span className="text-sm font-bold text-gray-700">{getLabel()}</span>
      </div>
      <div className="flex w-full h-3 rounded-full overflow-hidden space-x-1 p-0.5 bg-gray-100">
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-full transition-colors duration-300 ${getColor(i)}`}
            style={{ transitionDelay: `${i * 20}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default BusynessVisualizer;
