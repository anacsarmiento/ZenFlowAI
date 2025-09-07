import React from 'react';
import GoogleCalendarManager from './GoogleCalendarManager';

interface CalendarInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  // Google Calendar props
  isSignedIn: boolean;
  isSyncing: boolean;
  gcalError: string;
  onSignIn: () => void;
  onSignOut: () => void;
  onSync: () => void;
}

const Instructions: React.FC = () => (
  <details className="mt-4 text-sm text-white/80 group">
    <summary className="font-semibold cursor-pointer list-none flex items-center">
      <span className="group-open:rotate-90 transform transition-transform duration-200 mr-1">&#9656;</span>
      Need help copying your schedule?
    </summary>
    <div className="mt-3 pl-4 border-l-2 border-white/30 space-y-3">
        <div>
          <h4 className="font-bold">Google Calendar</h4>
          <p>Go to your calendar, click the three-dot menu, select 'Print', choose your date range, and copy the text from the preview.</p>
        </div>
        <div>
          <h4 className="font-bold">Outlook Calendar</h4>
          <p>In the 'Print' view, select the 'List' or 'Agenda' style, and copy the text directly from the print preview screen.</p>
        </div>
        <div>
          <h4 className="font-bold">Apple Calendar</h4>
          <p>Use the 'File' > 'Print' menu, select 'List' view, and you can copy your events from the PDF preview.</p>
        </div>
    </div>
  </details>
);

const CalendarInput: React.FC<CalendarInputProps> = ({ 
  value, onChange, onSubmit, isLoading,
  isSignedIn, isSyncing, gcalError, onSignIn, onSignOut, onSync
}) => {
  return (
    <div className="bg-[var(--primary-800)] p-6 rounded-xl shadow-inner">
      <h2 className="text-lg font-semibold text-white mb-2 text-center">
        1. Input Your Day's Schedule
      </h2>
      
      <div className="flex flex-col space-y-4">

        <GoogleCalendarManager
            isSignedIn={isSignedIn}
            isSyncing={isSyncing}
            error={gcalError}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            onSync={onSync}
        />

        <div className="flex items-center text-xs text-white/50">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4">OR PASTE MANUALLY</span>
            <div className="flex-grow border-t border-white/20"></div>
        </div>

        <textarea
          id="calendar-input"
          value={value}
          onChange={onChange}
          placeholder={`e.g.\n9:00 AM - 10:00 AM: Team Standup\n10:00 AM - 11:30 AM: Project Deep Dive\n12:00 PM - 1:00 PM: Lunch\n...`}
          className="w-full h-48 p-4 bg-[var(--primary-900)]/50 text-gray-100 border border-[var(--primary-600)] rounded-lg focus:ring-2 focus:ring-[var(--primary-400)] focus:border-[var(--primary-400)] transition duration-200 ease-in-out resize-none placeholder-gray-400"
          disabled={isLoading}
        />
        
        <Instructions />

        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="w-full sm:w-auto self-end px-8 py-3 bg-[var(--accent-500)] text-[var(--accent-contrast)] font-bold rounded-lg hover:bg-[var(--accent-600)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-300)] transition-transform transform hover:scale-105 disabled:bg-[var(--primary-700)] disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Analyzing...' : '2. Find Your Flow'}
        </button>
      </div>
    </div>
  );
};

export default CalendarInput;