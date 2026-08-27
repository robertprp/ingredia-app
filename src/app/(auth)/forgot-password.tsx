import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';
import { ArrowLeft, CircleAlert, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { error: requestError } = await authClient.requestPasswordReset({
        email: normalizedEmail,
        redirectTo: Linking.createURL('/reset-password'),
      });

      if (requestError) {
        setError(requestError.message ?? 'We could not send the reset email.');
        return;
      }
      setSent(true);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-warm px-6" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="mx-auto w-full max-w-2xl flex-1 pt-8"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Button
          accessibilityLabel="Go back"
          className="mb-10 size-12 rounded-full p-0"
          variant="outline"
          onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={22} />
        </Button>

        <Text className="font-display text-5xl leading-[1.04] tracking-tight text-brand-ink">
          {sent ? 'Check your email' : 'Reset your password'}
        </Text>
        <Text className="mt-4 font-sans text-lg leading-7 text-muted-foreground">
          {sent
            ? `If an account exists for ${email.trim()}, we sent it a password reset link.`
            : 'Enter your email and we’ll send you a secure reset link.'}
        </Text>

        {sent ? (
          <View className="mt-10 items-center rounded-3xl bg-white px-6 py-12">
            <View className="size-20 items-center justify-center rounded-full bg-brand-lavender">
              <Icon as={MailCheck} className="text-brand-purple" size={38} />
            </View>
            <Button className="mt-8 h-14 w-full rounded-2xl" onPress={() => router.replace('/login' as Href)}>
              <Text className="font-sans-semibold text-white">Back to sign in</Text>
            </Button>
          </View>
        ) : (
          <View className="mt-10">
            <Text className="mb-3 font-sans-semibold text-lg">Email address</Text>
            <Input
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              className="h-16 rounded-2xl border-0 bg-black/5 px-5 text-lg"
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setError(null);
              }}
              placeholder="Email address"
              placeholderTextColor="#A6A8AA"
              returnKeyType="send"
              value={email}
              onSubmitEditing={() => void submit()}
            />

            {error ? (
              <Alert className="mt-5" icon={CircleAlert} variant="destructive">
                <AlertTitle>Unable to send email</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              className="mt-6 h-16 rounded-2xl"
              disabled={pending}
              onPress={() => void submit()}>
              {pending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-sans-semibold text-white">Send reset link</Text>
              )}
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
