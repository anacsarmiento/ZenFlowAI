
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--primary-700)]">
      <div className="w-12 h-12 border-4 border-[var(--primary-200)] border-t-[var(--primary-600)] rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">Finding your flow...</p>
      <p className="text-sm text-[var(--primary-600)]">Analyzing your schedule and generating a recommendation.</p>
    </div>
  );
};

export default LoadingSpinner;