import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, ChevronRight, CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'login' | 'sign-up';
type AuthMethod = 'email' | 'google' | 'apple';
type AuthStep = 'email' | 'password';

type AuthEntryScreenProps = {
  mode: AuthMode;
};

function messageFromError(error: { message?: string; code?: string } | null) {
  if (!error) return null;
  if (error.code === 'EMAIL_NOT_VERIFIED') {
    return 'Verify your email before signing in.';
  }
  return error.message ?? 'Something went wrong. Please try again.';
}

export function AuthEntryScreen({ mode }: AuthEntryScreenProps) {
  const { verified } = useLocalSearchParams<{ verified?: string }>();
  const [step, setStep] = useState<AuthStep>('email');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignUp = mode === 'sign-up';
  const normalizedEmail = email.trim().toLowerCase();
  const emailIsValid = /^\S+@\S+\.\S+$/.test(normalizedEmail);
  const passwordIsValid = password.length >= 8 && password.length <= 128;

  const copy = useMemo(
    () => ({
      title: isSignUp ? 'Create your account' : 'Sign in to your account',
      socialVerb: isSignUp ? 'Sign up' : 'Sign in',
    }),
    [isSignUp]
  );

  const goBack = () => {
    setError(null);
    if (step === 'password') {
      setStep('email');
      return;
    }
    router.back();
  };

  const continueWithEmail = async () => {
    if (step === 'email') {
      if (!emailIsValid) {
        setError('Enter a valid email address.');
        return;
      }
      setError(null);
      setStep('password');
      return;
    }

    if (!passwordIsValid) {
      setError('Your password must be between 8 and 128 characters.');
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await authClient.signUp.email({
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          password,
          callbackURL: Linking.createURL('/login', {
            queryParams: { verified: 'true' },
          }),
        });

        if (signUpError) {
          setError(messageFromError(signUpError));
          return;
        }

        router.replace(`/verify-email?email=${encodeURIComponent(normalizedEmail)}` as Href);
        return;
      }

      const { error: signInError } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        const nextError = messageFromError(signInError);
        setError(nextError);
        if (signInError.code === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}` as Href);
        }
        return;
      }

      router.replace('/app' as Href);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };

  const continueWithSocial = async (provider: 'google' | 'apple') => {
    setPending(true);
    setError(null);
    try {
      const { error: socialError } = await authClient.signIn.social({
        provider,
        callbackURL: '/app',
      });

      if (socialError) {
        setError(messageFromError(socialError));
        return;
      }

      router.replace('/app' as Href);
    } catch {
      setError(
        `${provider === 'google' ? 'Google' : 'Apple'} sign-in is not available yet. Check the provider configuration on the server.`
      );
    } finally {
      setPending(false);
    }
  };

  const handleContinue = () => {
    if (method === 'email') {
      void continueWithEmail();
      return;
    }
    void continueWithSocial(method);
  };

  const continueLabel =
    method === 'email'
      ? step === 'email'
        ? 'Continue'
        : isSignUp
          ? 'Create account'
          : 'Sign in'
      : `Continue with ${method === 'google' ? 'Google' : 'Apple'}`;

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
            <Text className="font-display text-5xl leading-[1.04] tracking-tight text-brand-ink">
              {copy.title}
            </Text>

            <View className="mt-10">
              <Text className="mb-4 font-sans-semibold text-2xl text-brand-ink">
                {step === 'email' ? 'With your email' : 'Enter your password'}
              </Text>

              {step === 'email' ? (
                <Input
                  accessibilityLabel="Email address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  className="h-16 rounded-2xl border-0 bg-black/5 px-5 font-sans text-lg text-brand-ink"
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setMethod('email');
                    setError(null);
                  }}
                  onFocus={() => setMethod('email')}
                  placeholder="Email address"
                  placeholderTextColor="#A6A8AA"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  value={email}
                  onSubmitEditing={() => void continueWithEmail()}
                />
              ) : (
                <View className="relative">
                  <Input
                    accessibilityLabel="Password"
                    autoCapitalize="none"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    className="h-16 rounded-2xl border-0 bg-black/5 px-5 pr-14 font-sans text-lg text-brand-ink"
                    onChangeText={(value) => {
                      setPassword(value);
                      setError(null);
                    }}
                    placeholder="Password"
                    placeholderTextColor="#A6A8AA"
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    textContentType={isSignUp ? 'newPassword' : 'password'}
                    value={password}
                    onSubmitEditing={() => void continueWithEmail()}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-4 size-8 items-center justify-center"
                    hitSlop={8}
                    onPress={() => setShowPassword((current) => !current)}>
                    <Icon
                      as={showPassword ? EyeOff : Eye}
                      className="text-muted-foreground"
                      size={22}
                    />
                  </Pressable>
                </View>
              )}

              {step === 'password' && !isSignUp ? (
                <Button
                  className="mt-2 self-end px-0"
                  variant="link"
                  onPress={() => router.push('/forgot-password' as Href)}>
                  <Text>Forgot password?</Text>
                </Button>
              ) : null}
            </View>

            {error ? (
              <Alert className="mt-5" icon={CircleAlert} variant="destructive">
                <AlertTitle>Unable to continue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : verified === 'true' ? (
              <Alert className="mt-5" icon={CircleCheck}>
                <AlertTitle>Email verified</AlertTitle>
                <AlertDescription>Sign in to continue to NOOVELLER.</AlertDescription>
              </Alert>
            ) : null}

            {step === 'email' ? (
              <View className="mt-10 gap-4">
                <Text className="font-sans-semibold text-2xl text-brand-ink">Or use</Text>

                <ProviderRow
                  active={method === 'google'}
                  label={`${copy.socialVerb} with Google`}
                  logo={<Text className="font-sans-semibold text-3xl text-[#4285F4]">G</Text>}
                  onPress={() => {
                    setMethod('google');
                    setError(null);
                  }}
                />

                {Platform.OS === 'ios' ? (
                  <ProviderRow
                    active={method === 'apple'}
                    label={`${copy.socialVerb} with Apple`}
                    logo={
                      <Text style={{ fontFamily: 'System' }} className="text-4xl leading-9 text-black">
                        
                      </Text>
                    }
                    onPress={() => {
                      setMethod('apple');
                      setError(null);
                    }}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View className="flex-row gap-3 rounded-t-[32px] border-t border-black/5 bg-white px-5 pb-3 pt-5">
          <Button
            accessibilityLabel="Go back"
            className="h-16 rounded-2xl px-5"
            disabled={pending}
            variant="outline"
            onPress={goBack}>
            <Icon as={ArrowLeft} size={24} />
            <Text className="font-sans-semibold text-base">Back</Text>
          </Button>

          <Button
            className="h-16 flex-1 rounded-2xl bg-brand-purple px-4"
            disabled={pending}
            onPress={handleContinue}>
            {pending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center font-sans-semibold text-base text-white">
                {continueLabel}
              </Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProviderRow({
  active,
  label,
  logo,
  onPress,
}: {
  active: boolean;
  label: string;
  logo: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={
        active
          ? 'h-20 flex-row items-center rounded-2xl border-2 border-brand-purple bg-white px-5'
          : 'h-20 flex-row items-center rounded-2xl border-2 border-transparent bg-white px-5'
      }
      onPress={onPress}>
      <View className="w-12 items-center">{logo}</View>
      <Text className="ml-2 flex-1 font-sans-semibold text-lg text-brand-ink">{label}</Text>
      <Icon as={ChevronRight} className="text-black/30" size={28} />
    </Pressable>
  );
}
