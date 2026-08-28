import type { VerificationResult } from "@didit-protocol/sdk-react-native";
import { TurboModuleRegistry } from "react-native";

import type { IdentityVerificationResult } from "./didit-verification.types";

const DIDIT_NATIVE_MODULE_NAME = "SdkReactNative";

export function isDiditVerificationAvailable(): boolean {
  return TurboModuleRegistry.get(DIDIT_NATIVE_MODULE_NAME) !== null;
}

function mapCompletedResult(
  result: Extract<VerificationResult, { type: "completed" }>,
): IdentityVerificationResult {
  const status = String(result.session.status);

  if (status === "Approved") {
    return {
      type: "completed",
      sessionId: result.session.sessionId,
      status: "approved",
    };
  }

  if (status === "Declined") {
    return {
      type: "completed",
      sessionId: result.session.sessionId,
      status: "declined",
    };
  }

  return {
    type: "completed",
    sessionId: result.session.sessionId,
    status: "pending",
  };
}

export async function runDiditVerification(
  sessionToken: string,
): Promise<IdentityVerificationResult> {
  if (!isDiditVerificationAvailable()) {
    return {
      type: "failed",
      error: {
        type: "nativeModuleUnavailable",
        message:
          "Didit is not included in this app binary. Install a freshly rebuilt development build; Expo Go cannot run identity verification.",
      },
    };
  }

  // Didit's package enforces its TurboModule as soon as it is imported. Keep
  // that import behind the availability check so Expo Go can render the app.
  const { startVerification } =
    await import("@didit-protocol/sdk-react-native");
  const result = await startVerification(sessionToken);

  if (result.type === "completed") {
    return mapCompletedResult(result);
  }

  if (result.type === "cancelled") {
    return { type: "cancelled", sessionId: result.session?.sessionId };
  }

  return {
    type: "failed",
    error: result.error,
    sessionId: result.session?.sessionId,
  };
}

export type { IdentityVerificationResult } from "./didit-verification.types";
