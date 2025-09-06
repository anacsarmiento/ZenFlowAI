import React from 'react';

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const ProIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);


interface PaywallModalProps {
  onShare: () => void;
  onSubscribe: () => void;
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ onShare, onSubscribe, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <h2 id="paywall-title" className="text-2xl font-bold text-[var(--primary-800)] mb-2">Unlock More Flows</h2>
          <p className="text-gray-600 mb-6">You've used all your free recommendations. Please choose an option to continue your wellness journey.</p>
          
          <div className="space-y-4">
            {/* Share Option */}
            <button
              onClick={onShare}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-[var(--primary-50)] hover:border-[var(--primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] transition-all flex items-center space-x-4 group"
            >
              <div className="flex-shrink-0 bg-[var(--primary-100)] text-[var(--primary-600)] p-3 rounded-full">
                <ShareIcon />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Share for 3 More Uses</p>
                <p className="text-sm text-gray-500">Share on X (Twitter) to get your next 3 recommendations for free.</p>
              </div>
            </button>

            {/* Subscribe Option */}
            <button
              onClick={onSubscribe}
              className="w-full text-left p-4 border-2 border-[var(--accent-500)] bg-[var(--primary-50)] rounded-lg hover:bg-[var(--primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] transition-all flex items-center space-x-4 group"
            >
              <div className="flex-shrink-0 bg-[var(--primary-200)] text-[var(--accent-700)] p-3 rounded-full">
                <ProIcon />
              </div>
              <div>
                <p className="font-semibold text-[var(--accent-900)]">Go Pro for $75/year</p>
                <p className="text-sm text-[var(--accent-700)]">Get unlimited, lifetime access and support the app.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;