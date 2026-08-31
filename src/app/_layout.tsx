import '../global.css';

import { LoadingScreen } from '@/components/ingredia/loading-screen';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/query-client';
import { NAV_THEME } from '@/lib/theme';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

export default function RootLayout(): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const { data: session, isPending } = authClient.useSession();
  console.log({ session, isPending })
  const themeName = colorScheme ?? 'light';

  if (isPending) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[themeName]}>
        <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={Boolean(session)}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="additives" />
            <Stack.Screen name="analyses" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="app" />
          </Stack.Protected>
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
