// Tracks which backend capabilities are actually live, so the UI can show
// honest "not available yet" states instead of fabricated data. Flip a flag
// to true only once the corresponding Feranmi-owned endpoint is confirmed working.
export const FEATURES = {
  harvestReports: true,
  dailyInsights: true,
  weather: true,
  farmTasks: false,
  cropAdvisory: true,
  voiceCall: true,
} as const;

export type FeatureName = keyof typeof FEATURES;
