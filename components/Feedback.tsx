import React, { useState } from 'react';

// Thumbs Up SVG Icon
const ThumbsUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.949-.684l2.121-6.364A1 1 0 0015.434 10H11V4a1 1 0 00-1-1H7a1 1 0 00-1 1v6.333z" />
  </svg>
);

// Thumbs Down SVG Icon
const ThumbsDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.949.684L3.566 9H5v6a1 1 0 001 1h3a1 1 0 001-1V9.667z" />
  </svg>
);


interface FeedbackProps {
  state: 'idle' | 'positive' | 'negative-prompt' | 'negative-submitted';
  onPositive: () => void;
  onNegative: () => void;
  onSubmit: (feedback: string) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ state, onPositive, onNegative, onSubmit }) => {
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      onSubmit(feedbackText);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'positive':
        return <p className="text-center text-[var(--primary-700)] font-medium">Thanks for your feedback!</p>;
      
      case 'negative-submitted':
        return <p className="text-center text-[var(--primary-700)] font-medium">Thanks for helping us improve!</p>;

      case 'negative-prompt':
        return (
          <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
            <label htmlFor="feedback-input" className="font-semibold text-gray-700">What could be better?</label>
            <textarea
              id="feedback-input"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g., The recommended flow was too intense for my busy day."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent-500)] focus:border-[var(--accent-500)] transition duration-200 ease-in-out resize-none"
              aria-label="Feedback input"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[var(--primary-600)] text-white font-bold rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-300)] transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!feedbackText.trim()}
            >
              Submit Feedback
            </button>
          </form>
        );

      case 'idle':
      default:
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <p className="font-semibold text-gray-700">Was this recommendation helpful?</p>
            <div className="flex space-x-3">
              <button
                onClick={onPositive}
                aria-label="Helpful"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-green-100 hover:border-green-400 hover:text-green-700 transition-colors"
              >
                <ThumbsUpIcon />
                Yes
              </button>
              <button
                onClick={onNegative}
                aria-label="Not helpful"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-red-100 hover:border-red-400 hover:text-red-700 transition-colors"
              >
                <ThumbsDownIcon />
                No
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in">
      {renderContent()}
    </div>
  );
};

export default Feedback;