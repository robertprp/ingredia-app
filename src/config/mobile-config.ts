import { Platform } from 'react-native';

const developmentApiUrl = Platform.select({
  android: 'https://sneezing-surprise-syrup.ngrok-free.dev',
  default: 'https://sneezing-surprise-syrup.ngrok-free.dev',
});

export const mobileConfig = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_BETTER_AUTH_URL ??
    developmentApiUrl,
} as const;
