export type IdentityVerificationStatus = "approved" | "pending" | "declined";

export type IdentityVerificationResult =
  | {
      type: "completed";
      sessionId: string;
      status: IdentityVerificationStatus;
    }
  | {
      type: "cancelled";
      sessionId?: string;
    }
  | {
      type: "failed";
      error: {
        type: string;
        message: string;
      };
      sessionId?: string;
    };
