import { authClient, betterAuthURL } from "@/lib/auth-client";
import { Platform } from "react-native";

type CreateVerificationSessionResponse = {
  session_id: string;
  session_token: string;
};

export type VerificationSession = {
  sessionId: string;
  sessionToken: string;
};

export class VerificationSessionError extends Error {
  readonly status: number;
  readonly retryAfter: string | null;

  constructor(
    message: string,
    status: number,
    retryAfter: string | null = null,
  ) {
    super(message);
    this.name = "VerificationSessionError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function getSessionEndpoint() {
  const configuredEndpoint = process.env.EXPO_PUBLIC_DIDIT_SESSION_URL?.trim();
  if (configuredEndpoint) return configuredEndpoint;

  return new URL("/api/verification/start", betterAuthURL).toString();
}

function isSessionResponse(
  value: unknown,
): value is CreateVerificationSessionResponse {
  if (!value || typeof value !== "object") return false;

  const response = value as Partial<CreateVerificationSessionResponse>;
  return (
    typeof response.session_id === "string" &&
    typeof response.session_token === "string"
  );
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return body.message ?? body.error;
  } catch {
    return undefined;
  }
}

export async function createVerificationSession(): Promise<VerificationSession> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (Platform.OS !== "web") {
    const cookie = await authClient.getCookie();
    if (cookie) headers.cookie = cookie;
  }

  const response = await fetch(getSessionEndpoint(), {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const serverMessage = await getErrorMessage(response);
    const retryAfter = response.headers.get("retry-after");
    const fallbackMessage =
      response.status === 429
        ? `Too many verification attempts. Try again${retryAfter ? ` after ${retryAfter}` : " shortly"}.`
        : "We could not start identity verification. Please try again.";

    throw new VerificationSessionError(
      serverMessage ?? fallbackMessage,
      response.status,
      retryAfter,
    );
  }

  const body: unknown = await response.json();
  if (!isSessionResponse(body)) {
    throw new VerificationSessionError(
      "The verification server returned an invalid response.",
      502,
    );
  }

  return {
    sessionId: body.session_id,
    sessionToken: body.session_token,
  };
}
