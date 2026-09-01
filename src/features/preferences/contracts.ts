export interface UserPreferences {
  pregnancyMode: boolean;
  riskAlerts: boolean;
  locale: string;
}

export interface AccountDeletionResponse {
  scheduledAt: string;
}
