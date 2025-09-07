import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { analyzeCalendarAndRecommendFlow, generatePoseImage, fetchYouTubeFlows } from './services/geminiService';
import { initGoogleClient, handleSignInClick, handleSignOutClick, listTodaysEvents } from './services/googleCalendarService';
import { YogaRecommendation, YouTubeVideo, Theme } from './types';
import CalendarInput from './components/CalendarInput';
import RecommendationDisplay from './components/RecommendationDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import BusynessVisualizer from './components/BusynessVisualizer';
import Feedback from './components/Feedback';
import SessionManager from './components/SessionManager';
import { calculateBusyness } from './utils/calendarAnalyzer';
import YouTubeCarousel from './components/YouTubeCarousel';
import PaywallModal from './components/PaywallModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import { getContrastingTextColor, adjustColor } from './utils/colorUtils';
import { SettingsIcon } from './components/Icons';

type FeedbackState = 'idle' | 'positive' | 'negative-prompt' | 'negative-submitted';

const STORAGE_KEY = 'zenflow_savedSession';
const USAGE_COUNT_KEY = 'zenflow_usageCount';
const SUBSCRIBED_KEY = 'zenflow_isSubscribed';
const THEME_KEY = 'zenflow_theme';
const USAGE_LIMIT = 3;

const defaultTheme: Theme = { name: 'emerald' };

const App: React.FC = () => {
  const [calendarText, setCalendarText] = useState<string>('');
  const [recommendation, setRecommendation] = useState<YogaRecommendation | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [busynessScore, setBusynessScore] = useState<number>(0);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [youtubeSources, setYoutubeSources] = useState<any[]>([]);
  const [isFetchingVideos, setIsFetchingVideos] = useState<boolean>(false);
  const [youtubeError, setYoutubeError] = useState<string>('');
  
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState<boolean>(false);
  
  // Google Calendar State
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [gcalError, setGcalError] = useState<string>('');


  useEffect(() => {
    // Load saved session, usage, subscription, and theme
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) setHasSavedData(true);
    const savedUsage = parseInt(localStorage.getItem(USAGE_COUNT_KEY) || '0', 10);
    const savedSubscription = localStorage.getItem(SUBSCRIBED_KEY) === 'true';
    setUsageCount(savedUsage);
    setIsSubscribed(savedSubscription);
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setTheme(JSON.parse(savedTheme));

    // Initialize Google Client
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // The gapi script has loaded, now we can initialize the client.
      initGoogleClient(setIsSignedIn, setGcalError);
    };
    document.body.appendChild(script);
    return () => {
        document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const score = calculateBusyness(calendarText);
    setBusynessScore(score);
  }, [calendarText]);
  
  const customThemeStyles: any = useMemo(() => {
    if (theme.name !== 'custom' || !theme.primaryColor || !theme.accentColor) return {};
    return {
      '--primary-50': adjustColor(theme.primaryColor, 0.9), '--primary-100': adjustColor(theme.primaryColor, 0.8),
      '--primary-200': adjustColor(theme.primaryColor, 0.6), '--primary-300': adjustColor(theme.primaryColor, 0.4),
      '--primary-400': adjustColor(theme.primaryColor, 0.2), '--primary-500': theme.primaryColor,
      '--primary-600': adjustColor(theme.primaryColor, -0.1), '--primary-700': adjustColor(theme.primaryColor, -0.2),
      '--primary-800': adjustColor(theme.primaryColor, -0.3), '--primary-900': adjustColor(theme.primaryColor, -0.4),
      '--accent-300': adjustColor(theme.accentColor, 0.4), '--accent-500': theme.accentColor,
      '--accent-600': adjustColor(theme.accentColor, -0.1), '--accent-700': adjustColor(theme.accentColor, -0.2),
      '--accent-900': adjustColor(theme.accentColor, -0.4), '--accent-contrast': getContrastingTextColor(theme.accentColor),
    };
  }, [theme]);

  const handleAnalyze = useCallback(async () => {
    if (usageCount >= USAGE_LIMIT && !isSubscribed) {
      setShowPaywall(true);
      return;
    }
    if (!calendarText.trim()) {
      setError('Please paste or sync your calendar schedule first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendation(null);
    setImageUrl('');
    setYoutubeVideos([]);
    setYoutubeSources([]);
    setYoutubeError('');
    setFeedbackState('idle');

    try {
      const rec = await analyzeCalendarAndRecommendFlow(calendarText);
      setRecommendation(rec);

      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      localStorage.setItem(USAGE_COUNT_KEY, newUsageCount.toString());
      
      let generatedImageUrl = '';
      if (rec?.samplePose) {
        generatedImageUrl = await generatePoseImage(rec.samplePose);
        setImageUrl(generatedImageUrl);
      }
      
      let fetchedVideos: YouTubeVideo[] = [];
      let fetchedSources: any[] = [];
      if (rec?.recommendedFlow) {
        setIsFetchingVideos(true);
        try {
          const result = await fetchYouTubeFlows(rec.recommendedFlow);
          fetchedVideos = result.videos;
          fetchedSources = result.sources;
          setYoutubeVideos(fetchedVideos);
          setYoutubeSources(fetchedSources);
        } catch (videoError) {
            console.error(videoError);
            setYoutubeError('Could not fetch video suggestions at this time.');
        } finally {
            setIsFetchingVideos(false);
        }
      }

      const sessionData = {
        calendarText, recommendation: rec, imageUrl: generatedImageUrl,
        busynessScore: calculateBusyness(calendarText),
        youtubeVideos: fetchedVideos, youtubeSources: fetchedSources,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      setHasSavedData(true);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [calendarText, usageCount, isSubscribed]);

  // Feedback Handlers
  const handlePositiveFeedback = () => setFeedbackState('positive');
  const handleNegativeFeedback = () => setFeedbackState('negative-prompt');
  const handleFeedbackSubmit = (feedback: string) => {
    console.log("Feedback Submitted:", feedback);
    setFeedbackState('negative-submitted');
  };

  // Session Handlers
  const handleLoadSavedData = useCallback(() => {
    const savedDataString = localStorage.getItem(STORAGE_KEY);
    if (savedDataString) {
      const savedData = JSON.parse(savedDataString);
      setCalendarText(savedData.calendarText);
      setRecommendation(savedData.recommendation);
      setImageUrl(savedData.imageUrl);
      setBusynessScore(savedData.busynessScore ?? calculateBusyness(savedData.calendarText));
      setYoutubeVideos(savedData.youtubeVideos ?? []);
      setYoutubeSources(savedData.youtubeSources ?? []);
      setError('');
      setYoutubeError('');
      setFeedbackState('idle');
      document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleClearSavedData = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your saved session?")) {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedData(false); setCalendarText(''); setRecommendation(null);
      setImageUrl(''); setBusynessScore(0); setYoutubeVideos([]);
      setYoutubeSources([]); setError(''); setYoutubeError(''); setFeedbackState('idle');
    }
  }, []);
  
  // Google Calendar Handlers
  const handleSignIn = useCallback(() => {
    setGcalError('');
    handleSignInClick();
  }, []);
  const handleSignOut = useCallback(() => {
    handleSignOutClick();
    setIsSignedIn(false);
  }, []);
  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setGcalError('');
    try {
      const events = await listTodaysEvents();
      setCalendarText(events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not sync calendar.';
      setGcalError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  }, []);
  

  // Paywall Handlers
  const handleShare = () => {
    const shareText = "Just found my perfect yoga flow with ZenFlow AI! It analyzes your calendar to recommend a personalized practice. 🧘‍♀️✨ #ZenFlowAI #Yoga";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
    setUsageCount(0);
    localStorage.setItem(USAGE_COUNT_KEY, '0');
    setShowPaywall(false);
  };
  const handleSubscribe = () => {
    alert("Thank you for subscribing! You now have unlimited access.");
    setIsSubscribed(true);
    localStorage.setItem(SUBSCRIBED_KEY, 'true');
    setShowPaywall(false);
  };

  // Theme Handler
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
  };
  
  const themeClassName = theme.name !== 'custom' ? `theme-${theme.name}` : '';

  return (
    <div 
      className={`bg-[var(--primary-50)] min-h-screen font-sans text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8 ${themeClassName}`}
      style={customThemeStyles}
    >
      {showPaywall && <PaywallModal onShare={handleShare} onSubscribe={handleSubscribe} onClose={() => setShowPaywall(false)} />}
      {showThemeSwitcher && <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} onClose={() => setShowThemeSwitcher(false)} />}
      
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full flex justify-end items-center gap-3 mb-4">
            <SessionManager hasSavedData={hasSavedData} onLoad={handleLoadSavedData} onClear={handleClearSavedData} />
            <button
                onClick={() => setShowThemeSwitcher(true)}
                className="p-2 rounded-full text-[var(--primary-700)] bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-500)] transition-colors"
                aria-label="Customize theme"
            >
                <SettingsIcon />
            </button>
        </div>

        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--primary-800)] tracking-tight">ZenFlow AI</h1>
            <p className="text-lg text-[var(--primary-600)] mt-2">Your personal yoga recommender based on your day's schedule.</p>
        </header>

        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <CalendarInput
            value={calendarText}
            onChange={(e) => setCalendarText(e.target.value)}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
            isSignedIn={isSignedIn}
            isSyncing={isSyncing}
            gcalError={gcalError}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onSync={handleSync}
          />
          
          {calendarText.trim().length > 0 && !isLoading && !recommendation && <BusynessVisualizer score={busynessScore} />}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && <LoadingSpinner />}
          
          {!isLoading && recommendation && (
            <>
              <RecommendationDisplay recommendation={recommendation} imageUrl={imageUrl} />
              <YouTubeCarousel videos={youtubeVideos} sources={youtubeSources} isLoading={isFetchingVideos} error={youtubeError} />
              <Feedback state={feedbackState} onPositive={handlePositiveFeedback} onNegative={handleNegativeFeedback} onSubmit={handleFeedbackSubmit} />
            </>
          )}

          {!isLoading && !recommendation && (
             <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-lg">Your personalized yoga recommendation will appear here.</p>
               {calendarText.trim().length === 0 && (
                <p className="mt-2 text-sm">Paste or sync your schedule above to see your day's busyness.</p>
              )}
            </div>
          )}
        </main>

        <footer className="text-center mt-8 text-sm text-gray-500">
            <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;