import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { IdentityVerificationCard } from "@/components/verification/identity-verification-card";
import { authClient } from "@/lib/auth-client";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthenticatedHomeScreen() {
  const { data: session } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/");
  };

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-warm">
        <ActivityIndicator color="#4B2E83" />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-brand-warm px-7"
      edges={["top", "bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-2xl flex-grow justify-center py-10"
      >
        <Text className="font-display text-5xl leading-tight text-brand-ink">
          Welcome to NOOVELLER
        </Text>
        <Text className="mt-4 text-lg leading-7 text-muted-foreground">
          Signed in as {session.user.email}
        </Text>

        <View className="mt-10">
          <IdentityVerificationCard />
        </View>

        <Button
          className="mt-6 h-14 rounded-2xl"
          variant="outline"
          onPress={() => void signOut()}
        >
          <Text className="font-sans-semibold">Sign out</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
