import { Platform } from 'react-native';

const developmentApiUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const mobileConfig = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_BETTER_AUTH_URL ??
    developmentApiUrl,
} as const;
