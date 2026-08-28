import type { IdentityVerificationResult } from "./didit-verification.types";

export function isDiditVerificationAvailable(): boolean {
  return false;
}

export async function runDiditVerification(
  _sessionToken: string,
): Promise<IdentityVerificationResult> {
  return {
    type: "failed",
    error: {
      type: "unsupportedPlatform",
      message:
        "Identity verification requires an iOS or Android development build.",
    },
  };
}

export type { IdentityVerificationResult } from "./didit-verification.types";
