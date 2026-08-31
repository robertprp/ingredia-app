import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { authClient, persistMagicLinkSessionCookie } from '@/lib/auth-client';
import { ROUTES } from '@/lib/routes';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CircleAlert, CircleCheck, Mail } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
type SearchParam = string | string[] | undefined;

function firstParam(param: SearchParam): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

function messageFromError(error: { message?: string; code?: string } | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.code === 'INVALID_TOKEN') {
    return 'This sign-in link is invalid or has expired. Request a new link below.';
  }
  return error.message ?? 'Something went wrong. Please try again.';
}

export function AuthEntryScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{
    cookie?: SearchParam;
    error?: SearchParam;
    error_description?: SearchParam;
  }>();
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const handledCallback = useRef<string | null>(null);
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(Boolean(firstParam(params.cookie)));

  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = /^\S+@\S+\.\S+$/.test(normalizedEmail);
  const callbackError = firstParam(params.error);
  const displayError =
    error ??
    (!sentTo && callbackError
      ? messageFromError({
          code: callbackError,
          message: firstParam(params.error_description),
        })
      : null);

  useEffect(() => {
    if (session) router.replace(ROUTES.tabs);
  }, [session]);

  useEffect(() => {
    const callbackCookie = firstParam(params.cookie);
    if (!callbackCookie || handledCallback.current === callbackCookie) return;

    handledCallback.current = callbackCookie;
    const sessionCookie = callbackCookie;
    let active = true;

    async function finishMagicLinkSignIn() {
      setPending(true);
      setError(null);

      try {
        await persistMagicLinkSessionCookie(sessionCookie);
        const result = await authClient.getSession();

        if (!active) return;
        if (!result.data) {
          setError(
            'The link was verified, but the session could not be restored. Request a new link.'
          );
          return;
        }

        await refetchSession();
      } catch {
        if (active) {
          setError('We could not complete sign-in. Request a new link and try again.');
        }
      } finally {
        if (active) setPending(false);
      }
    }

    void finishMagicLinkSignIn();

    return () => {
      active = false;
    };
  }, [params.cookie, refetchSession]);

  const sendMagicLink = async () => {
    if (!emailIsValid) {
      setError('Enter a valid email address.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      const { error: magicLinkError } = await authClient.signIn.magicLink({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        callbackURL: Linking.createURL('/login'),
        errorCallbackURL: Linking.createURL('/login'),
      });

      if (magicLinkError) {
        setError(messageFromError(magicLinkError));
        return;
      }

      setSentTo(normalizedEmail);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-warm" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-8 pt-12"
          keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-2xl flex-1">
            <View className="size-14 items-center justify-center rounded-2xl bg-brand-purple/10">
              <Icon as={Mail} className="text-brand-purple" size={28} />
            </View>

            <Text className="mt-6 font-display text-5xl leading-[1.04] tracking-tight text-brand-ink">
              Sign in or create your account
            </Text>
            <Text className="mt-4 font-sans text-lg leading-7 text-brand-ink/65">
              Enter your email and we will send you a secure sign-in link
            </Text>

            <View className="mt-10">
              <Text className="mb-4 font-sans-semibold text-2xl text-brand-ink">
                Your email
              </Text>
              <Input
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                className="h-16 rounded-2xl border-0 bg-black/5 px-5 font-sans text-lg text-brand-ink"
                editable={!pending}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setSentTo(null);
                  setError(null);
                }}
                placeholder="Email address"
                placeholderTextColor="#A6A8AA"
                returnKeyType="send"
                textContentType="emailAddress"
                value={email}
                onSubmitEditing={() => void sendMagicLink()}
              />
            </View>

            {displayError ? (
              <Alert className="mt-5" icon={CircleAlert} variant="destructive">
                <AlertTitle>Unable to continue</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            ) : sentTo ? (
              <Alert className="mt-5" icon={CircleCheck}>
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  We sent a sign-in link to {sentTo}. Open it on this device to continue.
                </AlertDescription>
              </Alert>
            ) : null}
          </View>
        </ScrollView>

        <View className="flex-row gap-3 rounded-t-[32px] border-t border-black/5 px-5 pb-3 pt-5">
          <Button
            accessibilityLabel="Go back"
            className="h-16 rounded-2xl px-5"
            disabled={pending}
            variant="outline"
            onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} />
            <Text className="font-sans-semibold text-base">Back</Text>
          </Button>

          <Button
            className="h-16 flex-1 rounded-2xl bg-brand-purple px-4"
            disabled={pending}
            onPress={() => void sendMagicLink()}>
            {pending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center font-sans-semibold text-base text-white">
                {sentTo ? 'Send another link' : 'Email me a sign-in link'}
              </Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
