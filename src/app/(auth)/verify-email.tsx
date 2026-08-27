import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Check, CircleAlert, Mail, UsersRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RESEND_DELAY_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [countdown, setCountdown] = useState(RESEND_DELAY_SECONDS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const resend = async () => {
    if (!email || countdown > 0) return;
    setPending(true);
    setError(null);
    setResent(false);
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: Linking.createURL('/login', {
          queryParams: { verified: 'true' },
        }),
      });
      if (resendError) {
        setError(resendError.message ?? 'We could not resend the verification email.');
        return;
      }
      setCountdown(RESEND_DELAY_SECONDS);
      setResent(true);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };

  const openMailApp = async () => {
    const mailURL = Platform.OS === 'ios' ? 'message://' : 'mailto:';
    const canOpen = await Linking.canOpenURL(mailURL);
    if (!canOpen) {
      setError('No email app is available on this device.');
      return;
    }
    await Linking.openURL(mailURL);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-warm px-5" edges={['top', 'bottom']}>
      <View className="mx-auto w-full max-w-2xl flex-1 pt-8">
        <Text className="font-display text-4xl leading-tight tracking-tight text-brand-ink">
          Check your email on this device
        </Text>
        <Text className="mt-3 font-sans text-base leading-6 text-brand-ink">
          We sent a verification link to{' '}
          <Text className="font-sans-semibold text-brand-ink">{email}</Text>
        </Text>
        <View className="mt-2 flex-row flex-wrap">
          <Text className="text-sm leading-5 text-muted-foreground">
            Didn’t receive it? Check spam or{' '}
          </Text>
          <Pressable accessibilityRole="button" disabled={countdown > 0 || pending} onPress={() => void resend()}>
            <Text className="text-sm text-muted-foreground underline">
              {pending
                ? 'Sending…'
                : countdown > 0
                  ? `Resend in 00:${String(countdown).padStart(2, '0')}`
                  : 'Resend email'}
            </Text>
          </Pressable>
        </View>

        {resent ? (
          <Text className="mt-3 text-sm text-brand-purple">A new verification email was sent.</Text>
        ) : null}

        {error ? (
          <Alert className="mt-5" icon={CircleAlert} variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <View className="flex-1 items-center justify-center py-8">
          <View className="h-36 w-44 rotate-[-4deg] items-center justify-center rounded-[28px] border border-purple-200 bg-purple-100 shadow-lg shadow-brand-purple/20">
            <View className="absolute left-5 top-5 size-3 rounded-full bg-white/70" />
            <Icon as={Mail} className="text-brand-purple" size={76} strokeWidth={1.5} />
          </View>
        </View>

        <View className="rounded-3xl border border-black/5 bg-white px-5 py-4">
          <InstructionRow
            icon={Mail}
            title="Open your email app"
            description="On this device"
          />
          <InstructionRow
            icon={Check}
            title="Tap the large verify button"
            description="If it doesn’t work, use the code received"
          />
          <InstructionRow
            icon={UsersRound}
            title="Need help? We’re here"
            description="Write to support@nooveller.com"
          />
        </View>

        <Button className="mt-4 h-14 rounded-2xl" onPress={() => void openMailApp()}>
          <Text className="font-sans-semibold text-white">Open email app</Text>
        </Button>
        <Button className="mt-1" variant="link" onPress={() => router.replace('/login' as Href)}>
          {pending ? <ActivityIndicator /> : <Text>Back to sign in</Text>}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function InstructionRow({
  icon,
  title,
  description,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-3 py-2">
      <Icon as={icon} className="mt-0.5 text-brand-ink" size={20} />
      <View className="flex-1">
        <Text className="font-sans-semibold text-base text-brand-ink">{title}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</Text>
      </View>
    </View>
  );
}
