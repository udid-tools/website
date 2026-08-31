import "server-only";

import {
  generateProfile,
  parseProfileServiceResponse,
  type GeneratedProfile,
  type ProfileServiceResponse,
} from "@udid-tools/core";
import { createProfileChallenge, verifyProfileChallenge } from "@/lib/profile-challenge";
import { profileResponseVerification, profileSigning, publicOrigin } from "@/lib/server-config";

const ATTRIBUTES = ["PRODUCT", "SERIAL", "VERSION", "UDID", "IMEI", "MEID"] as const;

export async function generateDeviceProfile(): Promise<GeneratedProfile> {
  const signing = profileSigning();
  const result = await generateProfile({
    profile: {
      kind: "profile-service",
      identifier: "tools.udid.profile-service",
      displayName: "Device Identification Profile",
      organization: "UDID Tools",
      description:
        "This profile allows the service to securely retrieve your device's unique identifier (UDID) and related information.",
      service: {
        responseUrl: `${publicOrigin()}/api/retrieve`,
        deviceAttributes: ATTRIBUTES,
        challenge: { type: "string", value: createProfileChallenge() },
      },
    },
    ...(signing ? { signing } : {}),
  });
  if (!result.ok) throw result.error;
  return result.value;
}

export async function parseDeviceResponse(input: ArrayBuffer): Promise<ProfileServiceResponse> {
  const policy = profileResponseVerification();
  const result = await parseProfileServiceResponse(input, {
    expectedAttributes: ATTRIBUTES,
    requiredAttributes: ["UDID"],
    verification: policy.verification,
    allowUnsigned: policy.allowUnsigned,
  });
  if (!result.ok) throw result.error;
  if (!verifyProfileChallenge(result.value.challenge))
    throw new Error("Invalid or expired profile challenge");
  return result.value;
}
