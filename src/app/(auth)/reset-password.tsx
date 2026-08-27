import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async () => {
    if (!token) {
      setError('This reset link is missing its token. Request a new link.');
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setError('Your password must be between 8 and 128 characters.');
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (resetError) {
        setError(resetError.message ?? 'We could not reset your password.');
        return;
      }
      setComplete(true);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-warm px-6" edges={['top', 'bottom']}>
      <View className="mx-auto w-full max-w-2xl flex-1 justify-center">
        <Text className="font-display text-5xl leading-[1.04] tracking-tight text-brand-ink">
          {complete ? 'Password updated' : 'Choose a new password'}
        </Text>
        <Text className="mt-4 text-lg leading-7 text-muted-foreground">
          {complete
            ? 'You can now sign in with your new password.'
            : 'Use at least 8 characters. Your existing sessions will be signed out.'}
        </Text>

        {complete ? (
          <View className="mt-10 items-center rounded-3xl bg-white px-6 py-12">
            <Icon as={CircleCheck} className="text-brand-purple" size={64} />
            <Button className="mt-8 h-14 w-full rounded-2xl" onPress={() => router.replace('/login' as Href)}>
              <Text className="font-sans-semibold text-white">Sign in</Text>
            </Button>
          </View>
        ) : (
          <View className="mt-10">
            <View className="relative">
              <Input
                accessibilityLabel="New password"
                autoCapitalize="none"
                autoComplete="new-password"
                className="h-16 rounded-2xl border-0 bg-black/5 px-5 pr-14 text-lg"
                onChangeText={(value) => {
                  setPassword(value);
                  setError(null);
                }}
                placeholder="New password"
                placeholderTextColor="#A6A8AA"
                secureTextEntry={!showPassword}
                value={password}
                onSubmitEditing={() => void submit()}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-4 size-8 items-center justify-center"
                onPress={() => setShowPassword((current) => !current)}>
                <Icon as={showPassword ? EyeOff : Eye} className="text-muted-foreground" size={22} />
              </Pressable>
            </View>

            {error ? (
              <Alert className="mt-5" icon={CircleAlert} variant="destructive">
                <AlertTitle>Unable to reset password</AlertTitle>
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
                <Text className="font-sans-semibold text-white">Update password</Text>
              )}
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
