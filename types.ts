
export interface YogaRecommendation {
  busynessLevel: 'Busy' | 'Moderate' | 'Relaxed';
  recommendedFlow: string;
  reasoning: string;
  samplePose: string;
}

export interface YouTubeVideo {
  title: string;
  channel: string;
  videoId: string;
}

export interface Theme {
  name: 'emerald' | 'ocean' | 'sunset' | 'custom';
  primaryColor?: string; // For custom theme
  accentColor?: string;  // For custom theme
}