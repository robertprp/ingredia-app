import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  isDiditVerificationAvailable,
  runDiditVerification,
} from "@/lib/didit-verification";
import { createVerificationSession } from "@/lib/identity-verification-api";
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  IdCard,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

type ViewState =
  | { type: "idle" }
  | { type: "starting" }
  | { type: "approved"; sessionId: string }
  | { type: "pending"; sessionId: string }
  | { type: "declined"; sessionId: string }
  | { type: "cancelled" }
  | { type: "failed"; message: string };

export function IdentityVerificationCard() {
  const [state, setState] = useState<ViewState>({ type: "idle" });

  const startIdentityVerification = async () => {
    if (!isDiditVerificationAvailable()) {
      setState({
        type: "failed",
        message:
          "Identity verification requires a freshly rebuilt development app. It is not available in Expo Go.",
      });
      return;
    }

    setState({ type: "starting" });

    try {
      const session = await createVerificationSession();
      const result = await runDiditVerification(session.sessionToken);

      if (result.type === "cancelled") {
        setState({ type: "cancelled" });
        return;
      }

      if (result.type === "failed") {
        setState({ type: "failed", message: result.error.message });
        return;
      }

      setState({ type: result.status, sessionId: result.sessionId });
    } catch (error) {
      setState({
        type: "failed",
        message:
          error instanceof Error
            ? error.message
            : "We could not start identity verification. Please try again.",
      });
    }
  };

  const isStarting = state.type === "starting";
  const canStart = state.type !== "approved" && state.type !== "pending";

  return (
    <Card className="overflow-hidden rounded-3xl border-0">
      <CardHeader className="gap-4 px-6 pt-7">
        <View className="size-12 items-center justify-center rounded-2xl bg-brand-purple/10">
          <Icon as={IdCard} className="text-brand-purple" size={25} />
        </View>
        <View className="gap-2">
          <CardTitle className="font-display text-3xl leading-tight text-brand-ink">
            Verify your identity
          </CardTitle>
          <CardDescription className="text-base leading-6">
            Complete a secure identity check to unlock verified access. Have
            your identity document ready.
          </CardDescription>
        </View>
      </CardHeader>

      <CardContent className="gap-5 px-6 pb-7">
        <View className="gap-3 rounded-2xl bg-brand-warm p-4">
          <Feature
            icon={ShieldCheck}
            text="Your check is completed securely with Didit"
          />
          <Feature
            icon={IdCard}
            text="Document and selfie checks happen in the native app"
          />
        </View>

        {state.type === "approved" ? (
          <Alert icon={CircleCheck} iconClassName="text-emerald-700">
            <AlertTitle className="text-emerald-800">
              Identity verified
            </AlertTitle>
            <AlertDescription>
              Your verification was approved. Verified access is ready.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.type === "pending" ? (
          <Alert icon={Clock3} iconClassName="text-amber-700">
            <AlertTitle className="text-amber-800">
              Verification under review
            </AlertTitle>
            <AlertDescription>
              Your check needs manual review. We will update your access when
              the decision arrives.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.type === "declined" ? (
          <Alert icon={XCircle} variant="destructive">
            <AlertTitle>Verification declined</AlertTitle>
            <AlertDescription>
              We could not verify your identity. Try again or contact support if
              this continues.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.type === "cancelled" ? (
          <Alert icon={CircleAlert}>
            <AlertTitle>Verification cancelled</AlertTitle>
            <AlertDescription>
              No changes were made. You can restart whenever you are ready.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.type === "failed" ? (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertTitle>Unable to verify</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        {canStart ? (
          <Button
            accessibilityLabel={
              state.type === "idle"
                ? "Verify identity"
                : "Try identity verification again"
            }
            className="h-14 rounded-2xl"
            disabled={isStarting}
            onPress={() => void startIdentityVerification()}
          >
            {isStarting ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text className="font-sans-semibold">
                  Opening secure check…
                </Text>
              </>
            ) : (
              <>
                {state.type === "idle" ? null : (
                  <Icon as={RotateCcw} className="text-white" size={18} />
                )}
                <Text className="font-sans-semibold">
                  {state.type === "idle" ? "Verify identity" : "Try again"}
                </Text>
              </>
            )}
          </Button>
        ) : null}

        {"sessionId" in state ? (
          <Text
            selectable
            className="text-center text-xs text-muted-foreground"
          >
            Session {state.sessionId}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Feature({ icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Icon as={icon} className="text-brand-purple" size={19} />
      <Text className="flex-1 text-sm leading-5 text-brand-ink">{text}</Text>
    </View>
  );
}
