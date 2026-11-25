// Tracks which backend capabilities are actually live, so the UI can show
// honest "not available yet" states instead of fabricated data. Flip a flag
// to true only once the corresponding Feranmi-owned endpoint is confirmed working.
export const FEATURES = {
  harvestReports: true,
  dailyInsights: false,
  weather: false,
  farmTasks: false,
  cropAdvisory: false,
  voiceCall: false,
} as const;

export type FeatureName = keyof typeof FEATURES;
